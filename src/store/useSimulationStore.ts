import { create } from "zustand";
import L from "leaflet";
import { mapService } from "../services/map.service";
import { simulationSessionService } from "../services/simulationSession.service";
import { performCalculation, aggregateResults } from "../utils/simulationMath";
import { validateInputs } from "../utils/simulationValidation";
import type { SimulationStoreState } from "../types/simulation";
import { convertRawToReal, convertRealToRaw } from "../utils/calibrationMath";
import { getSessionSnapshot } from "../types/simulationSession";

const DIRECTIONS = [
  "Bắc",
  "Đông Bắc",
  "Đông",
  "Đông Nam",
  "Nam",
  "Tây Nam",
  "Tây",
  "Tây Bắc",
];

const angleToDirectionLocal = (angleDeg: number): string => {
  const a = ((angleDeg % 360) + 360) % 360;
  const idx = Math.round(a / 45) % 8;
  return DIRECTIONS[idx];
};

const recalculateBattlefieldData = (
  battlefieldData: any,
  currentRealCoords: { x: number; y: number } | null,
  rawToReal: (lng: number, lat: number) => { x: number; y: number } | null,
) => {
  if (!currentRealCoords) return battlefieldData;
  const keys = ["firePoints", "commandPost", "reserveUnit"] as const;
  const updated = { ...battlefieldData };
  for (const key of keys) {
    const entry = battlefieldData[key];
    if (entry && entry.rawCoords) {
      const real = rawToReal(entry.rawCoords.lng, entry.rawCoords.lat);
      let distance = "";
      let direction = "Bắc";
      if (real) {
        const dx = real.x - currentRealCoords.x;
        const dy = real.y - currentRealCoords.y;
        const dist = Math.round(Math.sqrt(dx * dx + dy * dy));
        distance = String(dist);
        const mathAngle = Math.atan2(dy, dx) * (180 / Math.PI);
        const compassAngle = 90 - mathAngle;
        direction = angleToDirectionLocal(compassAngle);
      }
      updated[key] = {
        ...entry,
        distance,
        direction,
      };
    }
  }
  return updated;
};

const captureCurrentStateAsDraft = (state: any) => {
  return {
    coords: state.clickedRaw,
    targetDefenseData: { ...state.targetDefenseData },
    smokeMethodData: { ...state.smokeMethodData },
    selectedVehicles: [...state.selectedVehicles],
    battlefieldData: { ...state.battlefieldData },
    weatherData: { ...state.weatherData },
    smokeTime: { ...state.smokeTime },
    vehicleConfigs: { ...state.vehicleConfigs },
    smokeLineLength: state.smokeLineLength,
    reserveCoefficient: state.reserveCoefficient,
    vehicleWeights: { ...state.vehicleWeights },
  };
};

