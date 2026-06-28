import { api } from "./api";
import { API_ROUTES } from "../const/apiConfig";
import type {
  SimulationSession,
  SimulationSessionData,
  SimulationSessionMeta,
} from "../types/simulationSession";

const BASE = API_ROUTES.SIMULATION_SESSIONS;

export const simulationSessionService = {
  /**
   * Lấy danh sách metadata phương án (không bao gồm data).
   */
  getAll: (mapId: string): Promise<SimulationSessionMeta[]> =>
    api.get(BASE, { params: { mapId } }).then((r) => r.data),

  /**
   * Lấy chi tiết 1 phương án (bao gồm data) để tải vào store.
   */
  getById: (id: string): Promise<SimulationSession> =>
    api.get(`${BASE}/${id}`).then((r) => r.data),

  /**
   * Tạo phương án mới.
   */
  create: (
    name: string,
    data: SimulationSessionData,
  ): Promise<SimulationSessionMeta> =>
    api.post(BASE, { name, mapId: data.mapId, data }).then((r) => r.data),

  /**
   * Cập nhật tên hoặc dữ liệu phương án.
   */
  update: (
    id: string,
    payload: { name?: string; data?: SimulationSessionData },
  ): Promise<SimulationSessionMeta> =>
    api.put(`${BASE}/${id}`, payload).then((r) => r.data),

  /**
   * Xóa phương án.
   */
  delete: (id: string): Promise<void> =>
    api.delete(`${BASE}/${id}`).then((r) => r.data),
};
