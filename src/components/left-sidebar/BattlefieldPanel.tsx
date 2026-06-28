import { useState } from "react";
import {
  Layers,
  Flame,
  Eye,
  Shield,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Input } from "../ui/Input";

const DIRECTIONS = [
  "Bắc",
  "Đông Bắc",
  "Đông",
  "Đông Nam",
  "Nam",
  "Tây Nam",
  "Tây",
  "Tây Bắc",
];

type PositionEntry = {
  distance: string;
  direction: string;
};

type BattlefieldData = {
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
        <Input
          type="number"
          min={0}
          value={value.distance}
          onChange={(e: any) => {
            const val = e.target.value;
            if (val === "" || parseFloat(val) >= 0) {
              onChange({ ...value, distance: val });
            }
          }}
          placeholder="0"
          className="text-center"
        />
        <span className="text-xs text-slate-400 shrink-0">m,</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-xs text-slate-400 shrink-0">hướng</span>
        <select
          value={value.direction}
          onChange={(e) => onChange({ ...value, direction: e.target.value })}
          className="w-full h-9 rounded-lg border border-slate-300 bg-white px-2 text-sm font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 transition-all"
        >
          {DIRECTIONS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>
    </div>
  </div>
);

export type { BattlefieldData };

import { useSimulation } from "../../context/SimulationContext";

export const BattlefieldPanel = () => {
  const isCalibrated = useSimulation((s) => s.isCalibrated);
  const battlefieldData = useSimulation((s) => s.battlefieldData);
  const setBattlefieldData = useSimulation((s) => s.setBattlefieldData);
  const [showPanel, setShowPanel] = useState(true);

  return (
    <div
      className={`rounded-xl border bg-white border-slate-200 shadow-sm overflow-hidden transition-opacity ${
        !isCalibrated ? "opacity-30 pointer-events-none" : ""
      }`}
    >
      {/* Header */}
      <button
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors"
        onClick={() => setShowPanel(!showPanel)}
      >
        <div className="flex items-center gap-2">
          <Layers size={18} className="text-rose-600" />
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">
            8. cấu trúc trận địa khói
          </h2>
        </div>
        {showPanel ? (
          <ChevronUp size={14} className="text-slate-400" />
        ) : (
          <ChevronDown size={14} className="text-slate-400" />
        )}
      </button>

      {showPanel && (
        <div className="px-4 pb-4 pt-2 space-y-3">
          {/* Vị trí điểm hỏa */}
          <div>
            <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
              <Flame size={14} className="text-orange-500" /> Vị trí điểm hỏa
            </label>
            <PositionInput
              value={battlefieldData.firePoints}
              onChange={(v) =>
                setBattlefieldData({ ...battlefieldData, firePoints: v })
              }
            />
          </div>

          {/* Vị trí chỉ huy, quan sát */}
          <div>
            <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
              <Eye size={14} className="text-blue-500" /> Vị trí chỉ huy, quan
              sát
            </label>
            <PositionInput
              value={battlefieldData.commandPost}
              onChange={(v) =>
                setBattlefieldData({ ...battlefieldData, commandPost: v })
              }
            />
          </div>

          {/* Vị trí bộ phận dự bị, bảo đảm */}
          <div>
            <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
              <Shield size={14} className="text-emerald-500" /> Vị trí bộ phận
              dự bị, bảo đảm
            </label>
            <PositionInput
              value={battlefieldData.reserveUnit}
              onChange={(v) =>
                setBattlefieldData({ ...battlefieldData, reserveUnit: v })
              }
            />
          </div>
        </div>
      )}
    </div>
  );
};