export const useSimulationStore = create<SimulationStoreState>((set, get) => ({
  toast: null,
  initToast: (toast) => set({ toast }),

  // Initial States
  maps: [],
  currentMap: null,
  isUploading: false,
  uploadProgress: 0,
  sessions: [],
  isSessionsLoading: false,
  activeSessionId: null,
  clickedRaw: null,
  currentRealCoords: null,
  isCalibrated: false,
  showCalibration: true,
  showWeather: true,
  isSelectingFor: null,
  p1: { rawX: null, rawY: null, realX: "", realY: "" },
  p2: { rawX: null, rawY: null, realX: "", realY: "" },
  scale: { x: 1, y: 1 },
  searchX: "",
  searchY: "",
  isSidebarOpen: true,
  isRightSidebarOpen: true,
  pointsList: [],
  results: null,
  selectedPointId: null,
  editingPointId: null,
  drafts: {},
  confirmModal: {
    isOpen: false,
    title: "",
    message: "",
    pendingAction: null,
  },
  mapFlyCenter: null,

  targetDefenseData: {
    targetType: "Trận địa hỏa lực",
    length: "500",
    width: "300",
    diameter: "500",
    area: "15",
    coverageMultiplier: "10",
  },
  smokeTime: {
    fromH: "06",
    fromM: "00",
    toH: "06",
    toM: "15",
    duration: "",
    customTemplate: "",
    mode: "range",
  },
  smokeMethodData: {
    lineType: "Thẳng",
    lineRole: "Chính",
    bufferColor: "none",
  },
  selectedVehicles: [],
  vehicleConfigs: {},
  originalVehicleConfigs: {},
  battlefieldData: {
    firePoints: {
      rawCoords: null,
      distance: "",
      direction: "Bắc",
      bufferColor: "none",
    },
    commandPost: {
      rawCoords: null,
      distance: "",
      direction: "Bắc",
      bufferColor: "none",
    },
    reserveUnit: {
      rawCoords: null,
      distance: "",
      direction: "Bắc",
      bufferColor: "none",
    },
  },
  battlefieldScale: 1,
  commandPostLevel: "squad" as const,
  weatherActive: true,
  weatherData: {
    combatTime: "01.05.26",
    windDirection: "Tây Bắc",
    windAngle: 315,
    secondaryWindDirection: "Tây",
    secondaryWindAngle: 270,
    beta: 0,
    alpha: 90,
    alphaDirection: "right" as const,
    speed: 5,
    rainfall: 5,
    tkkMin: 28,
    tkkMax: 35,
    tmdMin: 30,
    tmdMax: 37,
    humidity: 70,
  },
  smokeLineLength: 700,
  reserveCoefficient: 1.2,
  vehicleWeights: {},

  // Setters
  setCurrentMap: (val) => {
    const nextMap = typeof val === "function" ? val(get().currentMap) : val;
    if (get().currentMap?.id !== nextMap?.id) {
      get().resetCurrentSession();
    }
    set({ currentMap: nextMap });
  },
  setIsCalibrated: (val) =>
    set((state) => ({
      isCalibrated: typeof val === "function" ? val(state.isCalibrated) : val,
    })),
  setShowCalibration: (val) =>
    set((state) => ({
      showCalibration:
        typeof val === "function" ? val(state.showCalibration) : val,
    })),
  setShowWeather: (val) =>
    set((state) => ({
      showWeather: typeof val === "function" ? val(state.showWeather) : val,
    })),
  setIsSelectingFor: (val) =>
    set((state) => ({
      isSelectingFor:
        typeof val === "function" ? val(state.isSelectingFor) : val,
    })),
  setP1: (val) =>
    set((state) => ({ p1: typeof val === "function" ? val(state.p1) : val })),
  setP2: (val) =>
    set((state) => ({ p2: typeof val === "function" ? val(state.p2) : val })),
  setScale: (val) =>
    set((state) => ({
      scale: typeof val === "function" ? val(state.scale) : val,
    })),
  setClickedRaw: (val) => {
    const clickedRaw = typeof val === "function" ? val(get().clickedRaw) : val;
    const currentRealCoords = clickedRaw
      ? get().rawToReal(clickedRaw.lng, clickedRaw.lat)
      : null;

    const { selectedPointId, editingPointId, drafts } = get();

    if (editingPointId !== null) {
      const updatedBattlefieldData = recalculateBattlefieldData(
        get().battlefieldData,
        currentRealCoords,
        get().rawToReal,
      );
      set({
        clickedRaw,
        currentRealCoords,
        battlefieldData: updatedBattlefieldData,
      });
    } else {
      if (selectedPointId !== null) {
        const draft = drafts["new"];
        if (draft) {
          set({
            clickedRaw: clickedRaw || draft.coords,
            currentRealCoords: clickedRaw
              ? get().rawToReal(clickedRaw.lng, clickedRaw.lat)
              : draft.coords
                ? get().rawToReal(draft.coords.lng, draft.coords.lat)
                : null,
            selectedPointId: null,
            targetDefenseData: { ...draft.targetDefenseData },
            smokeMethodData: { ...draft.smokeMethodData },
            selectedVehicles: [...draft.selectedVehicles],
            battlefieldData: { ...draft.battlefieldData },
            weatherData: { ...draft.weatherData },
            smokeTime: { ...draft.smokeTime },
            vehicleConfigs:
              draft.vehicleConfigs || get().originalVehicleConfigs,
            smokeLineLength: draft.smokeLineLength ?? 700,
            reserveCoefficient: draft.reserveCoefficient ?? 1.2,
            vehicleWeights: draft.vehicleWeights || {},
          });
        } else {
          const realToRaw = get().realToRaw;
          let defaultBattlefieldData = {
            firePoints: {
              rawCoords: null as L.LatLng | null,
              distance: "",
              direction: "Bắc",
              bufferColor: "none",
            },
            commandPost: {
              rawCoords: null as L.LatLng | null,
              distance: "",
              direction: "Bắc",
              bufferColor: "none",
            },
            reserveUnit: {
              rawCoords: null as L.LatLng | null,
              distance: "",
              direction: "Bắc",
              bufferColor: "none",
            },
          };
          if (currentRealCoords) {
            const raw_firePoints = realToRaw(
              currentRealCoords.x,
              currentRealCoords.y + 500,
            );
            const raw_commandPost = realToRaw(
              currentRealCoords.x - 500,
              currentRealCoords.y - 500,
            );
            const raw_reserveUnit = realToRaw(
              currentRealCoords.x + 500,
              currentRealCoords.y - 500,
            );
            defaultBattlefieldData = {
              firePoints: {
                rawCoords: raw_firePoints,
                distance: "500",
                direction: "Bắc",
                bufferColor: "none",
              },
              commandPost: {
                rawCoords: raw_commandPost,
                distance: "707",
                direction: "Tây Nam",
                bufferColor: "none",
              },
              reserveUnit: {
                rawCoords: raw_reserveUnit,
                distance: "707",
                direction: "Đông Nam",
                bufferColor: "none",
              },
            };
          }
          set({
            clickedRaw,
            currentRealCoords,
            selectedPointId: null,
            targetDefenseData: {
              targetType: "Trận địa hỏa lực",
              length: "500",
              width: "300",
              diameter: "500",
              area: "15",
              coverageMultiplier: "10",
            },
            smokeTime: {
              fromH: "06",
              fromM: "00",
              toH: "06",
              toM: "15",
              duration: "",
              customTemplate: "",
              mode: "range",
            },
            smokeMethodData: {
              lineType: "Thẳng",
              lineRole: "Chính",
              bufferColor: "none",
            },
            selectedVehicles: [],
            vehicleConfigs: get().originalVehicleConfigs || {},
            battlefieldScale: 1,
            weatherActive: true,
            weatherData: {
              combatTime: "01.05.26",
              windDirection: "Tây Bắc",
              windAngle: 315,
              secondaryWindDirection: "Tây",
              secondaryWindAngle: 270,
              beta: 0,
              alpha: 90,
              alphaDirection: "right" as const,
              speed: 5,
              rainfall: 5,
              tkkMin: 28,
              tkkMax: 35,
              tmdMin: 30,
              tmdMax: 37,
              humidity: 70,
            },
            smokeLineLength: 700,
            reserveCoefficient: 1.2,
            vehicleWeights: {},
            battlefieldData: defaultBattlefieldData,
          });
        }
      } else {
        if (get().clickedRaw === null) {
          const realToRaw = get().realToRaw;
          let defaultBattlefieldData = {
            firePoints: {
              rawCoords: null as L.LatLng | null,
              distance: "",
              direction: "Bắc",
              bufferColor: "none",
            },
            commandPost: {
              rawCoords: null as L.LatLng | null,
              distance: "",
              direction: "Bắc",
              bufferColor: "none",
            },
            reserveUnit: {
              rawCoords: null as L.LatLng | null,
              distance: "",
              direction: "Bắc",
              bufferColor: "none",
            },
          };
          if (currentRealCoords) {
            const raw_firePoints = realToRaw(
              currentRealCoords.x,
              currentRealCoords.y + 500,
            );
            const raw_commandPost = realToRaw(
              currentRealCoords.x - 500,
              currentRealCoords.y - 500,
            );
            const raw_reserveUnit = realToRaw(
              currentRealCoords.x + 500,
              currentRealCoords.y - 500,
            );
            defaultBattlefieldData = {
              firePoints: {
                rawCoords: raw_firePoints,
                distance: "500",
                direction: "Bắc",
                bufferColor: "none",
              },
              commandPost: {
                rawCoords: raw_commandPost,
                distance: "700",
                direction: "Tây Nam",
                bufferColor: "none",
              },
              reserveUnit: {
                rawCoords: raw_reserveUnit,
                distance: "700",
                direction: "Đông Nam",
                bufferColor: "none",
              },
            };
          }
          set({
            clickedRaw,
            currentRealCoords,
            battlefieldData: defaultBattlefieldData,
            targetDefenseData: {
              targetType: "Trận địa hỏa lực",
              length: "500",
              width: "300",
              diameter: "500",
              area: "15",
              coverageMultiplier: "10",
            },
            smokeTime: {
              fromH: "06",
              fromM: "00",
              toH: "06",
              toM: "15",
              duration: "",
              customTemplate: "",
              mode: "range",
            },
            smokeMethodData: {
              lineType: "Thẳng",
              lineRole: "Chính",
              bufferColor: "none",
            },
            selectedVehicles: [],
            vehicleConfigs: get().originalVehicleConfigs || {},
            battlefieldScale: 1,
            weatherActive: true,
            weatherData: {
              combatTime: "01.05.26",
              windDirection: "Tây Bắc",
              windAngle: 315,
              secondaryWindDirection: "Tây",
              secondaryWindAngle: 270,
              beta: 0,
              alpha: 90,
              alphaDirection: "right" as const,
              speed: 5,
              rainfall: 5,
              tkkMin: 28,
              tkkMax: 35,
              tmdMin: 30,
              tmdMax: 37,
              humidity: 70,
            },
            smokeLineLength: 700,
            reserveCoefficient: 1.2,
            vehicleWeights: {},
          });
        } else {
          const updatedBattlefieldData = recalculateBattlefieldData(
            get().battlefieldData,
            currentRealCoords,
            get().rawToReal,
          );
          set({
            clickedRaw,
            currentRealCoords,
            battlefieldData: updatedBattlefieldData,
          });
        }
      }
    }
  },
  setSearchX: (val) =>
    set((state) => ({
      searchX: typeof val === "function" ? val(state.searchX) : val,
    })),
  setSearchY: (val) =>
    set((state) => ({
      searchY: typeof val === "function" ? val(state.searchY) : val,
    })),
  setMapFlyCenter: (val) =>
    set((state) => ({
      mapFlyCenter: typeof val === "function" ? val(state.mapFlyCenter) : val,
    })),
  setIsSidebarOpen: (val) =>
    set((state) => ({
      isSidebarOpen: typeof val === "function" ? val(state.isSidebarOpen) : val,
    })),
  setIsRightSidebarOpen: (val) =>
    set((state) => ({
      isRightSidebarOpen:
        typeof val === "function" ? val(state.isRightSidebarOpen) : val,
    })),
  setTargetDefenseData: (val) =>
    set((state) => ({
      targetDefenseData:
        typeof val === "function" ? val(state.targetDefenseData) : val,
    })),
  setSmokeTime: (val) =>
    set((state) => ({
      smokeTime: typeof val === "function" ? val(state.smokeTime) : val,
    })),
  setSmokeMethodData: (val) =>
    set((state) => {
      const nextMethodData =
        typeof val === "function" ? val(state.smokeMethodData) : val;
      const prevLineType = state.smokeMethodData.lineType;
      const nextLineType = nextMethodData.lineType;

      let nextTargetData = { ...state.targetDefenseData };
      if (prevLineType !== nextLineType) {
        if (nextLineType === "Vòng") {
          const dVal = parseFloat(nextTargetData.diameter);
          nextTargetData.area = !isNaN(dVal)
            ? Number(
                ((Math.PI * Math.pow(dVal / 2, 2)) / 10000).toFixed(4),
              ).toString()
            : "";
        } else {
          // "Thẳng" hoặc "Diện"
          const lVal = parseFloat(nextTargetData.length);
          const wVal = parseFloat(nextTargetData.width);
          nextTargetData.area =
            !isNaN(lVal) && !isNaN(wVal)
              ? Number(((lVal * wVal) / 10000).toFixed(4)).toString()
              : "";
        }
      }

      return {
        smokeMethodData: nextMethodData,
        targetDefenseData: nextTargetData,
      };
    }),
  setSelectedVehicles: (val) =>
    set((state) => ({
      selectedVehicles:
        typeof val === "function" ? val(state.selectedVehicles) : val,
    })),
  setVehicleConfigs: (val) =>
    set((state) => ({
      vehicleConfigs:
        typeof val === "function" ? val(state.vehicleConfigs) : val,
    })),
  setBattlefieldData: (val) =>
    set((state) => ({
      battlefieldData:
        typeof val === "function" ? val(state.battlefieldData) : val,
    })),
  setBattlefieldScale: (val) =>
    set((state) => ({
      battlefieldScale:
        typeof val === "function" ? val(state.battlefieldScale) : val,
    })),
  setCommandPostLevel: (val) => set({ commandPostLevel: val }),
  setWeatherActive: (val) =>
    set((state) => ({
      weatherActive: typeof val === "function" ? val(state.weatherActive) : val,
    })),
  setWeatherData: (val) =>
    set((state) => ({
      weatherData: typeof val === "function" ? val(state.weatherData) : val,
    })),
  setSmokeLineLength: (val) =>
    set((state) => ({
      smokeLineLength:
        typeof val === "function" ? val(state.smokeLineLength) : val,
    })),
  setReserveCoefficient: (val) =>
    set((state) => ({
      reserveCoefficient:
        typeof val === "function" ? val(state.reserveCoefficient) : val,
    })),
  setVehicleWeights: (val) =>
    set((state) => ({
      vehicleWeights:
        typeof val === "function" ? val(state.vehicleWeights) : val,
    })),

  // Actions
  fetchMaps: async () => {
    try {
      const userId = sessionStorage.getItem("userId") || undefined;
      const data = await mapService.getAllMaps(userId);
      set({ maps: data });
    } catch (e) {
      console.error("Cannot fetch maps", e);
      get().toast?.error("Không thể kết nối máy chủ để tải thư viện bản đồ.");
    }
  },

  handleUploadFile: async (file) => {
    set({ isUploading: true, uploadProgress: 0 });
    try {
      const userId = sessionStorage.getItem("userId") || undefined;
      const newMap = await mapService.uploadMap(file, userId, (percent) => {
        set({ uploadProgress: percent });
      });
      get().setCurrentMap(newMap);
      get().fetchMaps();
    } catch (e) {
      get().toast?.error("Tải bản đồ lên thất bại!");
    }
    set({ isUploading: false, uploadProgress: 0 });
  },

  handleRenameMap: async (mapId, newName) => {
    try {
      await mapService.renameMap(mapId, newName);
      const currentMap = get().currentMap;
      if (currentMap?.id === mapId) {
        set({ currentMap: { ...currentMap, name: newName } });
      }
      get().fetchMaps();
    } catch (e) {
      get().toast?.error("Đổi tên bản đồ thất bại!");
    }
  },

  rawToReal: (rx, ry) => {
    const { isCalibrated, p1, scale } = get();
    return convertRawToReal(rx, ry, isCalibrated, p1, scale);
  },

  realToRaw: (realX, realY) => {
    const { isCalibrated, p1, scale } = get();
    return convertRealToRaw(realX, realY, isCalibrated, p1, scale);
  },

  handleSearch: () => {
    const { isCalibrated, searchX, searchY, currentMap, realToRaw, toast } =
      get();
    if (!isCalibrated)
      return toast?.error(
        "Bạn phải hiệu chuẩn bản đồ trước khi tìm tọa độ thật!",
      );
    const x = parseFloat(searchX);
    const y = parseFloat(searchY);
    if (!isNaN(x) && !isNaN(y)) {
      const rawTarget = realToRaw(x, y);
      if (rawTarget) {
        const mWidth = currentMap?.width || 0;
        const mHeight = currentMap?.height || 0;
        const maxScale = Math.pow(2, currentMap?.maxNativeZoom || 6);

        if (
          rawTarget.lng < 0 ||
          rawTarget.lng > mWidth / maxScale ||
          rawTarget.lat > 0 ||
          rawTarget.lat < -(mHeight / maxScale)
        ) {
          return toast?.error(
            `Tọa độ ${x}, ${y} nằm ngoài phạm vi giới hạn của bản đồ hiện tại!`,
          );
        }

        set({
          clickedRaw: rawTarget,
          currentRealCoords: { x, y },
          mapFlyCenter: rawTarget,
        });
      }
    }
  },

  calculateCalibration: async () => {
    const { currentMap, p1, p2, toast } = get();
    if (!currentMap) return toast?.error("Hãy chọn bản đồ trước!");
    if (!p1.rawX || !p1.rawY || !p2.rawX || !p2.rawY)
      return toast?.error("Cần chọn đủ 2 điểm trên bản đồ!");
    if (!p1.realX || !p1.realY || !p2.realX || !p2.realY)
      return toast?.error("Cần nhập tọa độ thực tế VN-2000 cho cả 2 điểm!");

    const rX1 = parseFloat(p1.realX);
    const rY1 = parseFloat(p1.realY);
    const rX2 = parseFloat(p2.realX);
    const rY2 = parseFloat(p2.realY);

    const sX = (rX2 - rX1) / (p2.rawX! - p1.rawX!);
    const sY = (rY2 - rY1) / (p2.rawY! - p1.rawY!);

    if (sX === 0 || sY === 0 || !isFinite(sX))
      return toast?.error("2 điểm không hợp lệ (không được trùng nhau)!");

    const calData = { p1, p2, scale: { x: sX, y: sY } };
    set({
      scale: { x: sX, y: sY },
      isCalibrated: true,
      clickedRaw: null,
      currentRealCoords: null,
      showCalibration: false,
    });

    try {
      await mapService.calibrateMap(currentMap.id, calData);
      set({ currentMap: { ...currentMap, calibration: calData } });
    } catch (e) {
      console.error("Lưu hiệu chuẩn thất bại");
    }
  },

  syncCalibration: () => {
    const currentMap = get().currentMap;
    if (currentMap && currentMap.calibration) {
      set({
        p1: currentMap.calibration.p1,
        p2: currentMap.calibration.p2,
        scale: currentMap.calibration.scale,
        isCalibrated: true,
      });
    } else {
      set({
        p1: { rawX: null, rawY: null, realX: "", realY: "" },
        p2: { rawX: null, rawY: null, realX: "", realY: "" },
        isCalibrated: false,
        scale: { x: 1, y: 1 },
      });
    }
    set({ clickedRaw: null, currentRealCoords: null });
  },

  onAddPoint: () => {
    const {
      isCalibrated,
      clickedRaw,
      targetDefenseData,
      smokeMethodData,
      selectedVehicles,
      battlefieldData,
      weatherData,
      smokeTime,
      vehicleConfigs,
      pointsList,
      rawToReal,
      editingPointId,
      drafts,
      toast,
    } = get();
    if (!isCalibrated) return toast?.error("Bạn cần hiệu chuẩn bản đồ trước!");

    if (
      !validateInputs(
        {
          targetDefenseData,
          smokeMethodData,
          selectedVehicles,
          battlefieldData,
          smokeTime,
          weatherData,
          smokeLineLength: get().smokeLineLength,
          reserveCoefficient: get().reserveCoefficient,
          vehicleConfigs,
          vehicleWeights: get().vehicleWeights,
          battlefieldScale: get().battlefieldScale,
          commandPostLevel: get().commandPostLevel,
        },
        toast,
      )
    ) {
      return;
    }

    const currentResults = performCalculation({
      targetDefenseData,
      smokeMethodData,
      selectedVehicles,
      battlefieldData,
      weatherData,
      smokeTime,
      vehicleConfigs,
      reserveCoefficient: get().reserveCoefficient,
      vehicleWeights: get().vehicleWeights,
    });

    let updatedDrafts = { ...drafts };

    if (editingPointId) {
      // Editing existing point
      const updatedPointsList = pointsList.map((p) => {
        if (p.id === editingPointId) {
          const newCoords = clickedRaw || p.coords;
          const newRealCoords = clickedRaw
            ? rawToReal(clickedRaw.lng, clickedRaw.lat)
            : p.realCoords;
          return {
            ...p,
            coords: newCoords,
            realCoords: newRealCoords,
            targetDefenseData: { ...targetDefenseData },
            smokeMethodData: { ...smokeMethodData },
            selectedVehicles: [...selectedVehicles],
            battlefieldData: { ...battlefieldData },
            weatherData: { ...weatherData },
            smokeTime: { ...smokeTime },
            vehicleConfigs: { ...vehicleConfigs },
            smokeLineLength: get().smokeLineLength,
            reserveCoefficient: get().reserveCoefficient,
            vehicleWeights: { ...get().vehicleWeights },
            results: currentResults,
          };
        }
        return p;
      });

      const aggregatedResults = aggregateResults(updatedPointsList);

      delete updatedDrafts[editingPointId];

      set({
        pointsList: updatedPointsList,
        results: aggregatedResults,
        clickedRaw: null,
        currentRealCoords: null,
        editingPointId: null,
        drafts: updatedDrafts,
      });

      const pointName =
        pointsList.find((p) => p.id === editingPointId)?.name || "";
      toast?.success(`Đã cập nhật thay đổi cho ${pointName}`);
    } else {
      // Creating new point
      if (!clickedRaw)
        return toast?.error("Vui lòng chọn một vị trí trên bản đồ!");

      const baseName = targetDefenseData.targetType || "Mục tiêu";
      const sameTypeCount = pointsList.filter(
        (p) => p.targetDefenseData?.targetType === baseName,
      ).length;

      const newPoint = {
        id: Math.random().toString(36).substring(2, 9),
        name: `${baseName} ${sameTypeCount + 1}`,
        coords: clickedRaw,
        realCoords: rawToReal(clickedRaw.lng, clickedRaw.lat),
        targetDefenseData: { ...targetDefenseData },
        smokeMethodData: { ...smokeMethodData },
        selectedVehicles: [...selectedVehicles],
        battlefieldData: { ...battlefieldData },
        weatherData: { ...weatherData },
        smokeTime: { ...smokeTime },
        vehicleConfigs: { ...vehicleConfigs },
        smokeLineLength: get().smokeLineLength,
        reserveCoefficient: get().reserveCoefficient,
        vehicleWeights: { ...get().vehicleWeights },
        results: currentResults,
      };

      const updatedPointsList = [...pointsList, newPoint];

      const aggregatedResults = aggregateResults(updatedPointsList);

      delete updatedDrafts["new"];

      set({
        pointsList: updatedPointsList,
        results: aggregatedResults,
        selectedPointId: newPoint.id,
        clickedRaw: null,
        currentRealCoords: null,
        drafts: updatedDrafts,
      });

      toast?.success(`Đã lưu mục tiêu mới: ${newPoint.name}`);
    }
  },

  onDeletePoint: (id) => {
    const updated = get().pointsList.filter((p) => p.id !== id);
    const updatedDrafts = { ...get().drafts };
    delete updatedDrafts[id];

    const isActive = id === get().selectedPointId || id === get().editingPointId;

    if (isActive) {
      // Reset to "new point" mode and clear battlefield markers in one single state update only if deleting the active point
      set({
        pointsList: updated,
        editingPointId: null,
        drafts: updatedDrafts,
        selectedPointId: null,
        clickedRaw: null,
        currentRealCoords: null,
        battlefieldData: {
          firePoints: {
            rawCoords: null,
            distance: "",
            direction: "Bắc",
            bufferColor: "none",
          },
          commandPost: {
            rawCoords: null,
            distance: "",
            direction: "Bắc",
            bufferColor: "none",
          },
          reserveUnit: {
            rawCoords: null,
            distance: "",
            direction: "Bắc",
            bufferColor: "none",
          },
        },
        targetDefenseData: {
          targetType: "Trận địa hỏa lực",
          length: "500",
          width: "300",
          diameter: "500",
          area: "15",
          coverageMultiplier: "10",
        },
        smokeTime: {
          fromH: "06",
          fromM: "00",
          toH: "06",
          toM: "15",
          duration: "",
          customTemplate: "",
          mode: "range",
        },
        smokeMethodData: {
          lineType: "Thẳng",
          lineRole: "Chính",
          bufferColor: "none",
        },
        selectedVehicles: [],
        vehicleConfigs: get().originalVehicleConfigs || {},
        vehicleWeights: {},
        results: updated.length === 0 ? null : aggregateResults(updated),
      });
    } else {
      // If deleting a non-active point, just update pointsList, drafts, and aggregate results, keeping active session untouched
      set({
        pointsList: updated,
        drafts: updatedDrafts,
        results: updated.length === 0 ? null : aggregateResults(updated),
      });
    }
  },

  onRenamePoint: (id, name) => {
    const updated = get().pointsList.map((p) =>
      p.id === id ? { ...p, name } : p,
    );
    set({ pointsList: updated });
  },

  updatePointLabelCoords: (id, coords) => {
    const updated = get().pointsList.map((p) =>
      p.id === id
        ? { ...p, labelCoords: { lat: coords.lat, lng: coords.lng } }
        : p,
    );
    set({ pointsList: updated });
  },

  onSelectPoint: (id) => {
    const { clickedRaw, editingPointId, drafts, pointsList } = get();

    const currentOwnerKey = editingPointId || (clickedRaw ? "new" : null);
    let updatedDrafts = { ...drafts };
    if (currentOwnerKey) {
      updatedDrafts[currentOwnerKey] = captureCurrentStateAsDraft(get());
    }

    const point = pointsList.find((p) => p.id === id);
    if (point) {
      set({
        selectedPointId: id,
        editingPointId: null,
        drafts: updatedDrafts,
        results: point.results,
        mapFlyCenter: point.coords,
        targetDefenseData: { ...point.targetDefenseData },
        smokeMethodData: { ...point.smokeMethodData },
        selectedVehicles: [...point.selectedVehicles],
        battlefieldData: { ...point.battlefieldData },
        weatherData: { ...point.weatherData },
        smokeTime: { ...point.smokeTime },
        vehicleConfigs: point.vehicleConfigs || get().originalVehicleConfigs,
        smokeLineLength: point.smokeLineLength ?? 700,
        reserveCoefficient: point.reserveCoefficient ?? 1.2,
        vehicleWeights: point.vehicleWeights || {},
        clickedRaw: null,
        currentRealCoords: null,
      });
    }
  },

  onStartEditPoint: (id) => {
    const { clickedRaw, editingPointId, drafts, pointsList } = get();

    if (editingPointId && editingPointId !== id) {
      const activeEditingPoint = pointsList.find(
        (p) => p.id === editingPointId,
      );
      const targetPointName =
        pointsList.find((p) => p.id === id)?.name || "mục tiêu khác";
      set({
        confirmModal: {
          isOpen: true,
          title: "XÁC NHẬN CHUYỂN MỤC TIÊU SỬA",
          message: `Bạn đang chỉnh sửa ${activeEditingPoint?.name || "mục tiêu khác"} và có thay đổi chưa lưu. Bạn có muốn lưu các thay đổi này trước khi chuyển sang sửa ${targetPointName} không?`,
          pendingAction: "edit_other",
          targetId: id,
        },
      });
      return;
    }

    const currentOwnerKey = editingPointId || (clickedRaw ? "new" : null);
    let updatedDrafts = { ...drafts };
    if (currentOwnerKey) {
      updatedDrafts[currentOwnerKey] = captureCurrentStateAsDraft(get());
    }

    const point = pointsList.find((p) => p.id === id);
    if (point) {
      const draft = updatedDrafts[id] || point;
      const rawCoords = draft.coords || draft.clickedRaw || null;
      set({
        selectedPointId: id,
        editingPointId: id,
        drafts: updatedDrafts,
        results: point.results,
        mapFlyCenter: point.coords,
        targetDefenseData: { ...draft.targetDefenseData },
        smokeMethodData: { ...draft.smokeMethodData },
        selectedVehicles: [...draft.selectedVehicles],
        battlefieldData: { ...draft.battlefieldData },
        weatherData: { ...draft.weatherData },
        smokeTime: { ...draft.smokeTime },
        vehicleConfigs: draft.vehicleConfigs || get().originalVehicleConfigs,
        smokeLineLength: draft.smokeLineLength ?? 700,
        reserveCoefficient: draft.reserveCoefficient ?? 1.2,
        vehicleWeights: draft.vehicleWeights || {},
        clickedRaw: rawCoords,
        currentRealCoords: rawCoords
          ? get().rawToReal(rawCoords.lng, rawCoords.lat)
          : null,
      });
    }
  },

  onCancelEditPoint: () => {
    const { editingPointId, pointsList, drafts } = get();
    if (!editingPointId) return;

    let updatedDrafts = { ...drafts };
    delete updatedDrafts[editingPointId];

    const point = pointsList.find((p) => p.id === editingPointId);
    if (point) {
      set({
        editingPointId: null,
        drafts: updatedDrafts,
        results: point.results,
        targetDefenseData: { ...point.targetDefenseData },
        smokeMethodData: { ...point.smokeMethodData },
        selectedVehicles: [...point.selectedVehicles],
        battlefieldData: { ...point.battlefieldData },
        weatherData: { ...point.weatherData },
        smokeTime: { ...point.smokeTime },
        vehicleConfigs: point.vehicleConfigs || get().originalVehicleConfigs,
        smokeLineLength: point.smokeLineLength ?? 700,
        reserveCoefficient: point.reserveCoefficient ?? 1.2,
        vehicleWeights: point.vehicleWeights || {},
        clickedRaw: null,
        currentRealCoords: null,
      });
    }
  },

  onSelectUnsavedPoint: () => {
    const { editingPointId, drafts, pointsList } = get();

    if (editingPointId) {
      const activeEditingPoint = pointsList.find(
        (p) => p.id === editingPointId,
      );
      set({
        confirmModal: {
          isOpen: true,
          title: "XÁC NHẬN QUAY LẠI MỤC TIÊU TẠM",
          message: `Bạn đang chỉnh sửa ${activeEditingPoint?.name || "mục tiêu khác"} và có thay đổi chưa lưu. Bạn có muốn lưu các thay đổi này trước khi quay lại Mục tiêu tạm không?`,
          pendingAction: "new_point",
        },
      });
      return;
    }

    let updatedDrafts = { ...drafts };

    const draft = updatedDrafts["new"];
    if (draft) {
      const rawCoords = draft.coords || null;
      set({
        selectedPointId: null,
        editingPointId: null,
        drafts: updatedDrafts,
        targetDefenseData: { ...draft.targetDefenseData },
        smokeMethodData: { ...draft.smokeMethodData },
        selectedVehicles: [...draft.selectedVehicles],
        battlefieldData: { ...draft.battlefieldData },
        weatherData: { ...draft.weatherData },
        smokeTime: { ...draft.smokeTime },
        vehicleConfigs: draft.vehicleConfigs || get().originalVehicleConfigs,
        smokeLineLength: draft.smokeLineLength ?? 700,
        reserveCoefficient: draft.reserveCoefficient ?? 1.2,
        vehicleWeights: draft.vehicleWeights || {},
        clickedRaw: rawCoords,
        currentRealCoords: rawCoords
          ? get().rawToReal(rawCoords.lng, rawCoords.lat)
          : null,
      });
    }
  },

  onClearUnsavedPoint: () => {
    const { drafts, pointsList } = get();
    let updatedDrafts = { ...drafts };
    delete updatedDrafts["new"];

    set({
      clickedRaw: null,
      currentRealCoords: null,
      drafts: updatedDrafts,
      selectedPointId: null,
      editingPointId: null,
      battlefieldData: {
        firePoints: {
          rawCoords: null,
          distance: "",
          direction: "Bắc",
          bufferColor: "none",
        },
        commandPost: {
          rawCoords: null,
          distance: "",
          direction: "Bắc",
          bufferColor: "none",
        },
        reserveUnit: {
          rawCoords: null,
          distance: "",
          direction: "Bắc",
          bufferColor: "none",
        },
      },
      targetDefenseData: {
        targetType: "Trận địa hỏa lực",
        length: "500",
        width: "300",
        diameter: "500",
        area: "15",
        coverageMultiplier: "10",
      },
      smokeTime: {
        fromH: "06",
        fromM: "00",
        toH: "06",
        toM: "15",
        duration: "",
        customTemplate: "",
        mode: "range",
      },
      smokeMethodData: {
        lineType: "Thẳng",
        lineRole: "Chính",
        bufferColor: "none",
      },
      selectedVehicles: [],
      vehicleConfigs: get().originalVehicleConfigs || {},
      vehicleWeights: {},
      results: pointsList.length === 0 ? null : aggregateResults(pointsList),
    });
  },

  closeConfirmModal: () => {
    set((state) => ({
      confirmModal: {
        ...state.confirmModal,
        isOpen: false,
        pendingAction: null,
      },
    }));
  },

  handleConfirmModalSave: () => {
    const { confirmModal, onAddPoint, onStartEditPoint, onSelectUnsavedPoint } =
      get();
    onAddPoint();

    const { pendingAction, targetId } = confirmModal;
    if (pendingAction === "edit_other" && targetId) {
      onStartEditPoint(targetId);
    } else if (pendingAction === "new_point") {
      onSelectUnsavedPoint();
    }

    set((state) => ({
      confirmModal: {
        ...state.confirmModal,
        isOpen: false,
        pendingAction: null,
      },
    }));
  },

  handleConfirmModalDiscard: () => {
    const {
      confirmModal,
      onCancelEditPoint,
      onStartEditPoint,
      onSelectUnsavedPoint,
    } = get();
    onCancelEditPoint();

    const { pendingAction, targetId } = confirmModal;
    if (pendingAction === "edit_other" && targetId) {
      onStartEditPoint(targetId);
    } else if (pendingAction === "new_point") {
      onSelectUnsavedPoint();
    }

    set((state) => ({
      confirmModal: {
        ...state.confirmModal,
        isOpen: false,
        pendingAction: null,
      },
    }));
  },

  onCalculate: () => {
    const {
      isCalibrated,
      clickedRaw,
      pointsList,
      targetDefenseData,
      smokeMethodData,
      selectedVehicles,
      battlefieldData,
      weatherData,
      smokeTime,
      vehicleConfigs,
      rawToReal,
      editingPointId,
      drafts,
      toast,
    } = get();
    let listToCalculate = [...pointsList];
    let updatedPointsList = [...pointsList];
    let newSelectedPointId = get().selectedPointId;
    let newEditingPointId = editingPointId;
    let updatedDrafts = { ...drafts };

    if (editingPointId || clickedRaw) {
      if (
        !validateInputs(
          {
            targetDefenseData,
            smokeMethodData,
            selectedVehicles,
            battlefieldData,
            smokeTime,
            weatherData,
            smokeLineLength: get().smokeLineLength,
            reserveCoefficient: get().reserveCoefficient,
            vehicleConfigs,
            vehicleWeights: get().vehicleWeights,
            battlefieldScale: get().battlefieldScale,
            commandPostLevel: get().commandPostLevel,
          },
          toast,
        )
      ) {
        return;
      }
    }

    const currentResults = performCalculation({
      targetDefenseData,
      smokeMethodData,
      selectedVehicles,
      battlefieldData,
      weatherData,
      smokeTime,
      vehicleConfigs,
      reserveCoefficient: get().reserveCoefficient,
      vehicleWeights: get().vehicleWeights,
    });

    if (editingPointId) {
      // Editing existing point - update its parameters and recalculate
      updatedPointsList = pointsList.map((p) => {
        if (p.id === editingPointId) {
          const newCoords = clickedRaw || p.coords;
          const newRealCoords = clickedRaw
            ? rawToReal(clickedRaw.lng, clickedRaw.lat)
            : p.realCoords;
          return {
            ...p,
            coords: newCoords,
            realCoords: newRealCoords,
            targetDefenseData: { ...targetDefenseData },
            smokeMethodData: { ...smokeMethodData },
            selectedVehicles: [...selectedVehicles],
            battlefieldData: { ...battlefieldData },
            weatherData: { ...weatherData },
            smokeTime: { ...smokeTime },
            vehicleConfigs: { ...vehicleConfigs },
            smokeLineLength: get().smokeLineLength,
            reserveCoefficient: get().reserveCoefficient,
            vehicleWeights: { ...get().vehicleWeights },
            results: currentResults,
          };
        }
        return p;
      });
      listToCalculate = updatedPointsList;
      delete updatedDrafts[editingPointId];
      newEditingPointId = null;
    } else if (clickedRaw) {
      // Creating new point
      if (!isCalibrated)
        return toast?.error("Bạn cần hiệu chuẩn bản đồ trước!");

      const baseName = targetDefenseData.targetType || "Mục tiêu";
      const sameTypeCount = pointsList.filter(
        (p) => p.targetDefenseData?.targetType === baseName,
      ).length;

      const newPoint = {
        id: Math.random().toString(36).substring(2, 9),
        name: `${baseName} ${sameTypeCount + 1}`,
        coords: clickedRaw,
        realCoords: rawToReal(clickedRaw.lng, clickedRaw.lat),
        targetDefenseData: { ...targetDefenseData },
        smokeMethodData: { ...smokeMethodData },
        selectedVehicles: [...selectedVehicles],
        battlefieldData: { ...battlefieldData },
        weatherData: { ...weatherData },
        smokeTime: { ...smokeTime },
        vehicleConfigs: { ...vehicleConfigs },
        smokeLineLength: get().smokeLineLength,
        reserveCoefficient: get().reserveCoefficient,
        vehicleWeights: { ...get().vehicleWeights },
        results: currentResults,
      };

      listToCalculate.push(newPoint);
      updatedPointsList.push(newPoint);
      newSelectedPointId = newPoint.id;
      delete updatedDrafts["new"];
    }

    if (listToCalculate.length === 0) {
      return toast?.error(
        "Vui lòng chọn vị trí trên bản đồ và cấu hình rồi bấm Lưu mục tiêu hoặc Tính toán!",
      );
    }

    const aggregatedResults = aggregateResults(listToCalculate);

    set({
      pointsList: updatedPointsList,
      results: aggregatedResults,
      selectedPointId: newSelectedPointId,
      editingPointId: newEditingPointId,
      drafts: updatedDrafts,
      clickedRaw: null,
      currentRealCoords: null,
    });
  },

  resetStore: () => {
    set({
      maps: [],
      currentMap: null,
      isUploading: false,
      uploadProgress: 0,
      clickedRaw: null,
      currentRealCoords: null,
      isCalibrated: false,
      showCalibration: true,
      showWeather: true,
      isSelectingFor: null,
      p1: { rawX: null, rawY: null, realX: "", realY: "" },
      p2: { rawX: null, rawY: null, realX: "", realY: "" },
      scale: { x: 1, y: 1 },
      searchX: "",
      searchY: "",
      pointsList: [],
      results: null,
      selectedPointId: null,
      editingPointId: null,
      drafts: {},
      targetDefenseData: {
        targetType: "Trận địa hỏa lực",
        length: "500",
        width: "300",
        diameter: "500",
        area: "15",
        coverageMultiplier: "10",
      },
      smokeTime: {
        fromH: "",
        fromM: "",
        toH: "",
        toM: "",
        duration: "",
        customTemplate: "",
        mode: "range",
      },
      smokeMethodData: { lineType: "Thẳng", lineRole: "Chính" },
      selectedVehicles: [],
      vehicleConfigs: {},
      originalVehicleConfigs: {},
      battlefieldData: {
        firePoints: {
          rawCoords: null,
          distance: "",
          direction: "Bắc",
          bufferColor: "none",
        },
        commandPost: {
          rawCoords: null,
          distance: "",
          direction: "Bắc",
          bufferColor: "none",
        },
        reserveUnit: {
          rawCoords: null,
          distance: "",
          direction: "Bắc",
          bufferColor: "none",
        },
      },
      weatherActive: true,
      weatherData: {
        combatTime: "01.05.26",
        windDirection: "Tây Bắc",
        windAngle: 315,
        secondaryWindDirection: "Tây",
        secondaryWindAngle: 270,
        beta: 0,
        alpha: 90,
        alphaDirection: "right" as const,
        speed: 5,
        rainfall: 5,
        tkkMin: 28,
        tkkMax: 35,
        tmdMin: 30,
        tmdMax: 37,
        humidity: 70,
      },
      smokeLineLength: 700,
      reserveCoefficient: 1.2,
      vehicleWeights: {},
    });
  },

  resetCurrentSession: () => {
    set({
      activeSessionId: null,
      clickedRaw: null,
      currentRealCoords: null,
      pointsList: [],
      results: null,
      selectedPointId: null,
      editingPointId: null,
      drafts: {},
      targetDefenseData: {
        targetType: "Trận địa hỏa lực",
        length: "500",
        width: "300",
        diameter: "500",
        area: "15",
        coverageMultiplier: "10",
      },
      smokeTime: {
        fromH: "06",
        fromM: "00",
        toH: "06",
        toM: "15",
        duration: "",
        customTemplate: "",
        mode: "range",
      },
      smokeMethodData: { lineType: "Thẳng", lineRole: "Chính" },
      selectedVehicles: [],
      vehicleConfigs: get().originalVehicleConfigs || {},
      battlefieldData: {
        firePoints: { rawCoords: null, distance: "", direction: "Bắc" },
        commandPost: { rawCoords: null, distance: "", direction: "Bắc" },
        reserveUnit: { rawCoords: null, distance: "", direction: "Bắc" },
      },
      battlefieldScale: 1,
      weatherActive: true,
      weatherData: {
        combatTime: "01.05.26",
        windDirection: "Tây Bắc",
        windAngle: 315,
        secondaryWindDirection: "Tây",
        secondaryWindAngle: 270,
        beta: 0,
        alpha: 90,
        alphaDirection: "right" as const,
        speed: 5,
        rainfall: 5,
        tkkMin: 28,
        tkkMax: 35,
        tmdMin: 30,
        tmdMax: 37,
        humidity: 70,
      },
      smokeLineLength: 700,
      reserveCoefficient: 1.2,
      vehicleWeights: {},
    });
  },

  // ── Session Actions ────────────────────────────────────────────────────

  fetchSessions: async (mapId: string) => {
    if (!mapId) {
      set({ sessions: [] });
      return;
    }
    set({ isSessionsLoading: true });
    try {
      const sessions = await simulationSessionService.getAll(mapId);
      set({ sessions });
    } catch (e) {
      console.error("Không thể tải danh sách phương án", e);
      get().toast?.error("Không thể tải danh sách phương án.");
    } finally {
      set({ isSessionsLoading: false });
    }
  },

  saveSession: async (name: string) => {
    const state = get();
    const snapshot = getSessionSnapshot(state);
    try {
      const newSession = await simulationSessionService.create(name, snapshot);
      set((s) => ({
        sessions: [newSession, ...s.sessions],
        activeSessionId: newSession.id,
      }));
      state.toast?.success(`Đã lưu phương án "${name}"`);
    } catch (e: any) {
      const msg = e?.response?.data?.message || "Lưu phương án thất bại!";
      get().toast?.error(msg);
    }
  },

  updateCurrentSession: async () => {
    const state = get();
    const { activeSessionId, sessions } = state;
    if (!activeSessionId) return;
    const snapshot = getSessionSnapshot(state);
    try {
      const updated = await simulationSessionService.update(activeSessionId, {
        data: snapshot,
      });
      set((s) => ({
        sessions: s.sessions.map((sess) =>
          sess.id === activeSessionId ? { ...sess, ...updated } : sess,
        ),
      }));
      const sessionName =
        sessions.find((s) => s.id === activeSessionId)?.name ?? "";
      state.toast?.success(`Đã cập nhật phương án "${sessionName}"`);
    } catch (e: any) {
      const msg = e?.response?.data?.message || "Cập nhật phương án thất bại!";
      get().toast?.error(msg);
    }
  },

  loadSession: async (id: string) => {
    const state = get();
    try {
      const session = await simulationSessionService.getById(id);
      const { data } = session;

      const unsavedDraft = data.drafts?.["new"];
      const hasUnsavedPoint = !!unsavedDraft || !!data.clickedRaw;

      const nextP1 = data.p1 ?? state.p1;
      const nextP2 = data.p2 ?? state.p2;
      const nextScale = data.scale ?? state.scale;
      const nextIsCalibrated = !!(
        nextP1?.rawX &&
        nextP1?.rawY &&
        nextP2?.rawX &&
        nextP2?.rawY
      );

      const rawCoords = unsavedDraft ? unsavedDraft.coords : data.clickedRaw;
      const clickedRawObj = rawCoords
        ? L.latLng(rawCoords.lat, rawCoords.lng)
        : null;

      const currentRealCoords = clickedRawObj
        ? convertRawToReal(
            clickedRawObj.lng,
            clickedRawObj.lat,
            nextIsCalibrated,
            nextP1,
            nextScale,
          )
        : null;

      const source = unsavedDraft || data;

      set({
        // Calibration
        p1: nextP1,
        p2: nextP2,
        scale: nextScale,
        isCalibrated: nextIsCalibrated,
        // Points
        pointsList: data.pointsList ?? [],
        clickedRaw: clickedRawObj,
        currentRealCoords,
        selectedPointId: null, // load mặc định vào cái tạo điểm mới luôn
        editingPointId: null,
        drafts: data.drafts ?? {},
        results: data.pointsList?.length
          ? aggregateResults(data.pointsList)
          : null,
        // Form data: load from data if hasUnsavedPoint, else reset to defaults
        targetDefenseData: {
          targetType: "Trận địa hỏa lực",
          length: "500",
          width: "300",
          diameter: "500",
          area: "15",
          coverageMultiplier: "10",
          ...(hasUnsavedPoint ? (source.targetDefenseData ?? {}) : {}),
        },
        smokeMethodData: {
          lineType: "Thẳng",
          lineRole: "Chính",
          bufferColor: "none",
          ...(hasUnsavedPoint ? (source.smokeMethodData ?? {}) : {}),
        },
        selectedVehicles: hasUnsavedPoint
          ? (source.selectedVehicles ?? [])
          : [],
        vehicleConfigs: {
          ...(state.originalVehicleConfigs || {}),
          ...(hasUnsavedPoint ? (source.vehicleConfigs ?? {}) : {}),
        },
        vehicleWeights: hasUnsavedPoint ? (source.vehicleWeights ?? {}) : {},
        battlefieldData: (() => {
          const defaults = {
            firePoints: {
              rawCoords: null,
              distance: "",
              direction: "Bắc",
              bufferColor: "none",
            },
            commandPost: {
              rawCoords: null,
              distance: "",
              direction: "Bắc",
              bufferColor: "none",
            },
            reserveUnit: {
              rawCoords: null,
              distance: "",
              direction: "Bắc",
              bufferColor: "none",
            },
          };
          if (hasUnsavedPoint) {
            const bd = source.battlefieldData ?? {};
            const rehydrate = (entry: any, defaultEntry: any) =>
              entry?.rawCoords
                ? {
                    ...defaultEntry,
                    ...entry,
                    rawCoords: L.latLng(
                      entry.rawCoords.lat,
                      entry.rawCoords.lng,
                    ),
                  }
                : (entry ?? defaultEntry);
            return {
              firePoints: rehydrate(bd.firePoints, defaults.firePoints),
              commandPost: rehydrate(bd.commandPost, defaults.commandPost),
              reserveUnit: rehydrate(bd.reserveUnit, defaults.reserveUnit),
            };
          } else {
            return defaults;
          }
        })(),
        battlefieldScale: data.battlefieldScale ?? 1,
        commandPostLevel: (data.commandPostLevel ?? "squad") as
          | "squad"
          | "platoon"
          | "company",
        weatherData: {
          combatTime: "01.05.26",
          windDirection: "Tây Bắc",
          windAngle: 315,
          secondaryWindDirection: "Tây",
          secondaryWindAngle: 270,
          beta: 0,
          alpha: 90,
          alphaDirection: "right" as const,
          speed: 5,
          rainfall: 5,
          tkkMin: 28,
          tkkMax: 35,
          tmdMin: 30,
          tmdMax: 37,
          humidity: 70,
          ...(hasUnsavedPoint ? (source.weatherData ?? {}) : {}),
        },
        weatherActive: true,
        smokeTime: {
          fromH: "06",
          fromM: "00",
          toH: "06",
          toM: "15",
          duration: "",
          customTemplate: "",
          mode: "range",
          ...(hasUnsavedPoint ? (source.smokeTime ?? {}) : {}),
        },
        smokeLineLength: hasUnsavedPoint
          ? (source.smokeLineLength ?? 700)
          : 700,
        reserveCoefficient: hasUnsavedPoint
          ? (source.reserveCoefficient ?? 1.2)
          : 1.2,
      });

      // Fetch bản đồ tương ứng nếu mapId có giá trị
      if (data.mapId) {
        const map = state.maps.find((m) => m.id === data.mapId);
        if (map) {
          set({ currentMap: map });
        } else {
          // Bản đồ không còn trong danh sách - hiển thị cảnh báo
          state.toast?.error(
            "Bản đồ gốc của phương án này đã bị xóa. Vui lòng chọn bản đồ khác.",
          );
          set({ currentMap: null });
        }
      }

      state.toast?.success(`Đã tải phương án "${session.name}"`);
      set({ activeSessionId: id });
    } catch (e) {
      console.error("Không thể tải phương án", e);
      get().toast?.error("Không thể tải phương án.");
    }
  },

  renameSession: async (id: string, name: string) => {
    try {
      const updated = await simulationSessionService.update(id, { name });
      set((s) => ({
        sessions: s.sessions.map((sess) =>
          sess.id === id ? { ...sess, ...updated } : sess,
        ),
      }));
      get().toast?.success(`Đã đổi tên thành "${name}"`);
    } catch (e) {
      get().toast?.error("Đổi tên phương án thất bại!");
    }
  },

  deleteSession: async (id: string) => {
    try {
      await simulationSessionService.delete(id);
      set((s) => ({
        sessions: s.sessions.filter((sess) => sess.id !== id),
      }));
      get().toast?.success("Đã xóa phương án.");
    } catch (e) {
      get().toast?.error("Xóa phương án thất bại!");
    }
  },
}));
