import { useState } from "react";
import { Truck } from "lucide-react";

const VEHICLES = [
  { id: "HPK-2.5", name: "HPK-2.5", desc: "Hộp phát khói" },
  { id: "TPK", name: "TPK", desc: "Thùng thả khói" },
  { id: "KH-1", name: "KH-1", desc: "Xe thả khói" },
  { id: "TDA-M", name: "TDA-M", desc: "Xe thả khói" },
  { id: "KHOI_UNG_DUNG", name: "KHÓI ỨNG DỤNG", desc: "Khói ứng dụng" },
];

export const SmokeVehiclePanel = ({
  isCalibrated,
  selectedVehicles,
  setSelectedVehicles,
}: {
  isCalibrated: boolean;
  selectedVehicles: string[];
  setSelectedVehicles: (val: string[]) => void;
}) => {
  const [showPanel, setShowPanel] = useState(true);

  const toggleVehicle = (id: string) => {
    if (selectedVehicles.includes(id)) {
      setSelectedVehicles([]);
    } else {
      setSelectedVehicles([id]);
    }
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
        <div className="mt-2">
          <div className="flex flex-wrap gap-2">
            {VEHICLES.map((v) => {
              const isSelected = selectedVehicles.includes(v.id);
              return (
                <button
                  key={v.id}
                  onClick={() => toggleVehicle(v.id)}
                  title={v.desc}
                  className={`px-3 h-9 rounded-lg text-sm font-bold border-2 transition-all duration-200 ${
                    isSelected
                      ? "bg-orange-600 text-white border-orange-600 shadow-md shadow-orange-200"
                      : "bg-white text-slate-600 border-slate-300 hover:border-orange-400 hover:text-orange-600"
                  }`}
                >
                  {v.name}
                </button>
              );
            })}
          </div>
          {selectedVehicles.length > 0 && (
            <p className="text-[10px] text-slate-400 mt-2">
              Đã chọn: {VEHICLES.find((v) => v.id === selectedVehicles[0])?.desc} ({VEHICLES.find((v) => v.id === selectedVehicles[0])?.name})
            </p>
          )}
        </div>
      )}
    </div>
  );
};
