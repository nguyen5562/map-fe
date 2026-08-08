import { useState, useEffect } from "react";
import { Settings, MapPin, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

import { useSimulation } from "../../context/SimulationContext";

const KmInput = ({ value, onChange, placeholder, disabled }: any) => {
  const [internalValue, setInternalValue] = useState(() => {
    if (!value) return "";
    const num = parseFloat(value);
    return isNaN(num) ? "" : String(num / 1000);
  });

  useEffect(() => {
    if (value) {
      const currentNum = parseFloat(internalValue) * 1000;
      const propNum = parseFloat(value);
      if (isNaN(currentNum) || Math.abs(currentNum - propNum) > 0.0001) {
        setInternalValue(String(propNum / 1000));
      }
    } else {
      setInternalValue("");
    }
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (e: any) => {
    setInternalValue(e.target.value);
    if (e.target.value === "") {
      onChange("");
    } else {
      const num = parseFloat(e.target.value);
      if (!isNaN(num)) {
        onChange(String(num * 1000));
      }
    }
  };

  return (
    <Input
      type="number"
      value={internalValue}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled}
    />
  );
};

export const CalibrationPanel = () => {
  const isCalibrated = useSimulation((s) => s.isCalibrated);
  const setIsCalibrated = useSimulation((s) => s.setIsCalibrated);
  const showCalibration = useSimulation((s) => s.showCalibration);
  const setShowCalibration = useSimulation((s) => s.setShowCalibration);
  const p1 = useSimulation((s) => s.p1);
  const setP1 = useSimulation((s) => s.setP1);
  const p2 = useSimulation((s) => s.p2);
  const setP2 = useSimulation((s) => s.setP2);
  const isSelectingFor = useSimulation((s) => s.isSelectingFor);
  const setIsSelectingFor = useSimulation((s) => s.setIsSelectingFor);
  const calculateCalibration = useSimulation((s) => s.calculateCalibration);
  return (
    <div
      className={`rounded-xl border overflow-hidden shadow-sm ${
        isCalibrated
          ? "bg-slate-50 border-slate-200 opacity-80"
          : "bg-blue-50/50 border-blue-200"
      }`}
    >
      <button
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50/80 hover:bg-slate-100/80 transition-colors"
        onClick={() => setShowCalibration(!showCalibration)}
      >
        <div className="flex items-center gap-1 min-w-0">
          <Settings
            size={18}
            className={`shrink-0 ${
              isCalibrated ? "text-slate-400" : "text-blue-600"
            }`}
          />
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700 whitespace-nowrap">
            1. Hiệu chuẩn bản đồ
          </h2>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {isCalibrated && (
            <Button
              variant="outline"
              onClick={(e: any) => {
                e.stopPropagation();
                setIsCalibrated(false);
                setShowCalibration(true);
              }}
              className="h-7 text-xs px-2"
            >
              Sửa
            </Button>
          )}
          {showCalibration ? (
            <ChevronUp size={14} className="text-slate-400" />
          ) : (
            <ChevronDown size={14} className="text-slate-400" />
          )}
        </div>
      </button>

      {showCalibration && (
        <div className="px-4 pb-4 pt-2 space-y-4">
          {!isCalibrated && (
            <p className="text-xs text-slate-600 my-2">
              Áp 2 điểm mốc để quy đổi từ tọa độ ảnh sang Km (tính toán nội bộ
              theo VN-2000 Mét).
            </p>
          )}

          {/* Point 1 */}
          <div className="space-y-2 bg-white p-3 rounded-md border border-slate-200">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <MapPin size={13} className="text-blue-600 shrink-0" />
                <span>Điểm mốc 1</span>
              </span>
              <Button
                variant={isSelectingFor === "p1" ? "primary" : "outline"}
                onClick={() => setIsSelectingFor("p1")}
                className="h-7 text-xs px-2"
                disabled={isCalibrated}
              >
                {isSelectingFor === "p1"
                  ? "Chọn trên map..."
                  : p1.rawX
                    ? "Sửa điểm"
                    : "Chọn điểm trên map"}
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <KmInput
                value={p1.realX}
                onChange={(val: string) => setP1({ ...p1, realX: val })}
                placeholder="X thật (km)"
                disabled={isCalibrated}
              />
              <KmInput
                value={p1.realY}
                onChange={(val: string) => setP1({ ...p1, realY: val })}
                placeholder="Y thật (km)"
                disabled={isCalibrated}
              />
            </div>
          </div>

          {/* Point 2 */}
          <div className="space-y-2 bg-white p-3 rounded-md border border-slate-200">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <MapPin size={13} className="text-blue-600 shrink-0" />
                <span>Điểm mốc 2</span>
              </span>
              <Button
                variant={isSelectingFor === "p2" ? "primary" : "outline"}
                onClick={() => setIsSelectingFor("p2")}
                className="h-7 text-xs px-2"
                disabled={isCalibrated}
              >
                {isSelectingFor === "p2"
                  ? "Chọn trên map..."
                  : p2.rawX
                    ? "Sửa điểm"
                    : "Chọn điểm trên map"}
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <KmInput
                value={p2.realX}
                onChange={(val: string) => setP2({ ...p2, realX: val })}
                placeholder="X thật (km)"
                disabled={isCalibrated}
              />
              <KmInput
                value={p2.realY}
                onChange={(val: string) => setP2({ ...p2, realY: val })}
                placeholder="Y thật (km)"
                disabled={isCalibrated}
              />
            </div>
          </div>

          {!isCalibrated && (
            <Button
              onClick={calculateCalibration}
              variant="primary"
              className="w-full mt-2 font-bold shadow-md"
            >
              Lưu Hệ Tọa Độ Map
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
