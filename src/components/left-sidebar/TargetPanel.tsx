import { Target, Crosshair, Search } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

export const TargetPanel = ({
  isCalibrated,
  currentRealCoords,
  searchX,
  setSearchX,
  searchY,
  setSearchY,
  handleSearch,
}: any) => {
  return (
    <div
      className={`space-y-4 p-4 rounded-xl border bg-white border-slate-200 shadow-sm transition-opacity ${!isCalibrated && "opacity-30 pointer-events-none"}`}
    >
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <Target size={18} className="text-slate-600" />
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
          8. Tìm điểm mục tiêu
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

        <div className="border-t border-slate-100"></div>

        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-600">
            Di chuyển đến tọa độ (m)
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <Input
              value={searchX}
              onChange={(e: any) => setSearchX(e.target.value)}
              placeholder="Nhập X..."
            />
            <Input
              value={searchY}
              onChange={(e: any) => setSearchY(e.target.value)}
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
