import { Target, Crosshair, Search, Ruler } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

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
  return (
    <div
      className={`space-y-4 p-4 rounded-xl border bg-white border-slate-200 shadow-sm transition-opacity ${!isCalibrated && "opacity-30 pointer-events-none"}`}
    >
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <Target size={18} className="text-slate-600" />
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
          4. Chọn vị trí trận địa khói
        </h2>
      </div>

      <div className="space-y-4 mt-2">
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

        {/* Độ dài ký hiệu tuyến khói */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Ruler size={14} className="text-slate-500" />
            <h3 className="text-xs font-bold text-slate-600">
              Độ dài ký hiệu tuyến khói (m)
            </h3>
          </div>
          <Input
            type="number"
            min={100}
            value={smokeLineLength}
            onChange={(e: any) => {
              const val = e.target.value;
              if (val === "") {
                setSmokeLineLength(700);
                return;
              }
              let num = Number(val);
              if (num < 100) num = 100;
              setSmokeLineLength(num);
            }}
            placeholder="700"
          />
          <p className="text-[10px] text-slate-400">
            Mặc định: 700m. Thay đổi để điều chỉnh độ dài ký hiệu trên bản đồ.
          </p>
        </div>

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
    </div>
  );
};
