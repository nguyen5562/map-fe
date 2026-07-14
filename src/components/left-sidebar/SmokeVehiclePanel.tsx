import { useState } from "react";
import {
  Truck,
  RotateCcw,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export type VehicleConfig = {
  id: string;
  name: string;
  desc: string;
  l: number | ""; // smoke length
  r: number | ""; // smoke width
  t: number | ""; // smoke release time
  materials: string; // spec sheet consumables
  unit: string; // unit of consumption
  isCar?: boolean;
};

const PREFERRED_ORDER = ["HPK-2.5", "TPK", "KH-1", "TDA-M", "KHOI_UNG_DUNG"];

import { useSimulation } from "../../context/SimulationContext";

export const SmokeVehiclePanel = () => {
  const isCalibrated = useSimulation((s) => s.isCalibrated);
  const selectedVehicles = useSimulation((s) => s.selectedVehicles);
  const setSelectedVehicles = useSimulation((s) => s.setSelectedVehicles);
  const vehicleConfigs = useSimulation((s) => s.vehicleConfigs);
  const originalVehicleConfigs = useSimulation((s) => s.originalVehicleConfigs);
  const setVehicleConfigs = useSimulation((s) => s.setVehicleConfigs);
  const reserveCoefficient = useSimulation((s) => s.reserveCoefficient);
  const setReserveCoefficient = useSimulation((s) => s.setReserveCoefficient);
  const vehicleWeights = useSimulation((s) => s.vehicleWeights);
  const setVehicleWeights = useSimulation((s) => s.setVehicleWeights);
  const [showPanel, setShowPanel] = useState(true);

  const sortedVehicles = Object.values(vehicleConfigs).sort((a, b) => {
    const indexA = PREFERRED_ORDER.indexOf(a.id);
    const indexB = PREFERRED_ORDER.indexOf(b.id);
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return a.id.localeCompare(b.id);
  });

  const toggleVehicle = (id: string) => {
    if (selectedVehicles.includes(id)) {
      setSelectedVehicles(selectedVehicles.filter((x) => x !== id));
      setVehicleWeights((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } else {
      setSelectedVehicles([...selectedVehicles, id]);
      setVehicleWeights((prev) => ({
        ...prev,
        [id]: "",
      }));
    }
  };

  const handleConfigChange = (
    vehicleId: string,
    field: keyof VehicleConfig,
    val: any,
  ) => {
    setVehicleConfigs((prev) => ({
      ...prev,
      [vehicleId]: {
        ...prev[vehicleId],
        [field]: val,
      },
    }));
  };

  const handleReset = (vehicleId: string) => {
    const defaultConfig = originalVehicleConfigs[vehicleId];
    if (!defaultConfig) return;
    setVehicleConfigs((prev) => ({
      ...prev,
      [vehicleId]: {
        ...defaultConfig,
      },
    }));
  };

  return (
    <div
      className={`rounded-xl border bg-white border-slate-200 shadow-sm overflow-hidden transition-opacity ${
        !isCalibrated ? "opacity-30 pointer-events-none" : ""
      }`}
    >
      <button
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors"
        onClick={() => setShowPanel(!showPanel)}
      >
        <div className="flex items-center gap-2">
          <Truck size={18} className="text-orange-600" />
          <h2 className="text-sm font-bold tracking-wide uppercase text-slate-700">
            7. Phương tiện thả khói
          </h2>
        </div>
        {showPanel ? (
          <ChevronUp size={14} className="text-slate-400" />
        ) : (
          <ChevronDown size={14} className="text-slate-400" />
        )}
      </button>

      {showPanel && (
        <div className="px-4 pb-4 pt-2 mt-0 space-y-3">
          <div className="flex flex-wrap gap-2">
            {sortedVehicles.map((v) => {
              const isSelected = selectedVehicles.includes(v.id);
              return (
                <button
                  key={v.id}
                  onClick={() => toggleVehicle(v.id)}
                  title={v.desc}
                  className={`px-3 h-9 rounded-lg text-sm font-bold border transition-all duration-200 active:scale-[0.98] ${
                    isSelected
                      ? "bg-orange-600 text-white border-orange-600 shadow-md shadow-orange-200/50"
                      : "bg-white text-slate-600 border-slate-300 hover:border-orange-400 hover:text-orange-600"
                  }`}
                >
                  {v.name}
                </button>
              );
            })}
          </div>

          {selectedVehicles.map((vehicleId) => {
            const config = vehicleConfigs[vehicleId];
            const defaultConfig = originalVehicleConfigs[vehicleId];
            if (!config || !defaultConfig) return null;

            const isCustomized =
              config.l !== defaultConfig.l ||
              config.r !== defaultConfig.r ||
              config.t !== defaultConfig.t;

            return (
              <div
                key={vehicleId}
                className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-3"
              >
                <div className="flex flex-col gap-1 border-b border-slate-200/80 pb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                      Thông số màn khói: {config.name}
                    </span>
                    {isCustomized && (
                      <button
                        onClick={() => handleReset(vehicleId)}
                        className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-all active:scale-95"
                      >
                        <RotateCcw size={10} />
                        Đặt lại
                      </button>
                    )}
                  </div>
                  {isCustomized && (
                    <div className="flex">
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-0.5 animate-pulse">
                        <AlertTriangle size={10} className="shrink-0" />
                        Đã chỉnh sửa
                      </span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block">
                      Chiều dài (l)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={config.l}
                        onChange={(e) => {
                          const val = e.target.value;
                          handleConfigChange(
                            vehicleId,
                            "l",
                            val === "" ? "" : parseFloat(val),
                          );
                        }}
                        className="w-full h-8 px-2 pr-6 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-slate-450 tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] text-slate-400 font-bold select-none">
                        m
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block">
                      Chiều rộng (r)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={config.r}
                        onChange={(e) => {
                          const val = e.target.value;
                          handleConfigChange(
                            vehicleId,
                            "r",
                            val === "" ? "" : parseFloat(val),
                          );
                        }}
                        className="w-full h-8 px-2 pr-6 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-slate-450 tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] text-slate-400 font-bold select-none">
                        m
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block">
                      Thời gian (t)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={config.t}
                        onChange={(e) => {
                          const val = e.target.value;
                          handleConfigChange(
                            vehicleId,
                            "t",
                            val === "" ? "" : parseFloat(val),
                          );
                        }}
                        className="w-full h-8 px-2 pr-6 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-slate-450 tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] text-slate-400 font-bold select-none">
                        phút
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Tỷ lệ sử dụng khí tài (%) - chỉ khi chọn từ 2 khí tài trở lên */}
          {selectedVehicles.length > 1 && (
            <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider border-b border-slate-200 pb-1">
                Tỷ lệ sử dụng khí tài (%)
              </label>
              <div className="grid grid-cols-2 gap-2 pt-1">
                {selectedVehicles.map((vehicleId) => {
                  const name = vehicleConfigs[vehicleId]?.name || vehicleId;
                  const weightVal = vehicleWeights[vehicleId] ?? "";
                  return (
                    <div key={vehicleId} className="space-y-1">
                      <label
                        className="text-[10px] font-bold text-slate-500 block truncate"
                        title={name}
                      >
                        {name}
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={weightVal}
                          onChange={(e) => {
                            const val = e.target.value;
                            setVehicleWeights((prev) => ({
                              ...prev,
                              [vehicleId]: val === "" ? "" : parseFloat(val),
                            }));
                          }}
                          placeholder="e.g. 50"
                          className="w-full h-8 px-2 pr-6 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-slate-450 tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] text-slate-400 font-bold select-none">
                          %
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {(() => {
                const total = selectedVehicles.reduce(
                  (sum, vid) => sum + (Number(vehicleWeights[vid]) || 0),
                  0,
                );
                const isCorrect = total === 100;
                return (
                  <div className="flex justify-between items-center text-[10px] pt-1">
                    <span className="text-slate-400 font-medium">
                      Tổng tỷ lệ đóng góp:
                    </span>
                    <span
                      className={`font-bold ${
                        isCorrect
                          ? "text-emerald-600"
                          : "text-rose-600 animate-pulse"
                      }`}
                    >
                      {total}% / 100%
                    </span>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Hệ số dự phòng (Tách ra riêng biệt) */}
          <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
            <label className="text-[10px] font-bold text-slate-450 block uppercase tracking-wider">
              Hệ số phương tiện, khí tài bổ trợ, dự bị
            </label>
            <div className="relative">
              <input
                type="number"
                step={0.1}
                min={1}
                value={reserveCoefficient}
                onChange={(e) => {
                  const val = e.target.value;
                  setReserveCoefficient(val === "" ? "" : parseFloat(val));
                }}
                className="w-full h-8 px-2 pr-6 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-slate-450 tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] text-slate-400 font-bold select-none">
                lần
              </span>
            </div>
            <p className="text-[9px] text-slate-400">
              Mặc định 1.2 (dự phòng 20%)
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
