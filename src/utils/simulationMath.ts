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
  reserveCoefficient: number | "";
  vehicleWeights?: Record<string, number | "">;
}) => {
  const lineType = inputs.smokeMethodData.lineType;
  const selectedVehicles = inputs.selectedVehicles;
  const configs = inputs.vehicleConfigs || {};
  const reserveCoeff = Number(inputs.reserveCoefficient);
  const weights = inputs.vehicleWeights || {};

  // --- Thông số mục tiêu ---
  const K = parseFloat(inputs.targetDefenseData.coverageMultiplier) || 1; // hệ số diện tích (lần)
  const sqrtK = Math.sqrt(K); // nhân mỗi chiều với √K để diện tích tăng K lần
  const L = (parseFloat(inputs.targetDefenseData.length) || 0) * sqrtK; // dọc theo hướng gió (m), đã nhân √K
  const R = (parseFloat(inputs.targetDefenseData.width) || 0) * sqrtK; // chính diện hướng gió (m), đã nhân √K
  const D = (parseFloat(inputs.targetDefenseData.diameter) || 0) * sqrtK; // đường kính tuyến vòng (m), đã nhân √K

  // --- Thông số khí tượng ---
  const alpha = Number(inputs.weatherData.alpha); // góc α (°)
  const v = Number(inputs.weatherData.speed); // tốc độ gió (m/s)

  // --- T: thời gian cần thả khói (phút) = toTime - fromTime ---
  const fromMin =
    Number(inputs.smokeTime.fromH || 0) * 60 +
    Number(inputs.smokeTime.fromM || 0);
  const toMin =
    Number(inputs.smokeTime.toH || 0) * 60 + Number(inputs.smokeTime.toM || 0);
  const T = Math.max(0, toMin - fromMin); // phút

  const vehicleBreakdown: Record<
    string,
    {
      straightLine_vehicles: number;
      straightLine_routes: number;
      circularLine_vehicles: number;
      circularLine_routes: number;
      pointVehicles: number;
      totalVehicles: number;
      coverTime_min: number;
      weight: number;
    }
  > = {};

  let totalVehiclesSum = 0;
  let maxCoverTime = 0;

  selectedVehicles.forEach((vehicleId) => {
    const config = configs[vehicleId];
    if (!config) return;

    const l = Number(config.l);
    const r = Number(config.r);
    const t = Number(config.t);

    let N = 0;
    let A = 0;

    if (lineType === "Thẳng" || lineType === "Diện") {
      // Công thức 1a: N = L / l
      N = l > 0 ? Math.ceil(L / l) : 0;

      // Công thức 2: Số PT trên 1 tuyến thẳng
      if (alpha === 90) {
        // Trường hợp vuông góc: A = (R × T) / (r × t)
        A = r > 0 && t > 0 ? Math.ceil((R * T) / (r * t)) : 0;
      } else {
        // Trường hợp góc lệch α (cosα × l × t)
        const cosAlpha = Math.cos((alpha * Math.PI) / 180);
        A =
          cosAlpha > 0 && l > 0 && t > 0
            ? Math.ceil((L * T) / (cosAlpha * l * t))
            : 0;
      }
    } else {
      // === TUYẾN VÒNG ===
      // Công thức 1b: N = 1 + (L_vòng - l) / (2 × l)
      const circumference = Math.PI * D;
      N = l > 0 ? Math.ceil(1 + Math.max(0, circumference - l) / (2 * l)) : 0;

      // Công thức 3: A = (π × D × T) / (r × t)
      A = r > 0 && t > 0 ? Math.ceil((Math.PI * D * T) / (r * t)) : 0;
    }

    // Công thức 4: Số PT trên 1 điểm: a = T / t
    const a = t > 0 ? Math.ceil(T / t) : 0;

    // Trọng số (weight)
    let weight = 100;
    if (selectedVehicles.length > 1) {
      weight = Number(weights[vehicleId]) || 0;
    }

    // Công thức 5: Tổng số PT = A * N * reserveCoeff * (weight / 100)
    const baseTotal = A * N * reserveCoeff;
    const totalVehicles = Math.ceil(baseTotal * (weight / 100));

    // Công thức 6: Thời gian phủ kín mục tiêu τ = l / v (giây) → ÷ 60 → phút
    const coverTime_min = v > 0 ? Math.round((l / v / 60) * 100) / 100 : 0;

    vehicleBreakdown[vehicleId] = {
      straightLine_vehicles: (lineType === "Thẳng" || lineType === "Diện") ? A : 0,
      straightLine_routes: (lineType === "Thẳng" || lineType === "Diện") ? N : 0,
      circularLine_vehicles: lineType === "Vòng" ? A : 0,
      circularLine_routes: lineType === "Vòng" ? N : 0,
      pointVehicles: a,
      totalVehicles,
      coverTime_min,
      weight,
    };

    totalVehiclesSum += totalVehicles;
    maxCoverTime = Math.max(maxCoverTime, coverTime_min);
  });

  return {
    straightLine_vehicles:
      (lineType === "Thẳng" || lineType === "Diện")
        ? Object.values(vehicleBreakdown).reduce(
            (sum, v) => sum + v.straightLine_vehicles,
            0,
          )
        : 0,
    straightLine_routes:
      (lineType === "Thẳng" || lineType === "Diện")
        ? Object.values(vehicleBreakdown).reduce(
            (sum, v) => sum + v.straightLine_routes,
            0,
          )
        : 0,
    circularLine_vehicles:
      lineType === "Vòng"
        ? Object.values(vehicleBreakdown).reduce(
            (sum, v) => sum + v.circularLine_vehicles,
            0,
          )
        : 0,
    circularLine_routes:
      lineType === "Vòng"
        ? Object.values(vehicleBreakdown).reduce(
            (sum, v) => sum + v.circularLine_routes,
            0,
          )
        : 0,
    pointVehicles: Object.values(vehicleBreakdown).reduce(
      (sum, v) => sum + v.pointVehicles,
      0,
    ),
    totalVehicles: totalVehiclesSum,
    coverTime_min: maxCoverTime,
    vehicleBreakdown,
  };
};

