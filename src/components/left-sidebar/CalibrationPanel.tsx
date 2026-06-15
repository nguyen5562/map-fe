import { Settings } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

import { useSimulation } from "../../context/SimulationContext";

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
      className={`space-y-4 p-4 rounded-xl border ${isCalibrated ? "bg-slate-50 border-slate-200 opacity-80" : "bg-blue-50/50 border-blue-200 shadow-sm"}`}
    >
      <div
        className="flex items-center justify-between border-b border-slate-200 pb-2 cursor-pointer"
        onClick={() => setShowCalibration(!showCalibration)}
      >
        <div className="flex items-center gap-1 min-w-0">
          <Settings
            size={16}
            className={`shrink-0 ${isCalibrated ? "text-slate-400" : "text-blue-600"}`}
          />
          <h2 className="text-sm font-bold uppercase tracking-tighter text-slate-700 whitespace-nowrap">
            1. Hiệu chuẩn hệ tọa độ
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
          <span className="text-slate-400 text-xs">
            {showCalibration ? "▼" : "▲"}
          </span>
        </div>
      </div>

      {showCalibration && (
        <div className="space-y-4 mt-2">
          {!isCalibrated && (
            <p className="text-xs text-slate-600 my-2">
              Áp 2 điểm mốc để quy đổi từ tọa độ ảnh sang Mét (VN-2000).
            </p>
          )}

          {/* Point 1 */}
          <div className="space-y-2 bg-white p-3 rounded-md border border-slate-200">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-700">
                📌 Điểm mốc 1
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
              <Input
                type="number"
                value={p1.realX}
                onChange={(e: any) => setP1({ ...p1, realX: e.target.value })}
                placeholder="X thật"
                disabled={isCalibrated}
              />
              <Input
                type="number"
                value={p1.realY}
                onChange={(e: any) => setP1({ ...p1, realY: e.target.value })}
                placeholder="Y thật"
                disabled={isCalibrated}
              />
            </div>
          </div>

          {/* Point 2 */}
          <div className="space-y-2 bg-white p-3 rounded-md border border-slate-200">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-700">
                📌 Điểm mốc 2
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
              <Input
                type="number"
                value={p2.realX}
                onChange={(e: any) => setP2({ ...p2, realX: e.target.value })}
                placeholder="X thật"
                disabled={isCalibrated}
              />
              <Input
                type="number"
                value={p2.realY}
                onChange={(e: any) => setP2({ ...p2, realY: e.target.value })}
                placeholder="Y thật"
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
