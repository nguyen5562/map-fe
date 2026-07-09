import { SVGOverlay } from "react-leaflet";
import L from "leaflet";
import { useSimulationStore } from "../../store/useSimulationStore";
import { lightenHexColor } from "../../utils/colorMath";

/**
 * Renders a fixed-size military symbol on the Leaflet map using SVGOverlay.
 * All shapes use purely black strokes and no colors (fill is none or semi-transparent white).
 */
export function BattlefieldMarker({
  center,
  type,
  scaleX,
  commandPostLevel = "squad",
  bufferColor = "none",
  onClick,
}: {
  center: L.LatLng;
  type: "firePoints" | "reserveUnit" | "commandPost";
  scaleX: number;
  commandPostLevel?: "squad" | "platoon" | "company";
  bufferColor?: string;
  onClick?: () => void;
}) {
  const battlefieldScale = useSimulationStore((s) => s.battlefieldScale ?? 1);

  // Made markers larger by increasing the base width/height to 120x80 pixels at scale
  const rawW = (120 * battlefieldScale) / Math.abs(scaleX);
  const rawH = (80 * battlefieldScale) / Math.abs(scaleX);

  const bounds: L.LatLngBoundsExpression = [
    [center.lat - rawH / 2, center.lng - rawW / 2],
    [center.lat + rawH / 2, center.lng + rawW / 2],
  ];

  const finalBufferColor =
    bufferColor !== "none" ? lightenHexColor(bufferColor, 30) : "none";

  return (
    <SVGOverlay
      key={`bf-${type}-${center.lat}-${center.lng}-${battlefieldScale}`}
      bounds={bounds}
      attributes={{ viewBox: "0 0 120 80" }}
      eventHandlers={onClick ? { click: onClick } : undefined}
    >
      {type === "firePoints" && (
        <FirePointSymbol
          bufferColor={finalBufferColor}
          uniqueId={`fp-${center.lat}-${center.lng}`.replace(
            /[^a-zA-Z0-9]/g,
            "",
          )}
        />
      )}
      {type === "reserveUnit" && (
        <ReserveUnitSymbol bufferColor={finalBufferColor} />
      )}
      {type === "commandPost" && (
        <CommandPostSymbol
          level={commandPostLevel}
          bufferColor={finalBufferColor}
          uniqueId={`cp-${center.lat}-${center.lng}`.replace(
            /[^a-zA-Z0-9]/g,
            "",
          )}
        />
      )}
    </SVGOverlay>
  );
}

// ── Style Configuration ──────────────────────────────────────────────────────
const SW_THICK = 4.5;
const VE = "non-scaling-stroke";
const FILL_COLOR = "none";

// ── Hình 1: Điểm hỏa ─────────────────────────────────────────────────────────
// Hình chữ nhật ngang viền đen + cột nhỏ zíc zắc ở đáy giữa (cân đối hơn, hcn nhỏ hơn, ziczac to dài hơn)
function FirePointSymbol({
  bufferColor,
  uniqueId,
}: {
  bufferColor: string;
  uniqueId: string;
}) {
  return (
    <g>
      {/* 1. LỚP ĐỆM (Màu đệm) vẽ bên dưới */}
      {bufferColor !== "none" && (
        <g stroke={bufferColor}>
          {/* Vẽ viền trong (inner border) cho hình chữ nhật kín */}
          <defs>
            <clipPath id={`clip-${uniqueId}`}>
              <rect x="20" y="20" width="80" height="34" rx="2" />
            </clipPath>
          </defs>
          <g clipPath={`url(#clip-${uniqueId})`}>
            <rect
              x="20"
              y="20"
              width="80"
              height="34"
              rx="2"
              fill="none"
              strokeWidth={SW_THICK + 12} // Rất dày để làm viền trong rõ ràng
              vectorEffect={VE}
            />
          </g>

          {/* Vẽ nét đệm cho cột zíc zắc: dịch chuyển sang phải + xuống dưới */}
          <g transform="translate(2, 2)">
            <path
              d="M 60,54 L 60,64 L 76,64 L 76,76"
              fill="none"
              strokeWidth={SW_THICK + 6} // Dày hơn để chồng lấp hoàn toàn, không bị đứt đoạn
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect={VE}
            />
          </g>
        </g>
      )}

      {/* 2. LỚP NÉT VẼ CHÍNH vẽ đè lên trên */}
      <g stroke="#ff0000" strokeWidth={SW_THICK}>
        {/* Rectangle body */}
        <rect
          x="20"
          y="20"
          width="80"
          height="34"
          rx="2"
          fill={FILL_COLOR}
          vectorEffect={VE}
        />
        {/* Zig-zag step stem below centre */}
        <path
          d="M 60,54 L 60,64 L 76,64 L 76,76"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect={VE}
        />
      </g>
    </g>
  );
}

