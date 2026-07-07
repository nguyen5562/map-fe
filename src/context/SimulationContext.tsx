import React, { useEffect } from "react";
import { useSimulationStore } from "../store/useSimulationStore";
import { useToast } from "./ToastContext";
import { mapService } from "../services/map.service";
import { vehicleService } from "../services/vehicle.service";
import type { VehicleConfig } from "../components/left-sidebar/SmokeVehiclePanel";

// ─── Interfaces ───────────────────────────────────────────────────────────────
export interface CalibrationPoint {
  rawX: number | null;
  rawY: number | null;
  realX: string;
  realY: string;
}

export interface TargetDefenseData {
  targetType: string;
  length: string;
  width: string;
  diameter: string;
  area: string;
  coverageMultiplier: string;
}

export interface SmokeMethodData {
  lineType: "Thẳng" | "Vòng" | "Diện";
  lineRole?: "Chính" | "Dự bị";
  bufferColor?: string;
}

export interface WeatherData {
  combatTime: string;
  windDirection: string;
  windAngle: number;
  secondaryWindDirection: string | null;
  secondaryWindAngle: number | null;
  beta: number | "";
  alpha: number | "";
  alphaDirection: "left" | "right";
  speed: number | "";
  rainfall: number | string;
  tkkMin: number | "";
  tkkMax: number | "";
  tmdMin: number | "";
  tmdMax: number | "";
  humidity: number | string;
}

// Export hook directly referencing Zustand store for 100% compatibility
export const useSimulation = useSimulationStore;

export function SimulationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const toast = useToast();
  const initToast = useSimulationStore((state) => state.initToast);
  const fetchMaps = useSimulationStore((state) => state.fetchMaps);
  const currentMap = useSimulationStore((state) => state.currentMap);
  const syncCalibration = useSimulationStore((state) => state.syncCalibration);

  // Initialize toast reference in the store
  useEffect(() => {
    initToast(toast);
  }, [toast, initToast]);

  // Fetch maps on mount
  useEffect(() => {
    fetchMaps();
  }, [fetchMaps]);

  // Sync calibration when map changes
  useEffect(() => {
    syncCalibration();
  }, [currentMap?.id, syncCalibration]);

  // Handle map processing update polling
  useEffect(() => {
    let interval: any;
    const activeStatuses = ["processing", "resizing", "tiling"];
    if (currentMap && activeStatuses.includes(currentMap.status)) {
      interval = setInterval(async () => {
        try {
          const updated = await mapService.getMapById(currentMap.id);
          if (updated.status === "ready") {
            useSimulationStore.setState({ currentMap: updated });
            fetchMaps();
            clearInterval(interval);
          } else if (updated.status === "error") {
            useSimulationStore.setState({ currentMap: updated });
            toast.error("Xử lý bản đồ thất bại!");
            clearInterval(interval);
          } else {
            useSimulationStore.setState({ currentMap: updated });
          }
        } catch (e) {}
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentMap?.status, currentMap?.id, fetchMaps, toast]);

  // Get default vehicle configs from backend
  useEffect(() => {
    vehicleService
      .getVehicles()
      .then((data: any[]) => {
        if (data && data.length > 0) {
          const configMap: Record<string, VehicleConfig> = {};
          data.forEach((v) => {
            configMap[v.id] = {
              id: v.id,
              name: v.name,
              desc: v.desc || "",
              l: Number(v.l),
              r: Number(v.r),
              t: Number(v.t),
              materials: v.materials || "",
              unit: v.unit || "cái",
            };
          });
          useSimulationStore.setState({
            vehicleConfigs: configMap,
            originalVehicleConfigs: JSON.parse(JSON.stringify(configMap)),
          });
        }
      })
      .catch((err) => console.error("Lỗi lấy cấu hình khí tài:", err));
  }, []);

  return <>{children}</>;
}
