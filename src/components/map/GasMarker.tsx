import { SVGOverlay } from "react-leaflet";
import L from "leaflet";
import { lightenHexColor } from "../../utils/colorMath";

export function GasMarker({
  center,
  angle,
  scaleX,
  smokeLineLength = 700,
  smokeLineDiameter = 700,
  smokeLineWidth = 300,
  lineType = "Thẳng",
  lineRole = "Chính",
  bufferColor = "none",
  onClick,
}: {
  center: L.LatLng;
  angle: number;
  scaleX: number;
  smokeLineLength?: number | "";
  smokeLineDiameter?: number | "";
  smokeLineWidth?: number | "";
  lineType?: string;
  lineRole?: string;
  bufferColor?: string;
  onClick?: () => void;
}) {
  // Tính chiều rộng overlay dựa trên loại tuyến khói.
  // Tuyến thẳng: SVG width 250px, line dài 200px (80%), nên overlay = length / 0.8 = length * 1.25
  // Tuyến vòng: SVG width 250px, circle đường kính 150px (60%), nên overlay = diameter / 0.6 = diameter * 1.6666667
  let rawWidth = 0;
  if (lineType === "Vòng") {
    const actualDiameter = smokeLineDiameter ? Number(smokeLineDiameter) : 700;
    rawWidth = (actualDiameter * 1.6666667) / Math.abs(scaleX);
  } else {
    const actualLength = smokeLineLength ? Number(smokeLineLength) : 700;
    rawWidth = (actualLength * 1.25) / Math.abs(scaleX);
  }
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
  const VE = undefined;
  const strokeColor = "#000000";

  // Tính chiều cao hình chữ nhật cho tuyến diện (độ dài thực địa tương đương 200px của chiều dài)
  const actualLength = smokeLineLength ? Number(smokeLineLength) : 700;
  const actualWidth = smokeLineWidth ? Number(smokeLineWidth) : 300;
  const rectHeightInSvg = actualLength > 0 ? (200 * actualWidth) / actualLength : 75;

  const yTop = 125 - rectHeightInSvg / 2;
  const yBottom = 125 + rectHeightInSvg / 2;

  // Helper render functions
  const renderAreaRect = (stroke: string, sw: number) => (
    <rect
      x="25"
      y={yTop}
      width="200"
      height={rectHeightInSvg}
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
      {/* ^ trái — apex cạnh trên (yTop), chân xuống (yTop + 20) */}
      <path d={`M 81.67,${yTop + 20} L 91.67,${yTop} L 101.67,${yTop + 20}`} vectorEffect={VE} />
      {/* ^ phải */}
      <path d={`M 148.33,${yTop + 20} L 158.33,${yTop} L 168.33,${yTop + 20}`} vectorEffect={VE} />
      {/* V trái — apex cạnh dưới (yBottom), chân lên (yBottom - 20) */}
      <path d={`M 81.67,${yBottom - 20} L 91.67,${yBottom} L 101.67,${yBottom - 20}`} vectorEffect={VE} />
      {/* V phải */}
      <path d={`M 148.33,${yBottom - 20} L 158.33,${yBottom} L 168.33,${yBottom - 20}`} vectorEffect={VE} />
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
      key={`${center.lat}-${center.lng}-${angle}-${smokeLineLength}-${smokeLineDiameter}-${smokeLineWidth}-${lineType}-${lineRole}-${bufferColor}`}
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
                      <rect x="25" y={yTop} width="200" height={rectHeightInSvg} />
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
