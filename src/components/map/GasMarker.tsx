import { SVGOverlay } from "react-leaflet";
import L from "leaflet";
import { lightenHexColor } from "../../utils/colorMath";

export function GasMarker({
  center,
  angle,
  scaleX,
  smokeLineLength = 700,
  lineType = "Thẳng",
  lineRole = "Chính",
  bufferColor = "none",
  onClick,
}: {
  center: L.LatLng;
  angle: number;
  scaleX: number;
  smokeLineLength?: number | "";
  lineType?: string;
  lineRole?: string;
  bufferColor?: string;
  onClick?: () => void;
}) {
  // Tính chiều rộng overlay dựa trên độ dài tuyến khói (mét).
  // SVG viewBox 250, line từ 25→225 (200px = 80%), nên overlay = length / 0.8
  const actualLength = smokeLineLength ? Number(smokeLineLength) : 700;
  const rawWidth = (actualLength * 1.25) / Math.abs(scaleX);
  const rawHeight = rawWidth; // Hình vuông để tránh bị clip khi xoay

  const bounds: L.LatLngBoundsExpression = [
    [center.lat - rawHeight / 2, center.lng - rawWidth / 2],
    [center.lat + rawHeight / 2, center.lng + rawWidth / 2],
  ];

  const uniqueId = `gas-${center.lat}-${center.lng}`.replace(
    /[^a-zA-Z0-9]/g,
    "",
  );
  const SW_MAIN = 4;
  const VE = "non-scaling-stroke";
  const strokeColor = "#000000";

  // Helper render functions
  const renderAreaRect = (stroke: string, sw: number) => (
    <rect
      x="25"
      y="88"
      width="200"
      height="75"
      fill="none"
      stroke={stroke}
      strokeWidth={sw}
      vectorEffect={VE}
      strokeDasharray={lineRole === "Dự bị" ? "25, 10" : undefined}
    />
  );

  const renderAreaArrows = (stroke: string, sw: number) => (
    <g
      stroke={stroke}
      strokeWidth={sw}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* ^ trái — apex cạnh trên (y=88), chân xuống (y=108) */}
      <path d="M 81.67,108 L 91.67,88 L 101.67,108" vectorEffect={VE} />
      {/* ^ phải */}
      <path d="M 148.33,108 L 158.33,88 L 168.33,108" vectorEffect={VE} />
      {/* V trái — apex cạnh dưới (y=163), chân lên (y=143) */}
      <path d="M 81.67,143 L 91.67,163 L 101.67,143" vectorEffect={VE} />
      {/* V phải */}
      <path d="M 148.33,143 L 158.33,163 L 168.33,143" vectorEffect={VE} />
    </g>
  );

  const renderCircleRoute = (stroke: string, sw: number) => (
    <circle
      cx="125"
      cy="125"
      r="75"
      fill="none"
      stroke={stroke}
      strokeWidth={sw}
      vectorEffect={VE}
      strokeDasharray={lineRole === "Dự bị" ? "25, 10" : undefined}
    />
  );

  const renderCircleArrows = (stroke: string, sw: number) => (
    <g
      stroke={stroke}
      strokeWidth={sw}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Râu trên: apex tại (125,50), chân tại (115,70) và (135,70) */}
      <path d="M 115,70 L 125,50 L 135,70" vectorEffect={VE} />
      {/* Râu dưới: apex tại (125,200), chân tại (115,180) và (135,180) */}
      <path d="M 115,180 L 125,200 L 135,180" vectorEffect={VE} />
      {/* Râu trái: apex tại (50,125), chân tại (70,115) và (70,135) */}
      <path d="M 70,115 L 50,125 L 70,135" vectorEffect={VE} />
      {/* Râu phải: apex tại (200,125), chân tại (180,115) và (180,135) */}
      <path d="M 180,115 L 200,125 L 180,135" vectorEffect={VE} />
    </g>
  );

  const renderStraightLine = (stroke: string, sw: number) => (
    <g
      stroke={stroke}
      strokeWidth={sw}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Đường ngang chính */}
      <line
        x1="25"
        y1="125"
        x2="225"
        y2="125"
        vectorEffect={VE}
        strokeDasharray={lineRole === "Dự bị" ? "25, 10" : undefined}
      />
      {/* Đầu chặn trái */}
      <line x1="25" y1="115" x2="25" y2="135" vectorEffect={VE} />
      {/* Đầu chặn phải */}
      <line x1="225" y1="115" x2="225" y2="135" vectorEffect={VE} />
      {/* Mũi tên V trái */}
      <path d="M 81.67,105 L 91.67,125 L 101.67,105" vectorEffect={VE} />
      {/* Mũi tên V phải */}
      <path d="M 148.33,105 L 158.33,125 L 168.33,105" vectorEffect={VE} />
    </g>
  );

  return (
    <SVGOverlay
      key={`${center.lat}-${center.lng}-${angle}-${smokeLineLength}-${lineType}-${lineRole}-${bufferColor}`}
      bounds={bounds}
      attributes={{ viewBox: "0 0 250 250" }}
      eventHandlers={onClick ? { click: onClick } : undefined}
    >
      <g
        style={{
          transform: `rotate(${angle + 180}deg)`,
          transformOrigin: "125px 125px",
        }}
      >
        {/* 1. LỚP ĐỆM (Màu đệm) vẽ bên dưới */}
        {(() => {
          const finalBufferColor =
            bufferColor !== "none" ? lightenHexColor(bufferColor, 30) : "none";
          if (finalBufferColor === "none") return null;
          return (
            <g>
              {lineType === "Diện" && (
                <>
                  {/* Viền trong cho rect kín */}
                  <defs>
                    <clipPath id={`clip-rect-${uniqueId}`}>
                      <rect x="25" y="88" width="200" height="75" />
                    </clipPath>
                  </defs>
                  <g clipPath={`url(#clip-rect-${uniqueId})`}>
                    {renderAreaRect(finalBufferColor, SW_MAIN + 12)}
                  </g>
                  {/* Nét đệm dịch chuyển cho các mũi tên hở */}
                  <g transform="translate(2, 2)">
                    {renderAreaArrows(finalBufferColor, SW_MAIN + 6)}
                  </g>
                </>
              )}

              {lineType === "Vòng" && (
                <>
                  {/* Viền trong cho circle kín */}
                  <defs>
                    <clipPath id={`clip-circle-${uniqueId}`}>
                      <circle cx="125" cy="125" r="75" />
                    </clipPath>
                  </defs>
                  <g clipPath={`url(#clip-circle-${uniqueId})`}>
                    {renderCircleRoute(finalBufferColor, SW_MAIN + 12)}
                  </g>
                  {/* Nét đệm dịch chuyển cho các râu hở */}
                  <g transform="translate(2, 2)">
                    {renderCircleArrows(finalBufferColor, SW_MAIN + 6)}
                  </g>
                </>
              )}

              {lineType !== "Diện" && lineType !== "Vòng" && (
                /* Nét đệm dịch chuyển cho toàn bộ tuyến thẳng */
                <g transform="translate(2, 2)">
                  {renderStraightLine(finalBufferColor, SW_MAIN + 6)}
                </g>
              )}
            </g>
          );
        })()}

        {/* 2. LỚP NÉT CHÍNH vẽ đè lên trên */}
        {lineType === "Diện" ? (
          <>
            {renderAreaRect(strokeColor, SW_MAIN)}
            {renderAreaArrows(strokeColor, SW_MAIN)}
          </>
        ) : lineType === "Vòng" ? (
          <>
            {renderCircleRoute(strokeColor, SW_MAIN)}
            {renderCircleArrows(strokeColor, SW_MAIN)}
          </>
        ) : (
          renderStraightLine(strokeColor, SW_MAIN)
        )}
      </g>
    </SVGOverlay>
  );
}
