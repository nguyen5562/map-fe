import type { VehicleConfig } from "../components/left-sidebar/SmokeVehiclePanel";
import type { SmokeTimeRange } from "../components/left-sidebar/SmokeTimePanel";
import type { BattlefieldData } from "../components/left-sidebar/BattlefieldPanel";
import type {
  TargetDefenseData,
  SmokeMethodData,
  WeatherData,
} from "../context/SimulationContext";

/**
 * Làm tròn theo quy tắc tài liệu:
 * - Phần thập phân <= 0.2 → làm tròn xuống (floor)
 * - Phần thập phân > 0.2 → làm tròn lên (ceil)
 * - Ngoại lệ: Nếu có giá trị tính toán (> 0) thì tối thiểu phải làm tròn lên 1 (không thể = 0).
 * Ví dụ: 3.2 → 3, 3.3 → 4, 0.1 → 1, 1.1 → 1
 */
function smokeRound(value: number): number {
  if (value <= 0) return 0;
  const decimal = value - Math.floor(value);
  const result = decimal > 0.2 ? Math.ceil(value) : Math.floor(value);
  return Math.max(1, result);
}

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

  // --- T: thời gian cần thả khói (phút) ---
  let T = 0;
  if (inputs.smokeTime.mode === "duration") {
    T = parseFloat(inputs.smokeTime.duration || "0") || 0;
  } else {
    const fromMin =
      Number(inputs.smokeTime.fromH || 0) * 60 +
      Number(inputs.smokeTime.fromM || 0);
    const toMin =
      Number(inputs.smokeTime.toH || 0) * 60 +
      Number(inputs.smokeTime.toM || 0);
    T = Math.max(0, toMin - fromMin); // phút
  }

  const vehicleBreakdown: Record<
    string,
    {
      straightLine_vehicles: number;
      straightLine_routes: number;
      straightLine_points: number;
      circularLine_vehicles: number;
      circularLine_routes: number;
      circularLine_points: number;
      pointVehicles: number;
      totalVehicles: number;
      coverTime_min: number;
      weight: number;
      consumption?: Record<string, number>;
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
      // === TUYẾN THẲNG / DIỆN ===

      // Công thức 1.2 & 1.3: Tính số tuyến khói N
      if (alpha === 90) {
        // Trường hợp gió vuông góc: N = L / l (công thức 1.2)
        N = l > 0 ? smokeRound(L / l) : 0;
      } else {
        // Trường hợp gió chéo góc α: N = L / (l × cosα) (công thức 1.3)
        const cosAlphaForN = Math.cos((alpha * Math.PI) / 180);
        N = l > 0 && cosAlphaForN > 0 ? smokeRound(L / (l * cosAlphaForN)) : 0;
      }

      // Công thức 1.5 & 1.6: Tính số điểm khói trên 1 tuyến A
      if (alpha === 90) {
        // Trường hợp gió vuông góc: A = R / r (công thức 1.5)
        A = r > 0 ? smokeRound(R / r) : 0;
      } else {
        // Trường hợp gió dọc/chéo tuyến: A = L / l (công thức 1.6)
        A = l > 0 ? smokeRound(L / l) : 0;
      }
    } else {
      // === TUYẾN VÒNG ===

      // Công thức 1.4: N = 1 + 1/2(L - l) / l, trong đó L = πD (chu vi)
      const circumference = Math.PI * D;
      N = l > 0 ? smokeRound(1 + Math.max(0, circumference - l) / (2 * l)) : 0;

      // Công thức 1.7: A = πD / r (số điểm khói trên tuyến vòng)
      A = r > 0 ? smokeRound((Math.PI * D) / r) : 0;
    }

    // Công thức 1.8: Số PT trên 1 điểm: a = T / t
    const a = t > 0 ? smokeRound(T / t) : 0;

    // Trọng số (weight)
    let weight = 100;
    if (selectedVehicles.length > 1) {
      weight = Number(weights[vehicleId]) || 0;
    }

    // Công thức 1.9: Tổng số PT = N × A × a × reserveCoeff × (weight / 100)
    const baseTotal = N * A * a * reserveCoeff;
    const totalVehicles = Math.ceil(baseTotal * (weight / 100));

    // Thời gian phủ kín mục tiêu τ = l / v (giây) → ÷ 60 → phút
    const coverTime_min = v > 0 ? Math.round((l / v / 60) * 100) / 100 : 0;

    // Tính tiêu hao khí tài cho xe (isCar)
    let consumption: Record<string, number> | undefined;
    if (
      config.isCar &&
      config.consumptionConfig &&
      config.consumptionConfig.length > 0
    ) {
      const T_hours = T / 60; // T đang là phút, đổi sang giờ
      consumption = {};
      config.consumptionConfig.forEach((item: any) => {
        const rate = Number(item.rate) || 0;
        if (rate > 0) {
          consumption![item.name] =
            Math.round(rate * T_hours * totalVehicles * 100) / 100;
        }
      });
    }

    vehicleBreakdown[vehicleId] = {
      straightLine_vehicles:
        lineType === "Thẳng" || lineType === "Diện" ? A * a : 0,
      straightLine_routes: lineType === "Thẳng" || lineType === "Diện" ? N : 0,
      straightLine_points: lineType === "Thẳng" || lineType === "Diện" ? A : 0,
      circularLine_vehicles: lineType === "Vòng" ? A * a : 0,
      circularLine_routes: lineType === "Vòng" ? N : 0,
      circularLine_points: lineType === "Vòng" ? A : 0,
      pointVehicles: a,
      totalVehicles,
      coverTime_min,
      weight,
      consumption,
    };

    totalVehiclesSum += totalVehicles;
    maxCoverTime = Math.max(maxCoverTime, coverTime_min);
  });

  return {
    straightLine_vehicles:
      lineType === "Thẳng" || lineType === "Diện"
        ? Object.values(vehicleBreakdown).reduce(
            (sum, v) => sum + v.straightLine_vehicles,
            0,
          )
        : 0,
    straightLine_routes:
      lineType === "Thẳng" || lineType === "Diện"
        ? Object.values(vehicleBreakdown).reduce(
            (sum, v) => sum + v.straightLine_routes,
            0,
          )
        : 0,
    straightLine_points:
      lineType === "Thẳng" || lineType === "Diện"
        ? Object.values(vehicleBreakdown).reduce(
            (sum, v) => sum + v.straightLine_points,
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
    circularLine_points:
      lineType === "Vòng"
        ? Object.values(vehicleBreakdown).reduce(
            (sum, v) => sum + v.circularLine_points,
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
      acc.straightLine_points += r.straightLine_points || 0;
      acc.circularLine_vehicles += r.circularLine_vehicles || 0;
      acc.circularLine_routes += r.circularLine_routes || 0;
      acc.circularLine_points += r.circularLine_points || 0;
      acc.pointVehicles += r.pointVehicles || 0;
      acc.totalVehicles += r.totalVehicles || 0;
      acc.coverTime_min = Math.max(acc.coverTime_min, r.coverTime_min || 0);

      const breakdown = r.vehicleBreakdown || {};
      Object.keys(breakdown).forEach((vid) => {
        if (!acc.vehicleBreakdown[vid]) {
          acc.vehicleBreakdown[vid] = {
            straightLine_vehicles: 0,
            straightLine_routes: 0,
            straightLine_points: 0,
            circularLine_vehicles: 0,
            circularLine_routes: 0,
            circularLine_points: 0,
            pointVehicles: 0,
            totalVehicles: 0,
            coverTime_min: 0,
            weight: 0,
            consumption: undefined as Record<string, number> | undefined,
          };
        }
        const vdata = breakdown[vid];
        acc.vehicleBreakdown[vid].straightLine_vehicles +=
          vdata.straightLine_vehicles || 0;
        acc.vehicleBreakdown[vid].straightLine_routes +=
          vdata.straightLine_routes || 0;
        acc.vehicleBreakdown[vid].straightLine_points +=
          vdata.straightLine_points || 0;
        acc.vehicleBreakdown[vid].circularLine_vehicles +=
          vdata.circularLine_vehicles || 0;
        acc.vehicleBreakdown[vid].circularLine_routes +=
          vdata.circularLine_routes || 0;
        acc.vehicleBreakdown[vid].circularLine_points +=
          vdata.circularLine_points || 0;
        acc.vehicleBreakdown[vid].pointVehicles += vdata.pointVehicles || 0;
        acc.vehicleBreakdown[vid].totalVehicles += vdata.totalVehicles || 0;
        acc.vehicleBreakdown[vid].coverTime_min = Math.max(
          acc.vehicleBreakdown[vid].coverTime_min,
          vdata.coverTime_min || 0,
        );
        // Gộp consumption
        if (vdata.consumption) {
          if (!acc.vehicleBreakdown[vid].consumption) {
            acc.vehicleBreakdown[vid].consumption = {};
          }
          Object.entries(vdata.consumption).forEach(([key, val]) => {
            acc.vehicleBreakdown[vid].consumption![key] =
              (acc.vehicleBreakdown[vid].consumption![key] || 0) +
              (val as number);
          });
        }
      });

      return acc;
    },
    {
      straightLine_vehicles: 0,
      straightLine_routes: 0,
      straightLine_points: 0,
      circularLine_vehicles: 0,
      circularLine_routes: 0,
      circularLine_points: 0,
      pointVehicles: 0,
      totalVehicles: 0,
      coverTime_min: 0,
      vehicleBreakdown: {} as Record<string, any>,
    },
  );
  return aggregated;
};
