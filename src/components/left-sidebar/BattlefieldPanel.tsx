import { useState } from "react";
import { Layers } from "lucide-react";
import { Input } from "../ui/Input";

const DIRECTIONS = ["Bắc", "Đông Bắc", "Đông", "Đông Nam", "Nam", "Tây Nam", "Tây", "Tây Bắc"];

type PositionEntry = {
  distance: string;
  direction: string;
};

type BattlefieldData = {
  routes: string;
  firePoints: PositionEntry;
  commandPost: PositionEntry;
  reserveUnit: PositionEntry;
};

const PositionInput = ({
  value,
  onChange,
}: {
  value: PositionEntry;
  onChange: (v: PositionEntry) => void;
}) => (
  <div className="mt-1 space-y-1.5">
    <p className="text-xs text-slate-400">Cách trung tâm trận địa khói:</p>
    <div className="grid gap-x-1" style={{ gridTemplateColumns: "4fr 5fr" }}>
      <div className="flex items-center gap-1">
        <span className="text-xs text-slate-400 shrink-0">cách</span>
        <input
          type="number"
          min={0}
          value={value.distance}
          onChange={(e) => onChange({ ...value, distance: e.target.value })}
          placeholder="0"
          className="w-full h-9 text-center rounded-md border border-slate-300 bg-white text-sm px-2 focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <span className="text-xs text-slate-400 shrink-0">m,</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-xs text-slate-400 shrink-0">hướng</span>
        <select
          value={value.direction}
          onChange={(e) => onChange({ ...value, direction: e.target.value })}
          className="w-full h-9 rounded-md border border-slate-300 bg-white px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {DIRECTIONS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>
    </div>
  </div>
);

export type { BattlefieldData };

export const BattlefieldPanel = ({
  isCalibrated,
  battlefieldData,
  setBattlefieldData,
}: {
  isCalibrated: boolean;
  battlefieldData: BattlefieldData;
  setBattlefieldData: (data: BattlefieldData) => void;
}) => {
  const [showPanel, setShowPanel] = useState(true);

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
          <Layers size={18} className="text-rose-600" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            8. Thành phần, cấu trúc trận địa khói
          </h2>
        </div>
        <span className="text-slate-400 text-xs">{showPanel ? "▼" : "▲"}</span>
      </div>

      {showPanel && (
        <div className="space-y-3 mt-2">
          {/* Các tuyến — giữ nguyên nhập text */}
          <div>
            <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
              <span>📍</span> Các tuyến (diện)
            </label>
            <Input
              value={battlefieldData.routes}
              onChange={(e: any) =>
                setBattlefieldData({ ...battlefieldData, routes: e.target.value })
              }
              placeholder="Nhập số tuyến..."
            />
          </div>

          {/* Vị trí điểm hỏa */}
          <div>
            <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
              <span>🔥</span> Vị trí điểm hỏa
            </label>
            <PositionInput
              value={battlefieldData.firePoints}
              onChange={(v) => setBattlefieldData({ ...battlefieldData, firePoints: v })}
            />
          </div>

          {/* Vị trí chỉ huy, quan sát */}
          <div>
            <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
              <span>🎖️</span> Vị trí chỉ huy, quan sát
            </label>
            <PositionInput
              value={battlefieldData.commandPost}
              onChange={(v) => setBattlefieldData({ ...battlefieldData, commandPost: v })}
            />
          </div>

          {/* Vị trí bộ phận dự bị, bảo đảm */}
          <div>
            <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
              <span>🛡️</span> Vị trí bộ phận dự bị, bảo đảm
            </label>
            <PositionInput
              value={battlefieldData.reserveUnit}
              onChange={(v) => setBattlefieldData({ ...battlefieldData, reserveUnit: v })}
            />
          </div>
        </div>
      )}
    </div>
  );
};
