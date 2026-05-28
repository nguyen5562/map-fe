import { Wind } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

const DIRECTIONS = [
  { name: 'Bắc', short: 'B', angle: 0 },
  { name: 'Đông Bắc', short: 'ĐB', angle: 45 },
  { name: 'Đông', short: 'Đ', angle: 90 },
  { name: 'Đông Nam', short: 'ĐN', angle: 135 },
  { name: 'Nam', short: 'N', angle: 180 },
  { name: 'Tây Nam', short: 'TN', angle: 225 },
  { name: 'Tây', short: 'T', angle: 270 },
  { name: 'Tây Bắc', short: 'TB', angle: 315 },
];

export const WeatherPanel = ({
  isCalibrated,
  showWeather, setShowWeather,
  weatherActive, setWeatherActive,
  weatherData, setWeatherData
}: any) => {
  const selectedDir = DIRECTIONS.find(d => d.name === weatherData.windDirection) || DIRECTIONS[0];

  return (
    <div className={`space-y-4 p-4 rounded-xl border bg-white border-slate-200 shadow-sm transition-opacity ${!isCalibrated ? 'opacity-30 pointer-events-none' : ''}`}>
      <div className="flex items-center justify-between border-b border-slate-200 pb-2 cursor-pointer" onClick={() => setShowWeather(!showWeather)}>
        <div className="flex items-center gap-2">
          <Wind size={18} className="text-blue-600" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">3. Khí tượng</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant={weatherActive ? 'primary' : 'outline'} onClick={(e: any) => {
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
        <div className="space-y-4 mt-2">
          {/* Season */}
          <div>
            <label className="text-xs font-semibold text-slate-500">Mùa</label>
            <select value={weatherData.season} onChange={(e) => setWeatherData({ ...weatherData, season: e.target.value })} className="flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold">
              <option value="MÙA XUÂN">Mùa Xuân</option>
              <option value="MÙA HÈ">Mùa Hè</option>
              <option value="MÙA THU">Mùa Thu</option>
              <option value="MÙA ĐÔNG">Mùa Đông</option>
            </select>
          </div>

          {/* Wind Direction Compass */}
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-2 block">Hướng gió chính</label>
            <div className="flex items-center gap-4">
              {/* Compass Rose */}
              <div className="relative w-[140px] h-[140px] flex-shrink-0">
                {/* Outer ring */}
                <div className="absolute inset-0 rounded-full border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-blue-50/30"></div>
                {/* Inner circle */}
                <div className="absolute inset-[30%] rounded-full border border-slate-200/60 bg-white/80"></div>
                {/* Cross lines */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 140 140">
                  <line x1="70" y1="8" x2="70" y2="132" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3,3" />
                  <line x1="8" y1="70" x2="132" y2="70" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3,3" />
                  <line x1="25" y1="25" x2="115" y2="115" stroke="#e2e8f0" strokeWidth="0.8" strokeDasharray="3,3" />
                  <line x1="115" y1="25" x2="25" y2="115" stroke="#e2e8f0" strokeWidth="0.8" strokeDasharray="3,3" />
                </svg>
                {/* Wind arrow indicator - points toward selected wind direction */}
                <div
                  className="absolute inset-0 transition-transform duration-300 ease-out"
                  style={{ transform: `rotate(${selectedDir.angle}deg)` }}
                >
                  <svg className="absolute w-full h-full" viewBox="0 0 140 140">
                    <defs>
                      <linearGradient id="arrowGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563eb" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                    <polygon
                      points="70,12 63,38 70,32 77,38"
                      fill="url(#arrowGradient)"
                      stroke="#1d4ed8"
                      strokeWidth="0.5"
                    />
                    <line x1="70" y1="38" x2="70" y2="85" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
                  </svg>
                </div>

                {/* Direction buttons */}
                {DIRECTIONS.map((dir) => {
                  const isSelected = dir.name === weatherData.windDirection;
                  // Position each label around the circle
                  const rad = (dir.angle - 90) * (Math.PI / 180);
                  const radius = 62;
                  const cx = 70 + radius * Math.cos(rad);
                  const cy = 70 + radius * Math.sin(rad);

                  return (
                    <button
                      key={dir.name}
                      onClick={() => setWeatherData({ ...weatherData, windDirection: dir.name })}
                      className={`absolute flex items-center justify-center rounded-full text-[10px] font-bold transition-all duration-200 focus:outline-none
                        ${isSelected
                          ? 'w-7 h-7 bg-blue-600 text-white shadow-lg shadow-blue-300/50 scale-110 ring-2 ring-blue-300'
                          : 'w-6 h-6 bg-white text-slate-500 border border-slate-300 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 hover:scale-105'
                        }`}
                      style={{
                        left: `${cx}px`,
                        top: `${cy}px`,
                        transform: 'translate(-50%, -50%)',
                      }}
                      title={dir.name}
                    >
                      {dir.short}
                    </button>
                  );
                })}
              </div>

              {/* Direction info + alpha */}
              <div className="flex-1 space-y-3">
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                  <span className="text-[10px] text-blue-500 font-medium uppercase tracking-wider">Hướng đã chọn</span>
                  <p className="text-sm font-bold text-blue-800 mt-0.5">{selectedDir.name} ({selectedDir.angle}°)</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Góc lệch α (°)</label>
                  <Input
                    value={weatherData.alpha}
                    onChange={(e: any) => setWeatherData({ ...weatherData, alpha: Number(e.target.value) })}
                    placeholder="0"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Lệch so với hướng chính</p>
                </div>
                <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-2">
                  Góc tổng hợp: <span className="font-bold text-slate-600">{(selectedDir.angle + (weatherData.alpha || 0))}°</span>
                </div>
              </div>
            </div>
          </div>

          {/* Speed */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-slate-500">Tốc độ gió (m/s)</label>
              <Input value={weatherData.speed} onChange={(e: any) => setWeatherData({ ...weatherData, speed: Number(e.target.value) })} placeholder="m/s" />
            </div>
          </div>

          {/* Temperatures */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-slate-500">tº Không khí (°C)</label>
              <div className="flex gap-2 items-center">
                <Input value={weatherData.tkkMin} onChange={(e: any) => setWeatherData({ ...weatherData, tkkMin: Number(e.target.value) })} placeholder="Từ" />
                <span className="text-slate-400 font-bold">-</span>
                <Input value={weatherData.tkkMax} onChange={(e: any) => setWeatherData({ ...weatherData, tkkMax: Number(e.target.value) })} placeholder="Đến" />
              </div>
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-slate-500">tº Mặt đất (°C)</label>
              <div className="flex gap-2 items-center">
                <Input value={weatherData.tmdMin} onChange={(e: any) => setWeatherData({ ...weatherData, tmdMin: Number(e.target.value) })} placeholder="Từ" />
                <span className="text-slate-400 font-bold">-</span>
                <Input value={weatherData.tmdMax} onChange={(e: any) => setWeatherData({ ...weatherData, tmdMax: Number(e.target.value) })} placeholder="Đến" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
