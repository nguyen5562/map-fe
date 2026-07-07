import { SVGOverlay } from "react-leaflet";
import L from "leaflet";
import type { VehicleConfig } from "../left-sidebar/SmokeVehiclePanel";
import type { SmokeTimeRange } from "../left-sidebar/SmokeTimePanel";
import type {
  TargetDefenseData,
  SmokeMethodData,
} from "../../context/SimulationContext";

export const UTM_FONT = "'UTM Helvetins', 'Times New Roman', Times, serif";

// ViewBox dimensions — khớp chiều ngang với GasMarker (250px wide)
const VB_W = 250;
const VB_H = 120; // 2 dòng text + separator (tăng từ 110 lên 120 cho cả 2 dòng cùng to 28px)

type Props = {
  center: L.LatLng;
  results: {
    totalVehicles: number;
    vehicleBreakdown?: Record<
      string,
      { weight: number; totalVehicles: number }
    >;
  };
  smokeTime: SmokeTimeRange;
  vehicleConfigs: Record<string, VehicleConfig>;
  selectedVehicles: string[];
  combatTime?: string;
  smokeLineLength?: number | "";
  scaleX: number;
  onClick?: () => void;
  targetDefenseData?: TargetDefenseData;
  smokeMethodData?: SmokeMethodData;
};

/** Pad số thành 2 chữ số */
export const pad = (v: string | number) => String(v ?? "0").padStart(2, "0");

/**
 * Parse ngày chiến đấu:
 * - "01.05.26"    => "01.05"
 * - "06.00 - N-3" => "N-3"
 * - "N" / khác   => giữ nguyên
 */
export const parseCombatDate = (combatTime?: string): string => {
  const raw = combatTime?.trim();
  if (!raw) return "N";
  if (raw.includes(" - ")) {
    return raw.split(" - ").slice(-1)[0].trim() || "N";
  }
  if (/^\d{2}\.\d{2}\.\d{2}$/.test(raw)) {
    return raw.slice(0, 5);
  }
  return raw;
};

/** Lấy vehicle id chính: 1 vehicle → lấy luôn, nhiều → weight cao nhất */
export const getMainVehicleId = (
  selectedVehicles: string[],
  vehicleBreakdown?: Record<string, { weight: number }>,
): string | null => {
  if (!selectedVehicles.length) return null;
  if (selectedVehicles.length === 1 || !vehicleBreakdown) {
    return selectedVehicles[0];
  }
  return selectedVehicles.reduce((best, vid) => {
    const bw = vehicleBreakdown[best]?.weight ?? 0;
    const vw = vehicleBreakdown[vid]?.weight ?? 0;
    return vw > bw ? vid : best;
  }, selectedVehicles[0]);
};

/** Ước lượng độ dài text theo px trong SVG viewBox dựa trên số ký tự */
export const estimateTextWidth = (text: string, fontSize: number): number => {
  let width = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (/[A-Z]/.test(char)) {
      width += fontSize * 0.62;
    } else if (/[0-9]/.test(char)) {
      width += fontSize * 0.55;
    } else if (char === " " || char === "-" || char === ".") {
      width += fontSize * 0.3;
    } else if (char === "÷") {
      width += fontSize * 0.6;
    } else {
      width += fontSize * 0.5;
    }
  }
  return width;
};

