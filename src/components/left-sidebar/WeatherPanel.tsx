import { useState } from "react";
import { Wind } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { DatePickerInput } from "../ui/DatePickerInput";

const DIRECTIONS = [
  { name: "Bắc", short: "B", angle: 0 },
  { name: "Đông Bắc", short: "ĐB", angle: 45 },
  { name: "Đông", short: "Đ", angle: 90 },
  { name: "Đông Nam", short: "ĐN", angle: 135 },
  { name: "Nam", short: "N", angle: 180 },
  { name: "Tây Nam", short: "TN", angle: 225 },
  { name: "Tây", short: "T", angle: 270 },
  { name: "Tây Bắc", short: "TB", angle: 315 },
];

export const WeatherPanel = ({
  isCalibrated,
  showWeather,
  setShowWeather,
  weatherActive,
  setWeatherActive,
  weatherData,
  setWeatherData,
}: any) => {
  const selectedDir =
    DIRECTIONS.find((d) => d.name === weatherData.windDirection) ||
    DIRECTIONS[0];
  const secondaryDir =
    DIRECTIONS.find((d) => d.name === weatherData.secondaryWindDirection) ||
    null;
  const [activeWindTab, setActiveWindTab] = useState<"primary" | "secondary">(
    "primary",
  );

  return (
    <div
      className={`space-y-4 p-4 rounded-xl border bg-white border-slate-200 shadow-sm transition-opacity ${!isCalibrated ? "opacity-30 pointer-events-none" : ""}`}
    >
      <div
        className="flex items-center justify-between border-b border-slate-200 pb-2 cursor-pointer"
        onClick={() => setShowWeather(!showWeather)}
      >
        <div className="flex items-center gap-2">
          <Wind size={18} className="text-blue-600" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            4. Khí tượng
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={weatherActive ? "primary" : "outline"}
            onClick={(e: any) => {
              e.stopPropagation();
              const newState = !weatherActive;
              setWeatherActive(newState);
              // if (newState) setShowWeather(false);
            }}
            className="h-7 text-xs px-2 w-20"
          >
            {weatherActive ? "Tắt" : "Hiển thị"}
          </Button>
          <span className="text-slate-400 text-xs ml-1">
            {showWeather ? "▼" : "▲"}
          </span>
        </div>
      </div>

      {showWeather && (
        <div className="space-y-4 mt-2">
          {/* Thời gian tác chiến */}
          <div>
            <label className="text-xs font-semibold text-slate-500">
              Thời gian tác chiến
            </label>
            <DatePickerInput
              value={weatherData.combatTime ?? ""}
              onChange={(val: string) =>
                setWeatherData({ ...weatherData, combatTime: val })
              }
              placeholder="DD.MM.YY"
            />
          </div>

          {/* Wind Direction Compass */}
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-2 block">
              Hướng gió
            </label>

            {/* TAB SELECTOR FOR WIND DIRECTION */}
            <div className="flex gap-2 mb-3 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setActiveWindTab("primary")}
                className={`flex-1 py-1 px-2 rounded-md text-xs font-bold transition-all duration-200 active:scale-[0.98] ${
                  activeWindTab === "primary"
                    ? "bg-white text-emerald-700 shadow-sm border border-slate-200"
                    : "text-slate-500 hover:text-slate-700 hover:bg-white/40"
                }`}
              >
                Gió chính ({selectedDir.short})
              </button>
              <button
                type="button"
                onClick={() => setActiveWindTab("secondary")}
                className={`flex-1 py-1 px-2 rounded-md text-xs font-bold transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-1.5 ${
                  activeWindTab === "secondary"
                    ? "bg-white text-amber-700 shadow-sm border border-slate-200"
                    : "text-slate-500 hover:text-slate-700 hover:bg-white/40"
                }`}
              >
                <span>Gió phụ ({secondaryDir ? secondaryDir.short : "T"})</span>
              </button>
            </div>

            <div className="flex items-center gap-4">
              {/* Compass Rose */}
              <div className="relative w-[140px] h-[140px] flex-shrink-0">
                {/* Outer ring */}
                <div className="absolute inset-0 rounded-full border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100/50"></div>
                {/* Inner circle */}
                <div className="absolute inset-[30%] rounded-full border border-slate-200/60 bg-white/80"></div>
                {/* Cross lines */}
                <svg
                  className="absolute inset-0 w-full h-full"
                  viewBox="0 0 140 140"
                >
                  <line
                    x1="70"
                    y1="8"
                    x2="70"
                    y2="132"
                    stroke="#e2e8f0"
                    strokeWidth="1"
                    strokeDasharray="3,3"
                  />
                  <line
                    x1="8"
                    y1="70"
                    x2="132"
                    y2="70"
                    stroke="#e2e8f0"
                    strokeWidth="1"
                    strokeDasharray="3,3"
                  />
                  <line
                    x1="25"
                    y1="25"
                    x2="115"
                    y2="115"
                    stroke="#e2e8f0"
                    strokeWidth="0.8"
                    strokeDasharray="3,3"
                  />
                  <line
                    x1="115"
                    y1="25"
                    x2="25"
                    y2="115"
                    stroke="#e2e8f0"
                    strokeWidth="0.8"
                    strokeDasharray="3,3"
                  />
                </svg>

                {/* Wind arrow indicator - Primary (solid emerald) */}
                <div
                  className="absolute inset-0 transition-transform duration-300 ease-out"
                  style={{ transform: `rotate(${selectedDir.angle}deg)` }}
                >
                  <svg className="absolute w-full h-full" viewBox="0 0 140 140">
                    <defs>
                      <linearGradient
                        id="arrowGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#059669" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                    <polygon
                      points="70,12 63,38 70,32 77,38"
                      fill="url(#arrowGradient)"
                      stroke="#047857"
                      strokeWidth="0.5"
                    />
                    <line
                      x1="70"
                      y1="38"
                      x2="70"
                      y2="85"
                      stroke="#10b981"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      opacity="0.6"
                    />
                  </svg>
                </div>

                {/* Wind arrow indicator - Secondary (dashed amber) */}
                {secondaryDir && (
                  <div
                    className="absolute inset-0 transition-transform duration-300 ease-out"
                    style={{ transform: `rotate(${secondaryDir.angle}deg)` }}
                  >
                    <svg
                      className="absolute w-full h-full"
                      viewBox="0 0 140 140"
                    >
                      <polygon
                        points="70,15 65,35 70,30 75,35"
                        fill="#f59e0b"
                        stroke="#d97706"
                        strokeWidth="0.5"
                      />
                      <line
                        x1="70"
                        y1="35"
                        x2="70"
                        y2="85"
                        stroke="#f59e0b"
                        strokeWidth="2"
                        strokeDasharray="3,3"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                )}

                {/* Direction buttons */}
                {DIRECTIONS.map((dir) => {
                  const isPrimary = dir.name === weatherData.windDirection;
                  const isSecondary =
                    dir.name === weatherData.secondaryWindDirection;
                  const rad = (dir.angle - 90) * (Math.PI / 180);
                  const radius = 62;
                  const cx = 70 + radius * Math.cos(rad);
                  const cy = 70 + radius * Math.sin(rad);

                  let btnClassName =
                    "bg-white text-slate-500 border border-slate-300 hover:bg-slate-50 hover:text-emerald-600 hover:border-emerald-300 hover:scale-105";
                  if (isPrimary) {
                    btnClassName =
                      "bg-emerald-600 text-white shadow-lg shadow-emerald-300/40 scale-110 ring-2 ring-emerald-300";
                  } else if (isSecondary) {
                    btnClassName =
                      "bg-amber-500 text-white shadow-md shadow-amber-300/40 scale-110 border-2 border-dashed border-amber-300 ring-2 ring-amber-300";
                  }

                  return (
                    <button
                      key={dir.name}
                      onClick={() => {
                        if (activeWindTab === "primary") {
                          setWeatherData({
                            ...weatherData,
                            windDirection: dir.name,
                            windAngle: dir.angle, // lưu angle để tính toán
                            secondaryWindDirection:
                              dir.name === weatherData.secondaryWindDirection
                                ? null
                                : weatherData.secondaryWindDirection,
                            secondaryWindAngle:
                              dir.name === weatherData.secondaryWindDirection
                                ? null
                                : weatherData.secondaryWindAngle,
                          });
                        } else {
                          if (dir.name === weatherData.windDirection) {
                            alert(
                              "Hướng gió phụ không được trùng hướng gió chính!",
                            );
                            return;
                          }
                          setWeatherData({
                            ...weatherData,
                            secondaryWindDirection: dir.name,
                            secondaryWindAngle: dir.angle, // lưu angle để tính toán
                          });
                        }
                      }}
                      className={`absolute flex items-center justify-center rounded-full text-[10px] font-bold transition-all duration-200 focus:outline-none w-6 h-6 ${
                        isPrimary || isSecondary ? "w-7 h-7" : ""
                      } ${btnClassName}`}
                      style={{
                        left: `${cx}px`,
                        top: `${cy}px`,
                        transform: "translate(-50%, -50%)",
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
                <div className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 space-y-1">
                  <div>
                    <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">
                      Hướng chính
                    </span>
                    <p className="text-xs font-bold text-slate-700">
                      {selectedDir.name} ({selectedDir.angle}°)
                    </p>
                  </div>
                  {secondaryDir && (
                    <div className="border-t border-slate-100 pt-1">
                      <span className="text-[9px] text-amber-500 font-semibold uppercase tracking-wider">
                        Hướng phụ
                      </span>
                      <p className="text-xs font-bold text-amber-700">
                        {secondaryDir.name} ({secondaryDir.angle}°)
                      </p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">
                    Góc lệch α (°)
                  </label>
                  <Input
                    type="number"
                    value={weatherData.alpha}
                    onChange={(e: any) =>
                      setWeatherData({
                        ...weatherData,
                        alpha: Number(e.target.value),
                      })
                    }
                    placeholder="0"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Lệch so với hướng chính bắc
                  </p>
                </div>
                <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-2">
                  Góc tổng hợp:{" "}
                  <span className="font-bold text-slate-600">
                    {selectedDir.angle + (weatherData.alpha || 0)}°
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Speed */}
          <div>
            <label className="text-xs font-semibold text-slate-500">
              Tốc độ gió (m/s)
            </label>
            <Input
              type="number"
              value={weatherData.speed}
              onChange={(e: any) =>
                setWeatherData({
                  ...weatherData,
                  speed: Number(e.target.value),
                })
              }
              placeholder="m/s"
            />
          </div>

          {/* Lượng mây */}
          <div>
            <label className="text-xs font-semibold text-slate-500">
              Lượng mây (%)
            </label>
            <Input
              type="text"
              value={weatherData.rainfall ?? ""}
              onChange={(e: any) =>
                setWeatherData({ ...weatherData, rainfall: e.target.value })
              }
              placeholder="VD: 0"
            />
          </div>

          {/* Temperatures */}
          <div>
            <label className="text-xs font-semibold text-slate-500">
              tº Không khí (°C)
            </label>
            <div className="flex gap-2 items-center">
              <Input
                type="number"
                value={weatherData.tkkMin}
                onChange={(e: any) =>
                  setWeatherData({
                    ...weatherData,
                    tkkMin: Number(e.target.value),
                  })
                }
                placeholder="Từ"
              />
              <span className="text-slate-400 font-bold">-</span>
              <Input
                type="number"
                value={weatherData.tkkMax}
                onChange={(e: any) =>
                  setWeatherData({
                    ...weatherData,
                    tkkMax: Number(e.target.value),
                  })
                }
                placeholder="Đến"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500">
              tº Mặt đất (°C)
            </label>
            <div className="flex gap-2 items-center">
              <Input
                type="number"
                value={weatherData.tmdMin}
                onChange={(e: any) =>
                  setWeatherData({
                    ...weatherData,
                    tmdMin: Number(e.target.value),
                  })
                }
                placeholder="Từ"
              />
              <span className="text-slate-400 font-bold">-</span>
              <Input
                type="number"
                value={weatherData.tmdMax}
                onChange={(e: any) =>
                  setWeatherData({
                    ...weatherData,
                    tmdMax: Number(e.target.value),
                  })
                }
                placeholder="Đến"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
