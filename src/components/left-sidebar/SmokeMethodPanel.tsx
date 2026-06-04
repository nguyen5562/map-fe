import { useState } from "react";
import { Route } from "lucide-react";

type SmokeMethodData = {
  lineType: "Thẳng" | "Vòng";
  areaEnabled: boolean;
};

export const SmokeMethodPanel = ({
  isCalibrated,
  smokeMethodData,
  setSmokeMethodData,
  targetDefenseData,
}: {
  isCalibrated: boolean;
  smokeMethodData: SmokeMethodData;
  setSmokeMethodData: (data: SmokeMethodData) => void;
  targetDefenseData: any;
}) => {
  const [showPanel, setShowPanel] = useState(true);

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
          <Route size={18} className="text-teal-600" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            6. Phương pháp phát khói
          </h2>
        </div>
        <span className="text-slate-400 text-xs">{showPanel ? "▼" : "▲"}</span>
      </div>

      {showPanel && (
        <div className="space-y-4 mt-2">
          {/* Theo tuyến */}
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-2 block">
              Theo tuyến
            </label>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setSmokeMethodData({ ...smokeMethodData, lineType: "Thẳng" })
                }
                className={`flex-1 h-9 rounded-lg text-sm font-bold border-2 transition-all duration-200 ${
                  smokeMethodData.lineType === "Thẳng"
                    ? "bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-200"
                    : "bg-white text-slate-600 border-slate-300 hover:border-teal-400 hover:text-teal-600"
                }`}
              >
                Thẳng
              </button>
              <button
                onClick={() =>
                  setSmokeMethodData({ ...smokeMethodData, lineType: "Vòng" })
                }
                className={`flex-1 h-9 rounded-lg text-sm font-bold border-2 transition-all duration-200 ${
                  smokeMethodData.lineType === "Vòng"
                    ? "bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-200"
                    : "bg-white text-slate-600 border-slate-300 hover:border-teal-400 hover:text-teal-600"
                }`}
              >
                Vòng
              </button>
            </div>
          </div>

          {/* Theo diện */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="text-xs font-semibold text-slate-500">
                Theo diện (khu vực)
              </label>
              <button
                onClick={() =>
                  setSmokeMethodData({
                    ...smokeMethodData,
                    areaEnabled: !smokeMethodData.areaEnabled,
                  })
                }
                className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${
                  smokeMethodData.areaEnabled ? "bg-teal-600" : "bg-slate-300"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
                    smokeMethodData.areaEnabled
                      ? "translate-x-4"
                      : "translate-x-0.5"
                  }`}
                ></div>
              </button>
            </div>
            {smokeMethodData.areaEnabled && (() => {
              const base = parseFloat(targetDefenseData?.area || '0');
              const mult = parseFloat(targetDefenseData?.coverageMultiplier || '1');
              const computed = isNaN(base) || isNaN(mult) ? null : base * mult;
              return (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-slate-500 whitespace-nowrap">Diện tích</span>
                  <div className="flex-1 h-9 flex items-center px-3 rounded-md border border-slate-200 bg-slate-50 text-sm font-bold text-teal-700">
                    {computed !== null ? computed.toLocaleString('vi-VN') : <span className="text-slate-400 font-normal">Chưa có dữ liệu mục 2</span>}
                  </div>
                  <span className="text-sm text-slate-500 font-medium whitespace-nowrap">m²</span>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
