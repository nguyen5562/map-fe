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
import { WeatherOverlay, GasMarker, GasLabel } from "../components/map";
import {
  estimateTextWidth,
  getMainVehicleId,
  parseCombatDate,
  pad,
} from "../components/map/GasLabel";
import { LeftSidebar } from "../components/left-sidebar";
import { RightSidebar } from "../components/right-sidebar";
import { ConfirmChangesModal } from "../components/ui/ConfirmChangesModal";
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

  const handleMapClick = (e: L.LeafletMouseEvent) => {
    const rawX = e.latlng.lng;
    const rawY = e.latlng.lat;
    setClickedRaw(e.latlng);

    if (isSelectingFor === "p1") {
      setP1({ ...p1, rawX, rawY });
      setIsSelectingFor(null);
    } else if (isSelectingFor === "p2") {
      setP2({ ...p2, rawX, rawY });
      setIsSelectingFor(null);
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
              const rawHeight = rawWidth * (70 / 250);

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

                const w1 = estimateTextWidth(line1, 17);
                const w2 = estimateTextWidth(line2String, 15);
                const maxW = Math.max(w1, w2);

                const halfLine = (maxW + 12) / 2;
                const halfLineLng = (halfLine / 250) * rawWidth;

                // y=32 trong 70px height (viewBox của SVG)
                const dividerLat = labelCenter.lat + (3 / 70) * rawHeight;

                const isLabelToRight = labelCenter.lng >= markerCoords.lng;
                const dividerLng = isLabelToRight
                  ? labelCenter.lng - halfLineLng
                  : labelCenter.lng + halfLineLng;

                leaderLinePoints = [
                  markerCoords,
                  L.latLng(dividerLat, dividerLng),
                ];
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