export function GasLabel({
  center,
  results,
  smokeTime,
  selectedVehicles,
  combatTime,
  smokeLineLength = 700,
  scaleX,
  onClick,
  targetDefenseData,
  smokeMethodData,
}: Props) {
  if (!results || results.totalVehicles == null) return null;

  // Kích thước overlay — dùng cùng công thức với GasMarker
  const actualLength = smokeLineLength ? Number(smokeLineLength) : 700;
  const rawWidth = (actualLength * 1.25) / Math.abs(scaleX);
  const rawHeight = rawWidth * (VB_H / VB_W); // Tỷ lệ khớp viewBox

  // Đặt nhãn căn giữa quanh tọa độ kéo thả (center)
  const bounds: L.LatLngBoundsExpression = [
    [center.lat - rawHeight / 2, center.lng - rawWidth / 2],
    [center.lat + rawHeight / 2, center.lng + rawWidth / 2],
  ];

  // Lấy id phương tiện chính (ví dụ: HPK-2.5)
  const mainVid = getMainVehicleId(selectedVehicles, results.vehicleBreakdown);

  // Tính toán độ dài hiển thị:
  // Nếu là tuyến thẳng hoặc diện thì lấy cái R, còn tuyến vòng lấy D, nhân với căn cái số lần bao phủ (K)
  const K = parseFloat(targetDefenseData?.coverageMultiplier || "1") || 1;
  const sqrtK = Math.sqrt(K);
  const R = parseFloat(targetDefenseData?.width || "0") || 0;
  const D = parseFloat(targetDefenseData?.diameter || "0") || 0;
  const lineType = smokeMethodData?.lineType || "Thẳng";

  let displayedLength = actualLength;
  if (lineType === "Vòng") {
    if (D > 0) {
      displayedLength = D * sqrtK;
    }
  } else {
    if (R > 0) {
      displayedLength = R * sqrtK;
    }
  }

  const lengthInKm = Number((displayedLength / 1000).toFixed(2));
  const line1 = `${results.totalVehicles}${mainVid || ""}-${lengthInKm}`;

  const fromH = pad(smokeTime.fromH || "0");
  const fromM = pad(smokeTime.fromM || "0");
  const toH = pad(smokeTime.toH || "0");
  const toM = pad(smokeTime.toM || "0");
  const dateLabel = parseCombatDate(combatTime);

  const line2String = `${fromH}.${fromM}÷${toH}.${toM}-${dateLabel}`;

  // Tính chiều rộng text của cả 2 dòng, lấy cái lớn nhất
  const w1 = estimateTextWidth(line1, 28);
  const w2 = estimateTextWidth(line2String, 28);
  const maxW = Math.max(w1, w2);

  // Đường gạch ngang chỉ dài hơn text dài nhất 12px (mỗi bên thò ra 6px)
  const halfLine = (maxW + 12) / 2;
  const x1 = VB_W / 2 - halfLine;
  const x2 = VB_W / 2 + halfLine;

  return (
    <SVGOverlay
      bounds={bounds}
      attributes={{ viewBox: `0 0 ${VB_W} ${VB_H}`, overflow: "visible" }}
      eventHandlers={onClick ? { click: onClick } : undefined}
    >
      {/* Outline trắng để chữ nổi trên mọi nền bản đồ */}
      <defs>
        <filter
          id="gas-label-outline"
          x="-10%"
          y="-10%"
          width="120%"
          height="120%"
        >
          <feMorphology
            operator="dilate"
            radius="2.5"
            in="SourceAlpha"
            result="expanded"
          />
          <feFlood floodColor="#ffffff" result="white" />
          <feComposite
            in="white"
            in2="expanded"
            operator="in"
            result="outline"
          />
          <feMerge>
            <feMergeNode in="outline" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Dòng 1: "4 HPK-2.5" */}
      <text
        x={VB_W / 2}
        y={38}
        textAnchor="middle"
        fontFamily={UTM_FONT}
        fontSize={28}
        fontWeight="bold"
        fill="#0f172a"
        stroke="#0f172a"
        strokeWidth={0.8}
        filter="url(#gas-label-outline)"
        style={{ letterSpacing: "0.5px" }}
      >
        {line1}
      </text>

      {/* Đường kẻ ngang chia 2 dòng, dài theo text */}
      <line
        x1={x1}
        y1={55}
        x2={x2}
        y2={55}
        stroke="#0f172a"
        strokeWidth={3.0}
      />

      {/* Dòng 2: "10.00÷11.00 - 01.05" */}
      <text
        x={VB_W / 2}
        y={96}
        textAnchor="middle"
        fontFamily={UTM_FONT}
        fontSize={28}
        fontWeight="bold"
        fill="#0f172a"
        stroke="#0f172a"
        strokeWidth={0.8}
        filter="url(#gas-label-outline)"
        direction="ltr"
        style={{ letterSpacing: "0.5px", unicodeBidi: "isolate" }}
      >
        {/* Dùng tspan cho ÷ vì UTM Helvetins không có glyph này */}
        <tspan fontFamily={UTM_FONT}>{`${fromH}.${fromM}`}</tspan>
        <tspan fontFamily="'Times New Roman', Times, serif">&#247;</tspan>
        <tspan fontFamily={UTM_FONT}>{`${toH}.${toM} - ${dateLabel}`}</tspan>
      </text>
    </SVGOverlay>
  );
}
