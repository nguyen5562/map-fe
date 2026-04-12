import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Target, Search, Crosshair, Map as MapIcon, Settings, CheckCircle2 } from 'lucide-react';

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

const Button = ({ children, onClick, variant = 'primary', className = '', disabled=false }: any) => {
  const baseStyle = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
    outline: "border border-slate-200 bg-white hover:bg-slate-100 text-slate-900",
    success: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm",
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant as keyof typeof variants]} ${className}`}>
      {children}
    </button>
  );
};

const Input = ({ value, onChange, placeholder, className = '' }: any) => (
  <input type="number" value={value} onChange={onChange} placeholder={placeholder}
    className={`flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-1 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 ${className}`}
  />
);

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

type CalibrationPoint = {
  rawX: number | null, rawY: number | null,
  realX: string, realY: string
};

export default function MapSimulation() {
  const [clickedRaw, setClickedRaw] = useState<L.LatLng | null>(null);
  const [targetRaw, setTargetRaw] = useState<L.LatLng | null>(null);

  // Calibration State
  const [isCalibrated, setIsCalibrated] = useState(false);
  const [isSelectingFor, setIsSelectingFor] = useState<'p1' | 'p2' | null>(null);
  
  const [p1, setP1] = useState<CalibrationPoint>({ rawX: null, rawY: null, realX: '', realY: '' });
  const [p2, setP2] = useState<CalibrationPoint>({ rawX: null, rawY: null, realX: '', realY: '' });
  
  const [scale, setScale] = useState({ x: 1, y: 1 });

  // Search Inputs
  const [searchX, setSearchX] = useState('');
  const [searchY, setSearchY] = useState('');

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

  const calculateCalibration = () => {
    if (!p1.rawX || !p1.rawY || !p2.rawX || !p2.rawY) return alert("Cần chọn đủ 2 điểm trên bản đồ!");
    if (!p1.realX || !p1.realY || !p2.realX || !p2.realY) return alert("Cần nhập tọa độ thực tế VN-2000 cho cả 2 điểm!");
    
    const rX1 = parseFloat(p1.realX); const rY1 = parseFloat(p1.realY);
    const rX2 = parseFloat(p2.realX); const rY2 = parseFloat(p2.realY);

    const sX = (rX2 - rX1) / (p2.rawX! - p1.rawX!);
    const sY = (rY2 - rY1) / (p2.rawY! - p1.rawY!);

    if (sX === 0 || sY === 0 || !isFinite(sX)) return alert("2 điểm không hợp lệ (không được trùng nhau)!");

    setScale({ x: sX, y: sY });
    setIsCalibrated(true);
    setClickedRaw(null); // Clear click state
  };

  // Convert Math
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
      if(rawTarget) setTargetRaw(rawTarget);
    }
  };

  const currentRealCoords = clickedRaw ? rawToReal(clickedRaw.lng, clickedRaw.lat) : null;

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      
      <div className="w-[420px] flex-shrink-0 bg-white border-r border-slate-200 flex flex-col shadow-sm z-10">
        
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
                  <span className="text-rose-600 font-bold">Chưa hiệu chuẩn</span>}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 flex-1 overflow-y-auto space-y-6">
          
          {/* STEP 1: CALIBRATION */}
          <div className={`space-y-4 p-4 rounded-xl border ${isCalibrated ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-blue-50/50 border-blue-200 shadow-sm'}`}>
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <Settings size={18} className={isCalibrated ? "text-slate-400" : "text-blue-600"} />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">1. Hiệu chuẩn Bản đồ</h2>
              </div>
              {isCalibrated && <Button variant="outline" onClick={() => setIsCalibrated(false)} className="h-7 text-xs px-2">Làm lại</Button>}
            </div>

            {!isCalibrated && (
              <p className="text-xs text-slate-600 my-2">Bản đồ đang ở trạng thái pixel ảnh. Hãy nhập 2 Điểm mốc để quy đổi sang Mét (VN-2000).</p>
            )}

            {/* Point 1 */}
            <div className="space-y-2 bg-white p-3 rounded-md border border-slate-200">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700">📌 Điểm mốc 1</span>
                <Button variant={isSelectingFor === 'p1' ? 'primary' : 'outline'} onClick={() => setIsSelectingFor('p1')} className="h-7 text-xs px-2">
                  {isSelectingFor === 'p1' ? 'Đang chọn trên Map...' : p1.rawX ? 'Đổi điểm trên Map' : 'Click chọn trên Map'}
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Input value={p1.realX} onChange={(e:any) => setP1({...p1, realX: e.target.value})} placeholder="X thật (VD: 528000)" disabled={isCalibrated} />
                <Input value={p1.realY} onChange={(e:any) => setP1({...p1, realY: e.target.value})} placeholder="Y thật (VD: 2349000)" disabled={isCalibrated} />
              </div>
            </div>

            {/* Point 2 */}
            <div className="space-y-2 bg-white p-3 rounded-md border border-slate-200">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700">📌 Điểm mốc 2</span>
                <Button variant={isSelectingFor === 'p2' ? 'primary' : 'outline'} onClick={() => setIsSelectingFor('p2')} className="h-7 text-xs px-2">
                  {isSelectingFor === 'p2' ? 'Đang chọn trên Map...' : p2.rawX ? 'Đổi điểm trên Map' : 'Click chọn trên Map'}
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Input value={p2.realX} onChange={(e:any) => setP2({...p2, realX: e.target.value})} placeholder="X thật (VD: 535000)" disabled={isCalibrated} />
                <Input value={p2.realY} onChange={(e:any) => setP2({...p2, realY: e.target.value})} placeholder="Y thật (VD: 2346000)" disabled={isCalibrated} />
              </div>
            </div>

            {!isCalibrated && (
               <Button onClick={calculateCalibration} variant="primary" className="w-full mt-2 font-bold">
                 Vận hành hệ tọa độ
               </Button>
            )}
          </div>

          {/* STEP 2: FIND & CHECK COORDS */}
          <div className={`space-y-6 transition-opacity ${!isCalibrated && 'opacity-30 pointer-events-none'}`}>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <Crosshair size={18} className="text-slate-600" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">Tọa độ Click</h2>
              </div>
              
              <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
                {currentRealCoords ? (
                  <div className="space-y-2">
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-xs text-slate-500">X (Easting M)</span>
                      <span className="font-mono text-sm font-bold text-blue-700">{currentRealCoords.x.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-500">Y (Northing M)</span>
                      <span className="font-mono text-sm font-bold text-rose-600">{currentRealCoords.y.toFixed(1)}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic text-center">Click lên bản đồ để lấy phần tử</p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <Target size={18} className="text-slate-600" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">Tìm điểm thả khói</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <Input value={searchX} onChange={(e:any) => setSearchX(e.target.value)} placeholder="Nhập X thật..." />
                <Input value={searchY} onChange={(e:any) => setSearchY(e.target.value)} placeholder="Nhập Y thật..." />
              </div>
              <Button onClick={handleSearch} variant="success" className="w-full gap-2 font-bold">
                <Search size={16} /> Di chuyển tới điểm
              </Button>
            </div>
            
          </div>
        </div>
      </div>

      <div className="flex-1 relative bg-white cursor-crosshair">
        <MapContainer
          center={[-108, 74]} zoom={1} minZoom={0} maxZoom={9}
          maxBounds={[[-216.14, 0], [0, 147.89]]} maxBoundsViscosity={1.0}
          crs={L.CRS.Simple} className="w-full h-full" style={{ background: '#ffffff' }}
        >
          <TileLayer 
            url="/maptiles/{z}/{y}/{x}.png" 
            noWrap={true} 
            minNativeZoom={0}
            maxNativeZoom={6}
            bounds={[[-216.14, 0], [0, 147.89]]} 
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
      </div>
    </div>
  );
}
