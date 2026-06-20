import { useState } from "react";
import { Truck, RotateCcw, AlertTriangle } from "lucide-react";

export type VehicleConfig = {
  id: string;
  name: string;
  desc: string;
  l: number; // smoke length
  r: number; // smoke width
  t: number; // smoke release time
  materials: string; // spec sheet consumables
  unit: string; // unit of consumption
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
      setSelectedVehicles([]);
    } else {
      setSelectedVehicles([id]);
    }
  };

  const selectedId = selectedVehicles[0];
  const config = selectedId ? vehicleConfigs[selectedId] : null;
  const defaultConfig = selectedId ? originalVehicleConfigs[selectedId] : null;

  const isCustomized =
    config &&
    defaultConfig &&
    (config.l !== defaultConfig.l ||
      config.r !== defaultConfig.r ||
      config.t !== defaultConfig.t);

  const handleConfigChange = (field: keyof VehicleConfig, val: any) => {
    if (!selectedId) return;
    setVehicleConfigs((prev) => ({
      ...prev,
      [selectedId]: {
        ...prev[selectedId],
        [field]: val,
      },
    }));
  };

  const handleReset = () => {
    if (!selectedId || !defaultConfig) return;
    setVehicleConfigs((prev) => ({
      ...prev,
      [selectedId]: {
        ...defaultConfig,
      },
    }));
  };

  return (
    <div
      className={`space-y-4 p-4 rounded-xl border bg-white border-slate-200 shadow-sm transition-opacity ${
        !isCalibrated ? "opacity-30 pointer-events-none" : ""
      }`}
    >
      <div
        className="flex items-center justify-between border-b border-slate-200 pb-2 cursor-pointer"
        onClick={() => setShowPanel(!showPanel)}
      >
        <div className="flex items-center gap-2">
          <Truck size={18} className="text-orange-600" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            7. Lựa chọn phương tiện thả khói
          </h2>
        </div>
        <span className="text-slate-400 text-xs">{showPanel ? "▼" : "▲"}</span>
      </div>

      {showPanel && (
        <div className="mt-2 space-y-3">
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

          {selectedId && config && (
            <div className="mt-3 p-3 bg-slate-50 border border-slate-250 rounded-lg space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Thông số màn khói
                  </span>
                  {isCustomized && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-0.5 animate-pulse">
                      <AlertTriangle size={10} className="shrink-0" />
                      Đã chỉnh sửa
                    </span>
                  )}
                </div>
                {isCustomized && (
                  <button
                    onClick={handleReset}
                    className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-all active:scale-95"
                  >
                    <RotateCcw size={10} />
                    Đặt lại
                  </button>
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
                      onChange={(e) =>
                        handleConfigChange("l", parseFloat(e.target.value) || 0)
                      }
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
                      onChange={(e) =>
                        handleConfigChange("r", parseFloat(e.target.value) || 0)
                      }
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
                      onChange={(e) =>
                        handleConfigChange("t", parseFloat(e.target.value) || 0)
                      }
                      className="w-full h-8 px-2 pr-6 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-slate-450 tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] text-slate-400 font-bold select-none">
                      phút
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider mb-0.5">
                  Vật tư tiêu hao đặc thù
                </span>
                <span className="text-[10px] text-slate-650 font-semibold leading-relaxed block">
                  {config.materials}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
