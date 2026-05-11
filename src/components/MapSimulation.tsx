import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Map as MapIcon, CheckCircle2, UploadCloud, MapPinned } from 'lucide-react';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconRetinaUrl: iconRetina,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

import { mapService } from '../services/map.service';
import { BASE_URL } from '../const/apiConfig';
import { CalibrationPanel } from './simulation/CalibrationPanel';
import { WeatherPanel } from './simulation/WeatherPanel';
import { TargetPanel } from './simulation/TargetPanel';
import { WeatherOverlay } from './simulation/WeatherOverlay';

function ClickHandler({ onMapClick }: { onMapClick: (e: L.LeafletMouseEvent) => void }) {
  useMapEvents({ click: onMapClick }); return null;
}

function MapController({ center }: { center: L.LatLng | null }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, map.getZoom(), { duration: 0.5 });
  }, [center, map]);
  return null;
}

type CalibrationPoint = { rawX: number | null, rawY: number | null, realX: string, realY: string };

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
  const [isSelectingFor, setIsSelectingFor] = useState<'p1' | 'p2' | null>(null);
  const [p1, setP1] = useState<CalibrationPoint>({ rawX: null, rawY: null, realX: '', realY: '' });
  const [p2, setP2] = useState<CalibrationPoint>({ rawX: null, rawY: null, realX: '', realY: '' });
  const [scale, setScale] = useState({ x: 1, y: 1 });

  const [searchX, setSearchX] = useState('');
  const [searchY, setSearchY] = useState('');

  // Weather State
  const [weatherActive, setWeatherActive] = useState(false);
  const [weatherData, setWeatherData] = useState({
    season: 'MÙA HÈ',
    angle: 315,
    speed: 5,
    tkkMin: 28,
    tkkMax: 35,
    tmdMin: 30,
    tmdMax: 37
  });

  const fetchMaps = async () => {
    try {
      const data = await mapService.getAllMaps();
      setMaps(data);
    } catch (e) { console.error("Cannot fetch maps", e); }
  };

  useEffect(() => { fetchMaps(); }, []);

  useEffect(() => {
    if (currentMap && currentMap.calibration) {
      setP1(currentMap.calibration.p1);
      setP2(currentMap.calibration.p2);
      setScale(currentMap.calibration.scale);
      setIsCalibrated(true);
    } else {
      setP1({ rawX: null, rawY: null, realX: '', realY: '' });
      setP2({ rawX: null, rawY: null, realX: '', realY: '' });
      setIsCalibrated(false);
      setScale({x:1, y:1});
    }
    setClickedRaw(null);
    setTargetRaw(null);
  }, [currentMap?.id]);

  useEffect(() => {
    let interval: any;
    if (currentMap?.status === 'processing') {
      interval = setInterval(async () => {
        try {
          const updated = await mapService.getMapById(currentMap.id);
          if (updated.status === 'ready') {
            setCurrentMap(updated);
            fetchMaps();
            clearInterval(interval);
          } else if (updated.status === 'error') {
            alert("Xử lý bản đồ thất bại!");
            clearInterval(interval);
          }
        } catch(e) {}
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
    } catch(e) {
       alert('Upload thất bại');
    }
    setIsUploading(false);
    setUploadProgress(0);
  };

  const handleMapClick = (e: L.LeafletMouseEvent) => {
    const rawX = e.latlng.lng;
    const rawY = e.latlng.lat;
    setClickedRaw(e.latlng);

    if (isSelectingFor === 'p1') {
      setP1({ ...p1, rawX, rawY });
      setIsSelectingFor(null);
    } else if (isSelectingFor === 'p2') {
      setP2({ ...p2, rawX, rawY });
      setIsSelectingFor(null);
    }
  };

  const calculateCalibration = async () => {
    if (!currentMap) return alert("Hãy chọn bản đồ trước");
    if (!p1.rawX || !p1.rawY || !p2.rawX || !p2.rawY) return alert("Cần chọn đủ 2 điểm trên bản đồ!");
    if (!p1.realX || !p1.realY || !p2.realX || !p2.realY) return alert("Cần nhập tọa độ thực tế VN-2000 cho cả 2 điểm!");
    
    const rX1 = parseFloat(p1.realX); const rY1 = parseFloat(p1.realY);
    const rX2 = parseFloat(p2.realX); const rY2 = parseFloat(p2.realY);

    const sX = (rX2 - rX1) / (p2.rawX! - p1.rawX!);
    const sY = (rY2 - rY1) / (p2.rawY! - p1.rawY!);

    if (sX === 0 || sY === 0 || !isFinite(sX)) return alert("2 điểm không hợp lệ (không được trùng nhau)!");

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
    if(!isCalibrated) return { x: rx, y: ry };
    const realX = parseFloat(p1.realX) + (rx - p1.rawX!) * scale.x;
    const realY = parseFloat(p1.realY) + (ry - p1.rawY!) * scale.y;
    return { x: realX, y: realY };
  };

  const realToRaw = (realX: number, realY: number) => {
    if(!isCalibrated) return null;
    const rawX = p1.rawX! + (realX - parseFloat(p1.realX)) / scale.x;
    const rawY = p1.rawY! + (realY - parseFloat(p1.realY)) / scale.y;
    return L.latLng(rawY, rawX);
  };

  const handleSearch = () => {
    if (!isCalibrated) return alert("Bạn phải Hiệu chuẩn bản đồ trước khi tìm tọa độ thật!");
    const x = parseFloat(searchX);
    const y = parseFloat(searchY);
    if (!isNaN(x) && !isNaN(y)) {
      const rawTarget = realToRaw(x, y);
      if(rawTarget) {
        const mWidth = currentMap?.width || 0;
        const mHeight = currentMap?.height || 0;
        const maxScale = Math.pow(2, currentMap?.maxNativeZoom || 6);
        
        if (
          rawTarget.lng < 0 || 
          rawTarget.lng > (mWidth / maxScale) || 
          rawTarget.lat > 0 || 
          rawTarget.lat < -(mHeight / maxScale)
        ) {
          return alert("Tọa độ " + x + ", " + y + " nằm ngoài phạm vi giới hạn của bản đồ hiện tại!");
        }

        setTargetRaw(rawTarget);
      }
    }
  };

  const currentRealCoords = clickedRaw ? rawToReal(clickedRaw.lng, clickedRaw.lat) : null;

  // Calculate Map Bounds dynamically
  const mapWidth = currentMap?.width || 0;
  const mapHeight = currentMap?.height || 0;
  const maxNativeZ = currentMap?.maxNativeZoom || 6;
  const maxScale = Math.pow(2, maxNativeZ);
  const dynamicBounds: L.LatLngBoundsExpression = [[-(mapHeight / maxScale), 0], [0, mapWidth / maxScale]];

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      
      <div className="w-[420px] flex-shrink-0 bg-white border-r border-slate-200 flex flex-col shadow-sm z-10">
        
        <div className="p-4 border-b border-slate-200 bg-slate-100/50">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1"><MapPinned size={14}/> Thư viện Bản đồ</h2>
          <div className="flex gap-2">
            <select 
              className="flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-1 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={currentMap?.id || ''}
              onChange={(e) => {
                const smap = maps.find(m => m.id === e.target.value);
                if(smap) setCurrentMap(smap);
              }}
            >
              <option value="" disabled>Chọn một bản đồ để thao tác...</option>
              {maps.map(m => <option key={m.id} value={m.id}>{m.name} {m.status !== 'ready' ? '(Đang xử lý...)' : ''}</option>)}
            </select>
            <label className={`flex items-center justify-center bg-white hover:bg-slate-50 border border-slate-300 rounded-md cursor-pointer text-slate-700 shadow-sm transition-all overflow-hidden ${isUploading ? 'w-24 px-2' : 'w-10 px-0'}`}>
              {isUploading ? (
                <div className="flex flex-col items-center justify-center w-full gap-1">
                  <span className="text-[10px] font-bold text-blue-600 leading-none">{uploadProgress}%</span>
                  <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full transition-all duration-300" style={{width: `${uploadProgress}%`}}></div>
                  </div>
                </div>
              ) : <UploadCloud size={18} />}
              <input type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleUpload} disabled={isUploading} />
            </label>
          </div>
        </div>

        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isCalibrated ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
              <MapIcon size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">Mô phỏng Khí tài</h1>
              <p className="text-sm font-medium flex items-center gap-1">
                Trạng thái: {isCalibrated ? 
                  <span className="text-emerald-600 flex items-center"><CheckCircle2 size={14} className="mr-1"/> Đã hiệu chuẩn</span> : 
                  <span className="text-rose-600 font-bold">Cần hiệu chuẩn</span>}
              </p>
            </div>
          </div>
        </div>

        <div className={`p-4 flex-1 overflow-y-auto space-y-6 ${(!currentMap || currentMap.status !== 'ready') ? 'opacity-50 pointer-events-none' : ''}`}>
          {/* STEP 1: CALIBRATION */}
          <CalibrationPanel 
            isCalibrated={isCalibrated} setIsCalibrated={setIsCalibrated}
            showCalibration={showCalibration} setShowCalibration={setShowCalibration}
            p1={p1} setP1={setP1}
            p2={p2} setP2={setP2}
            isSelectingFor={isSelectingFor} setIsSelectingFor={setIsSelectingFor}
            calculateCalibration={calculateCalibration}
          />

          {/* STEP 2: WEATHER */}
          <WeatherPanel 
            isCalibrated={isCalibrated}
            showWeather={showWeather} setShowWeather={setShowWeather}
            weatherActive={weatherActive} setWeatherActive={setWeatherActive}
            weatherData={weatherData} setWeatherData={setWeatherData}
          />

          {/* STEP 3: FIND & CHECK COORDS */}
          <TargetPanel 
            isCalibrated={isCalibrated}
            currentRealCoords={currentRealCoords}
            searchX={searchX} setSearchX={setSearchX}
            searchY={searchY} setSearchY={setSearchY}
            handleSearch={handleSearch}
          />
        </div>
      </div>

      <div className="flex-1 relative bg-white flex flex-col">
        {/* Lớp Weather Overlay */}
        <WeatherOverlay 
          weatherActive={weatherActive} 
          currentMapStatus={currentMap?.status} 
          weatherData={weatherData} 
        />

        {currentMap?.status === 'ready' ? (
          <MapContainer
            key={currentMap.id}
            center={[-(mapHeight / maxScale) / 2, (mapWidth / maxScale) / 2]} zoom={1} minZoom={0} maxZoom={9}
            maxBounds={dynamicBounds} maxBoundsViscosity={1.0}
            crs={L.CRS.Simple} className="w-full h-full cursor-crosshair" 
            style={{ background: '#ffffff' }}
          >
            <TileLayer 
              url={`${BASE_URL}/uploads/maptiles/${currentMap.id}/{z}/{y}/{x}.png`}
              noWrap={true} 
              minNativeZoom={0}
              maxNativeZoom={maxNativeZ}
              bounds={dynamicBounds} 
            />
            <ClickHandler onMapClick={handleMapClick} />
            <MapController center={targetRaw} />
            
            {/* Calibration Markers */}
            {p1.rawX && !isCalibrated && <Marker position={[p1.rawY!, p1.rawX!]}><Tooltip permanent>Mốc 1</Tooltip></Marker>}
            {p2.rawX && !isCalibrated && <Marker position={[p2.rawY!, p2.rawX!]}><Tooltip permanent>Mốc 2</Tooltip></Marker>}
            
            {/* Click Marker */}
            {clickedRaw && isCalibrated && <Marker position={clickedRaw} opacity={0.6}/>}
            {/* Target Marker */}
            {targetRaw && <Marker position={targetRaw} />}
          </MapContainer>
        ) : currentMap?.status === 'processing' ? (
           <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 text-slate-500">
             <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
             <h3 className="text-lg font-bold text-slate-700">Đang xử lý trích xuất lớp bản đồ (Tiles)...</h3>
             <p className="text-sm mt-2">Hệ thống đang tự động xẻ ảnh độ phân giải cao thành mạng lưới Web Map.</p>
             <p className="text-sm">Tuỳ thuộc vào dung lượng, có thể mất từ 30 giây đến vài phút.</p>
           </div>
        ) : (
           <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 text-slate-400">
             <MapIcon size={64} className="mb-4 opacity-50" />
             <h3 className="text-lg font-medium">Chưa có Bản đồ nào được chọn</h3>
             <p className="text-sm">Vui lòng chọn từ thư viện bên trái hoặc Upload bản đồ mới</p>
           </div>
        )}
      </div>
    </div>
  );
}
