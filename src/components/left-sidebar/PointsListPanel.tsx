import { MapPin, Trash2, Edit, X, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

import { useSimulation } from "../../context/SimulationContext";

export const PointsListPanel = () => {
  const pointsList = useSimulation((s) => s.pointsList);
  const onDeletePoint = useSimulation((s) => s.onDeletePoint);
  const onRenamePoint = useSimulation((s) => s.onRenamePoint);
  const selectedPointId = useSimulation((s) => s.selectedPointId);
  const onSelectPoint = useSimulation((s) => s.onSelectPoint);
  const onStartEditPoint = useSimulation((s) => s.onStartEditPoint);
  const editingPointId = useSimulation((s) => s.editingPointId);
  const onCancelEditPoint = useSimulation((s) => s.onCancelEditPoint);
  const onSelectUnsavedPoint = useSimulation((s) => s.onSelectUnsavedPoint);
  const onClearUnsavedPoint = useSimulation((s) => s.onClearUnsavedPoint);
  const clickedRaw = useSimulation((s) => s.clickedRaw);
  const drafts = useSimulation((s) => s.drafts);

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
    <div className="rounded-xl border bg-white border-slate-200 shadow-sm overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors select-none"
        onClick={() => setShowPanel(!showPanel)}
      >
        <div className="flex items-center gap-2 min-w-0">
          <MapPin size={18} className="text-indigo-600 shrink-0" />
          <h2 className="text-sm font-bold uppercase tracking-tight text-slate-700 truncate">
            Danh sách trận địa khói
          </h2>
          <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold shrink-0">
            {pointsList.length}
          </span>
        </div>
        {showPanel ? (
          <ChevronUp size={14} className="text-slate-400 shrink-0 ml-1" />
        ) : (
          <ChevronDown size={14} className="text-slate-400 shrink-0 ml-1" />
        )}
      </button>

      {showPanel && (
        <div className="px-4 pb-3 pt-2 space-y-2">
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
                      <div
                        className="flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
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
                      <p className="text-xs font-bold text-slate-700 flex items-center justify-between gap-1.5 group w-full">
                        <span
                          className="cursor-pointer hover:underline flex items-center gap-1 flex-1 min-w-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            startEdit(p, idx);
                          }}
                          title="Click để đổi tên"
                        >
                          <MapPin
                            size={12}
                            className="text-emerald-600 shrink-0"
                          />
                          <span className="break-words">
                            {p.name || `Điểm ${idx + 1}`}
                          </span>
                          <Edit
                            size={10}
                            className="opacity-0 group-hover:opacity-100 text-blue-500 transition-opacity ml-1 shrink-0"
                          />
                        </span>
                        <span className="text-[10px] font-normal text-slate-400 shrink-0 ml-2">
                          ({methodType} - {vehicleName})
                        </span>
                      </p>
                    )}
                    {p.realCoords && (
                      <p className="text-[10px] text-slate-500 font-mono tabular-nums truncate mt-0.5">
                        X: {p.realCoords.x.toFixed(2)}, Y:{" "}
                        {p.realCoords.y.toFixed(2)}
                      </p>
                    )}
                  </div>
                  <div
                    className="flex items-center gap-1 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (editingPointId === p.id) {
                          onCancelEditPoint();
                        } else {
                          onStartEditPoint(p.id);
                        }
                      }}
                      className={`p-1 rounded-md transition-colors ${
                        editingPointId === p.id
                          ? "text-red-650 bg-red-50 hover:bg-red-100"
                          : "text-slate-400 hover:text-blue-605 hover:bg-blue-50"
                      }`}
                      title={
                        editingPointId === p.id
                          ? "Hủy chỉnh sửa"
                          : "Chỉnh sửa thông số"
                      }
                    >
                      {editingPointId === p.id ? (
                        <X size={14} />
                      ) : (
                        <Edit size={14} />
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeletePoint(p.id);
                      }}
                      className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Xóa điểm"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          )}

          {/* Unsaved draft entry */}
          {(drafts["new"] || (selectedPointId === null && clickedRaw)) && (
            <div
              onClick={() => onSelectUnsavedPoint()}
              className={`flex items-center justify-between p-2 rounded-lg border border-dashed cursor-pointer transition-colors ${
                selectedPointId === null && clickedRaw !== null
                  ? "bg-amber-50 border-amber-300 hover:bg-amber-100/70"
                  : "bg-slate-50 border-slate-200 hover:bg-slate-100/80"
              }`}
            >
              <div className="flex-1 min-w-0 pr-2">
                <p className="text-xs font-bold text-amber-700 flex items-center gap-1">
                  <MapPin size={12} className="text-amber-700 shrink-0" />
                  <span>* Mục tiêu tạm (Chưa lưu)</span>
                </p>
                <p className="text-[10px] text-slate-500 italic mt-0.5">
                  Nhấp để quay lại nhập liệu & lưu
                </p>
              </div>
              <div
                className="flex items-center gap-1 shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearUnsavedPoint();
                  }}
                  className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Hủy mục tiêu tạm"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