export const aggregateResults = (pointsList: any[]) => {
  const aggregated = pointsList.reduce(
    (acc, p) => {
      const r = p.results || {};

      acc.straightLine_vehicles += r.straightLine_vehicles || 0;
      acc.straightLine_routes += r.straightLine_routes || 0;
      acc.circularLine_vehicles += r.circularLine_vehicles || 0;
      acc.circularLine_routes += r.circularLine_routes || 0;
      acc.pointVehicles += r.pointVehicles || 0;
      acc.totalVehicles += r.totalVehicles || 0;
      acc.coverTime_min = Math.max(acc.coverTime_min, r.coverTime_min || 0);

      const breakdown = r.vehicleBreakdown || {};
      Object.keys(breakdown).forEach((vid) => {
        if (!acc.vehicleBreakdown[vid]) {
          acc.vehicleBreakdown[vid] = {
            straightLine_vehicles: 0,
            straightLine_routes: 0,
            circularLine_vehicles: 0,
            circularLine_routes: 0,
            pointVehicles: 0,
            totalVehicles: 0,
            coverTime_min: 0,
            weight: 0,
          };
        }
        const vdata = breakdown[vid];
        acc.vehicleBreakdown[vid].straightLine_vehicles +=
          vdata.straightLine_vehicles || 0;
        acc.vehicleBreakdown[vid].straightLine_routes +=
          vdata.straightLine_routes || 0;
        acc.vehicleBreakdown[vid].circularLine_vehicles +=
          vdata.circularLine_vehicles || 0;
        acc.vehicleBreakdown[vid].circularLine_routes +=
          vdata.circularLine_routes || 0;
        acc.vehicleBreakdown[vid].pointVehicles += vdata.pointVehicles || 0;
        acc.vehicleBreakdown[vid].totalVehicles += vdata.totalVehicles || 0;
        acc.vehicleBreakdown[vid].coverTime_min = Math.max(
          acc.vehicleBreakdown[vid].coverTime_min,
          vdata.coverTime_min || 0,
        );
      });

      return acc;
    },
    {
      straightLine_vehicles: 0,
      straightLine_routes: 0,
      circularLine_vehicles: 0,
      circularLine_routes: 0,
      pointVehicles: 0,
      totalVehicles: 0,
      coverTime_min: 0,
      vehicleBreakdown: {} as Record<string, any>,
    },
  );
  return aggregated;
};
