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
    battlefieldScale: number | "";
    commandPostLevel: string;
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
    battlefieldScale,
    commandPostLevel,
  } = inputs;

  // 1. Kiểm tra phương pháp phát khói (Smoke Method Data)
  if (!smokeMethodData.lineType) {
    toast?.error("Vui lòng chọn phương pháp phát khói!");
    return false;
  }

  if (!smokeMethodData.lineRole) {
    toast?.error("Vui lòng chọn vai trò tuyến khói!");
    return false;
  }

  // 2. Kiểm tra đối tượng bảo vệ (Target Defense Data)
  if (!targetDefenseData.targetType || !targetDefenseData.targetType.trim()) {
    toast?.error("Vui lòng chọn hoặc nhập mục tiêu bảo vệ!");
    return false;
  }

  if (smokeMethodData.lineType === "Vòng") {
    if (!targetDefenseData.diameter || !targetDefenseData.diameter.trim()) {
      toast?.error("Vui lòng nhập đường kính tuyến vòng (D) cho mục tiêu!");
      return false;
    }
  } else {
    // "Thẳng" hoặc "Diện"
    if (!targetDefenseData.width || !targetDefenseData.width.trim()) {
      toast?.error(
        "Vui lòng nhập kích thước chính diện hướng gió (R) cho mục tiêu!",
      );
      return false;
    }
    if (!targetDefenseData.length || !targetDefenseData.length.trim()) {
      toast?.error(
        "Vui lòng nhập kích thước dọc theo hướng gió (L) cho mục tiêu!",
      );
      return false;
    }
  }

  if (!targetDefenseData.area || !targetDefenseData.area.trim()) {
    toast?.error("Vui lòng nhập diện tích mục tiêu!");
    return false;
  }

  if (
    !targetDefenseData.coverageMultiplier ||
    !targetDefenseData.coverageMultiplier.trim()
  ) {
    toast?.error("Vui lòng nhập yêu cầu diện tích màn khói cần bao phủ!");
    return false;
  }

  // 2. Kiểm tra thời gian thả khói (Smoke Time)
  if (smokeTime.mode === "duration") {
    if (
      !smokeTime.duration ||
      !smokeTime.duration.trim() ||
      isNaN(Number(smokeTime.duration)) ||
      Number(smokeTime.duration) <= 0
    ) {
      toast?.error(
        "Vui lòng nhập thời gian phát khói hợp lệ (số phút lớn hơn 0)!",
      );
      return false;
    }
  } else {
    if (
      !smokeTime.fromH ||
      !smokeTime.fromH.trim() ||
      !smokeTime.fromM ||
      !smokeTime.fromM.trim()
    ) {
      toast?.error(
        "Vui lòng nhập đầy đủ thời gian bắt đầu thả khói (giờ, phút)!",
      );
      return false;
    }

    if (
      !smokeTime.toH ||
      !smokeTime.toH.trim() ||
      !smokeTime.toM ||
      !smokeTime.toM.trim()
    ) {
      toast?.error(
        "Vui lòng nhập đầy đủ thời gian kết thúc thả khói (giờ, phút)!",
      );
      return false;
    }
  }

  // 3. Kiểm tra phương tiện thả khói được chọn (Selected Vehicles)
  if (!selectedVehicles || selectedVehicles.length === 0) {
    toast?.error("Vui lòng chọn ít nhất một phương tiện thả khói!");
    return false;
  }

  // 4. Kiểm tra tọa độ trận địa (Battlefield Coordinates)
  if (!battlefieldData.firePoints.rawCoords) {
    toast?.error("Vui lòng chọn vị trí điểm hỏa trên bản đồ!");
    return false;
  }

  if (!battlefieldData.commandPost.rawCoords) {
    toast?.error("Vui lòng chọn vị trí bộ phận chỉ huy trên bản đồ!");
    return false;
  }

  if (!battlefieldData.reserveUnit.rawCoords) {
    toast?.error("Vui lòng chọn vị trí bộ phận dự bị, bảo đảm trên bản đồ!");
    return false;
  }

  // 5. Kiểm tra khí tượng (Weather Data)
  if (!weatherData.combatTime || !weatherData.combatTime.trim()) {
    toast?.error("Vui lòng nhập thời gian tác chiến trong phần khí tượng!");
    return false;
  }

  if (!weatherData.windDirection || !weatherData.windDirection.trim()) {
    toast?.error("Vui lòng chọn hướng gió chính trong phần khí tượng!");
    return false;
  }

  if (
    weatherData.beta === "" ||
    weatherData.beta === undefined ||
    weatherData.beta === null ||
    isNaN(Number(weatherData.beta))
  ) {
    toast?.error("Vui lòng nhập góc lệch β trong phần khí tượng!");
    return false;
  }

  if (
    (weatherData.speed as any) === "" ||
    weatherData.speed === undefined ||
    weatherData.speed === null ||
    isNaN(Number(weatherData.speed))
  ) {
    toast?.error("Vui lòng nhập tốc độ gió hợp lệ trong phần khí tượng!");
    return false;
  }

  if (
    (weatherData.alpha as any) === "" ||
    weatherData.alpha === undefined ||
    weatherData.alpha === null ||
    isNaN(Number(weatherData.alpha))
  ) {
    toast?.error(
      "Vui lòng nhập góc lệch hướng gió α hợp lệ trong phần khí tượng!",
    );
    return false;
  }

  if (!weatherData.alphaDirection) {
    toast?.error("Vui lòng chọn hướng lệch góc α (Trái hoặc Phải)!");
    return false;
  }

  if (
    weatherData.humidity === "" ||
    weatherData.humidity === undefined ||
    weatherData.humidity === null ||
    isNaN(Number(weatherData.humidity))
  ) {
    toast?.error("Vui lòng nhập độ ẩm không khí hợp lệ trong phần khí tượng!");
    return false;
  }

  if (
    weatherData.rainfall === "" ||
    weatherData.rainfall === undefined ||
    weatherData.rainfall === null ||
    isNaN(Number(weatherData.rainfall))
  ) {
    toast?.error("Vui lòng nhập lượng mây hợp lệ trong phần khí tượng!");
    return false;
  }

  if (
    (weatherData.tkkMin as any) === "" ||
    weatherData.tkkMin === undefined ||
    weatherData.tkkMin === null ||
    isNaN(Number(weatherData.tkkMin)) ||
    (weatherData.tkkMax as any) === "" ||
    weatherData.tkkMax === undefined ||
    weatherData.tkkMax === null ||
    isNaN(Number(weatherData.tkkMax))
  ) {
    toast?.error(
      "Vui lòng nhập đầy đủ nhiệt độ không khí (Tkk Min và Tkk Max) trong phần khí tượng!",
    );
    return false;
  }

  if (
    (weatherData.tmdMin as any) === "" ||
    weatherData.tmdMin === undefined ||
    weatherData.tmdMin === null ||
    isNaN(Number(weatherData.tmdMin)) ||
    (weatherData.tmdMax as any) === "" ||
    weatherData.tmdMax === undefined ||
    weatherData.tmdMax === null ||
    isNaN(Number(weatherData.tmdMax))
  ) {
    toast?.error(
      "Vui lòng nhập đầy đủ nhiệt độ mặt đất (Tmd Min và Tmd Max) trong phần khí tượng!",
    );
    return false;
  }

  // 6. Kiểm tra độ dài ký hiệu tuyến khói (Smoke Line Length)
  if (
    smokeLineLength === "" ||
    smokeLineLength === undefined ||
    smokeLineLength === null ||
    isNaN(Number(smokeLineLength))
  ) {
    toast?.error("Vui lòng nhập độ dài ký hiệu tuyến khói!");
    return false;
  }

  // 7. Kiểm tra hệ số dự phòng (Reserve Coefficient)
  if (
    reserveCoefficient === "" ||
    reserveCoefficient === undefined ||
    reserveCoefficient === null ||
    isNaN(Number(reserveCoefficient))
  ) {
    toast?.error("Vui lòng nhập hệ số phương tiện, khí tài bổ trợ, dự bị!");
    return false;
  }

  // 8. Kiểm tra cấu hình khí tài thả khói (Vehicle Configs)
  for (const vid of selectedVehicles) {
    const config = vehicleConfigs[vid];
    const vname = config?.name || vid;
    if (!config) {
      toast?.error(`Không tìm thấy cấu hình cho phương tiện ${vname}!`);
      return false;
    }
    if (
      config.l === "" ||
      config.l === undefined ||
      config.l === null ||
      isNaN(Number(config.l))
    ) {
      toast?.error(
        `Vui lòng nhập chiều dài màn khói (l) cho phương tiện ${vname}!`,
      );
      return false;
    }
    if (
      config.r === "" ||
      config.r === undefined ||
      config.r === null ||
      isNaN(Number(config.r))
    ) {
      toast?.error(
        `Vui lòng nhập chiều rộng màn khói (r) cho phương tiện ${vname}!`,
      );
      return false;
    }
    if (
      config.t === "" ||
      config.t === undefined ||
      config.t === null ||
      isNaN(Number(config.t))
    ) {
      toast?.error(
        `Vui lòng nhập thời gian tạo màn khói (t) cho phương tiện ${vname}!`,
      );
      return false;
    }
  }

  // 9. Kiểm tra tỷ lệ sử dụng khí tài (%) (Vehicle Weights)
  if (selectedVehicles.length > 1) {
    for (const vid of selectedVehicles) {
      const w = vehicleWeights[vid];
      const vname = vehicleConfigs[vid]?.name || vid;
      if (
        w === "" ||
        w === undefined ||
        w === null ||
        isNaN(Number(w)) ||
        Number(w) <= 0
      ) {
        toast?.error(
          `Vui lòng nhập phần trăm đóng góp hợp lệ (> 0) cho phương tiện ${vname}!`,
        );
        return false;
      }
    }

    const totalWeight = selectedVehicles.reduce(
      (sum, vid) => sum + (Number(vehicleWeights[vid]) || 0),
      0,
    );
    if (totalWeight !== 100) {
      toast?.error(
        `Tổng phần trăm đóng góp phải bằng 100% (Hiện tại là ${totalWeight}%).`,
      );
      return false;
    }
  }

  // 10. Kiểm tra tính hợp lệ thời gian thả khói (Smoke Time logic)
  if (smokeTime.mode !== "duration") {
    const from = Number(smokeTime.fromH) * 60 + Number(smokeTime.fromM || 0);
    const to = Number(smokeTime.toH) * 60 + Number(smokeTime.toM || 0);
    if (to <= from) {
      toast?.error(
        "Thời gian thả khói không hợp lệ (Thời gian đến phải lớn hơn thời gian từ)!",
      );
      return false;
    }
  }

  // 11. Kiểm tra cấu trúc trận địa khói (Battlefield Config)
  if (
    battlefieldScale === "" ||
    battlefieldScale === undefined ||
    battlefieldScale === null ||
    isNaN(Number(battlefieldScale)) ||
    Number(battlefieldScale) < 0.1
  ) {
    toast?.error(
      "Vui lòng nhập tỉ lệ kích thước ký hiệu hợp lệ (từ 0.1 trở lên)!",
    );
    return false;
  }

  if (!commandPostLevel || !commandPostLevel.trim()) {
    toast?.error("Vui lòng chọn cấp chỉ huy cho bộ phận chỉ huy!");
    return false;
  }

  return true;
};
