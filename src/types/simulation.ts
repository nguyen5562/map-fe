import L from "leaflet";
import type { VehicleConfig } from "../components/left-sidebar/SmokeVehiclePanel";
import type { SmokeTimeRange } from "../components/left-sidebar/SmokeTimePanel";
import type { BattlefieldData } from "../components/left-sidebar/BattlefieldPanel";
import type {
  CalibrationPoint,
  TargetDefenseData,
  SmokeMethodData,
  WeatherData,
} from "../context/SimulationContext";

export interface SimulationStoreState {
  // Toast reference
  toast: any | null;
  initToast: (toast: any) => void;

  // States
  maps: any[];
  currentMap: any | null;
  isUploading: boolean;
  uploadProgress: number;

  clickedRaw: L.LatLng | null;
  currentRealCoords: { x: number; y: number } | null;
  isCalibrated: boolean;
  showCalibration: boolean;
  showWeather: boolean;
  isSelectingFor: "p1" | "p2" | null;

  p1: CalibrationPoint;
  p2: CalibrationPoint;
  scale: { x: number; y: number };

  searchX: string;
  searchY: string;
  isSidebarOpen: boolean;
  isRightSidebarOpen: boolean;

  pointsList: any[];
  results: any | null;
  selectedPointId: string | null;
  editingPointId: string | null;
  drafts: Record<string, any>;
  confirmModal: {
    isOpen: boolean;
    title: string;
    message: string;
    pendingAction: "edit_other" | "new_point" | null;
    targetId?: string;
    targetCoords?: L.LatLng | null;
  };
  mapFlyCenter: L.LatLng | null;

  targetDefenseData: TargetDefenseData;
  smokeTime: SmokeTimeRange;
  smokeMethodData: SmokeMethodData;
  selectedVehicles: string[];
  vehicleConfigs: Record<string, VehicleConfig>;
  originalVehicleConfigs: Record<string, VehicleConfig>;
  battlefieldData: BattlefieldData;
  weatherActive: boolean;
  weatherData: WeatherData;
  smokeLineLength: number;
  reserveCoefficient: number;

  // Setters (with functional updates support)
  setCurrentMap: (val: any | null | ((prev: any | null) => any | null)) => void;
  setIsCalibrated: (val: boolean | ((prev: boolean) => boolean)) => void;
  setShowCalibration: (val: boolean | ((prev: boolean) => boolean)) => void;
  setShowWeather: (val: boolean | ((prev: boolean) => boolean)) => void;
  setIsSelectingFor: (
    val:
      | "p1"
      | "p2"
      | null
      | ((prev: "p1" | "p2" | null) => "p1" | "p2" | null),
  ) => void;
  setP1: (
    val: CalibrationPoint | ((prev: CalibrationPoint) => CalibrationPoint),
  ) => void;
  setP2: (
    val: CalibrationPoint | ((prev: CalibrationPoint) => CalibrationPoint),
  ) => void;
  setScale: (
    val:
      | { x: number; y: number }
      | ((prev: { x: number; y: number }) => { x: number; y: number }),
  ) => void;
  setClickedRaw: (
    val: L.LatLng | null | ((prev: L.LatLng | null) => L.LatLng | null),
  ) => void;
  setSearchX: (val: string | ((prev: string) => string)) => void;
  setSearchY: (val: string | ((prev: string) => string)) => void;
  setMapFlyCenter: (
    val: L.LatLng | null | ((prev: L.LatLng | null) => L.LatLng | null),
  ) => void;
  setIsSidebarOpen: (val: boolean | ((prev: boolean) => boolean)) => void;
  setIsRightSidebarOpen: (val: boolean | ((prev: boolean) => boolean)) => void;
  setTargetDefenseData: (
    val: TargetDefenseData | ((prev: TargetDefenseData) => TargetDefenseData),
  ) => void;
  setSmokeTime: (
    val: SmokeTimeRange | ((prev: SmokeTimeRange) => SmokeTimeRange),
  ) => void;
  setSmokeMethodData: (
    val: SmokeMethodData | ((prev: SmokeMethodData) => SmokeMethodData),
  ) => void;
  setSelectedVehicles: (val: string[] | ((prev: string[]) => string[])) => void;
  setVehicleConfigs: (
    val:
      | Record<string, VehicleConfig>
      | ((
          prev: Record<string, VehicleConfig>,
        ) => Record<string, VehicleConfig>),
  ) => void;
  setBattlefieldData: (
    val: BattlefieldData | ((prev: BattlefieldData) => BattlefieldData),
  ) => void;
  setWeatherActive: (val: boolean | ((prev: boolean) => boolean)) => void;
  setWeatherData: (
    val: WeatherData | ((prev: WeatherData) => WeatherData),
  ) => void;
  setSmokeLineLength: (val: number | ((prev: number) => number)) => void;
  setReserveCoefficient: (val: number | ((prev: number) => number)) => void;

  // Actions
  fetchMaps: () => Promise<void>;
  handleUploadFile: (file: File) => Promise<void>;
  handleRenameMap: (mapId: string, newName: string) => Promise<void>;
  calculateCalibration: () => Promise<void>;
  handleSearch: () => void;
  onAddPoint: () => void;
  onDeletePoint: (id: string) => void;
  onRenamePoint: (id: string, name: string) => void;
  onSelectPoint: (id: string) => void;
  onStartEditPoint: (id: string) => void;
  onCancelEditPoint: () => void;
  onSelectUnsavedPoint: () => void;
  onClearUnsavedPoint: () => void;
  onCalculate: () => void;
  closeConfirmModal: () => void;
  handleConfirmModalSave: () => void;
  handleConfirmModalDiscard: () => void;
  rawToReal: (rx: number, ry: number) => { x: number; y: number };
  realToRaw: (realX: number, realY: number) => L.LatLng | null;
  syncCalibration: () => void;
}