// ── Hình 2: Bộ phận dự bị, bảo đảm ──────────────────────────────────────────
// Hai chữ V cạnh nhau viền đen (kích thước lớn 110px ngang, H và + ngang tầm với đỉnh trái dấu căn).
function ReserveUnitSymbol({ bufferColor = "none" }: { bufferColor?: string }) {
  const leftColor = "#ff0000"; // Red for medical tick
  const rightColor = "#000000"; // Black for technical tick

  const renderLeft = (stroke: string, sw: number) => (
    <g stroke={stroke} strokeWidth={sw}>
      {/* Left √ main path (tick -> diagonal -> roof) */}
      <path
        d="M 14,43 L 24,68 L 34,25 L 55,25"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect={VE}
      />
      {/* + sign with its top aligned horizontally with the roof (y=25), leftmost edge at x=14 */}
      <line
        x1="18"
        y1="25"
        x2="18"
        y2="33"
        strokeLinecap="round"
        vectorEffect={VE}
      />
      <line
        x1="14"
        y1="29"
        x2="22"
        y2="29"
        strokeLinecap="round"
        vectorEffect={VE}
      />
    </g>
  );

  const renderRight = (stroke: string, sw: number) => (
    <g stroke={stroke} strokeWidth={sw}>
      {/* Right √ main path (tick -> diagonal -> roof) */}
      <path
        d="M 74,43 L 84,68 L 94,25 L 115,25"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect={VE}
      />
      {/* H sign with its top aligned horizontally with the roof (y=25), leftmost edge at x=74 */}
      {/* Left bar of H */}
      <line
        x1="74"
        y1="25"
        x2="74"
        y2="35"
        strokeLinecap="round"
        vectorEffect={VE}
      />
      {/* Right bar of H */}
      <line
        x1="82"
        y1="25"
        x2="82"
        y2="35"
        strokeLinecap="round"
        vectorEffect={VE}
      />
      {/* Crossbar of H */}
      <line x1="74" y1="30" x2="82" y2="30" vectorEffect={VE} />
    </g>
  );

  return (
    <g>
      {/* 1. LỚP ĐỆM (Màu đệm) vẽ dịch chuyển bên dưới */}
      {bufferColor !== "none" && (
        <g transform="translate(2, 2)">
          {renderLeft(bufferColor, SW_THICK + 6)}
          {renderRight(bufferColor, SW_THICK + 6)}
        </g>
      )}

      {/* 2. LỚP NÉT CHÍNH đè lên trên */}
      {renderLeft(leftColor, SW_THICK)}
      {renderRight(rightColor, SW_THICK)}
    </g>
  );
}

