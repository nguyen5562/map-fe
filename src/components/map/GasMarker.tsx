import { SVGOverlay } from "react-leaflet";
import L from "leaflet";

export function GasMarker({
  center,
  angle,
  scaleX,
  smokeLineLength = 700,
  lineType = "Thẳng",
}: {
  center: L.LatLng;
  angle: number;
  scaleX: number;
  smokeLineLength?: number;
  lineType?: string;
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
      key={`${center.lat}-${center.lng}-${angle}-${smokeLineLength}-${lineType}`}
      bounds={bounds}
      attributes={{ viewBox: "0 0 250 250" }}
    >
      <g
        style={{
          transform: `rotate(${angle + 180}deg)`,
          transformOrigin: "125px 125px",
        }}
      >
        {lineType === "Vòng" ? (
          /* Ký hiệu tuyến vòng: hình chữ nhật + 2x^ và 2xV bên trong hướng vào giữa */
          <>
            {/* Hình chữ nhật, kích thước tương tự ký hiệu cũ */}
            <rect
              x="25"
              y="88"
              width="200"
              height="75"
              fill="none"
              stroke="#000000"
              strokeWidth="4"
              vectorEffect="non-scaling-stroke"
            />

            {/* ^ trái — apex cạnh trên (y=88), chân xuống (y=108) */}
            <path
              d="M 95,108 L 105,88 L 115,108"
              fill="none"
              stroke="#000000"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
            {/* ^ phải */}
            <path
              d="M 135,108 L 145,88 L 155,108"
              fill="none"
              stroke="#000000"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />

            {/* V trái — apex cạnh dưới (y=163), chân lên (y=143) */}
            <path
              d="M 95,143 L 105,163 L 115,143"
              fill="none"
              stroke="#000000"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
            {/* V phải */}
            <path
              d="M 135,143 L 145,163 L 155,143"
              fill="none"
              stroke="#000000"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </>
        ) : (
          /* Ký hiệu tuyến thẳng: đường ngang + 2 đầu chặn + 2 mũi tên V */
          <>
            {/* Đường ngang chính */}
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

            {/* Đầu chặn trái */}
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
            {/* Đầu chặn phải */}
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

            {/* Mũi tên V trái */}
            <path
              d="M 95,105 L 105,125 L 115,105"
              fill="none"
              stroke="#000000"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />

            {/* Mũi tên V phải */}
            <path
              d="M 135,105 L 145,125 L 155,105"
              fill="none"
              stroke="#000000"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </>
        )}
      </g>
    </SVGOverlay>
  );
}
