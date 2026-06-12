import { MapPin, Trash2 } from "lucide-react";
import { useState } from "react";

import { useSimulation } from "../../context/SimulationContext";

export const PointsListPanel = () => {
  const pointsList = useSimulation((s) => s.pointsList);
  const onDeletePoint = useSimulation((s) => s.onDeletePoint);
  const onRenamePoint = useSimulation((s) => s.onRenamePoint);
  const selectedPointId = useSimulation((s) => s.selectedPointId);
  const onSelectPoint = useSimulation((s) => s.onSelectPoint);
  const [showPanel, setShowPanel] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempName, setTempName] = useState<string>("");

  const startEdit = (p: any, idx: number) => {
    setEditingId(p.id);
    setTempName(p.name || `Điểm ${idx + 1}`);
  };

  const saveEdit = (id: string) => {
    if (tempName.trim()) {
      onRenamePoint(id, tempName.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="space-y-4 p-4 rounded-xl border bg-white border-slate-200 shadow-sm">
      <div
        className="flex items-center justify-between border-b border-slate-200 pb-2 cursor-pointer select-none"
        onClick={() => setShowPanel(!showPanel)}
      >
        <div className="flex items-center gap-1 min-w-0">
          <MapPin size={18} className="text-indigo-600 shrink-0" />
          <h2 className="text-sm font-bold uppercase tracking-tight text-slate-700 truncate">
            Danh sách trận địa khói ({pointsList.length})
          </h2>
        </div>
        <span className="text-slate-400 text-xs shrink-0 ml-1">{showPanel ? "▼" : "▲"}</span>
      </div>

      {showPanel && (
        <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
          {pointsList.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-2 text-center">
              Chưa có điểm nào được lưu. Click bản đồ và bấm "Điểm kế tiếp".
            </p>
          ) : (
            pointsList.map((p, idx) => {
              const methodType = p.smokeMethodData?.lineType || "Thẳng";
              const vehicleName = p.selectedVehicles?.[0] || "Chưa chọn";
              const isSelected = selectedPointId === p.id;

              return (
                <div
                  key={p.id}
                  onClick={() => onSelectPoint(p.id)}
                  className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-indigo-50 border-indigo-200 hover:bg-indigo-100/70"
                      : "bg-slate-50 border-slate-100 hover:bg-slate-100/80"
                  }`}
                >
                  <div className="flex-1 min-w-0 pr-2">
                    {editingId === p.id ? (
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={tempName}
                          onChange={(e) => setTempName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveEdit(p.id);
                            if (e.key === "Escape") setEditingId(null);
                          }}
                          className="h-6 w-full text-xs border border-slate-300 rounded-lg px-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold"
                          autoFocus
                          onBlur={() => saveEdit(p.id)}
                        />
                      </div>
                    ) : (
                      <p className="text-xs font-bold text-slate-700 flex items-center gap-1 group">
                        <span
                          className="cursor-pointer hover:underline flex items-center gap-0.5"
                          onClick={(e) => {
                            e.stopPropagation();
                            startEdit(p, idx);
                          }}
                          title="Click để đổi tên"
                        >
                          📍 {p.name || `Điểm ${idx + 1}`}
                          <span className="opacity-0 group-hover:opacity-100 text-[10px] text-blue-500 transition-opacity ml-1">
                            ✏️
                          </span>
                        </span>
                        <span className="text-[10px] font-normal text-slate-400 shrink-0">
                          ({methodType} - {vehicleName})
                        </span>
                      </p>
                    )}
                    {p.realCoords && (
                      <p className="text-[10px] text-slate-500 font-mono tabular-nums truncate mt-0.5">
                        X: {p.realCoords.x.toFixed(2)}, Y: {p.realCoords.y.toFixed(2)}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeletePoint(p.id);
                    }}
                    className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
                    title="Xóa điểm"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
