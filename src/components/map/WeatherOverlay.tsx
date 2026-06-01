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
      <div className="w-[260px] aspect-square border-[2px] border-slate-900 flex flex-col justify-between p-3">
        <div
          className="font-bold text-2xl tracking-widest text-center text-slate-900 drop-shadow-md"
          style={{
            textShadow:
              "1px 1px 0px #fff, -1px -1px 0px #fff, 1px -1px 0px #fff, -1px 1px 0px #fff",
          }}
        >
          {weatherData.season.toUpperCase()}
        </div>

        <div className="flex-1 relative flex items-center justify-center my-2">
          <div
            className="relative"
            style={{ transform: `rotate(${weatherData.angle + 180}deg)` }}
          >
            <svg
              width="60"
              height="120"
              viewBox="0 0 60 120"
              className="overflow-visible drop-shadow-md"
            >
              <line
                x1="30"
                y1="15"
                x2="30"
                y2="42"
                stroke="#0f172a"
                strokeWidth="3"
              />
              <line
                x1="30"
                y1="78"
                x2="30"
                y2="105"
                stroke="#0f172a"
                strokeWidth="3"
              />
              <polygon points="30,0 20,20 30,16 40,20" fill="#0f172a" />
              <polyline
                points="15,120 30,105 45,120"
                fill="none"
                stroke="#0f172a"
                strokeWidth="3"
              />
            </svg>

            <div
              className="absolute top-1/2 left-1/2 w-9 h-9 rounded-full border-[3px] border-slate-900 bg-transparent flex items-center justify-center shadow-inner"
              style={{
                transform: `translate(-50%, -50%) rotate(-${weatherData.angle + 180}deg)`,
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

            <div
              className="absolute -bottom-1 left-[40px] font-bold text-2xl text-slate-900 drop-shadow-md"
              style={{
                transform: `rotate(-${weatherData.angle + 180}deg)`,
                textShadow:
                  "1px 1px 0px #fff, -1px -1px 0px #fff, 1px -1px 0px #fff, -1px 1px 0px #fff",
              }}
            >
              {getBeaufort(weatherData.speed)}
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
