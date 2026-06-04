import { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
  Tooltip,
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

import { mapService } from "../services/map.service";
import { BASE_URL } from "../const/apiConfig";
import { WeatherOverlay, GasMarker } from "./map";
import { LeftSidebar } from "./left-sidebar";
import { RightSidebar } from "./right-sidebar";

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

type CalibrationPoint = {
  rawX: number | null;
  rawY: number | null;
  realX: string;
  realY: string;
};

export default function MapSimulation() {
  const [maps, setMaps] = useState<any[]>([]);
  const [currentMap, setCurrentMap] = useState<any | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [clickedRaw, setClickedRaw] = useState<L.LatLng | null>(null);
  const [targetRaw, setTargetRaw] = useState<L.LatLng | null>(null);

  const [isCalibrated, setIsCalibrated] = useState(false);
  const [showCalibration, setShowCalibration] = useState(true);
  const [showWeather, setShowWeather] = useState(true);
  const [isSelectingFor, setIsSelectingFor] = useState<"p1" | "p2" | null>(
    null,
  );
  const [p1, setP1] = useState<CalibrationPoint>({
    rawX: null,
    rawY: null,
    realX: "",
    realY: "",
  });
  const [p2, setP2] = useState<CalibrationPoint>({
    rawX: null,
    rawY: null,
    realX: "",
    realY: "",
  });
  const [scale, setScale] = useState({ x: 1, y: 1 });

  const [searchX, setSearchX] = useState("");
  const [searchY, setSearchY] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);

  // Target Defense State (Mục 2)
  const [targetDefenseData, setTargetDefenseData] = useState({
    targetType: "Trận địa hỏa lực",
    length: "",
    width: "",
    area: "",
    coverageMultiplier: "1",
  });

  // Smoke Config State (Mục 4, 5, 6)
  const [smokeTime, setSmokeTime] = useState("");
  const [smokeMethodData, setSmokeMethodData] = useState({
    lineType: "Thẳng" as "Thẳng" | "Vòng",
    areaEnabled: false,
  });
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([]);

  // Battlefield Structure State (Mục 7)
  const [battlefieldData, setBattlefieldData] = useState({
    routes: "",
    firePoints: "",
    commandPost: "",
    reserveUnit: "",
  });

  // Weather State
  const [weatherActive, setWeatherActive] = useState(false);
  const [weatherData, setWeatherData] = useState({
    combatTime: '01.05.26',
    windDirection: "Tây Bắc",
    alpha: 0,
    speed: 5,
    tkkMin: 28,
    tkkMax: 35,
    tmdMin: 30,
    tmdMax: 37,
  });

  // Compute final angle from wind direction + alpha
  // windDirection = hướng gió thổi ĐẾN (e.g. "Đông" = gió thổi về Đông)
  // Overlay internally adds +180°, so subtract 180° to compensate
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
  const baseDirectionAngle = DIRECTION_ANGLES[weatherData.windDirection] ?? 0;
  const computedAngle = baseDirectionAngle - 180 + weatherData.alpha;
  const weatherDataWithAngle = { ...weatherData, angle: computedAngle };

  const fetchMaps = async () => {
    try {
      const data = await mapService.getAllMaps();
      setMaps(data);
    } catch (e) {
      console.error("Cannot fetch maps", e);
    }
  };

  useEffect(() => {
    fetchMaps();
  }, []);

  useEffect(() => {
    if (currentMap && currentMap.calibration) {
      setP1(currentMap.calibration.p1);
      setP2(currentMap.calibration.p2);
      setScale(currentMap.calibration.scale);
      setIsCalibrated(true);
    } else {
      setP1({ rawX: null, rawY: null, realX: "", realY: "" });
      setP2({ rawX: null, rawY: null, realX: "", realY: "" });
      setIsCalibrated(false);
      setScale({ x: 1, y: 1 });
    }
    setClickedRaw(null);
    setTargetRaw(null);
  }, [currentMap?.id]);

  useEffect(() => {
    let interval: any;
    if (currentMap?.status === "processing") {
      interval = setInterval(async () => {
        try {
          const updated = await mapService.getMapById(currentMap.id);
          if (updated.status === "ready") {
            setCurrentMap(updated);
            fetchMaps();
            clearInterval(interval);
          } else if (updated.status === "error") {
            alert("Xử lý bản đồ thất bại!");
            clearInterval(interval);
          }
        } catch (e) {}
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [currentMap?.status, currentMap?.id]);

  const handleUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    setUploadProgress(0);
    try {
      const newMap = await mapService.uploadMap(file, (percent) => {
        setUploadProgress(percent);
      });
      setCurrentMap(newMap);
      fetchMaps();
    } catch (e) {
      alert("Upload thất bại");
    }
    setIsUploading(false);
    setUploadProgress(0);
  };

  const handleUploadFile = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    try {
      const newMap = await mapService.uploadMap(file, (percent) => {
        setUploadProgress(percent);
      });
      setCurrentMap(newMap);
      fetchMaps();
    } catch (e) {
      alert("Upload thất bại");
    }
    setIsUploading(false);
    setUploadProgress(0);
  };

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

  const calculateCalibration = async () => {
    if (!currentMap) return alert("Hãy chọn bản đồ trước");
    if (!p1.rawX || !p1.rawY || !p2.rawX || !p2.rawY)
      return alert("Cần chọn đủ 2 điểm trên bản đồ!");
    if (!p1.realX || !p1.realY || !p2.realX || !p2.realY)
      return alert("Cần nhập tọa độ thực tế VN-2000 cho cả 2 điểm!");

    const rX1 = parseFloat(p1.realX);
    const rY1 = parseFloat(p1.realY);
    const rX2 = parseFloat(p2.realX);
    const rY2 = parseFloat(p2.realY);

    const sX = (rX2 - rX1) / (p2.rawX! - p1.rawX!);
    const sY = (rY2 - rY1) / (p2.rawY! - p1.rawY!);

    if (sX === 0 || sY === 0 || !isFinite(sX))
      return alert("2 điểm không hợp lệ (không được trùng nhau)!");

    const calData = { p1, p2, scale: { x: sX, y: sY } };
    setScale({ x: sX, y: sY });
    setIsCalibrated(true);
    setClickedRaw(null);

    // Save to Database
    try {
      await mapService.calibrateMap(currentMap.id, calData);
      // Update local state copy to avoid recalibrating again next time
      setCurrentMap({ ...currentMap, calibration: calData });
      setShowCalibration(false);
    } catch (e) {
      console.error("Lưu hiệu chuẩn thất bại");
    }
  };

  const rawToReal = (rx: number, ry: number) => {
    if (!isCalibrated) return { x: rx, y: ry };
    const realX = parseFloat(p1.realX) + (rx - p1.rawX!) * scale.x;
    const realY = parseFloat(p1.realY) + (ry - p1.rawY!) * scale.y;
    return { x: realX, y: realY };
  };

  const realToRaw = (realX: number, realY: number) => {
    if (!isCalibrated) return null;
    const rawX = p1.rawX! + (realX - parseFloat(p1.realX)) / scale.x;
    const rawY = p1.rawY! + (realY - parseFloat(p1.realY)) / scale.y;
    return L.latLng(rawY, rawX);
  };

  const handleSearch = () => {
    if (!isCalibrated)
      return alert("Bạn phải Hiệu chuẩn bản đồ trước khi tìm tọa độ thật!");
    const x = parseFloat(searchX);
    const y = parseFloat(searchY);
    if (!isNaN(x) && !isNaN(y)) {
      const rawTarget = realToRaw(x, y);
      if (rawTarget) {
        const mWidth = currentMap?.width || 0;
        const mHeight = currentMap?.height || 0;
        const maxScale = Math.pow(2, currentMap?.maxNativeZoom || 6);

        if (
          rawTarget.lng < 0 ||
          rawTarget.lng > mWidth / maxScale ||
          rawTarget.lat > 0 ||
          rawTarget.lat < -(mHeight / maxScale)
        ) {
          return alert(
            "Tọa độ " +
              x +
              ", " +
              y +
              " nằm ngoài phạm vi giới hạn của bản đồ hiện tại!",
          );
        }

        setTargetRaw(rawTarget);
      }
    }
  };

  const currentRealCoords = clickedRaw
    ? rawToReal(clickedRaw.lng, clickedRaw.lat)
    : null;

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
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* LEFT SIDEBAR — Thông số đầu vào */}
      <LeftSidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        maps={maps}
        currentMap={currentMap}
        setCurrentMap={setCurrentMap}
        isUploading={isUploading}
        uploadProgress={uploadProgress}
        handleUpload={handleUpload}
        handleUploadFile={handleUploadFile}
        isCalibrated={isCalibrated}
        setIsCalibrated={setIsCalibrated}
        showCalibration={showCalibration}
        setShowCalibration={setShowCalibration}
        p1={p1}
        setP1={setP1}
        p2={p2}
        setP2={setP2}
        isSelectingFor={isSelectingFor}
        setIsSelectingFor={setIsSelectingFor}
        calculateCalibration={calculateCalibration}
        targetDefenseData={targetDefenseData}
        setTargetDefenseData={setTargetDefenseData}
        showWeather={showWeather}
        setShowWeather={setShowWeather}
        weatherActive={weatherActive}
        setWeatherActive={setWeatherActive}
        weatherData={weatherData}
        setWeatherData={setWeatherData}
        smokeTime={smokeTime}
        setSmokeTime={setSmokeTime}
        smokeMethodData={smokeMethodData}
        setSmokeMethodData={setSmokeMethodData}
        selectedVehicles={selectedVehicles}
        setSelectedVehicles={setSelectedVehicles}
        battlefieldData={battlefieldData}
        setBattlefieldData={setBattlefieldData}
        onCalculate={() => {
          // TODO: Implement calculation logic
          alert("Chức năng TÍNH TOÁN đang được phát triển!");
        }}
        currentRealCoords={currentRealCoords}
        searchX={searchX}
        setSearchX={setSearchX}
        searchY={searchY}
        setSearchY={setSearchY}
        handleSearch={handleSearch}
      />

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
              center={targetRaw}
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
              isCalibrated &&
              (weatherActive ? (
                <GasMarker
                  center={clickedRaw}
                  angle={computedAngle}
                  scaleX={scale.x}
                />
              ) : (
                <Marker position={clickedRaw} opacity={0.6} />
              ))}
            {/* Target Marker */}
            {targetRaw &&
              (weatherActive ? (
                <GasMarker
                  center={targetRaw}
                  angle={computedAngle}
                  scaleX={scale.x}
                />
              ) : (
                <Marker position={targetRaw} />
              ))}
          </MapContainer>
        ) : currentMap?.status === "processing" ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 text-slate-500">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
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
          <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 text-slate-400">
            <MapIcon size={64} className="mb-4 opacity-50" />
            <h3 className="text-lg font-medium">
              Chưa có Bản đồ nào được chọn
            </h3>
            <p className="text-sm">
              Vui lòng chọn từ thư viện bên trái hoặc Upload bản đồ mới
            </p>
          </div>
        )}
      </div>

      {/* RIGHT SIDEBAR — Kết quả tính toán */}
      <RightSidebar
        isOpen={isRightSidebarOpen}
        setIsOpen={setIsRightSidebarOpen}
      />
    </div>
  );
}
