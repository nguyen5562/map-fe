import React from "react";
import { getStability, renderTemp } from "../../utils/weather";

const UTM_FONT = "'UTM Helvetins', 'Times New Roman', Times, serif";

// ── Kích thước ô vuông ──────────────────────────────────────────────────────
const SIZE = 280; // px — width = height
const BORDER = 6; // px — độ dày viền

export const WeatherOverlay = ({
  weatherActive,
  currentMapStatus,
  weatherData,
  styleOverride,
}: any) => {
  if (!weatherActive || currentMapStatus !== "ready") return null;

  // SVG diagram geometry
  const svgSize = 160;
  const cx = svgSize / 2; // 80
  const cy = svgSize / 2; // 80

  const ArrowHead = () => (
    <polygon points={`${cx},4 ${cx - 10},24 ${cx + 10},24`} fill="#0f172a" />
  );

  const ArrowTail = () => (
    <polyline
      points={`${cx - 12},148 ${cx},136 ${cx + 12},148`}
      fill="none"
      stroke="#0f172a"
      strokeWidth="4"
    />
  );

  const beaufortText = (angle: number, speed: number) => (
    <>
      <text
        x={cx + 11}
        y={142}
        fill="none"
        stroke="#ffffff"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fontWeight="bold"
        fontSize="18"
        textAnchor="start"
        transform={`rotate(${-angle}, ${cx + 11}, 142)`}
        style={{ fontFamily: UTM_FONT }}
      >
        {speed}
      </text>
      <text
        x={cx + 11}
        y={142}
        fill="#0f172a"
        fontWeight="bold"
        fontSize="18"
        textAnchor="start"
        transform={`rotate(${-angle}, ${cx + 11}, 142)`}
        style={{ fontFamily: UTM_FONT }}
      >
        {speed}
      </text>
    </>
  );

  const rotAngle = weatherData.angle + 180;
  const secAngle =
    weatherData.secondaryAngle !== null
      ? weatherData.secondaryAngle + 180
      : null;

  const tkkStr = renderTemp(weatherData.tkkMin, weatherData.tkkMax);
  const tmdStr = renderTemp(weatherData.tmdMin, weatherData.tmdMax);
  const stability = getStability(
    weatherData.tkkMin,
    weatherData.tkkMax,
    weatherData.tmdMin,
    weatherData.tmdMax,
  );
  const dateStr = weatherData.combatTime
    ? (() => {
        if (/^\d{2}\.\d{2}\.\d{2}$/.test(weatherData.combatTime)) {
          const [d, m, y] = weatherData.combatTime.split(".");
          return `${m}.${d}.${y}`;
        }
        return weatherData.combatTime;
      })()
    : "--.--.--";

  const baseStyle: React.CSSProperties = {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 1000,
    pointerEvents: "none",
    width: SIZE,
    height: SIZE,
    border: `${BORDER}px solid #0f172a`,
    borderRadius: 0,
    background: "transparent",
    boxSizing: "border-box",
    overflow: "visible",
  };

  return (
    <div style={{ ...baseStyle, ...styleOverride }}>
      {/* ── Ngày tháng ── */}
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: UTM_FONT,
          fontWeight: "bold",
          fontSize: 20,
          letterSpacing: 2,
          color: "#0f172a",
          textShadow:
            "1px 1px 0 #fff,-1px -1px 0 #fff,1px -1px 0 #fff,-1px 1px 0 #fff",
        }}
      >
        {dateStr}
      </div>

      {/* ── Sơ đồ gió ── */}
      <div
        style={{
          position: "absolute",
          top: 40,
          left: "50%",
          transform: "translateX(-50%)",
          width: svgSize,
          height: svgSize,
        }}
      >
        <svg
          width={svgSize}
          height={svgSize}
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          style={{ overflow: "visible" }}
        >
          {/* PRIMARY */}
          <g
            style={{
              transform: `rotate(${rotAngle}deg)`,
              transformOrigin: `${cx}px ${cy}px`,
            }}
          >
            <line
              x1={cx}
              y1={24}
              x2={cx}
              y2={62}
              stroke="#0f172a"
              strokeWidth="4"
            />
            <line
              x1={cx}
              y1={98}
              x2={cx}
              y2={136}
              stroke="#0f172a"
              strokeWidth="4"
            />
            <ArrowHead />
            <ArrowTail />
            {beaufortText(rotAngle, weatherData.speed)}
          </g>

          {/* SECONDARY (dashed) */}
          {secAngle !== null && (
            <g
              style={{
                transform: `rotate(${secAngle}deg)`,
                transformOrigin: `${cx}px ${cy}px`,
              }}
            >
              <line
                x1={cx}
                y1={24}
                x2={cx}
                y2={62}
                stroke="#0f172a"
                strokeWidth="4"
                strokeDasharray="10,6"
              />
              <line
                x1={cx}
                y1={98}
                x2={cx}
                y2={136}
                stroke="#0f172a"
                strokeWidth="4"
                strokeDasharray="10,6"
              />
              <ArrowHead />
              <ArrowTail />
              {beaufortText(
                secAngle,
                weatherData.secondarySpeed ?? weatherData.speed,
              )}
            </g>
          )}

          {/* Center circle */}
          <circle
            cx={cx}
            cy={cy}
            r={16}
            fill="white"
            stroke="#0f172a"
            strokeWidth="4"
          />
          <text
            x={cx}
            y={cy + 6}
            textAnchor="middle"
            fontWeight="bold"
            fontSize="16"
            fill="#0f172a"
            style={{ fontFamily: UTM_FONT }}
          >
            {weatherData.rainfall}
          </text>
        </svg>
      </div>

      {/* ── Nhiệt độ & ổn định ── */}
      <div
        style={{
          position: "absolute",
          bottom: 10,
          left: 10,
          right: 10,
          fontFamily: UTM_FONT,
          fontWeight: "bold",
          fontSize: 16,
          lineHeight: 1.6,
          color: "#0f172a",
          textShadow:
            "1px 1px 0 #fff,-1px -1px 0 #fff,1px -1px 0 #fff,-1px 1px 0 #fff",
        }}
      >
        <div>tºkk: {tkkStr}ºC</div>
        <div>tºmđ: {tmdStr}ºC</div>
        <div
          style={{
            textAlign: "center",
            fontSize: 20,
            letterSpacing: 2,
            marginTop: 4,
            textTransform: "uppercase",
          }}
        >
          {stability}
        </div>
      </div>
    </div>
  );
};
