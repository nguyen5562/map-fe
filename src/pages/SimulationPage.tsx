import React, { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
  Tooltip,
  Polyline,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Map as MapIcon } from "lucide-react";

import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import iconRetina from "leaflet/dist/images/marker-icon-2x.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconRetinaUrl: iconRetina,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

import { BASE_URL } from "../const/apiConfig";
import {
  WeatherOverlay,
  GasMarker,
  GasLabel,
  BattlefieldMarker,
} from "../components/map";
import {
  estimateTextWidth,
  getMainVehicleId,
  parseCombatDate,
  pad,
} from "../components/map/GasLabel";
import { LeftSidebar } from "../components/left-sidebar";
import { RightSidebar } from "../components/right-sidebar";
import { ConfirmChangesModal } from "../components/ui/ConfirmChangesModal";
import { angleToDirection } from "../components/left-sidebar/BattlefieldPanel";
import {
  SimulationProvider,
  useSimulation,
} from "../context/SimulationContext";

function ClickHandler({
  onMapClick,
}: {
  onMapClick: (e: L.LeafletMouseEvent) => void;
}) {
  useMapEvents({ click: onMapClick });
  return null;
}

function MapController({
  center,
  isSidebarOpen,
  isRightSidebarOpen,
}: {
  center: L.LatLng | null;
  isSidebarOpen?: boolean;
  isRightSidebarOpen?: boolean;
}) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, map.getZoom(), { duration: 0.5 });
  }, [center, map]);
  useEffect(() => {
    const timeout = setTimeout(() => {
      map.invalidateSize({ animate: true });
    }, 300);
    return () => clearTimeout(timeout);
  }, [isSidebarOpen, isRightSidebarOpen, map]);
  return null;
}

const DIRECTION_ANGLES: Record<string, number> = {
  Bắc: 0,
  "Đông Bắc": 45,
  Đông: 90,
  "Đông Nam": 135,
  Nam: 180,
  "Tây Nam": 225,
  Tây: 270,
  "Tây Bắc": 315,
};

/**
 * Calculates the intersection point on the boundary of the rotated rectangle/line
 * so the leader line doesn't penetrate to the center.
 */
function getLeaderLineIntersection(
  center: L.LatLng,
  labelAnchor: L.LatLng,
  angleDegrees: number,
  rawWidth: number,
  lineType: string,
): L.LatLng {
  // Fallback check to avoid any issues with scale/NaN
  if (!rawWidth || isNaN(rawWidth)) {
    return center;
  }

  const xc = center.lng;
  const yc = center.lat;
  const xp = labelAnchor.lng;
  const yp = labelAnchor.lat;

  if (lineType === "Vòng") {
    const dx = xp - xc;
    const dy = yp - yc;
    const len = Math.sqrt(dx * dx + dy * dy);
    const r_circle = 0.3 * rawWidth; // 75/250 * rawWidth
    if (len > r_circle) {
      return new L.LatLng(
        yc + (dy / len) * r_circle,
        xc + (dx / len) * r_circle,
      );
    }
    return center;
  }

  // Rectangle dimensions relative to 250 viewBox unit of the SVG overlay
  const wHalf = 0.4 * rawWidth; // 100/250 * rawWidth
  const hHalf = (lineType === "Diện" ? 0.15 : 0.02) * rawWidth; // 37.5/250 or 5/250

  // GasMarker rotates the SVG by (angle + 180) degrees.
  const angleRad = ((angleDegrees + 180) * Math.PI) / 180;

  // Transform label anchor to the local coordinate system of the rotated marker (CW rotation)
  const dx = xp - xc;
  const dy = yp - yc;
  const u = dx * Math.cos(angleRad) - dy * Math.sin(angleRad);
  const v = dx * Math.sin(angleRad) + dy * Math.cos(angleRad);

  // Find intersection scaling factor t
  const tU = u !== 0 ? wHalf / Math.abs(u) : Infinity;
  const tV = v !== 0 ? hHalf / Math.abs(v) : Infinity;
  const t = Math.min(1, tU, tV);

  // Intersection coordinates in local system
  const ui = t * u;
  const vi = t * v;

  // Transform back to LatLng coordinates (CW inverse rotation)
  const xi = xc + ui * Math.cos(angleRad) + vi * Math.sin(angleRad);
  const yi = yc - ui * Math.sin(angleRad) + vi * Math.cos(angleRad);

  if (isNaN(xi) || isNaN(yi)) {
    return center;
  }

  return L.latLng(yi, xi);
}

