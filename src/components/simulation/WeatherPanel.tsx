import { Wind } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export const WeatherPanel = ({ 
  isCalibrated, 
  showWeather, setShowWeather, 
  weatherActive, setWeatherActive, 
  weatherData, setWeatherData 
}: any) => {
  return (
    <div className={`space-y-4 p-4 rounded-xl border bg-white border-slate-200 shadow-sm transition-opacity ${!isCalibrated ? 'opacity-30 pointer-events-none' : ''}`}>
      <div className="flex items-center justify-between border-b border-slate-200 pb-2 cursor-pointer" onClick={() => setShowWeather(!showWeather)}>
        <div className="flex items-center gap-2">
          <Wind size={18} className="text-blue-600" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">2. Khí tượng</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant={weatherActive ? 'primary' : 'outline'} onClick={(e:any) => {
            e.stopPropagation();
            const newState = !weatherActive;
            setWeatherActive(newState);
            if (newState) setShowWeather(false);
          }} className="h-7 text-xs px-2">
            {weatherActive ? 'Tắt hiển thị' : 'Bật hiển thị'}
          </Button>
          <span className="text-slate-400 text-xs ml-1">{showWeather ? '▼' : '▲'}</span>
        </div>
      </div>
      
      {showWeather && (
        <div className="grid grid-cols-2 gap-3 mt-2">
           <div className="col-span-2">
             <label className="text-xs font-semibold text-slate-500">Mùa</label>
             <select value={weatherData.season} onChange={(e) => setWeatherData({...weatherData, season: e.target.value})} className="flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold">
               <option value="MÙA XUÂN">Mùa Xuân</option>
               <option value="MÙA HÈ">Mùa Hè</option>
               <option value="MÙA THU">Mùa Thu</option>
               <option value="MÙA ĐÔNG">Mùa Đông</option>
             </select>
           </div>
           <div>
             <label className="text-xs font-semibold text-slate-500">Góc gió (°)</label>
             <Input value={weatherData.angle} onChange={(e:any) => setWeatherData({...weatherData, angle: Number(e.target.value)})} placeholder="Độ" />
           </div>
           <div>
             <label className="text-xs font-semibold text-slate-500">Tốc độ (m/s)</label>
             <Input value={weatherData.speed} onChange={(e:any) => setWeatherData({...weatherData, speed: Number(e.target.value)})} placeholder="m/s" />
           </div>
           <div className="col-span-2">
             <label className="text-xs font-semibold text-slate-500">tº Không khí (°C)</label>
             <div className="flex gap-2 items-center">
               <Input value={weatherData.tkkMin} onChange={(e:any) => setWeatherData({...weatherData, tkkMin: Number(e.target.value)})} placeholder="Từ" />
               <span className="text-slate-400 font-bold">-</span>
               <Input value={weatherData.tkkMax} onChange={(e:any) => setWeatherData({...weatherData, tkkMax: Number(e.target.value)})} placeholder="Đến" />
             </div>
           </div>
           <div className="col-span-2">
             <label className="text-xs font-semibold text-slate-500">tº Mặt đất (°C)</label>
             <div className="flex gap-2 items-center">
               <Input value={weatherData.tmdMin} onChange={(e:any) => setWeatherData({...weatherData, tmdMin: Number(e.target.value)})} placeholder="Từ" />
               <span className="text-slate-400 font-bold">-</span>
               <Input value={weatherData.tmdMax} onChange={(e:any) => setWeatherData({...weatherData, tmdMax: Number(e.target.value)})} placeholder="Đến" />
             </div>
           </div>
        </div>
      )}
    </div>
  );
};
