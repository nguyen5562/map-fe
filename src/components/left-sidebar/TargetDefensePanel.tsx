import { useState, useEffect, useRef } from "react";
import { Shield, ChevronDown } from "lucide-react";
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

type TargetDefenseData = {
  targetType: string;
  length: string;
  width: string;
  area: string;
  coverageMultiplier: string;
};

export const TargetDefensePanel = ({
  isCalibrated,
  targetDefenseData,
  setTargetDefenseData,
}: {
  isCalibrated: boolean;
  targetDefenseData: TargetDefenseData;
  setTargetDefenseData: (data: TargetDefenseData) => void;
}) => {
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
    t.toLowerCase().includes(comboInput.toLowerCase())
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
        className="flex items-center justify-between border-b border-slate-200 pb-2 cursor-pointer"
        onClick={() => setShowPanel(!showPanel)}
      >
        <div className="flex items-center gap-2">
          <Shield size={18} className="text-amber-600" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            2. Mục tiêu bảo vệ
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
            <div className="relative mt-1">
              <input
                type="text"
                value={comboInput}
                onChange={(e) => {
                  setComboInput(e.target.value);
                  setTargetDefenseData({ ...targetDefenseData, targetType: e.target.value });
                  setComboOpen(true);
                }}
                onFocus={() => setComboOpen(true)}
                placeholder="Chọn hoặc nhập tên mục tiêu..."
                className="flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 pr-8 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setComboOpen((o) => !o)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <ChevronDown size={15} className={`transition-transform ${comboOpen ? "rotate-180" : ""}`} />
              </button>

              {comboOpen && filteredOptions.length > 0 && (
                <ul className="absolute z-50 mt-1 w-full rounded-md border border-slate-200 bg-white shadow-lg max-h-52 overflow-auto text-sm">
                  {filteredOptions.map((opt) => (
                    <li
                      key={opt}
                      onMouseDown={() => handleSelect(opt)}
                      className={`px-3 py-2 cursor-pointer hover:bg-blue-50 hover:text-blue-700 ${
                        comboInput === opt ? "bg-blue-50 font-semibold text-blue-700" : "text-slate-700"
                      }`}
                    >
                      {opt}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Chiều dài & Chiều rộng */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500">
                Chiều dài (m)
              </label>
              <Input
                value={targetDefenseData.length}
                onChange={(e: any) =>
                  setTargetDefenseData({
                    ...targetDefenseData,
                    length: e.target.value,
                  })
                }
                placeholder="Chiều dài"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">
                Chiều rộng (m)
              </label>
              <Input
                value={targetDefenseData.width}
                onChange={(e: any) =>
                  setTargetDefenseData({
                    ...targetDefenseData,
                    width: e.target.value,
                  })
                }
                placeholder="Chiều rộng"
              />
            </div>
          </div>

          {/* Diện tích mục tiêu */}
          <div>
            <label className="text-xs font-semibold text-slate-500">
              Diện tích mục tiêu (m²)
            </label>
            <Input
              value={targetDefenseData.area}
              onChange={(e: any) =>
                setTargetDefenseData({
                  ...targetDefenseData,
                  area: e.target.value,
                })
              }
              placeholder="Diện tích mục tiêu"
            />

          </div>

          {/* Yêu cầu diện tích màn khói cần bao phủ */}
          <div className="bg-amber-50/60 border border-amber-200 rounded-lg p-3">
            <label className="text-xs font-semibold text-slate-600">
              Yêu cầu diện tích màn khói cần bao phủ
            </label>
            <div className="flex items-center gap-2 mt-1.5">
              <Input
                value={targetDefenseData.coverageMultiplier}
                onChange={(e: any) =>
                  setTargetDefenseData({
                    ...targetDefenseData,
                    coverageMultiplier: e.target.value,
                  })
                }
                placeholder="Số lần"
              />
              <span className="text-xs text-slate-500 whitespace-nowrap font-medium">
                (lần) so với diện tích mục tiêu
              </span>
            </div>
            {targetDefenseData.area && targetDefenseData.coverageMultiplier && (
              <p className="text-xs text-amber-700 font-semibold mt-2">
                ={" "}
                {(
                  parseFloat(targetDefenseData.area) *
                  parseFloat(targetDefenseData.coverageMultiplier)
                ).toLocaleString()}{" "}
                m²
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
