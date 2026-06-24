import { useState, useEffect, useRef } from "react";
import { Shield, ChevronDown, AlertTriangle } from "lucide-react";
import { Input } from "../ui/Input";

const TARGET_TYPES = [
  "Trận địa hỏa lực",
  "Sở chỉ huy",
  "Kho tàng",
  "Cầu đường",
  "Bến vượt",
  "Trận địa tên lửa",
  "Đội hình hành quân",
];

import { useSimulation } from "../../context/SimulationContext";

export const TargetDefensePanel = () => {
  const isCalibrated = useSimulation((s) => s.isCalibrated);
  const targetDefenseData = useSimulation((s) => s.targetDefenseData);
  const setTargetDefenseData = useSimulation((s) => s.setTargetDefenseData);
  const smokeMethodData = useSimulation((s) => s.smokeMethodData);
  const [showPanel, setShowPanel] = useState(true);
  const [comboOpen, setComboOpen] = useState(false);
  const [comboInput, setComboInput] = useState(targetDefenseData.targetType);
  const comboRef = useRef<HTMLDivElement>(null);

  // Sync comboInput when targetType changes externally
  useEffect(() => {
    setComboInput(targetDefenseData.targetType);
  }, [targetDefenseData.targetType]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (comboRef.current && !comboRef.current.contains(e.target as Node)) {
        setComboOpen(false);
        // Commit whatever was typed
        setTargetDefenseData({ ...targetDefenseData, targetType: comboInput });
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [comboInput, targetDefenseData]);

  const filteredOptions = TARGET_TYPES.filter((t) =>
    t.toLowerCase().includes(comboInput.toLowerCase()),
  );

  const handleSelect = (value: string) => {
    setComboInput(value);
    setTargetDefenseData({ ...targetDefenseData, targetType: value });
    setComboOpen(false);
  };

  return (
    <div
      className={`space-y-4 p-4 rounded-xl border bg-white border-slate-200 shadow-sm transition-opacity ${
        !isCalibrated ? "opacity-30 pointer-events-none" : ""
      }`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between cursor-pointer ${showPanel ? "border-b border-slate-200 pb-2" : ""}`}
        onClick={() => setShowPanel(!showPanel)}
      >
        <div className="flex items-center gap-2">
          <Shield size={18} className="text-amber-600" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            3. Mục tiêu bảo vệ
          </h2>
        </div>
        <span className="text-slate-400 text-xs">{showPanel ? "▼" : "▲"}</span>
      </div>

      {showPanel && (
        <div className="space-y-3 mt-2">
          {/* Mục tiêu bảo vệ — Combobox */}
          <div ref={comboRef}>
            <label className="text-xs font-semibold text-slate-500">
              Mục tiêu bảo vệ
            </label>
            <div className="relative mt-1.5">
              <input
                type="text"
                value={comboInput}
                onChange={(e) => {
                  setComboInput(e.target.value);
                  setTargetDefenseData({
                    ...targetDefenseData,
                    targetType: e.target.value,
                  });
                  setComboOpen(true);
                }}
                onFocus={() => setComboOpen(true)}
                placeholder="Chọn hoặc nhập tên mục tiêu..."
                className="font-semibold flex h-9 w-full rounded-lg border border-slate-350 bg-white px-3 pr-8 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 transition-all placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setComboOpen((o) => !o)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650 transition"
              >
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${comboOpen ? "rotate-180" : ""}`}
                />
              </button>

              {comboOpen && filteredOptions.length > 0 && (
                <ul className="absolute z-50 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg max-h-52 overflow-auto text-sm py-1">
                  {filteredOptions.map((opt) => (
                    <li
                      key={opt}
                      onMouseDown={() => handleSelect(opt)}
                      className={`px-3 py-2 cursor-pointer hover:bg-slate-50 transition-colors ${
                        comboInput === opt
                          ? "bg-slate-50 font-semibold text-emerald-600"
                          : "text-slate-700"
                      }`}
                    >
                      {opt}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Chiều dài & Chiều rộng (Thẳng) hoặc Đường kính (Vòng) */}
          {smokeMethodData.lineType === "Vòng" ? (
            <div>
              <label className="text-xs font-semibold text-slate-500">
                Đường kính tuyến vòng — D (m)
              </label>
              <Input
                type="number"
                min={0}
                value={targetDefenseData.diameter}
                onChange={(e: any) => {
                  const val = e.target.value;
                  if (val === "" || parseFloat(val) >= 0) {
                    const dVal = parseFloat(val);
                    const calculatedArea = val
                      ? Number(
                          ((Math.PI * Math.pow(dVal / 2, 2)) / 10000).toFixed(
                            4,
                          ),
                        ).toString()
                      : "";
                    setTargetDefenseData({
                      ...targetDefenseData,
                      diameter: val,
                      area: calculatedArea,
                    });
                  }
                }}
                placeholder="Nhập đường kính"
              />
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-500">
                  Chính diện hướng gió — R (m)
                </label>
                <Input
                  type="number"
                  min={0}
                  value={targetDefenseData.width}
                  onChange={(e: any) => {
                    const val = e.target.value;
                    if (val === "" || parseFloat(val) >= 0) {
                      const lVal = parseFloat(targetDefenseData.length);
                      const wVal = parseFloat(val);
                      const calculatedArea =
                        val && targetDefenseData.length
                          ? Number(
                              ((lVal * wVal) / 10000).toFixed(4),
                            ).toString()
                          : "";
                      setTargetDefenseData({
                        ...targetDefenseData,
                        width: val,
                        area: calculatedArea,
                      });
                    }
                  }}
                  placeholder="Nhập số"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">
                  Dọc theo hướng gió — L (m)
                </label>
                <Input
                  type="number"
                  min={0}
                  value={targetDefenseData.length}
                  onChange={(e: any) => {
                    const val = e.target.value;
                    if (val === "" || parseFloat(val) >= 0) {
                      const wVal = parseFloat(targetDefenseData.width);
                      const lVal = parseFloat(val);
                      const calculatedArea =
                        targetDefenseData.width && val
                          ? Number(
                              ((wVal * lVal) / 10000).toFixed(4),
                            ).toString()
                          : "";
                      setTargetDefenseData({
                        ...targetDefenseData,
                        length: val,
                        area: calculatedArea,
                      });
                    }
                  }}
                  placeholder="Nhập số"
                />
              </div>
            </div>
          )}

          {/* Diện tích mục tiêu */}
          <div>
            <label className="text-xs font-semibold text-slate-500">
              Diện tích mục tiêu (ha)
            </label>
            <Input
              type="number"
              min={0}
              value={targetDefenseData.area}
              onChange={(e: any) => {
                const val = e.target.value;
                if (val === "" || parseFloat(val) >= 0) {
                  setTargetDefenseData({
                    ...targetDefenseData,
                    area: val,
                  });
                }
              }}
              placeholder="VD: 0.1"
            />
          </div>

          {/* Yêu cầu diện tích màn khói cần bao phủ */}
          <div className="bg-amber-50/65 border border-amber-200/80 rounded-lg p-3">
            <label className="text-xs font-semibold text-slate-600">
              Yêu cầu diện tích màn khói cần bao phủ
            </label>
            <div className="flex items-center gap-2 mt-1.5">
              <Input
                type="number"
                min={0}
                value={targetDefenseData.coverageMultiplier}
                onChange={(e: any) => {
                  const val = e.target.value;
                  if (val === "" || parseFloat(val) >= 0) {
                    setTargetDefenseData({
                      ...targetDefenseData,
                      coverageMultiplier: val,
                    });
                  }
                }}
                placeholder="Số lần"
              />
              <span className="text-xs text-slate-500 whitespace-nowrap font-medium">
                (lần) so với diện tích mục tiêu
              </span>
            </div>
            {targetDefenseData.area && targetDefenseData.coverageMultiplier && (
              <p className="text-xs text-amber-800 font-semibold mt-2 tabular-nums">
                ={" "}
                {(
                  parseFloat(targetDefenseData.area) *
                  parseFloat(targetDefenseData.coverageMultiplier)
                ).toLocaleString()}{" "}
                ha
              </p>
            )}

            {(() => {
              const areaVal = parseFloat(targetDefenseData.area);
              const multVal = parseFloat(targetDefenseData.coverageMultiplier);
              if (isNaN(areaVal) || isNaN(multVal)) return null;

              let recommendedMin = 0;
              let recommendedMax = 0;
              let categoryLabel = "";

              if (areaVal < 30) {
                recommendedMin = 10;
                recommendedMax = 15;
                categoryLabel = "nhỏ (< 30 ha)";
              } else if (areaVal >= 30 && areaVal <= 50) {
                recommendedMin = 6;
                recommendedMax = 10;
                categoryLabel = "vừa (30 - 50 ha)";
              } else {
                recommendedMin = 3;
                recommendedMax = 5;
                categoryLabel = "lớn (> 50 ha)";
              }

              const isOutOfRange =
                multVal < recommendedMin || multVal > recommendedMax;

              if (!isOutOfRange) return null;

              return (
                <div className="mt-2.5 p-2.5 rounded-lg bg-rose-50 border border-rose-100 text-[11px] text-rose-700 flex items-start gap-1.5 leading-relaxed animate-in fade-in slide-in-from-top-1 duration-200">
                  <AlertTriangle
                    size={13}
                    className="shrink-0 mt-0.5 text-rose-500"
                  />
                  <div>
                    <span className="font-bold">Khuyến nghị:</span> Diện tích
                    mục tiêu {categoryLabel} nên chọn từ{" "}
                    <span className="font-bold">
                      {recommendedMin} - {recommendedMax} lần
                    </span>
                    .
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
