import type { SmokeTimeRange } from "../components/left-sidebar/SmokeTimePanel";
import type { BattlefieldData } from "../components/left-sidebar/BattlefieldPanel";
import type { VehicleConfig } from "../components/left-sidebar/SmokeVehiclePanel";
import type {
  TargetDefenseData,
  SmokeMethodData,
  WeatherData,
} from "../context/SimulationContext";

export const validateInputs = (
  inputs: {
    targetDefenseData: TargetDefenseData;
    smokeMethodData: SmokeMethodData;
    selectedVehicles: string[];
    battlefieldData: BattlefieldData;
    smokeTime: SmokeTimeRange;
    weatherData: WeatherData;
    smokeLineLength: number | "";
    reserveCoefficient: number | "";
    vehicleConfigs: Record<string, VehicleConfig>;
    vehicleWeights: Record<string, number | "">;
  },
  toast: any,
): boolean => {
  const {
    targetDefenseData,
    smokeMethodData,
    selectedVehicles,
    battlefieldData,
    smokeTime,
    weatherData,
    smokeLineLength,
    reserveCoefficient,
    vehicleConfigs,
    vehicleWeights,
  } = inputs;

  const isTargetTypeEmpty =
    !targetDefenseData.targetType || !targetDefenseData.targetType.trim();
  const isLineTypeVongEmpty =
    smokeMethodData.lineType === "Vòng" &&
    (!targetDefenseData.diameter || !targetDefenseData.diameter.trim());
  const isLineTypeThangEmpty =
    (smokeMethodData.lineType === "Thẳng" || smokeMethodData.lineType === "Diện") &&
    (!targetDefenseData.width ||
      !targetDefenseData.width.trim() ||
      !targetDefenseData.length ||
      !targetDefenseData.length.trim());

  const isTargetDefenseEmpty =
    isTargetTypeEmpty ||
    isLineTypeVongEmpty ||
    isLineTypeThangEmpty ||
    !targetDefenseData.area ||
    !targetDefenseData.area.trim() ||
    !targetDefenseData.coverageMultiplier ||
    !targetDefenseData.coverageMultiplier.trim();

  const isSmokeTimeEmpty =
    !smokeTime.fromH ||
    !smokeTime.fromH.trim() ||
    !smokeTime.fromM ||
    !smokeTime.fromM.trim() ||
    !smokeTime.toH ||
    !smokeTime.toH.trim() ||
    !smokeTime.toM ||
    !smokeTime.toM.trim();

  const isVehiclesEmpty = !selectedVehicles || selectedVehicles.length === 0;

  const isBattlefieldEmpty =
    !battlefieldData.firePoints.distance ||
    !battlefieldData.firePoints.distance.trim() ||
    !battlefieldData.commandPost.distance ||
    !battlefieldData.commandPost.distance.trim() ||
    !battlefieldData.reserveUnit.distance ||
    !battlefieldData.reserveUnit.distance.trim();

  const isWeatherEmpty =
    !weatherData.combatTime ||
    !weatherData.combatTime.trim() ||
    (weatherData.speed as any) === "" ||
    weatherData.speed === undefined ||
    weatherData.speed === null ||
    isNaN(Number(weatherData.speed)) ||
    (weatherData.alpha as any) === "" ||
    weatherData.alpha === undefined ||
    weatherData.alpha === null ||
    isNaN(Number(weatherData.alpha)) ||
    weatherData.humidity === "" ||
    weatherData.humidity === undefined ||
    weatherData.humidity === null ||
    isNaN(Number(weatherData.humidity)) ||
    weatherData.rainfall === "" ||
    weatherData.rainfall === undefined ||
    weatherData.rainfall === null ||
    isNaN(Number(weatherData.rainfall)) ||
    (weatherData.tkkMin as any) === "" ||
    weatherData.tkkMin === undefined ||
    weatherData.tkkMin === null ||
    isNaN(Number(weatherData.tkkMin)) ||
    (weatherData.tkkMax as any) === "" ||
    weatherData.tkkMax === undefined ||
    weatherData.tkkMax === null ||
    isNaN(Number(weatherData.tkkMax)) ||
    (weatherData.tmdMin as any) === "" ||
    weatherData.tmdMin === undefined ||
    weatherData.tmdMin === null ||
    isNaN(Number(weatherData.tmdMin)) ||
    (weatherData.tmdMax as any) === "" ||
    weatherData.tmdMax === undefined ||
    weatherData.tmdMax === null ||
    isNaN(Number(weatherData.tmdMax));

  const isSmokeLineLengthEmpty =
    smokeLineLength === "" ||
    smokeLineLength === undefined ||
    smokeLineLength === null ||
    isNaN(Number(smokeLineLength));

  const isReserveCoefficientEmpty =
    reserveCoefficient === "" ||
    reserveCoefficient === undefined ||
    reserveCoefficient === null ||
    isNaN(Number(reserveCoefficient));

  // Check configs for all selected vehicles
  const isVehicleConfigEmpty = selectedVehicles.some((vid) => {
    const config = vehicleConfigs[vid];
    return (
      !config ||
      config.l === "" ||
      config.l === undefined ||
      config.l === null ||
      isNaN(Number(config.l)) ||
      config.r === "" ||
      config.r === undefined ||
      config.r === null ||
      isNaN(Number(config.r)) ||
      config.t === "" ||
      config.t === undefined ||
      config.t === null ||
      isNaN(Number(config.t))
    );
  });

  const isWeightInvalid =
    selectedVehicles.length > 1 &&
    selectedVehicles.some((vid) => {
      const w = vehicleWeights[vid];
      return (
        w === "" ||
        w === undefined ||
        w === null ||
        isNaN(Number(w)) ||
        Number(w) <= 0
      );
    });

  const totalWeight =
    selectedVehicles.length > 1
      ? selectedVehicles.reduce(
          (sum, vid) => sum + (Number(vehicleWeights[vid]) || 0),
          0,
        )
      : 100;

  if (
    isTargetDefenseEmpty ||
    isSmokeTimeEmpty ||
    isVehiclesEmpty ||
    isBattlefieldEmpty ||
    isWeatherEmpty ||
    isSmokeLineLengthEmpty ||
    isReserveCoefficientEmpty ||
    isVehicleConfigEmpty
  ) {
    toast?.error(
      "Vui lòng nhập đầy đủ thông tin các trường trước khi thực hiện!",
    );
    return false;
  }

  if (isWeightInvalid) {
    toast?.error("Vui lòng nhập đầy đủ phần trăm đóng góp cho từng khí tài!");
    return false;
  }

  if (selectedVehicles.length > 1 && totalWeight !== 100) {
    toast?.error(
      `Tổng phần trăm đóng góp phải bằng 100% (Hiện tại là ${totalWeight}%).`,
    );
    return false;
  }

  const from = Number(smokeTime.fromH) * 60 + Number(smokeTime.fromM || 0);
  const to = Number(smokeTime.toH) * 60 + Number(smokeTime.toM || 0);
  if (to <= from) {
    toast?.error(
      "Thời gian thả khói không hợp lệ (Thời gian đến phải lớn hơn thời gian từ)!",
    );
    return false;
  }

  return true;
};
