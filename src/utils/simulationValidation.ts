import type { VehicleConfig } from "../components/left-sidebar/SmokeVehiclePanel";
import type { SmokeTimeRange } from "../components/left-sidebar/SmokeTimePanel";
import type { BattlefieldData } from "../components/left-sidebar/BattlefieldPanel";
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
  },
  toast: any
): boolean => {
  const {
    targetDefenseData,
    smokeMethodData,
    selectedVehicles,
    battlefieldData,
    smokeTime,
    weatherData,
  } = inputs;

  const isTargetTypeEmpty = !targetDefenseData.targetType || !targetDefenseData.targetType.trim();
  const isLineTypeVongEmpty = smokeMethodData.lineType === "Vòng" && (!targetDefenseData.diameter || !targetDefenseData.diameter.trim());
  const isLineTypeThangEmpty = smokeMethodData.lineType === "Thẳng" && (
    !targetDefenseData.width || !targetDefenseData.width.trim() ||
    !targetDefenseData.length || !targetDefenseData.length.trim()
  );
  
  const isTargetDefenseEmpty = isTargetTypeEmpty || isLineTypeVongEmpty || isLineTypeThangEmpty ||
    !targetDefenseData.area || !targetDefenseData.area.trim() ||
    !targetDefenseData.coverageMultiplier || !targetDefenseData.coverageMultiplier.trim();

  const isSmokeTimeEmpty = !smokeTime.fromH || !smokeTime.fromH.trim() ||
    !smokeTime.fromM || !smokeTime.fromM.trim() ||
    !smokeTime.toH || !smokeTime.toH.trim() ||
    !smokeTime.toM || !smokeTime.toM.trim();

  const isVehiclesEmpty = !selectedVehicles || selectedVehicles.length === 0;

  const isBattlefieldEmpty = !battlefieldData.firePoints.distance || !battlefieldData.firePoints.distance.trim() ||
    !battlefieldData.commandPost.distance || !battlefieldData.commandPost.distance.trim() ||
    !battlefieldData.reserveUnit.distance || !battlefieldData.reserveUnit.distance.trim();

  const isWeatherEmpty = !weatherData.combatTime || !weatherData.combatTime.trim() ||
    (weatherData.speed as any) === "" || weatherData.speed === undefined || weatherData.speed === null || isNaN(weatherData.speed) ||
    (weatherData.alpha as any) === "" || weatherData.alpha === undefined || weatherData.alpha === null || isNaN(weatherData.alpha) ||
    weatherData.humidity === "" || weatherData.humidity === undefined || weatherData.humidity === null || isNaN(Number(weatherData.humidity)) ||
    weatherData.rainfall === "" || weatherData.rainfall === undefined || weatherData.rainfall === null || isNaN(Number(weatherData.rainfall)) ||
    (weatherData.tkkMin as any) === "" || weatherData.tkkMin === undefined || weatherData.tkkMin === null || isNaN(weatherData.tkkMin) ||
    (weatherData.tkkMax as any) === "" || weatherData.tkkMax === undefined || weatherData.tkkMax === null || isNaN(weatherData.tkkMax) ||
    (weatherData.tmdMin as any) === "" || weatherData.tmdMin === undefined || weatherData.tmdMin === null || isNaN(weatherData.tmdMin) ||
    (weatherData.tmdMax as any) === "" || weatherData.tmdMax === undefined || weatherData.tmdMax === null || isNaN(weatherData.tmdMax);

  if (isTargetDefenseEmpty || isSmokeTimeEmpty || isVehiclesEmpty || isBattlefieldEmpty || isWeatherEmpty) {
    toast?.error("Vui lòng nhập đầy đủ thông tin các trường trước khi thực hiện!");
    return false;
  }

  const from = Number(smokeTime.fromH) * 60 + Number(smokeTime.fromM || 0);
  const to = Number(smokeTime.toH) * 60 + Number(smokeTime.toM || 0);
  if (to <= from) {
    toast?.error("Thời gian thả khói không hợp lệ (Thời gian đến phải lớn hơn thời gian từ)!");
    return false;
  }

  return true;
};
