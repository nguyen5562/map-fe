import { getBeaufort, getStability, renderTemp } from "../../utils/weather";

export const WeatherOverlay = ({
  weatherActive,
  currentMapStatus,
  weatherData,
}: any) => {
  if (!weatherActive || currentMapStatus !== "ready") return null;

  return (
    <div
      className="absolute top-4 right-4 z-[1000] pointer-events-none flex flex-col items-center"
      style={{ fontFamily: "'Times New Roman', Times, serif" }}
    >
      <div className="w-[260px] aspect-square border-[4px] border-slate-900 flex flex-col justify-between p-3">
        <div
          className="font-bold text-2xl tracking-widest text-center text-slate-900 drop-shadow-md"
          style={{
            textShadow:
              "1px 1px 0px #fff, -1px -1px 0px #fff, 1px -1px 0px #fff, -1px 1px 0px #fff",
          }}
        >
          {weatherData.combatTime
            ? (() => {
                const [d, m, y] = weatherData.combatTime.split('.');
                return `${m}.${d}.${y}`;
              })()
            : '--.--.--'}
        </div>

        <div className="flex-1 relative flex items-center justify-center my-2">
          <div className="relative w-[180px] h-[180px] flex items-center justify-center">
            <svg
              width="180"
              height="180"
              viewBox="0 0 180 180"
              className="overflow-visible drop-shadow-md"
            >
              {/* PRIMARY WIND ARROW */}
              <g
                style={{
                  transform: `rotate(${weatherData.angle + 180}deg)`,
                  transformOrigin: "90px 90px",
                }}
              >
                <line
                  x1="90"
                  y1="25"
                  x2="90"
                  y2="70"
                  stroke="#0f172a"
                  strokeWidth="3"
                />
                <line
                  x1="90"
                  y1="110"
                  x2="90"
                  y2="155"
                  stroke="#0f172a"
                  strokeWidth="3"
                />
                <polygon points="90,10 80,30 90,26 100,30" fill="#0f172a" />
                <polyline
                  points="75,170 90,155 105,170"
                  fill="none"
                  stroke="#0f172a"
                  strokeWidth="3"
                />
                {/* Wind speed text outline at tail */}
                <text
                  x="103"
                  y="165"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fontWeight="bold"
                  fontSize="22"
                  textAnchor="start"
                  transform={`rotate(${- (weatherData.angle + 180)}, 103, 165)`}
                  style={{ fontFamily: "'Times New Roman', Times, serif" }}
                >
                  {getBeaufort(weatherData.speed)}
                </text>
                {/* Wind speed text at tail */}
                <text
                  x="103"
                  y="165"
                  fill="#0f172a"
                  fontWeight="bold"
                  fontSize="22"
                  textAnchor="start"
                  transform={`rotate(${- (weatherData.angle + 180)}, 103, 165)`}
                  style={{ fontFamily: "'Times New Roman', Times, serif" }}
                >
                  {getBeaufort(weatherData.speed)}
                </text>
              </g>

              {/* SECONDARY WIND ARROW (Dashed) */}
              {weatherData.secondaryAngle !== null && (
                <g
                  style={{
                    transform: `rotate(${weatherData.secondaryAngle + 180}deg)`,
                    transformOrigin: "90px 90px",
                  }}
                >
                  <line
                    x1="90"
                    y1="25"
                    x2="90"
                    y2="70"
                    stroke="#0f172a"
                    strokeWidth="3"
                    strokeDasharray="5,5"
                  />
                  <line
                    x1="90"
                    y1="110"
                    x2="90"
                    y2="155"
                    stroke="#0f172a"
                    strokeWidth="3"
                    strokeDasharray="5,5"
                  />
                  <polygon points="90,10 80,30 90,26 100,30" fill="#0f172a" />
                  <polyline
                    points="75,170 90,155 105,170"
                    fill="none"
                    stroke="#0f172a"
                    strokeWidth="3"
                    strokeDasharray="5,5"
                  />
                  {/* Secondary wind speed text outline at tail */}
                  <text
                    x="103"
                    y="165"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fontWeight="bold"
                    fontSize="22"
                    textAnchor="start"
                    transform={`rotate(${- (weatherData.secondaryAngle + 180)}, 103, 165)`}
                    style={{ fontFamily: "'Times New Roman', Times, serif" }}
                  >
                    {getBeaufort(weatherData.speed)}
                  </text>
                  {/* Secondary wind speed text at tail */}
                  <text
                    x="103"
                    y="165"
                    fill="#0f172a"
                    fontWeight="bold"
                    fontSize="22"
                    textAnchor="start"
                    transform={`rotate(${- (weatherData.secondaryAngle + 180)}, 103, 165)`}
                    style={{ fontFamily: "'Times New Roman', Times, serif" }}
                  >
                    {getBeaufort(weatherData.speed)}
                  </text>
                </g>
              )}
            </svg>

            {/* Center Circle */}
            <div
              className="absolute w-9 h-9 rounded-full border-[3px] border-slate-900 bg-white flex items-center justify-center shadow-inner"
              style={{
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            >
              <span
                className="font-bold text-xl text-slate-900"
                style={{
                  lineHeight: 1,
                  textShadow:
                    "1px 1px 0px #fff, -1px -1px 0px #fff, 1px -1px 0px #fff, -1px 1px 0px #fff",
                }}
              >
                {weatherData.speed}
              </span>
            </div>
          </div>
        </div>

        <div
          className="text-left font-bold text-xl leading-tight space-y-0.5 text-slate-900 drop-shadow-md pl-1"
          style={{
            textShadow:
              "1px 1px 0px #fff, -1px -1px 0px #fff, 1px -1px 0px #fff, -1px 1px 0px #fff",
          }}
        >
          <div>
            tºkk: {renderTemp(weatherData.tkkMin, weatherData.tkkMax)}ºC
          </div>
          <div>
            tºmđ: {renderTemp(weatherData.tmdMin, weatherData.tmdMax)}ºC
          </div>
          <div
            className="text-center text-2xl tracking-wider mt-2 uppercase text-slate-900 drop-shadow-lg"
            style={{
              textShadow:
                "1px 1px 0px #fff, -1px -1px 0px #fff, 1px -1px 0px #fff, -1px 1px 0px #fff",
            }}
          >
            {getStability(
              weatherData.tkkMin,
              weatherData.tkkMax,
              weatherData.tmdMin,
              weatherData.tmdMax,
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