// ── Hình 3: Bộ phận chỉ huy ──────────────────────────────────────────────────
// Trái: tam giác + H; Phải: tam giác rỗng + cột đỉnh + gạch ngang theo cấp.
function CommandPostSymbol({
  level = "squad",
  bufferColor = "none",
  uniqueId,
}: {
  level?: "squad" | "platoon" | "company";
  bufferColor?: string;
  uniqueId?: string;
}) {
  const strokeColor = "#000000";

  return (
    <g>
      {/* 1. LỚP ĐỆM (Màu đệm) vẽ bên dưới */}
      {bufferColor !== "none" && (
        <g stroke={bufferColor}>
          {/* A. Vẽ viền trong cho 2 tam giác kín dùng clipPath */}
          <defs>
            <clipPath id={`clip-cp-l-${uniqueId}`}>
              <polygon points="30,25 5,68 55,68" />
            </clipPath>
            <clipPath id={`clip-cp-r-${uniqueId}`}>
              <polygon points="90,25 65,68 115,68" />
            </clipPath>
          </defs>

          {/* Left triangle inner border */}
          <g clipPath={`url(#clip-cp-l-${uniqueId})`}>
            <polygon
              points="30,25 5,68 55,68"
              fill="none"
              strokeWidth={SW_THICK + 12}
              strokeLinejoin="round"
              vectorEffect={VE}
            />
          </g>

          {/* Right triangle inner border */}
          <g clipPath={`url(#clip-cp-r-${uniqueId})`}>
            <polygon
              points="90,25 65,68 115,68"
              fill="none"
              strokeWidth={SW_THICK + 12}
              strokeLinejoin="round"
              vectorEffect={VE}
            />
          </g>

          {/* B. Vẽ nét đệm dịch chuyển cho các nét vẽ hở */}
          <g transform="translate(2, 2)">
            {/* H of left triangle */}
            <line
              x1="25"
              y1="42"
              x2="25"
              y2="58"
              strokeWidth={SW_THICK + 6}
              strokeLinecap="round"
              vectorEffect={VE}
            />
            <line
              x1="35"
              y1="42"
              x2="35"
              y2="58"
              strokeWidth={SW_THICK + 6}
              strokeLinecap="round"
              vectorEffect={VE}
            />
            <line
              x1="25"
              y1="50"
              x2="35"
              y2="50"
              strokeWidth={SW_THICK + 6}
              vectorEffect={VE}
            />

            {/* Stem above right apex */}
            <line
              x1="90"
              y1="9"
              x2="90"
              y2="25"
              strokeWidth={SW_THICK + 6}
              strokeLinecap="round"
              vectorEffect={VE}
            />

            {/* Platoon rank bars */}
            {(level === "platoon" || level === "company") && (
              <line
                x1="83"
                y1="20"
                x2="97"
                y2="20"
                strokeWidth={SW_THICK + 6}
                strokeLinecap="round"
                vectorEffect={VE}
              />
            )}
            {/* Company rank bars */}
            {level === "company" && (
              <line
                x1="83"
                y1="14"
                x2="97"
                y2="14"
                strokeWidth={SW_THICK + 6}
                strokeLinecap="round"
                vectorEffect={VE}
              />
            )}
          </g>
        </g>
      )}

      {/* 2. LỚP NÉT VẼ CHÍNH đè lên trên */}
      <g stroke={strokeColor} strokeWidth={SW_THICK}>
        {/* --- LEFT TRIANGLE (with H) --- */}
        <polygon
          points="30,25 5,68 55,68"
          fill={FILL_COLOR}
          strokeLinejoin="round"
          vectorEffect={VE}
        />
        <line
          x1="25"
          y1="42"
          x2="25"
          y2="58"
          strokeLinecap="round"
          vectorEffect={VE}
        />
        <line
          x1="35"
          y1="42"
          x2="35"
          y2="58"
          strokeLinecap="round"
          vectorEffect={VE}
        />
        <line x1="25" y1="50" x2="35" y2="50" vectorEffect={VE} />

        {/* --- RIGHT TRIANGLE (empty, with stem above apex) --- */}
        <polygon
          points="90,25 65,68 115,68"
          fill={FILL_COLOR}
          strokeLinejoin="round"
          vectorEffect={VE}
        />
        {/* Stem above apex */}
        <line
          x1="90"
          y1="9"
          x2="90"
          y2="25"
          strokeLinecap="round"
          vectorEffect={VE}
        />
        {/* Trung đội: 1 gạch ngang */}
        {(level === "platoon" || level === "company") && (
          <line
            x1="83"
            y1="20"
            x2="97"
            y2="20"
            strokeLinecap="round"
            vectorEffect={VE}
          />
        )}
        {/* Đại đội: thêm gạch ngang thứ 2 */}
        {level === "company" && (
          <line
            x1="83"
            y1="14"
            x2="97"
            y2="14"
            strokeLinecap="round"
            vectorEffect={VE}
          />
        )}
      </g>
    </g>
  );
}
