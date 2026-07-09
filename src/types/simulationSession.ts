import type L from "leaflet";
import type { VehicleConfig } from "../components/left-sidebar/SmokeVehiclePanel";
import type { SmokeTimeRange } from "../components/left-sidebar/SmokeTimePanel";
import type { BattlefieldData } from "../components/left-sidebar/BattlefieldPanel";
import type {
  CalibrationPoint,
  TargetDefenseData,
  SmokeMethodData,
  WeatherData,
} from "../context/SimulationContext";

/**
 * Dữ liệu nghiệp vụ được lưu vào DB.
 * Chỉ chứa business data — KHÔNG bao gồm UI state (isSidebarOpen, isSelectingFor...).
 */
export interface SimulationSessionData {
  mapId: string | null;
  p1: CalibrationPoint;
  p2: CalibrationPoint;
  scale: { x: number; y: number };
  pointsList: any[];
  clickedRaw: { lng: number; lat: number } | null;
  currentRealCoords: { x: number; y: number } | null;
  targetDefenseData: TargetDefenseData;
  smokeMethodData: SmokeMethodData;
  selectedVehicles: string[];
  vehicleConfigs: Record<string, VehicleConfig>;
  vehicleWeights: Record<string, number | "">;
  battlefieldData: BattlefieldData;
  battlefieldScale?: number;
  commandPostLevel?: "squad" | "platoon" | "company";
  weatherData: WeatherData;
  weatherActive: boolean;
  smokeTime: SmokeTimeRange;
  smokeLineLength: number | "";
  smokeLineDiameter?: number | "";
  smokeLineWidth?: number | "";
  reserveCoefficient: number | "";
  drafts: Record<string, any>;
}

/**
 * Metadata hiển thị trong danh sách phương án (không bao gồm data).
 * Dùng cho GET /simulation-session (list).
 */
export interface SimulationSessionMeta {
  id: string;
  name: string;
  mapId: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Full record (bao gồm data).
 * Dùng cho GET /simulation-session/:id (load về store).
 */
export interface SimulationSession extends SimulationSessionMeta {
  data: SimulationSessionData;
}

/**
 * Lấy snapshot business data từ store state để lưu vào DB.
 * Tách biệt hoàn toàn với UI state.
 */
export const getSessionSnapshot = (state: {
  currentMap: any;
  p1: CalibrationPoint;
  p2: CalibrationPoint;
  scale: { x: number; y: number };
  pointsList: any[];
  clickedRaw: L.LatLng | null;
  currentRealCoords: { x: number; y: number } | null;
  targetDefenseData: TargetDefenseData;
  smokeMethodData: SmokeMethodData;
  selectedVehicles: string[];
  vehicleConfigs: Record<string, VehicleConfig>;
  vehicleWeights: Record<string, number | "">;
  battlefieldData: BattlefieldData;
  battlefieldScale: number;
  commandPostLevel: "squad" | "platoon" | "company";
  weatherData: WeatherData;
  weatherActive: boolean;
  smokeTime: SmokeTimeRange;
  smokeLineLength: number | "";
  smokeLineDiameter: number | "";
  smokeLineWidth: number | "";
  reserveCoefficient: number | "";
  drafts: Record<string, any>;
}): SimulationSessionData => ({
  mapId: state.currentMap?.id ?? null,
  p1: state.p1,
  p2: state.p2,
  scale: state.scale,
  pointsList: state.pointsList,
  clickedRaw: state.clickedRaw
    ? { lng: state.clickedRaw.lng, lat: state.clickedRaw.lat }
    : null,
  currentRealCoords: state.currentRealCoords,
  targetDefenseData: { ...state.targetDefenseData },
  smokeMethodData: { ...state.smokeMethodData },
  selectedVehicles: [...state.selectedVehicles],
  vehicleConfigs: { ...state.vehicleConfigs },
  vehicleWeights: { ...state.vehicleWeights },
  battlefieldData: { ...state.battlefieldData },
  battlefieldScale: state.battlefieldScale,
  commandPostLevel: state.commandPostLevel,
  weatherData: { ...state.weatherData },
  weatherActive: state.weatherActive,
  smokeTime: { ...state.smokeTime },
  smokeLineLength: state.smokeLineLength,
  smokeLineDiameter: state.smokeLineDiameter,
  smokeLineWidth: state.smokeLineWidth,
  reserveCoefficient: state.reserveCoefficient,
  drafts: { ...state.drafts },
});
