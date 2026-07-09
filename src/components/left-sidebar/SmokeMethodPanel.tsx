import { useState } from "react";
import { Route, ChevronDown, ChevronUp } from "lucide-react";

import { useSimulation } from "../../context/SimulationContext";

export const SmokeMethodPanel = () => {
  const isCalibrated = useSimulation((s) => s.isCalibrated);
  const smokeMethodData = useSimulation((s) => s.smokeMethodData);
  const setSmokeMethodData = useSimulation((s) => s.setSmokeMethodData);
  const targetDefenseData = useSimulation((s) => s.targetDefenseData);
  const [showPanel, setShowPanel] = useState(true);

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
          <Route size={18} className="text-teal-600" />
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">
            2. Phương pháp phát khói
          </h2>
        </div>
        {showPanel ? (
          <ChevronUp size={14} className="text-slate-400" />
        ) : (
          <ChevronDown size={14} className="text-slate-400" />
        )}
      </button>

      {showPanel && (
        <div className="px-4 pb-4 pt-2 space-y-4">
          {/* Phương pháp */}
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-2 block">
              Phương pháp
            </label>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setSmokeMethodData({ ...smokeMethodData, lineType: "Thẳng" })
                }
                className={`flex-1 h-9 rounded-lg text-xs font-bold border transition-all duration-200 active:scale-[0.98] ${
                  smokeMethodData.lineType === "Thẳng"
                    ? "bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-200/50"
                    : "bg-white text-slate-600 border-slate-300 hover:border-teal-400 hover:text-teal-600"
                }`}
              >
                Tuyến thẳng
              </button>
              <button
                onClick={() =>
                  setSmokeMethodData({ ...smokeMethodData, lineType: "Vòng" })
                }
                className={`flex-1 h-9 rounded-lg text-xs font-bold border transition-all duration-200 active:scale-[0.98] ${
                  smokeMethodData.lineType === "Vòng"
                    ? "bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-200/50"
                    : "bg-white text-slate-600 border-slate-300 hover:border-teal-400 hover:text-teal-600"
                }`}
              >
                Tuyến vòng
              </button>
              <button
                onClick={() =>
                  setSmokeMethodData({ ...smokeMethodData, lineType: "Diện" })
                }
                className={`flex-1 h-9 rounded-lg text-xs font-bold border transition-all duration-200 active:scale-[0.98] ${
                  smokeMethodData.lineType === "Diện"
                    ? "bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-200/50"
                    : "bg-white text-slate-600 border-slate-300 hover:border-teal-400 hover:text-teal-600"
                }`}
              >
                Theo diện
              </button>
            </div>
          </div>

          {/* Vai trò tuyến */}
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-2 block">
              Vai trò tuyến
            </label>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setSmokeMethodData({ ...smokeMethodData, lineRole: "Chính" })
                }
                className={`flex-1 h-9 rounded-lg text-xs font-bold border transition-all duration-200 active:scale-[0.98] ${
                  (smokeMethodData.lineRole || "Chính") === "Chính"
                    ? "bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-200/50"
                    : "bg-white text-slate-600 border-slate-300 hover:border-teal-400 hover:text-teal-600"
                }`}
              >
                Tuyến chính
              </button>
              <button
                onClick={() =>
                  setSmokeMethodData({ ...smokeMethodData, lineRole: "Dự bị" })
                }
                className={`flex-1 h-9 rounded-lg text-xs font-bold border transition-all duration-200 active:scale-[0.98] ${
                  smokeMethodData.lineRole === "Dự bị"
                    ? "bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-200/50"
                    : "bg-white text-slate-600 border-slate-300 hover:border-teal-400 hover:text-teal-600"
                }`}
              >
                Tuyến dự kiến
              </button>
            </div>
          </div>

          {/* Màu đệm tuyến khói */}
          <div className="bg-slate-50/50 rounded-lg border border-slate-200 p-2.5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                Màu đệm (viền)
              </span>
            </div>
            <div className="grid grid-cols-6 gap-1.5 justify-items-center">
              {[
                {
                  value: "none",
                  label: "Không",
                  class: "bg-slate-100 border-slate-300",
                },
                { value: "#ef4444", label: "Đỏ", class: "bg-[#ef4444]" },
                { value: "#f97316", label: "Cam", class: "bg-[#f97316]" },
                { value: "#eab308", label: "Vàng", class: "bg-[#eab308]" },
                { value: "#84cc16", label: "Lá mạ", class: "bg-[#84cc16]" },
                { value: "#22c55e", label: "Lá cây", class: "bg-[#22c55e]" },
                { value: "#0d9488", label: "Teal", class: "bg-[#0d9488]" },
                { value: "#06b6d4", label: "Xanh lơ", class: "bg-[#06b6d4]" },
                { value: "#3b82f6", label: "Xanh biển", class: "bg-[#3b82f6]" },
                { value: "#a855f7", label: "Tím", class: "bg-[#a855f7]" },
                { value: "#ec4899", label: "Hồng", class: "bg-[#ec4899]" },
                { value: "#6b7280", label: "Xám", class: "bg-[#6b7280]" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  title={opt.label}
                  onClick={() =>
                    setSmokeMethodData({
                      ...smokeMethodData,
                      bufferColor: opt.value,
                    })
                  }
                  className={`w-6 h-6 rounded-full ${opt.class} border transition-all relative flex items-center justify-center ${
                    (smokeMethodData.bufferColor || "none") === opt.value
                      ? "border-slate-800 scale-110 shadow-sm ring-1 ring-offset-0.5 ring-slate-400"
                      : "border-slate-200 hover:scale-105"
                  }`}
                >
                  {(smokeMethodData.bufferColor || "none") === opt.value && (
                    <span
                      className={`w-1 h-1 rounded-full ${opt.value === "#ffffff" ? "bg-black" : "bg-white"}`}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Diện tích */}
          <div>
            {(() => {
              const base = parseFloat(targetDefenseData?.area || "0");
              const mult = parseFloat(
                targetDefenseData?.coverageMultiplier || "1",
              );
              const computed = isNaN(base) || isNaN(mult) ? null : base * mult;
              return (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-slate-500 whitespace-nowrap">
                    Diện tích
                  </span>
                  <div className="flex-1 h-9 flex items-center px-3 rounded-lg border border-slate-200 bg-slate-50 text-sm font-bold text-teal-700 tabular-nums">
                    {computed !== null ? (
                      computed.toLocaleString("vi-VN")
                    ) : (
                      <span className="text-slate-400 font-normal">
                        Chưa có dữ liệu mục 3
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-slate-500 font-medium whitespace-nowrap">
                    ha
                  </span>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
