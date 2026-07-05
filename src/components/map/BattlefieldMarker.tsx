import { SVGOverlay } from "react-leaflet";
import L from "leaflet";
import { useSimulationStore } from "../../store/useSimulationStore";

/**
 * Renders a fixed-size military symbol on the Leaflet map using SVGOverlay.
 * All shapes use purely black strokes and no colors (fill is none or semi-transparent white).
 */
export function BattlefieldMarker({
  center,
  type,
  scaleX,
  onClick,
}: {
  center: L.LatLng;
  type: "firePoints" | "reserveUnit" | "commandPost";
  scaleX: number; // from useSimulationStore → scale.x  (metres per pixel)
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

  return (
    <SVGOverlay
      key={`bf-${type}-${center.lat}-${center.lng}-${battlefieldScale}`}
      bounds={bounds}
      attributes={{ viewBox: "0 0 120 80" }}
      eventHandlers={onClick ? { click: onClick } : undefined}
    >
      {type === "firePoints" && <FirePointSymbol />}
      {type === "reserveUnit" && <ReserveUnitSymbol />}
      {type === "commandPost" && <CommandPostSymbol />}
    </SVGOverlay>
  );
}

// ── Style Configuration ──────────────────────────────────────────────────────
const SW_THICK = 4.5;
const VE = "non-scaling-stroke";
const STROKE_COLOR = "#000000";
const FILL_COLOR = "none";

// ── Hình 1: Điểm hỏa ─────────────────────────────────────────────────────────
// Hình chữ nhật ngang viền đen + cột nhỏ zíc zắc ở đáy giữa (cân đối hơn, hcn nhỏ hơn, ziczac to dài hơn)
function FirePointSymbol() {
  return (
    <g>
      {/* Rectangle body (smaller width 80px, centered) */}
      <rect
        x="20"
        y="20"
        width="80"
        height="34"
        rx="2"
        fill={FILL_COLOR}
        stroke={STROKE_COLOR}
        strokeWidth={SW_THICK}
        vectorEffect={VE}
      />
      {/* Zig-zag step stem below centre (larger and longer: width 16px, height 22px) */}
      <path
        d="M 60,54 L 60,64 L 76,64 L 76,76"
        fill="none"
        stroke={STROKE_COLOR}
        strokeWidth={SW_THICK}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect={VE}
      />
    </g>
  );
}

// ── Hình 2: Bộ phận dự bị, bảo đảm ──────────────────────────────────────────
// Hai chữ V cạnh nhau viền đen (kích thước lớn 110px ngang, H và + ngang tầm với đỉnh trái dấu căn).
function ReserveUnitSymbol() {
  return (
    <g>
      {/* --- LEFT SYMBOL (Square Root √ with + on the left) --- */}
      {/* Left √ main path (tick -> diagonal -> roof) */}
      <path
        d="M 14,43 L 24,68 L 34,25 L 55,25"
        fill="none"
        stroke={STROKE_COLOR}
        strokeWidth={SW_THICK}
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
        stroke={STROKE_COLOR}
        strokeWidth={SW_THICK}
        strokeLinecap="round"
        vectorEffect={VE}
      />
      <line
        x1="14"
        y1="29"
        x2="22"
        y2="29"
        stroke={STROKE_COLOR}
        strokeWidth={SW_THICK}
        strokeLinecap="round"
        vectorEffect={VE}
      />

      {/* --- RIGHT SYMBOL (Square Root √ with H on the left) --- */}
      {/* Right √ main path (tick -> diagonal -> roof) */}
      <path
        d="M 74,43 L 84,68 L 94,25 L 115,25"
        fill="none"
        stroke={STROKE_COLOR}
        strokeWidth={SW_THICK}
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
        stroke={STROKE_COLOR}
        strokeWidth={SW_THICK}
        strokeLinecap="round"
        vectorEffect={VE}
      />
      {/* Right bar of H */}
      <line
        x1="82"
        y1="25"
        x2="82"
        y2="35"
        stroke={STROKE_COLOR}
        strokeWidth={SW_THICK}
        strokeLinecap="round"
        vectorEffect={VE}
      />
      {/* Crossbar of H */}
      <line
        x1="74"
        y1="30"
        x2="82"
        y2="30"
        stroke={STROKE_COLOR}
        strokeWidth={SW_THICK}
        vectorEffect={VE}
      />
    </g>
  );
}

// ── Hình 3: Bộ phận chỉ huy ──────────────────────────────────────────────────
// Hai tam giác đều cạnh nhau viền đen.
// Trái: có chữ H bên trong (không có cột ở đỉnh).
// Phải: rỗng bên trong (có cột đứng ở đỉnh).
function CommandPostSymbol() {
  return (
    <g>
      {/* --- LEFT TRIANGLE (with H) --- */}
      <polygon
        points="30,25 5,68 55,68"
        fill={FILL_COLOR}
        stroke={STROKE_COLOR}
        strokeWidth={SW_THICK}
        strokeLinejoin="round"
        vectorEffect={VE}
      />
      {/* H inside (bold stroke SW_THICK to match triangle, narrow 10px width) */}
      <line
        x1="25"
        y1="42"
        x2="25"
        y2="58"
        stroke={STROKE_COLOR}
        strokeWidth={SW_THICK}
        strokeLinecap="round"
        vectorEffect={VE}
      />
      <line
        x1="35"
        y1="42"
        x2="35"
        y2="58"
        stroke={STROKE_COLOR}
        strokeWidth={SW_THICK}
        strokeLinecap="round"
        vectorEffect={VE}
      />
      <line
        x1="25"
        y1="50"
        x2="35"
        y2="50"
        stroke={STROKE_COLOR}
        strokeWidth={SW_THICK}
        vectorEffect={VE}
      />

      {/* --- RIGHT TRIANGLE (with stem above apex, empty inside) --- */}
      <polygon
        points="90,25 65,68 115,68"
        fill={FILL_COLOR}
        stroke={STROKE_COLOR}
        strokeWidth={SW_THICK}
        strokeLinejoin="round"
        vectorEffect={VE}
      />
      {/* Stem above apex */}
      <line
        x1="90"
        y1="9"
        x2="90"
        y2="25"
        stroke={STROKE_COLOR}
        strokeWidth={SW_THICK}
        strokeLinecap="round"
        vectorEffect={VE}
      />
    </g>
  );
}
