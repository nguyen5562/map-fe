import { create } from "zustand";
import { mapService } from "../services/map.service";
import { performCalculation, aggregateResults } from "../utils/simulationMath";
import { validateInputs } from "../utils/simulationValidation";
import type { SimulationStoreState } from "../types/simulation";
import { convertRawToReal, convertRealToRaw } from "../utils/calibrationMath";

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
    length: "",
    width: "",
    diameter: "",
    area: "",
    coverageMultiplier: "1",
  },
  smokeTime: { fromH: "", fromM: "", toH: "", toM: "" },
  smokeMethodData: { lineType: "Thẳng" },
  selectedVehicles: [],
  vehicleConfigs: {},
  originalVehicleConfigs: {},
  battlefieldData: {
    firePoints: { distance: "100", direction: "Bắc" },
    commandPost: { distance: "300", direction: "Bắc" },
    reserveUnit: { distance: "200", direction: "Bắc" },
  },
  weatherActive: false,
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

  // Setters
  setCurrentMap: (val) =>
    set((state) => ({
      currentMap: typeof val === "function" ? val(state.currentMap) : val,
    })),
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
      set({ clickedRaw, currentRealCoords });
    } else {
      if (selectedPointId !== null) {
        const draft = drafts["new"];
        if (draft) {
          set({
            clickedRaw: clickedRaw || draft.coords,
            currentRealCoords: clickedRaw ? get().rawToReal(clickedRaw.lng, clickedRaw.lat) : (draft.coords ? get().rawToReal(draft.coords.lng, draft.coords.lat) : null),
            selectedPointId: null,
            targetDefenseData: { ...draft.targetDefenseData },
            smokeMethodData: { ...draft.smokeMethodData },
            selectedVehicles: [...draft.selectedVehicles],
            battlefieldData: { ...draft.battlefieldData },
            weatherData: { ...draft.weatherData },
            smokeTime: { ...draft.smokeTime },
            vehicleConfigs: draft.vehicleConfigs || get().originalVehicleConfigs,
            smokeLineLength: draft.smokeLineLength ?? 700,
            reserveCoefficient: draft.reserveCoefficient ?? 1.2,
          });
        } else {
          set({
            clickedRaw,
            currentRealCoords,
            selectedPointId: null,
          });
        }
      } else {
        set({ clickedRaw, currentRealCoords });
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
    set((state) => ({
      smokeMethodData:
        typeof val === "function" ? val(state.smokeMethodData) : val,
    })),
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
      smokeLineLength: typeof val === "function" ? val(state.smokeLineLength) : val,
    })),
  setReserveCoefficient: (val) =>
    set((state) => ({
      reserveCoefficient: typeof val === "function" ? val(state.reserveCoefficient) : val,
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
      set({ currentMap: newMap });
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

    if (!validateInputs({
      targetDefenseData,
      smokeMethodData,
      selectedVehicles,
      battlefieldData,
      smokeTime,
      weatherData,
    }, toast)) {
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

      const pointName = pointsList.find((p) => p.id === editingPointId)?.name || "";
      toast?.success(`Đã cập nhật thay đổi cho ${pointName}`);
    } else {
      // Creating new point
      if (!clickedRaw)
        return toast?.error("Vui lòng chọn một vị trí trên bản đồ!");

      const newPoint = {
        id: Math.random().toString(36).substring(2, 9),
        name: `Điểm ${pointsList.length + 1}`,
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

      toast?.success(`Đã lưu mục tiêu mới: Điểm ${updatedPointsList.length}`);
    }
  },

  onDeletePoint: (id) => {
    const updated = get().pointsList.filter((p) => p.id !== id);
    let nextEditingPointId = get().editingPointId;
    if (id === nextEditingPointId) {
      nextEditingPointId = null;
    }
    const updatedDrafts = { ...get().drafts };
    delete updatedDrafts[id];

    set({ pointsList: updated, editingPointId: nextEditingPointId, drafts: updatedDrafts });

    if (updated.length === 0) {
      set({ results: null, selectedPointId: null, editingPointId: null });
    } else {
      const lastPoint = updated[updated.length - 1];
      set({ results: lastPoint.results, selectedPointId: lastPoint.id });
    }
  },

  onRenamePoint: (id, name) => {
    const updated = get().pointsList.map((p) =>
      p.id === id ? { ...p, name } : p,
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
        clickedRaw: null,
        currentRealCoords: null,
      });
    }
  },

  onStartEditPoint: (id) => {
    const { clickedRaw, editingPointId, drafts, pointsList } = get();
    
    if (editingPointId && editingPointId !== id) {
      const activeEditingPoint = pointsList.find((p) => p.id === editingPointId);
      const targetPointName = pointsList.find((p) => p.id === id)?.name || "mục tiêu khác";
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
        clickedRaw: rawCoords,
        currentRealCoords: rawCoords ? get().rawToReal(rawCoords.lng, rawCoords.lat) : null,
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
        clickedRaw: null,
        currentRealCoords: null,
      });
    }
  },

  onSelectUnsavedPoint: () => {
    const { editingPointId, drafts, pointsList } = get();
    
    if (editingPointId) {
      const activeEditingPoint = pointsList.find((p) => p.id === editingPointId);
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
        clickedRaw: rawCoords,
        currentRealCoords: rawCoords ? get().rawToReal(rawCoords.lng, rawCoords.lat) : null,
      });
    }
  },

  onClearUnsavedPoint: () => {
    const { drafts } = get();
    let updatedDrafts = { ...drafts };
    delete updatedDrafts["new"];

    set({
      clickedRaw: null,
      currentRealCoords: null,
      drafts: updatedDrafts,
    });
  },

  closeConfirmModal: () => {
    set((state) => ({
      confirmModal: { ...state.confirmModal, isOpen: false, pendingAction: null },
    }));
  },

  handleConfirmModalSave: () => {
    const { confirmModal, onAddPoint, onStartEditPoint, onSelectUnsavedPoint } = get();
    onAddPoint();

    const { pendingAction, targetId } = confirmModal;
    if (pendingAction === "edit_other" && targetId) {
      onStartEditPoint(targetId);
    } else if (pendingAction === "new_point") {
      onSelectUnsavedPoint();
    }

    set((state) => ({
      confirmModal: { ...state.confirmModal, isOpen: false, pendingAction: null },
    }));
  },

  handleConfirmModalDiscard: () => {
    const { confirmModal, onCancelEditPoint, onStartEditPoint, onSelectUnsavedPoint } = get();
    onCancelEditPoint();

    const { pendingAction, targetId } = confirmModal;
    if (pendingAction === "edit_other" && targetId) {
      onStartEditPoint(targetId);
    } else if (pendingAction === "new_point") {
      onSelectUnsavedPoint();
    }

    set((state) => ({
      confirmModal: { ...state.confirmModal, isOpen: false, pendingAction: null },
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
      if (!validateInputs({
        targetDefenseData,
        smokeMethodData,
        selectedVehicles,
        battlefieldData,
        smokeTime,
        weatherData,
      }, toast)) {
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
      if (!isCalibrated) return toast?.error("Bạn cần hiệu chuẩn bản đồ trước!");

      const newPoint = {
        id: Math.random().toString(36).substring(2, 9),
        name: `Điểm ${pointsList.length + 1}`,
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
}));
