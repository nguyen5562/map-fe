import { SVGOverlay } from "react-leaflet";
import L from "leaflet";

export function GasMarker({
  center,
  angle,
  scaleX,
  smokeLineLength = 700,
}: {
  center: L.LatLng;
  angle: number;
  scaleX: number;
  smokeLineLength?: number;
}) {
  // Tính chiều rộng overlay dựa trên độ dài tuyến khói (mét).
  // SVG viewBox 250, line từ 25→225 (200px = 80%), nên overlay = length / 0.8
  const rawWidth = (smokeLineLength * 1.25) / Math.abs(scaleX);
  const rawHeight = rawWidth; // Hình vuông để tránh bị clip khi xoay

  const bounds: L.LatLngBoundsExpression = [
    [center.lat - rawHeight / 2, center.lng - rawWidth / 2],
    [center.lat + rawHeight / 2, center.lng + rawWidth / 2],
  ];

  return (
    <SVGOverlay
      key={`${center.lat}-${center.lng}-${angle}-${smokeLineLength}`}
      bounds={bounds}
      attributes={{ viewBox: "0 0 250 250" }}
    >
      <g
        style={{
          transform: `rotate(${angle + 180}deg)`,
          transformOrigin: "125px 125px",
        }}
      >
        <line
          x1="25"
          y1="125"
          x2="225"
          y2="125"
          stroke="#000000"
          strokeWidth="4"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />

        <line
          x1="25"
          y1="115"
          x2="25"
          y2="135"
          stroke="#000000"
          strokeWidth="4"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        <line
          x1="225"
          y1="115"
          x2="225"
          y2="135"
          stroke="#000000"
          strokeWidth="4"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />

        <path
          d="M 95,105 L 105,125 L 115,105"
          fill="none"
          stroke="#000000"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        <path
          d="M 135,105 L 145,125 L 155,105"
          fill="none"
          stroke="#000000"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </g>
    </SVGOverlay>
  );
}
