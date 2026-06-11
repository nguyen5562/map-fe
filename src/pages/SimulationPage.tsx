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
import { vehicleService } from "../services/vehicle.service";
import { WeatherOverlay, GasMarker } from "../components/map";
import { useToast } from "../context/ToastContext";
import { LeftSidebar } from "../components/left-sidebar";
import { RightSidebar } from "../components/right-sidebar";
import type { SmokeTimeRange } from "../components/left-sidebar/SmokeTimePanel";
import type { BattlefieldData } from "../components/left-sidebar/BattlefieldPanel";
import { DEFAULT_VEHICLE_CONFIGS } from "../components/left-sidebar/SmokeVehiclePanel";
import type { VehicleConfig } from "../components/left-sidebar/SmokeVehiclePanel";

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

export default function SimulationPage() {
  const toast = useToast();
  const [maps, setMaps] = useState<any[]>([]);
  const [currentMap, setCurrentMap] = useState<any | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [clickedRaw, setClickedRaw] = useState<L.LatLng | null>(null);

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

  const [pointsList, setPointsList] = useState<any[]>([]);
  const [results, setResults] = useState<any | null>(null);
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);
  const [mapFlyCenter, setMapFlyCenter] = useState<L.LatLng | null>(null);

  // Target Defense State (Mục 2)
  const [targetDefenseData, setTargetDefenseData] = useState({
    targetType: "Trận địa hỏa lực",
    length: "",
    width: "",
    area: "",
    coverageMultiplier: "1",
  });

  // Smoke Config State (Mục 4, 5, 6)
  const [smokeTime, setSmokeTime] = useState<SmokeTimeRange>({
    fromH: "", fromM: "", toH: "", toM: "",
  });
  const [smokeMethodData, setSmokeMethodData] = useState({
    lineType: "Thẳng" as "Thẳng" | "Vòng",
    areaEnabled: false,
  });
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([]);

  // Vehicle configs state (Mục 6 - Tinh chỉnh)
  const [vehicleConfigs, setVehicleConfigs] = useState<Record<string, VehicleConfig>>(DEFAULT_VEHICLE_CONFIGS);

  // Load default vehicle configs from backend DB
  useEffect(() => {
    vehicleService.getVehicles()
      .then((data: any[]) => {
        if (data && data.length > 0) {
          const configMap: Record<string, VehicleConfig> = {};
          data.forEach((v) => {
            configMap[v.id] = {
              id: v.id,
              name: v.name,
              desc: v.desc || "",
              l: Number(v.l),
              r: Number(v.r),
              t: Number(v.t),
              materials: v.materials || "",
            };
          });
          setVehicleConfigs(configMap);
        }
      })
      .catch((err) => console.error("Lỗi lấy cấu hình khí tài:", err));
  }, []);

  // Battlefield Structure State (Mục 7)
  const [battlefieldData, setBattlefieldData] = useState<BattlefieldData>({
    firePoints: { distance: "", direction: "Bắc" },
    commandPost: { distance: "", direction: "Bắc" },
    reserveUnit: { distance: "", direction: "Bắc" },
  });

  // Weather State
  const [weatherActive, setWeatherActive] = useState(false);
  const [weatherData, setWeatherData] = useState({
    combatTime: '01.05.26',
    windDirection: "Tây Bắc",
    windAngle: 315,              // angle (°) of primary wind — dùng để tính toán
    secondaryWindDirection: "Tây" as string | null,
    secondaryWindAngle: 270 as number | null,  // angle (°) of secondary wind
    alpha: 0,
    speed: 5,
    rainfall: 50,               // Lượng mây mặc định (%)
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
  // Ưu tiên dùng windAngle đã lưu sẵn (số), fallback sang lookup tên nếu cần
  const baseDirectionAngle = weatherData.windAngle ?? (DIRECTION_ANGLES[weatherData.windDirection] ?? 0);
  const computedAngle = baseDirectionAngle - 180 + weatherData.alpha;

  const baseSecondaryDirectionAngle = weatherData.secondaryWindAngle ?? (weatherData.secondaryWindDirection ? DIRECTION_ANGLES[weatherData.secondaryWindDirection] : null);
  const computedSecondaryAngle = baseSecondaryDirectionAngle !== null ? baseSecondaryDirectionAngle - 180 : null;

  const weatherDataWithAngle = {
    ...weatherData,
    angle: computedAngle,
    secondaryAngle: computedSecondaryAngle
  };

  const fetchMaps = async () => {
    try {
      const userId = sessionStorage.getItem("userId") || undefined;
      const data = await mapService.getAllMaps(userId);
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
            toast.error("Xử lý bản đồ thất bại!");
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
      const userId = sessionStorage.getItem("userId") || undefined;
      const newMap = await mapService.uploadMap(file, userId, (percent) => {
        setUploadProgress(percent);
      });
      setCurrentMap(newMap);
      fetchMaps();
    } catch (e) {
      toast.error("Tải bản đồ lên thất bại!");
    }
    setIsUploading(false);
    setUploadProgress(0);
  };

  const handleUploadFile = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    try {
      const userId = sessionStorage.getItem("userId") || undefined;
      const newMap = await mapService.uploadMap(file, userId, (percent) => {
        setUploadProgress(percent);
      });
      setCurrentMap(newMap);
      fetchMaps();
    } catch (e) {
      toast.error("Tải bản đồ lên thất bại!");
    }
    setIsUploading(false);
    setUploadProgress(0);
  };

  const handleRenameMap = async (mapId: string, newName: string) => {
    try {
      await mapService.renameMap(mapId, newName);
      if (currentMap?.id === mapId) {
        setCurrentMap({ ...currentMap, name: newName });
      }
      fetchMaps();
    } catch (e) {
      toast.error("Đổi tên bản đồ thất bại!");
    }
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
    if (!currentMap) return toast.error("Hãy chọn bản đồ trước!");
    if (!p1.rawX || !p1.rawY || !p2.rawX || !p2.rawY)
      return toast.error("Cần chọn đủ 2 điểm trên bản đồ!");
    if (!p1.realX || !p1.realY || !p2.realX || !p2.realY)
      return toast.error("Cần nhập tọa độ thực tế VN-2000 cho cả 2 điểm!");

    const rX1 = parseFloat(p1.realX);
    const rY1 = parseFloat(p1.realY);
    const rX2 = parseFloat(p2.realX);
    const rY2 = parseFloat(p2.realY);

    const sX = (rX2 - rX1) / (p2.rawX! - p1.rawX!);
    const sY = (rY2 - rY1) / (p2.rawY! - p1.rawY!);

    if (sX === 0 || sY === 0 || !isFinite(sX))
      return toast.error("2 điểm không hợp lệ (không được trùng nhau)!");

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
      return toast.error("Bạn phải hiệu chuẩn bản đồ trước khi tìm tọa độ thật!");
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
          return toast.error(
            "Tọa độ " +
              x +
              ", " +
              y +
              " nằm ngoài phạm vi giới hạn của bản đồ hiện tại!",
          );
        }

        setClickedRaw(rawTarget);
        setMapFlyCenter(rawTarget);
      }
    }
  };

  const currentRealCoords = clickedRaw
    ? rawToReal(clickedRaw.lng, clickedRaw.lat)
    : null;

  const performCalculation = (inputs: {
    targetDefenseData: any;
    smokeMethodData: any;
    selectedVehicles: string[];
    battlefieldData: any;
    weatherData: any;
    smokeTime: any;
    vehicleConfigs: Record<string, VehicleConfig>;
  }) => {
    const area = parseFloat(inputs.targetDefenseData.area) || 1000;
    const coverage = parseFloat(inputs.targetDefenseData.coverageMultiplier) || 1.2;
    const targetArea = area * coverage;
    
    const windSpeed = parseFloat(inputs.weatherData.speed) || 5;
    const routesCount = parseInt(inputs.battlefieldData.routes) || 1;
    const lineType = inputs.smokeMethodData.lineType; // "Thẳng" | "Vòng"
    const areaEnabled = inputs.smokeMethodData.areaEnabled;
    const vehicle = inputs.selectedVehicles[0] || "HPK-2.5";

    const configs = inputs.vehicleConfigs || DEFAULT_VEHICLE_CONFIGS;
    const config = configs[vehicle] || DEFAULT_VEHICLE_CONFIGS["HPK-2.5"];

    let straightLine_vehicles = 0;
    let straightLine_routes = 0;
    let circularLine_vehicles = 0;
    let circularLine_routes = 0;
    let pointDefense_vehicles = 0;

    // Use vehicle-specific l * r cover area instead of hardcoded 2000
    const vehicleCoverArea = config.l * config.r || 1200;
    let baseVehicles = Math.ceil(targetArea / vehicleCoverArea) * (windSpeed > 5 ? 2 : 1);
    if (baseVehicles < 1) baseVehicles = 1;

    if (lineType === "Thẳng") {
      straightLine_vehicles = baseVehicles;
      straightLine_routes = routesCount;
    } else {
      circularLine_vehicles = baseVehicles;
      circularLine_routes = routesCount;
    }

    if (areaEnabled) {
      pointDefense_vehicles = Math.ceil(targetArea / vehicleCoverArea);
    }

    const totalPoints = (straightLine_vehicles * straightLine_routes) + 
                         (circularLine_vehicles * circularLine_routes) + 
                         pointDefense_vehicles;

    let kh1_fuel_lit = 0;
    let hpk_boxes = 0;
    let tpk_cans = 0;

    if (vehicle === "KH-1" || vehicle === "TDA-M") {
      kh1_fuel_lit = totalPoints * 120; // 120 liters
    } else if (vehicle === "HPK-2.5" || vehicle === "KHOI_UNG_DUNG") {
      hpk_boxes = totalPoints * 5; // 5 boxes
    } else if (vehicle === "TPK") {
      tpk_cans = totalPoints * 2; // 2 cans
    }

    const coverTime_min = windSpeed > 0 
      ? Math.max(1, Math.round(config.l / (60 * windSpeed))) 
      : 1;

    return {
      straightLine_vehicles,
      straightLine_routes,
      circularLine_vehicles,
      circularLine_routes,
      pointDefense_vehicles,
      kh1_fuel_lit,
      hpk_boxes,
      tpk_cans,
      coverTime_min,
    };
  };

  const onAddPoint = () => {
    if (!isCalibrated) return toast.error("Bạn cần hiệu chuẩn bản đồ trước!");
    if (!clickedRaw) return toast.error("Vui lòng chọn một vị trí trên bản đồ!");

    const currentResults = performCalculation({
      targetDefenseData,
      smokeMethodData,
      selectedVehicles,
      battlefieldData,
      weatherData,
      smokeTime,
      vehicleConfigs,
    });

    const newPoint = {
      id: Math.random().toString(36).substring(2, 9),
      name: `Điểm ${pointsList.length + 1}`,
      coords: clickedRaw,
      realCoords: rawToReal(clickedRaw.lng, clickedRaw.lat),
      targetDefenseData: { ...targetDefenseData },
      smokeMethodData: { ...smokeMethodData },
      selectedVehicles: [...selectedVehicles],
      battlefieldData: { ...battlefieldData },
      weatherData: { ...weatherData },
      smokeTime: { ...smokeTime },
      vehicleConfigs: { ...vehicleConfigs },
      results: currentResults,
    };

    setPointsList([...pointsList, newPoint]);
    setResults(currentResults);
    setSelectedPointId(newPoint.id);
    setClickedRaw(null);
  };

  const onDeletePoint = (id: string) => {
    const updated = pointsList.filter((p) => p.id !== id);
    setPointsList(updated);

    if (updated.length === 0) {
      setResults(null);
      setSelectedPointId(null);
    } else {
      const lastPoint = updated[updated.length - 1];
      setResults(lastPoint.results);
      setSelectedPointId(lastPoint.id);
    }
  };

  const onRenamePoint = (id: string, name: string) => {
    setPointsList(pointsList.map((p) => (p.id === id ? { ...p, name } : p)));
  };

  const onSelectPoint = (id: string) => {
    setSelectedPointId(id);
    const point = pointsList.find((p) => p.id === id);
    if (point) {
      setResults(point.results);
      setMapFlyCenter(point.coords);
      
      setTargetDefenseData(point.targetDefenseData);
      setSmokeMethodData(point.smokeMethodData);
      setSelectedVehicles(point.selectedVehicles);
      setBattlefieldData(point.battlefieldData);
      setWeatherData(point.weatherData);
      setSmokeTime(point.smokeTime);
      if (point.vehicleConfigs) {
        setVehicleConfigs(point.vehicleConfigs);
      } else {
        setVehicleConfigs(DEFAULT_VEHICLE_CONFIGS);
      }
    }
  };

  const onCalculate = () => {
    let listToCalculate = [...pointsList];

    if (clickedRaw) {
      const activePointResults = performCalculation({
        targetDefenseData,
        smokeMethodData,
        selectedVehicles,
        battlefieldData,
        weatherData,
        smokeTime,
        vehicleConfigs,
      });

      const tempActivePoint = {
        id: "active",
        coords: clickedRaw,
        targetDefenseData,
        smokeMethodData,
        selectedVehicles,
        battlefieldData,
        weatherData,
        smokeTime,
        vehicleConfigs,
        results: activePointResults,
      };
      listToCalculate.push(tempActivePoint);
    }

    if (listToCalculate.length === 0) {
      return toast.error("Vui lòng chọn vị trí trên bản đồ và cấu hình rồi bấm Điểm kế tiếp hoặc Tính toán!");
    }

    const aggregatedResults = listToCalculate.reduce(
      (acc, p) => {
        const r = p.results;
        return {
          straightLine_vehicles: (acc.straightLine_vehicles || 0) + (r.straightLine_vehicles || 0),
          straightLine_routes: (acc.straightLine_routes || 0) + (r.straightLine_routes || 0),
          circularLine_vehicles: (acc.circularLine_vehicles || 0) + (r.circularLine_vehicles || 0),
          circularLine_routes: (acc.circularLine_routes || 0) + (r.circularLine_routes || 0),
          pointDefense_vehicles: (acc.pointDefense_vehicles || 0) + (r.pointDefense_vehicles || 0),
          kh1_fuel_lit: (acc.kh1_fuel_lit || 0) + (r.kh1_fuel_lit || 0),
          hpk_boxes: (acc.hpk_boxes || 0) + (r.hpk_boxes || 0),
          tpk_cans: (acc.tpk_cans || 0) + (r.tpk_cans || 0),
          coverTime_min: Math.max(acc.coverTime_min || 0, r.coverTime_min || 0),
        };
      },
      {
        straightLine_vehicles: 0,
        straightLine_routes: 0,
        circularLine_vehicles: 0,
        circularLine_routes: 0,
        pointDefense_vehicles: 0,
        kh1_fuel_lit: 0,
        hpk_boxes: 0,
        tpk_cans: 0,
        coverTime_min: 0,
      }
    );

    setResults(aggregatedResults);
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
        onRenameMap={handleRenameMap}
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
        vehicleConfigs={vehicleConfigs}
        setVehicleConfigs={setVehicleConfigs}
        battlefieldData={battlefieldData}
        setBattlefieldData={setBattlefieldData}
        onCalculate={onCalculate}
        pointsList={pointsList}
        onDeletePoint={onDeletePoint}
        onAddPoint={onAddPoint}
        onRenamePoint={onRenamePoint}
        selectedPointId={selectedPointId}
        onSelectPoint={onSelectPoint}
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

            {/* Saved Points Markers */}
            {pointsList.map((p, idx) => {
              const baseDirAngle = p.weatherData.windAngle ?? (DIRECTION_ANGLES[p.weatherData.windDirection] ?? 0);
              const compAngle = baseDirAngle - 180 + p.weatherData.alpha;

              return weatherActive ? (
                <GasMarker
                  key={p.id}
                  center={p.coords}
                  angle={compAngle}
                  scaleX={scale.x}
                />
              ) : (
                <Marker key={p.id} position={p.coords}>
                  <Tooltip>{p.name || `Điểm ${idx + 1}`}</Tooltip>
                </Marker>
              );
            })}


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
        results={results || undefined}
      />
    </div>
  );
}
