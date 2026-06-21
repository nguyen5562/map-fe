import type { VehicleConfig } from "../components/left-sidebar/SmokeVehiclePanel";
import type { SmokeTimeRange } from "../components/left-sidebar/SmokeTimePanel";
import type { BattlefieldData } from "../components/left-sidebar/BattlefieldPanel";
import type {
  TargetDefenseData,
  SmokeMethodData,
  WeatherData,
} from "../context/SimulationContext";

export const performCalculation = (inputs: {
  targetDefenseData: TargetDefenseData;
  smokeMethodData: SmokeMethodData;
  selectedVehicles: string[];
  battlefieldData: BattlefieldData;
  weatherData: WeatherData;
  smokeTime: SmokeTimeRange;
  vehicleConfigs: Record<string, VehicleConfig>;
  reserveCoefficient: number;
}) => {
  const lineType = inputs.smokeMethodData.lineType;
  const vehicle = inputs.selectedVehicles[0] || "HPK-2.5";
  const configs = inputs.vehicleConfigs || {};
  const config = configs[vehicle] || {
    id: vehicle,
    name: vehicle,
    desc: "",
    l: 120,
    r: 10,
    t: 3,
    materials: "",
    unit: "cái",
  };

  // --- Thông số phương tiện ---
  const l = config.l || 0; // chiều dài màn khói PT (m)
  const r = config.r || 0; // chiều rộng màn khói PT (m)
  const t = config.t || 0; // thời gian phát khói PT (phút)

  // --- Thông số mục tiêu ---
  const L = parseFloat(inputs.targetDefenseData.length) || 0; // dọc theo hướng gió (m)
  const R = parseFloat(inputs.targetDefenseData.width) || 0;  // chính diện hướng gió (m)
  const D = parseFloat(inputs.targetDefenseData.diameter) || 0; // đường kính tuyến vòng (m)

  // --- Thông số khí tượng ---
  const alpha = inputs.weatherData.alpha ?? 90; // góc α (°)
  const v = inputs.weatherData.speed || 0;      // tốc độ gió (m/s)

  // --- T: thời gian cần thả khói (phút) = toTime - fromTime ---
  const fromMin = Number(inputs.smokeTime.fromH || 0) * 60 + Number(inputs.smokeTime.fromM || 0);
  const toMin = Number(inputs.smokeTime.toH || 0) * 60 + Number(inputs.smokeTime.toM || 0);
  const T = Math.max(0, toMin - fromMin); // phút

  // --- Hệ số dự phòng ---
  const reserveCoeff = inputs.reserveCoefficient || 1.2;

  let N = 0; // Công thức 1: Số tuyến khói cần bố trí
  let A = 0; // Công thức 2/3: Số PT bố trí trên 1 tuyến

  if (lineType === "Thẳng") {
    // === TUYẾN THẲNG ===

    // Công thức 1a: N = L / l
    N = l > 0 ? Math.ceil(L / l) : 0;

    // Công thức 2: Số PT trên 1 tuyến thẳng
    if (alpha === 90) {
      // Trường hợp vuông góc: A = (R × T) / (r × t)
      A = (r > 0 && t > 0) ? Math.ceil((R * T) / (r * t)) : 0;
    } else {
      // Trường hợp góc lệch α (bao gồm α=0° vì cos0=1): A = (L × T) / (cosα × l × t)
      const cosAlpha = Math.cos(alpha * Math.PI / 180);
      A = (cosAlpha > 0 && l > 0 && t > 0) ? Math.ceil((L * T) / (cosAlpha * l * t)) : 0;
    }
  } else {
    // === TUYẾN VÒNG ===

    // Công thức 1b: N = 1 + (L_vòng - l) / (2 × l), với L_vòng = π × D
    const circumference = Math.PI * D;
    N = l > 0 ? Math.ceil(1 + Math.max(0, circumference - l) / (2 * l)) : 0;

    // Công thức 3: A = (π × D × T) / (r × t)
    A = (r > 0 && t > 0) ? Math.ceil((Math.PI * D * T) / (r * t)) : 0;
  }

  // Công thức 4: Số PT trên 1 điểm: a = T / t
  const a = t > 0 ? Math.ceil(T / t) : 0;

  // Công thức 5: Tổng số PT cần sử dụng = A × N × hệ_số_dự_phòng
  const totalVehicles = Math.ceil(A * N * reserveCoeff);

  // Công thức 6: Thời gian phủ kín mục tiêu τ = l / v (giây) → ÷ 60 → phút
  const coverTime_min = v > 0 ? Math.round((l / v / 60) * 100) / 100 : 0;

  return {
    // Kết quả theo loại tuyến
    straightLine_vehicles: lineType === "Thẳng" ? A : 0,
    straightLine_routes: lineType === "Thẳng" ? N : 0,
    circularLine_vehicles: lineType === "Vòng" ? A : 0,
    circularLine_routes: lineType === "Vòng" ? N : 0,
    // Số PT trên 1 điểm
    pointVehicles: a,
    // Tổng số PT cần sử dụng (đã nhân hệ số dự phòng)
    totalVehicles,
    // Thời gian phủ kín
    coverTime_min,
  };
};

export const aggregateResults = (pointsList: any[]) => {
  return pointsList.reduce(
    (acc, p) => {
      const r = p.results || {};
      return {
        straightLine_vehicles:
          (acc.straightLine_vehicles || 0) + (r.straightLine_vehicles || 0),
        straightLine_routes:
          (acc.straightLine_routes || 0) + (r.straightLine_routes || 0),
        circularLine_vehicles:
          (acc.circularLine_vehicles || 0) + (r.circularLine_vehicles || 0),
        circularLine_routes:
          (acc.circularLine_routes || 0) + (r.circularLine_routes || 0),
        pointVehicles:
          (acc.pointVehicles || 0) + (r.pointVehicles || 0),
        totalVehicles:
          (acc.totalVehicles || 0) + (r.totalVehicles || 0),
        coverTime_min: Math.max(acc.coverTime_min || 0, r.coverTime_min || 0),
      };
    },
    {
      straightLine_vehicles: 0,
      straightLine_routes: 0,
      circularLine_vehicles: 0,
      circularLine_routes: 0,
      pointVehicles: 0,
      totalVehicles: 0,
      coverTime_min: 0,
    }
  );
};
