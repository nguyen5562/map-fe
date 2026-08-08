import React, { useEffect, useRef, useState, useCallback } from "react";
import ReactDOM from "react-dom";
import { MapContainer, TileLayer, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import { toPng } from "html-to-image";
import { Download, Loader2, Move } from "lucide-react";

import { BASE_URL } from "../../const/apiConfig";
import { GasMarker } from "./GasMarker";
import {
  GasLabel,
  estimateTextWidth,
  getMainVehicleId,
  formatSmokeTimeLabel,
} from "./GasLabel";
import { BattlefieldMarker } from "./BattlefieldMarker";
import { WeatherOverlay } from "./WeatherOverlay";
import { useSimulation } from "../../context/SimulationContext";
import { toSlug } from "../../utils/string";

// ── Constants ─────────────────────────────────────────────────────────────────
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

const WHITE_BORDER = 15; // px

// ── FitBoundsController ─────────────────────────────────────────────────────
function FitBoundsController({ bounds }: { bounds: L.LatLngBoundsExpression }) {
  const map = useMap();
  useEffect(() => {
    const timeout = setTimeout(() => {
      map.fitBounds(bounds, { animate: false, padding: [0, 0] });
      map.invalidateSize();
    }, 100);
    return () => clearTimeout(timeout);
  }, [map, bounds]);
  return null;
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface MapExportPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  sessionName?: string;
}

export function MapExportPreview({
  isOpen,
  onClose,
  sessionName,
}: MapExportPreviewProps) {
  // ── Store data ────────────────────────────────────────────────────────────
  const currentMap = useSimulation((s) => s.currentMap);
  const weatherActive = useSimulation((s) => s.weatherActive);
  const weatherData = useSimulation((s) => s.weatherData);
  const pointsList = useSimulation((s) => s.pointsList);
  const scale = useSimulation((s) => s.scale);
  const clickedRaw = useSimulation((s) => s.clickedRaw);
  const editingPointId = useSimulation((s) => s.editingPointId);
  const selectedPointId = useSimulation((s) => s.selectedPointId);
  const battlefieldData = useSimulation((s) => s.battlefieldData);
  const commandPostLevel = useSimulation((s) => s.commandPostLevel);
  const battlefieldScale = useSimulation((s) => s.battlefieldScale);
  const smokeLineLength = useSimulation((s) => s.smokeLineLength);
  const smokeLineDiameter = useSimulation((s) => s.smokeLineDiameter);
  const smokeLineWidth = useSimulation((s) => s.smokeLineWidth);
  const smokeMethodData = useSimulation((s) => s.smokeMethodData);
  const smokeTime = useSimulation((s) => s.smokeTime);
  const selectedVehicles = useSimulation((s) => s.selectedVehicles);
  const vehicleConfigs = useSimulation((s) => s.vehicleConfigs);
  const isCalibrated = useSimulation((s) => s.isCalibrated);

  // ── Weather overlay drag/scale state ──────────────────────────────────────
  const [weatherPos, setWeatherPos] = useState({ x: -1, y: -1 }); // -1 = uninitialized
  const [weatherScale, setWeatherScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 });

  // ── Export state ──────────────────────────────────────────────────────────
  const [isExporting, setIsExporting] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);

  // ── Initialize weather position when modal opens ──────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    setWeatherScale(1);
    setIsExporting(false);
    // Wait for portal to mount and container to have dimensions
    const timer = setTimeout(() => {
      if (captureRef.current) {
        const rect = captureRef.current.getBoundingClientRect();
        setWeatherPos({ x: rect.width - 280 - 32, y: 16 });
      } else {
        // Fallback: position relative to viewport
        setWeatherPos({ x: window.innerWidth - 280 - 64, y: 16 });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [isOpen]);

  // ── Computed values ───────────────────────────────────────────────────────
  const mapWidth = currentMap?.width || 0;
  const mapHeight = currentMap?.height || 0;
  const maxNativeZ = currentMap?.maxNativeZoom || 6;
  const maxScale = Math.pow(2, maxNativeZ);
  const dynamicBounds: L.LatLngBoundsExpression = [
    [-(mapHeight / maxScale), 0],
    [0, mapWidth / maxScale],
  ];

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

  // ── Drag handlers ─────────────────────────────────────────────────────────
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        posX: weatherPos.x,
        posY: weatherPos.y,
      };
    },
    [weatherPos],
  );

  useEffect(() => {
    if (!isDragging) return;
    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      setWeatherPos({
        x: dragStartRef.current.posX + dx,
        y: dragStartRef.current.posY + dy,
      });
    };
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const handleExport = useCallback(async () => {
    if (!captureRef.current) return;
    setIsExporting(true);

    try {
      // 1. Capture the element at high resolution
      const dataUrl = await toPng(captureRef.current, {
        pixelRatio: 4,
        style: {
          transform: "none",
          transformOrigin: "top left",
        },
      });

      // 2. Load captured image to draw on Canvas
      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      // 3. Create High-res Canvas
      const canvas = document.createElement("canvas");
      const pixelRatio = 4;
      const borderSize = WHITE_BORDER * pixelRatio;

      canvas.width = img.width + borderSize * 2;
      canvas.height = img.height + borderSize * 2;

      // 4. Fill background and draw image
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, borderSize, borderSize);

      // 5. Download
      const link = document.createElement("a");
      const date = new Date();
      const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
      const timeStr = `${String(date.getHours()).padStart(2, "0")}${String(date.getMinutes()).padStart(2, "0")}${String(date.getSeconds()).padStart(2, "0")}`;
      const timestamp = `${dateStr}-${timeStr}`;

      const slugName = sessionName ? toSlug(sessionName) : "";
      const fileName = slugName
        ? `ban-do-${slugName}-${timestamp}.png`
        : `ban-do-${timestamp}.png`;

      link.download = fileName;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setIsExporting(false);
    }
  }, [sessionName]);

  if (!isOpen || !currentMap || currentMap.status !== "ready") return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex flex-row bg-slate-950">
      {/* ── Loading Overlay ────────────────────────────────────────────────── */}
      {isExporting && (
        <div className="absolute inset-0 z-[100000] flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-sm">
          <Loader2 className="animate-spin text-emerald-500 mb-4" size={48} />
          <p className="text-white text-lg font-bold tracking-wide">
            ĐANG CHUẨN BỊ BẢN ĐỒ
          </p>
          <p className="text-slate-400 text-sm mt-1">
            Đang tải bản đồ độ phân giải tối đa. Vui lòng đợi...
          </p>
        </div>
      )}

      {/* ── Working Canvas (Left) ─────────────────────────────────────────── */}
      <div className="flex-1 bg-slate-950 relative overflow-hidden flex items-center justify-center p-12">
        <div
          ref={captureRef}
          className="relative bg-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] rounded-sm border border-slate-200/50 overflow-hidden"
          style={{
            aspectRatio:
              mapWidth && mapHeight ? `${mapWidth} / ${mapHeight}` : undefined,
            width:
              mapWidth && mapHeight && mapWidth > mapHeight ? "100%" : "auto",
            height:
              mapWidth && mapHeight && mapWidth > mapHeight ? "auto" : "100%",
            maxWidth: "100%",
            maxHeight: "100%",
          }}
        >
          {/* ── Map ──────────────────────────────────────────────────────── */}
          <MapContainer
            key={`export-${currentMap.id}`}
            center={[-(mapHeight / maxScale) / 2, mapWidth / maxScale / 2]}
            zoom={1}
            zoomSnap={0}
            zoomDelta={0.25}
            minZoom={0}
            maxZoom={maxNativeZ}
            maxBounds={dynamicBounds}
            maxBoundsViscosity={1.0}
            crs={L.CRS.Simple}
            className="w-full h-full"
            style={{ background: "#ffffff" }}
            dragging={false}
            scrollWheelZoom={false}
            doubleClickZoom={false}
            touchZoom={false}
            boxZoom={false}
            keyboard={false}
            zoomControl={false}
            attributionControl={false}
          >
            <TileLayer
              url={`${BASE_URL}/uploads/maptiles/${currentMap.id}/{z}/{y}/{x}.png`}
              noWrap={true}
              minNativeZoom={0}
              maxNativeZoom={maxNativeZ}
              bounds={dynamicBounds}
              crossOrigin="anonymous"
              detectRetina={true}
            />
            <FitBoundsController bounds={dynamicBounds} />

            {/* ── Battlefield markers (active draft, no point selected) ── */}
            {isCalibrated && !selectedPointId && (
              <>
                {battlefieldData.firePoints.rawCoords && (
                  <BattlefieldMarker
                    center={battlefieldData.firePoints.rawCoords}
                    type="firePoints"
                    scaleX={scale.x}
                    bufferColor={battlefieldData.firePoints.bufferColor}
                    battlefieldScale={battlefieldScale}
                  />
                )}
                {battlefieldData.reserveUnit.rawCoords && (
                  <BattlefieldMarker
                    center={battlefieldData.reserveUnit.rawCoords}
                    type="reserveUnit"
                    scaleX={scale.x}
                    bufferColor={battlefieldData.reserveUnit.bufferColor}
                    battlefieldScale={battlefieldScale}
                  />
                )}
                {battlefieldData.commandPost.rawCoords && (
                  <BattlefieldMarker
                    center={battlefieldData.commandPost.rawCoords}
                    type="commandPost"
                    scaleX={scale.x}
                    commandPostLevel={commandPostLevel}
                    bufferColor={battlefieldData.commandPost.bufferColor}
                    battlefieldScale={battlefieldScale}
                  />
                )}
              </>
            )}

            {/* ── Battlefield markers from saved points ── */}
            {isCalibrated &&
              pointsList.map((p) => {
                const isSelected = p.id === selectedPointId;
                const bfData = isSelected ? battlefieldData : p.battlefieldData;
                if (!bfData) return null;
                const cpLevel = isSelected
                  ? commandPostLevel
                  : p.commandPostLevel || commandPostLevel;
                const scaleVal = isSelected
                  ? battlefieldScale
                  : p.battlefieldScale || 1;
                return (
                  <React.Fragment key={`bf-${p.id}`}>
                    {bfData.firePoints?.rawCoords && (
                      <BattlefieldMarker
                        center={L.latLng(
                          bfData.firePoints.rawCoords.lat,
                          bfData.firePoints.rawCoords.lng,
                        )}
                        type="firePoints"
                        scaleX={scale.x}
                        bufferColor={
                          bfData.firePoints.bufferColor || bfData.bufferColor
                        }
                        battlefieldScale={scaleVal}
                      />
                    )}
                    {bfData.reserveUnit?.rawCoords && (
                      <BattlefieldMarker
                        center={L.latLng(
                          bfData.reserveUnit.rawCoords.lat,
                          bfData.reserveUnit.rawCoords.lng,
                        )}
                        type="reserveUnit"
                        scaleX={scale.x}
                        bufferColor={
                          bfData.reserveUnit.bufferColor || bfData.bufferColor
                        }
                        battlefieldScale={scaleVal}
                      />
                    )}
                    {bfData.commandPost?.rawCoords && (
                      <BattlefieldMarker
                        center={L.latLng(
                          bfData.commandPost.rawCoords.lat,
                          bfData.commandPost.rawCoords.lng,
                        )}
                        type="commandPost"
                        scaleX={scale.x}
                        commandPostLevel={cpLevel}
                        bufferColor={
                          bfData.commandPost.bufferColor || bfData.bufferColor
                        }
                        battlefieldScale={scaleVal}
                      />
                    )}
                  </React.Fragment>
                );
              })}

            {/* ── Active / draft smoke marker ── */}
            {clickedRaw &&
              editingPointId === null &&
              isCalibrated &&
              weatherActive && (
                <GasMarker
                  center={clickedRaw}
                  angle={smokeAngleComputed}
                  scaleX={scale.x}
                  smokeLineLength={smokeLineLength}
                  smokeLineDiameter={smokeLineDiameter}
                  smokeLineWidth={smokeLineWidth}
                  lineType={smokeMethodData.lineType}
                  lineRole={smokeMethodData.lineRole}
                  bufferColor={smokeMethodData.bufferColor}
                  hasVehicle={selectedVehicles.some(
                    (vid: string) => !!vehicleConfigs[vid]?.isCar,
                  )}
                  vehicleSide={smokeMethodData.vehicleSide}
                />
              )}

            {/* ── Saved points markers ── */}
            {pointsList.map((p) => {
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

              const isEditing = p.id === editingPointId;
              const markerCoords =
                isEditing && clickedRaw ? clickedRaw : p.coords;

              const activeLineType = isEditing
                ? (smokeMethodData?.lineType ?? "Thẳng")
                : (p.smokeMethodData?.lineType ?? "Thẳng");
              const activeLength = isEditing
                ? (smokeLineLength ?? 700)
                : (p.smokeLineLength ?? 700);
              const activeDiameter = isEditing
                ? (smokeLineDiameter ?? 700)
                : (p.smokeLineDiameter ?? 700);
              const activeWidth = isEditing
                ? (smokeLineWidth ?? 300)
                : (p.smokeLineWidth ?? 300);
              const activeLineRole = isEditing
                ? (smokeMethodData?.lineRole ?? "Chính")
                : (p.smokeMethodData?.lineRole ?? "Chính");
              const activeBufferColor = isEditing
                ? smokeMethodData?.bufferColor
                : p.smokeMethodData?.bufferColor;
              const activeVehicleSide = isEditing
                ? (smokeMethodData?.vehicleSide ?? "right")
                : (p.smokeMethodData?.vehicleSide ?? "right");

              let rawWidth = 0;
              if (activeLineType === "Vòng") {
                const actualDiameter = activeDiameter
                  ? Number(activeDiameter)
                  : 700;
                rawWidth = (actualDiameter * 1.6666667) / Math.abs(scale.x);
              } else {
                const actLen = activeLength ? Number(activeLength) : 700;
                rawWidth = (actLen * 1.25) / Math.abs(scale.x);
              }
              const rawHeight = rawWidth * (120 / 250);

              const labelLat =
                p.labelCoords?.lat ?? markerCoords.lat + rawHeight * 0.7;
              const labelLng = p.labelCoords?.lng ?? markerCoords.lng;
              const labelCenter = L.latLng(labelLat, labelLng);

              // Leader line
              let leaderLinePoints: L.LatLngExpression[] = [];
              if (p.results) {
                const activeSelectedVehicles = isEditing
                  ? selectedVehicles
                  : (p.selectedVehicles ?? []);
                const activeVehicleConfigs = isEditing
                  ? vehicleConfigs
                  : p.vehicleConfigs || vehicleConfigs;
                const activeCombatTime = isEditing
                  ? weatherData?.combatTime
                  : p.weatherData?.combatTime;
                const activeSmokeTime = isEditing ? smokeTime : p.smokeTime;

                const mainVid = getMainVehicleId(
                  activeSelectedVehicles,
                  p.results.vehicleBreakdown,
                );
                const mainVehicleName = mainVid
                  ? (activeVehicleConfigs?.[mainVid]?.name ?? mainVid)
                  : "";
                const line1 = `${p.results.totalVehicles} ${mainVehicleName}`;
                const line2String = formatSmokeTimeLabel(
                  activeSmokeTime,
                  activeCombatTime,
                );

                const w1 = estimateTextWidth(line1, 28);
                const w2 = estimateTextWidth(line2String, 28);
                const maxW = Math.max(w1, w2);
                const halfLine = (maxW + 12) / 2;
                const halfLineLng = (halfLine / 250) * rawWidth;
                const dividerLat = labelCenter.lat + (5 / 120) * rawHeight;
                const isLabelToRight = labelCenter.lng >= markerCoords.lng;
                const dividerLng = isLabelToRight
                  ? labelCenter.lng - halfLineLng
                  : labelCenter.lng + halfLineLng;

                leaderLinePoints = [
                  markerCoords,
                  L.latLng(dividerLat, dividerLng),
                ];
              }

              const activeSelectedVehicles = isEditing
                ? selectedVehicles
                : (p.selectedVehicles ?? []);
              const activeVehicleConfigs = isEditing
                ? vehicleConfigs
                : p.vehicleConfigs || vehicleConfigs;
              const pointHasVehicle = activeSelectedVehicles.some(
                (vid: string) => !!activeVehicleConfigs[vid]?.isCar,
              );

              if (!weatherActive) return null;

              return (
                <React.Fragment key={p.id}>
                  <GasMarker
                    center={markerCoords}
                    angle={compSmokeAngle}
                    scaleX={scale.x}
                    smokeLineLength={activeLength}
                    smokeLineDiameter={activeDiameter}
                    smokeLineWidth={activeWidth}
                    lineType={activeLineType}
                    lineRole={activeLineRole}
                    bufferColor={activeBufferColor}
                    hasVehicle={pointHasVehicle}
                    vehicleSide={activeVehicleSide}
                  />
                  {p.results && (
                    <>
                      {leaderLinePoints.length > 0 && (
                        <Polyline
                          positions={leaderLinePoints}
                          pathOptions={{ color: "#0f172a", weight: 1.5 }}
                        />
                      )}
                      <GasLabel
                        key={`label-${p.id}-${labelCenter.lat}-${labelCenter.lng}`}
                        center={labelCenter}
                        results={p.results}
                        smokeTime={isEditing ? smokeTime : p.smokeTime}
                        vehicleConfigs={
                          isEditing
                            ? vehicleConfigs
                            : p.vehicleConfigs || vehicleConfigs
                        }
                        selectedVehicles={
                          isEditing
                            ? selectedVehicles
                            : (p.selectedVehicles ?? [])
                        }
                        combatTime={
                          isEditing
                            ? weatherData?.combatTime
                            : p.weatherData?.combatTime
                        }
                        smokeLineLength={activeLength}
                        smokeLineDiameter={activeDiameter}
                        smokeLineWidth={activeWidth}
                        scaleX={scale.x}
                        targetDefenseData={p.targetDefenseData}
                        smokeMethodData={
                          isEditing ? smokeMethodData : p.smokeMethodData
                        }
                      />
                    </>
                  )}
                </React.Fragment>
              );
            })}
          </MapContainer>

          {/* ── Weather Overlay (draggable, scalable) ────────────────────── */}
          {weatherActive && weatherPos.x !== -1 && (
            <div
              data-weather-wrapper
              style={{
                position: "absolute",
                left: weatherPos.x,
                top: weatherPos.y,
                zIndex: 1000,
                transform: `scale(${weatherScale})`,
                transformOrigin: "top left",
                cursor: isDragging ? "grabbing" : "grab",
                userSelect: "none",
                width: 280,
                height: 280,
              }}
              onMouseDown={handleMouseDown}
            >
              {/* Drag handle indicator */}
              <div
                className="weather-drag-handle"
                style={{
                  position: "absolute",
                  top: -20,
                  left: "50%",
                  transform: "translateX(-50%)",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  background: "rgba(15,23,42,0.75)",
                  color: "#fff",
                  padding: "2px 8px",
                  borderRadius: 6,
                  fontSize: 10,
                  fontWeight: 600,
                  pointerEvents: "none",
                  whiteSpace: "nowrap",
                }}
              >
                <Move size={10} /> Kéo thả
              </div>

              {/* Render WeatherOverlay with overridden positioning */}
              <div style={{ position: "relative", width: 280, height: 280 }}>
                <WeatherOverlay
                  weatherActive={true}
                  currentMapStatus="ready"
                  weatherData={weatherDataWithAngle}
                  styleOverride={{
                    position: "relative" as const,
                    top: 0,
                    right: "auto" as any,
                    left: 0,
                    pointerEvents: "auto" as const,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Sidebar (Right) ────────────────────────────────────────────────── */}
      <div className="w-[340px] bg-slate-900 border-l border-slate-800/80 flex flex-col justify-between p-6 z-10 shadow-2xl flex-shrink-0">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div>
            <h3 className="text-white text-base font-black tracking-wider uppercase">
              XUẤT BẢN ĐỒ
            </h3>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">
              Kéo thả ô thời tiết trên bản đồ bên trái đến vị trí mong muốn
              trước khi tải ảnh.
            </p>
          </div>

          {/* Weather Configuration */}
          {weatherActive && (
            <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/30 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-700/40 pb-2">
                <span className="text-white text-xs font-bold uppercase tracking-wider">
                  Ô thời tiết
                </span>
                <span className="text-emerald-400 text-xs font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                  {Math.round(weatherScale * 100)}%
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                  Kích thước ô thời tiết
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={weatherScale}
                    onChange={(e) =>
                      setWeatherScale(parseFloat(e.target.value))
                    }
                    className="flex-1 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 mt-8">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center justify-center gap-2 h-11 w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-950/20 active:scale-[0.98]"
          >
            {isExporting ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Đang xuất ảnh...
              </>
            ) : (
              <>
                <Download size={15} />
                XUẤT BẢN ĐỒ
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="flex items-center justify-center gap-2 h-10 w-full rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-300 hover:text-white text-xs font-bold transition-all border border-slate-700/50"
          >
            Hủy bỏ
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
