import {
  Target,
  Crosshair,
  Search,
  Ruler,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { useState } from "react";

import { useSimulation } from "../../context/SimulationContext";

export const TargetPanel = () => {
  const isCalibrated = useSimulation((s) => s.isCalibrated);
  const currentRealCoords = useSimulation((s) => s.currentRealCoords);
  const searchX = useSimulation((s) => s.searchX);
  const setSearchX = useSimulation((s) => s.setSearchX);
  const searchY = useSimulation((s) => s.searchY);
  const setSearchY = useSimulation((s) => s.setSearchY);
  const handleSearch = useSimulation((s) => s.handleSearch);
  const smokeLineLength = useSimulation((s) => s.smokeLineLength);
  const setSmokeLineLength = useSimulation((s) => s.setSmokeLineLength);
  const smokeMethodData = useSimulation((s) => s.smokeMethodData);
  const smokeLineDiameter = useSimulation((s) => s.smokeLineDiameter);
  const setSmokeLineDiameter = useSimulation((s) => s.setSmokeLineDiameter);
  const smokeLineWidth = useSimulation((s) => s.smokeLineWidth);
  const setSmokeLineWidth = useSimulation((s) => s.setSmokeLineWidth);
  const [showPanel, setShowPanel] = useState(true);
  return (
    <div
      className={`rounded-xl border bg-white border-slate-200 shadow-sm overflow-hidden transition-opacity ${!isCalibrated && "opacity-30 pointer-events-none"}`}
    >
      <button
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors"
        onClick={() => setShowPanel(!showPanel)}
      >
        <div className="flex items-center gap-2">
          <Target size={18} className="text-slate-600" />
          <h2 className="text-sm font-bold tracking-wide uppercase text-slate-700">
            4. Vị trí trận địa khói
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
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Crosshair size={14} className="text-slate-500" />
              <h3 className="text-xs font-bold text-slate-600">
                Tọa độ nhấp chuột trên bản đồ
              </h3>
            </div>
            <div className="bg-slate-50 rounded-lg border border-slate-200 p-3 shadow-inner">
              {currentRealCoords ? (
                <div className="space-y-2">
                  <div className="flex justify-between border-b pb-1 border-slate-200">
                    <span className="text-xs font-semibold text-slate-500">
                      X (Easting M)
                    </span>
                    <span className="font-mono text-sm font-bold text-blue-700">
                      {currentRealCoords.x.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs font-semibold text-slate-500">
                      Y (Northing M)
                    </span>
                    <span className="font-mono text-sm font-bold text-rose-600">
                      {currentRealCoords.y.toFixed(1)}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic text-center py-1">
                  Hãy nhấp chuột lên bản đồ
                </p>
              )}
            </div>
          </div>

          {/* Kích thước ký hiệu tuyến khói */}
          {smokeMethodData.lineType === "Thẳng" && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Ruler size={14} className="text-slate-500" />
                <h3 className="text-xs font-bold text-slate-600">
                  Độ dài ký hiệu tuyến khói (m)
                </h3>
              </div>
              <Input
                type="number"
                value={smokeLineLength}
                onChange={(e: any) => {
                  const val = e.target.value;
                  if (val === "") {
                    setSmokeLineLength("");
                  } else {
                    setSmokeLineLength(Number(val));
                  }
                }}
                placeholder="700"
              />
              <p className="text-[10px] text-slate-400">
                Mặc định: 700m. Thay đổi để điều chỉnh độ dài ký hiệu trên bản đồ.
              </p>
            </div>
          )}

          {smokeMethodData.lineType === "Vòng" && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Ruler size={14} className="text-slate-500" />
                <h3 className="text-xs font-bold text-slate-600">
                  Đường kính ký hiệu tuyến khói (m)
                </h3>
              </div>
              <Input
                type="number"
                value={smokeLineDiameter}
                onChange={(e: any) => {
                  const val = e.target.value;
                  if (val === "") {
                    setSmokeLineDiameter("");
                  } else {
                    setSmokeLineDiameter(Number(val));
                  }
                }}
                placeholder="700"
              />
              <p className="text-[10px] text-slate-400">
                Mặc định: 700m. Thay đổi để điều chỉnh đường kính ký hiệu trên bản đồ.
              </p>
            </div>
          )}

          {smokeMethodData.lineType === "Diện" && (
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Ruler size={14} className="text-slate-500" />
                  <h3 className="text-xs font-bold text-slate-600">
                    Chiều dài ký hiệu tuyến khói (m)
                  </h3>
                </div>
                <Input
                  type="number"
                  value={smokeLineLength}
                  onChange={(e: any) => {
                    const val = e.target.value;
                    if (val === "") {
                      setSmokeLineLength("");
                    } else {
                      setSmokeLineLength(Number(val));
                    }
                  }}
                  placeholder="700"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Ruler size={14} className="text-slate-500" />
                  <h3 className="text-xs font-bold text-slate-600">
                    Chiều rộng ký hiệu tuyến khói (m)
                  </h3>
                </div>
                <Input
                  type="number"
                  value={smokeLineWidth}
                  onChange={(e: any) => {
                    const val = e.target.value;
                    if (val === "") {
                      setSmokeLineWidth("");
                    } else {
                      setSmokeLineWidth(Number(val));
                    }
                  }}
                  placeholder="300"
                />
              </div>
              <p className="text-[10px] text-slate-400">
                Mặc định: 700m x 300m. Thay đổi để điều chỉnh kích thước ký hiệu diện tích trên bản đồ.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-600">
              Di chuyển đến tọa độ (m)
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                value={searchX}
                min={0}
                onChange={(e: any) => {
                  const val = e.target.value;
                  if (val === "" || parseFloat(val) >= 0) {
                    setSearchX(val);
                  }
                }}
                placeholder="Nhập X..."
              />
              <Input
                type="number"
                value={searchY}
                min={0}
                onChange={(e: any) => {
                  const val = e.target.value;
                  if (val === "" || parseFloat(val) >= 0) {
                    setSearchY(val);
                  }
                }}
                placeholder="Nhập Y..."
              />
            </div>
            <Button
              onClick={handleSearch}
              variant="success"
              className="w-full gap-2 font-bold shadow-md mt-1"
            >
              <Search size={16} /> Đi tới điểm
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