function SimulationInner() {
  const maps = useSimulation((s) => s.maps);
  const currentMap = useSimulation((s) => s.currentMap);
  const isCalibrated = useSimulation((s) => s.isCalibrated);
  const p1 = useSimulation((s) => s.p1);
  const p2 = useSimulation((s) => s.p2);
  const setP1 = useSimulation((s) => s.setP1);
  const setP2 = useSimulation((s) => s.setP2);
  const isSelectingFor = useSimulation((s) => s.isSelectingFor);
  const setIsSelectingFor = useSimulation((s) => s.setIsSelectingFor);
  const scale = useSimulation((s) => s.scale);
  const clickedRaw = useSimulation((s) => s.clickedRaw);
  const setClickedRaw = useSimulation((s) => s.setClickedRaw);
  const mapFlyCenter = useSimulation((s) => s.mapFlyCenter);
  const isSidebarOpen = useSimulation((s) => s.isSidebarOpen);
  const isRightSidebarOpen = useSimulation((s) => s.isRightSidebarOpen);
  const weatherActive = useSimulation((s) => s.weatherActive);
  const weatherData = useSimulation((s) => s.weatherData);
  const pointsList = useSimulation((s) => s.pointsList);
  const smokeLineLength = useSimulation((s) => s.smokeLineLength);
  const smokeMethodData = useSimulation((s) => s.smokeMethodData);
  const vehicleConfigs = useSimulation((s) => s.vehicleConfigs);
  const editingPointId = useSimulation((s) => s.editingPointId);
  const selectedPointId = useSimulation((s) => s.selectedPointId);
  const onSelectPoint = useSimulation((s) => s.onSelectPoint);
  const updatePointLabelCoords = useSimulation((s) => s.updatePointLabelCoords);
  const confirmModal = useSimulation((s) => s.confirmModal);
  const closeConfirmModal = useSimulation((s) => s.closeConfirmModal);
  const handleConfirmModalSave = useSimulation((s) => s.handleConfirmModalSave);
  const handleConfirmModalDiscard = useSimulation(
    (s) => s.handleConfirmModalDiscard,
  );

  const currentRealCoords = useSimulation((s) => s.currentRealCoords);
  const battlefieldData = useSimulation((s) => s.battlefieldData);
  const setBattlefieldData = useSimulation((s) => s.setBattlefieldData);
  const commandPostLevel = useSimulation((s) => s.commandPostLevel);
  const rawToReal = useSimulation((s) => s.rawToReal);
  // Automatically recalculate distances and directions when currentRealCoords or battlefield coords change
  useEffect(() => {
    if (!isCalibrated) return;

    let changed = false;
    const nextBattlefieldData = { ...battlefieldData };

    const keys: ("firePoints" | "commandPost" | "reserveUnit")[] = [
      "firePoints",
      "commandPost",
      "reserveUnit",
    ];

    for (const key of keys) {
      const entry = battlefieldData[key];
      if (entry.rawCoords) {
        const real = rawToReal(entry.rawCoords.lng, entry.rawCoords.lat);
        let distance = "";
        let direction = "Bắc";

        if (real && currentRealCoords) {
          const dx = real.x - currentRealCoords.x;
          const dy = real.y - currentRealCoords.y;
          const dist = Math.round(Math.sqrt(dx * dx + dy * dy));
          distance = String(dist);
          const mathAngle = Math.atan2(dy, dx) * (180 / Math.PI);
          const compassAngle = 90 - mathAngle;
          direction = angleToDirection(compassAngle);
        }

        if (entry.distance !== distance || entry.direction !== direction) {
          nextBattlefieldData[key] = {
            ...entry,
            distance,
            direction,
          };
          changed = true;
        }
      }
    }

    if (changed) {
      setBattlefieldData(nextBattlefieldData);
    }
  }, [
    currentRealCoords,
    battlefieldData.firePoints.rawCoords,
    battlefieldData.commandPost.rawCoords,
    battlefieldData.reserveUnit.rawCoords,
    isCalibrated,
    p1,
    p2,
    rawToReal,
    setBattlefieldData,
  ]);

  const handleMapClick = (e: L.LeafletMouseEvent) => {
    const rawX = e.latlng.lng;
    const rawY = e.latlng.lat;

    if (isSelectingFor === "p1") {
      setP1({ ...p1, rawX, rawY });
      setIsSelectingFor(null);
      setClickedRaw(e.latlng);
    } else if (isSelectingFor === "p2") {
      setP2({ ...p2, rawX, rawY });
      setIsSelectingFor(null);
      setClickedRaw(e.latlng);
    } else if (
      isSelectingFor === "firePoints" ||
      isSelectingFor === "commandPost" ||
      isSelectingFor === "reserveUnit"
    ) {
      const real = rawToReal(rawX, rawY);
      const key = isSelectingFor;
      // Compute distance + direction from current smoke center
      let distance = "";
      let direction = "Bắc";
      if (real && currentRealCoords) {
        const dx = real.x - currentRealCoords.x;
        const dy = real.y - currentRealCoords.y;
        const dist = Math.round(Math.sqrt(dx * dx + dy * dy));
        distance = String(dist);
        // Math angle: 0=East, 90=North. Compass: 0=North, 90=East
        const mathAngle = Math.atan2(dy, dx) * (180 / Math.PI);
        const compassAngle = 90 - mathAngle;
        direction = angleToDirection(compassAngle);
      }
      setBattlefieldData({
        ...battlefieldData,
        [key]: {
          rawCoords: e.latlng,
          distance,
          direction,
        },
      });
      setIsSelectingFor(null);
    } else {
      setClickedRaw(e.latlng);
    }
  };

  const baseDirectionAngle =
    weatherData.windAngle ?? DIRECTION_ANGLES[weatherData.windDirection] ?? 0;
  const alphaVal = weatherData.alpha === "" ? 90 : Number(weatherData.alpha);
  const betaVal = weatherData.beta === "" ? 0 : Number(weatherData.beta);
  const smokeOffset =
    (90 - alphaVal) * (weatherData.alphaDirection === "right" ? 1 : -1);
  const windAngleComputed = baseDirectionAngle - 180 + betaVal;
  const smokeAngleComputed = windAngleComputed + smokeOffset;

  const baseSecondaryDirectionAngle =
    weatherData.secondaryWindAngle ??
    (weatherData.secondaryWindDirection
      ? DIRECTION_ANGLES[weatherData.secondaryWindDirection]
      : null);
  const computedSecondaryAngle =
    baseSecondaryDirectionAngle !== null
      ? baseSecondaryDirectionAngle - 180
      : null;

  const weatherDataWithAngle = {
    ...weatherData,
    angle: windAngleComputed,
    secondaryAngle: computedSecondaryAngle,
  };

  // Calculate Map Bounds dynamically
  const mapWidth = currentMap?.width || 0;
  const mapHeight = currentMap?.height || 0;
  const maxNativeZ = currentMap?.maxNativeZoom || 6;
  const maxScale = Math.pow(2, maxNativeZ);
  const dynamicBounds: L.LatLngBoundsExpression = [
    [-(mapHeight / maxScale), 0],
    [0, mapWidth / maxScale],
  ];

  return (
    <div className="flex h-full overflow-hidden bg-slate-50 font-sans text-slate-900">
      {/* LEFT SIDEBAR — Thông số đầu vào */}
      <LeftSidebar />

      {/* MAP AREA */}
      <div className="flex-1 relative bg-white flex flex-col">
        {/* Lớp Weather Overlay */}
        <WeatherOverlay
          weatherActive={weatherActive}
          currentMapStatus={currentMap?.status}
          weatherData={weatherDataWithAngle}
        />

        {/* Battlefield selection mode banner */}
        {(isSelectingFor === "firePoints" ||
          isSelectingFor === "commandPost" ||
          isSelectingFor === "reserveUnit") && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none">
            <div className="flex items-center gap-2 bg-slate-900/90 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              {isSelectingFor === "firePoints" &&
                "Click vao ban do de chon Vi tri diem hoa"}
              {isSelectingFor === "reserveUnit" &&
                "Click vao ban do de chon Vi tri bo phan du bi, bao dam"}
              {isSelectingFor === "commandPost" &&
                "Click vao ban do de chon Vi tri bo phan chi huy"}
            </div>
          </div>
        )}

        {currentMap?.status === "ready" ? (
          <MapContainer
            key={currentMap.id}
            center={[-(mapHeight / maxScale) / 2, mapWidth / maxScale / 2]}
            zoom={1}
            minZoom={0}
            maxZoom={9}
            maxBounds={dynamicBounds}
            maxBoundsViscosity={1.0}
            crs={L.CRS.Simple}
            className="w-full h-full cursor-crosshair"
            style={{ background: "#ffffff" }}
          >
            <TileLayer
              url={`${BASE_URL}/uploads/maptiles/${currentMap.id}/{z}/{y}/{x}.png`}
              noWrap={true}
              minNativeZoom={0}
              maxNativeZoom={maxNativeZ}
              bounds={dynamicBounds}
            />
            <ClickHandler onMapClick={handleMapClick} />
            <MapController
              center={mapFlyCenter}
              isSidebarOpen={isSidebarOpen}
              isRightSidebarOpen={isRightSidebarOpen}
            />

            {/* Calibration Markers */}
            {p1.rawX && !isCalibrated && (
              <Marker position={[p1.rawY!, p1.rawX!]}>
                <Tooltip permanent>Mốc 1</Tooltip>
              </Marker>
            )}
            {p2.rawX && !isCalibrated && (
              <Marker position={[p2.rawY!, p2.rawX!]}>
                <Tooltip permanent>Mốc 2</Tooltip>
              </Marker>
            )}

            {/* Battlefield Position Markers - Military SVG Symbols */}
            {isCalibrated && battlefieldData.firePoints.rawCoords && (
              <BattlefieldMarker
                center={battlefieldData.firePoints.rawCoords}
                type="firePoints"
                scaleX={scale.x}
                bufferColor={battlefieldData.firePoints.bufferColor}
              />
            )}
            {isCalibrated && battlefieldData.reserveUnit.rawCoords && (
              <BattlefieldMarker
                center={battlefieldData.reserveUnit.rawCoords}
                type="reserveUnit"
                scaleX={scale.x}
                bufferColor={battlefieldData.reserveUnit.bufferColor}
              />
            )}
            {isCalibrated && battlefieldData.commandPost.rawCoords && (
              <BattlefieldMarker
                center={battlefieldData.commandPost.rawCoords}
                type="commandPost"
                scaleX={scale.x}
                commandPostLevel={commandPostLevel}
                bufferColor={battlefieldData.commandPost.bufferColor}
              />
            )}

            {/* Saved Points Battlefield Position Markers */}
            {isCalibrated &&
              pointsList.map((p) => {
                if (p.id === selectedPointId) return null; // Already rendered by active/draft state above
                const bfData = p.battlefieldData;
                if (!bfData) return null;

                return (
                  <React.Fragment key={`bf-saved-${p.id}`}>
                    {bfData.firePoints?.rawCoords && (
                      <BattlefieldMarker
                        center={L.latLng(bfData.firePoints.rawCoords.lat, bfData.firePoints.rawCoords.lng)}
                        type="firePoints"
                        scaleX={scale.x}
                        bufferColor={bfData.firePoints.bufferColor || bfData.bufferColor}
                        onClick={() => onSelectPoint(p.id)}
                      />
                    )}
                    {bfData.reserveUnit?.rawCoords && (
                      <BattlefieldMarker
                        center={L.latLng(bfData.reserveUnit.rawCoords.lat, bfData.reserveUnit.rawCoords.lng)}
                        type="reserveUnit"
                        scaleX={scale.x}
                        bufferColor={bfData.reserveUnit.bufferColor || bfData.bufferColor}
                        onClick={() => onSelectPoint(p.id)}
                      />
                    )}
                    {bfData.commandPost?.rawCoords && (
                      <BattlefieldMarker
                        center={L.latLng(bfData.commandPost.rawCoords.lat, bfData.commandPost.rawCoords.lng)}
                        type="commandPost"
                        scaleX={scale.x}
                        commandPostLevel={p.commandPostLevel || commandPostLevel}
                        bufferColor={bfData.commandPost.bufferColor || bfData.bufferColor}
                        onClick={() => onSelectPoint(p.id)}
                      />
                    )}
                  </React.Fragment>
                );
              })}

            {/* Click Marker */}
            {clickedRaw &&
              editingPointId === null &&
              isCalibrated &&
              (weatherActive ? (
                <GasMarker
                  center={clickedRaw}
                  angle={smokeAngleComputed}
                  scaleX={scale.x}
                  smokeLineLength={smokeLineLength}
                  lineType={smokeMethodData.lineType}
                  lineRole={smokeMethodData.lineRole}
                  bufferColor={smokeMethodData.bufferColor}
                />
              ) : (
                <Marker position={clickedRaw} opacity={0.6} />
              ))}

            {/* Saved Points Markers */}
            {pointsList.map((p, idx) => {
              const baseDirAngle =
                p.weatherData.windAngle ??
                DIRECTION_ANGLES[p.weatherData.windDirection] ??
                0;
              const pAlphaVal =
                p.weatherData.alpha === ""
                  ? 90
                  : Number(p.weatherData.alpha ?? 90);
              const pBetaVal =
                p.weatherData.beta === "" ? 0 : Number(p.weatherData.beta ?? 0);
              const pSmokeOffset =
                (90 - pAlphaVal) *
                ((p.weatherData.alphaDirection ?? "right") === "right"
                  ? 1
                  : -1);
              const compWindAngle = baseDirAngle - 180 + pBetaVal;
              const compSmokeAngle = compWindAngle + pSmokeOffset;

              const actualLength = p.smokeLineLength
                ? Number(p.smokeLineLength)
                : 700;
              const rawWidth = (actualLength * 1.25) / Math.abs(scale.x);
              const rawHeight = rawWidth * (120 / 250);

              // Nếu đang chỉnh sửa điểm này và người dùng click vị trí mới, dùng clickedRaw làm vị trí tạm
              const isEditing = p.id === editingPointId;
              const markerCoords =
                isEditing && clickedRaw ? clickedRaw : p.coords;

              const labelLat =
                p.labelCoords?.lat ?? markerCoords.lat + rawHeight * 0.7;
              const labelLng = p.labelCoords?.lng ?? markerCoords.lng;
              const labelCenter = L.latLng(labelLat, labelLng);

              const isSelected = p.id === selectedPointId;

              let leaderLinePoints: L.LatLngExpression[] = [];
              if (p.results) {
                const mainVid = getMainVehicleId(
                  p.selectedVehicles ?? [],
                  p.results.vehicleBreakdown,
                );
                const mainVehicleName = mainVid
                  ? (p.vehicleConfigs?.[mainVid]?.name ??
                    vehicleConfigs[mainVid]?.name ??
                    mainVid)
                  : "";
                const line1 = `${p.results.totalVehicles} ${mainVehicleName}`;

                const fromH = pad(p.smokeTime.fromH || "0");
                const fromM = pad(p.smokeTime.fromM || "0");
                const toH = pad(p.smokeTime.toH || "0");
                const toM = pad(p.smokeTime.toM || "0");
                const dateLabel = parseCombatDate(p.weatherData?.combatTime);
                const line2String = `${fromH}.${fromM}÷${toH}.${toM} - ${dateLabel}`;

                const w1 = estimateTextWidth(line1, 28);
                const w2 = estimateTextWidth(line2String, 28);
                const maxW = Math.max(w1, w2);

                const halfLine = (maxW + 12) / 2;
                const halfLineLng = (halfLine / 250) * rawWidth;

                // y=50 trong 110px height (viewBox của SVG)
                const dividerLat = labelCenter.lat + (5 / 120) * rawHeight;

                const isLabelToRight = labelCenter.lng >= markerCoords.lng;
                const dividerLng = isLabelToRight
                  ? labelCenter.lng - halfLineLng
                  : labelCenter.lng + halfLineLng;

                const labelAnchor = L.latLng(dividerLat, dividerLng);
                const intersectionPoint = getLeaderLineIntersection(
                  markerCoords,
                  labelAnchor,
                  compSmokeAngle,
                  rawWidth,
                  p.smokeMethodData?.lineType ?? "Thẳng",
                );

                leaderLinePoints = [intersectionPoint, labelAnchor];
              }

              return weatherActive ? (
                <React.Fragment key={p.id}>
                  <GasMarker
                    center={markerCoords}
                    angle={compSmokeAngle}
                    scaleX={scale.x}
                    smokeLineLength={p.smokeLineLength ?? 700}
                    lineType={p.smokeMethodData?.lineType ?? "Thẳng"}
                    lineRole={p.smokeMethodData?.lineRole ?? "Chính"}
                    bufferColor={p.smokeMethodData?.bufferColor}
                    onClick={() => onSelectPoint(p.id)}
                  />
                  {p.results && (
                    <>
                      {leaderLinePoints.length > 0 && (
                        <Polyline
                          positions={leaderLinePoints}
                          pathOptions={{
                            color: "#0f172a",
                            weight: 1.5,
                          }}
                        />
                      )}
                      <GasLabel
                        key={`label-${p.id}-${labelCenter.lat}-${labelCenter.lng}`}
                        center={labelCenter}
                        results={p.results}
                        smokeTime={p.smokeTime}
                        vehicleConfigs={p.vehicleConfigs || vehicleConfigs}
                        selectedVehicles={p.selectedVehicles ?? []}
                        combatTime={p.weatherData?.combatTime}
                        smokeLineLength={p.smokeLineLength ?? 700}
                        scaleX={scale.x}
                        onClick={() => onSelectPoint(p.id)}
                        targetDefenseData={p.targetDefenseData}
                        smokeMethodData={p.smokeMethodData}
                      />
                      {isSelected && (
                        <Marker
                          position={labelCenter}
                          draggable={true}
                          icon={L.divIcon({
                            className:
                              "bg-transparent border-none flex items-center justify-center",
                            html: `<div style="width: 16px; height: 16px; border-radius: 50%; background-color: #3b82f6; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; cursor: move;">
                                       <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                                     </div>`,
                            iconSize: [16, 16],
                            iconAnchor: [8, 8],
                          })}
                          eventHandlers={{
                            dragend: (e: any) => {
                              const marker = e.target;
                              const newPos = marker.getLatLng();
                              updatePointLabelCoords(p.id, newPos);
                            },
                          }}
                        />
                      )}
                    </>
                  )}
                </React.Fragment>
              ) : (
                <Marker
                  key={p.id}
                  position={markerCoords}
                  eventHandlers={{
                    click: () => onSelectPoint(p.id),
                  }}
                >
                  <Tooltip>{p.name || `Điểm ${idx + 1}`}</Tooltip>
                </Marker>
              );
            })}
          </MapContainer>
        ) : currentMap?.status === "processing" ||
          currentMap?.status === "resizing" ||
          currentMap?.status === "tiling" ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 text-slate-500">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <h3 className="text-lg font-bold text-slate-700">
              Đang xử lý trích xuất lớp bản đồ (Tiles)...
            </h3>
            <p className="text-sm mt-2">
              Hệ thống đang tự động xẻ ảnh độ phân giải cao thành mạng lưới Web
              Map.
            </p>
            <p className="text-sm">
              Tuỳ thuộc vào dung lượng, có thể mất từ 30 giây đến vài phút.
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 text-slate-400 p-6 text-center">
            <MapIcon
              size={64}
              className="mb-4 opacity-50 animate-pulse text-slate-350"
            />
            <h3 className="text-lg font-bold text-slate-700">
              {maps.length === 0
                ? "Hệ thống chưa có Bản đồ nào"
                : "Chưa có Bản đồ nào được chọn"}
            </h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm">
              {maps.length === 0
                ? "Vui lòng tải lên bản đồ mới bằng nút ở thanh bên trái để bắt đầu giả định."
                : "Vui lòng chọn một bản đồ từ thư viện bên trái hoặc tải lên bản đồ mới."}
            </p>
          </div>
        )}
      </div>

      {/* RIGHT SIDEBAR — Kết quả tính toán */}
      <RightSidebar />

      <ConfirmChangesModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onClose={closeConfirmModal}
        onSave={handleConfirmModalSave}
        onDiscard={handleConfirmModalDiscard}
      />
    </div>
  );
}

export default function SimulationPage() {
  return (
    <SimulationProvider>
      <SimulationInner />
    </SimulationProvider>
  );
}
