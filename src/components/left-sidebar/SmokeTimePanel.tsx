import { useState } from "react";
import { Clock } from "lucide-react";

export type SmokeTimeRange = {
  fromH: string;
  fromM: string;
  toH: string;
  toM: string;
};

const TimeInput = ({
  value,
  onChange,
  max,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  max: number;
  placeholder: string;
}) => (
  <input
    type="number"
    min={0}
    max={max}
    value={value}
    onChange={(e) => {
      const v = e.target.value;
      if (v === "" || (Number(v) >= 0 && Number(v) <= max)) onChange(v);
    }}
    placeholder={placeholder}
    className="w-12 h-9 text-center rounded-md border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
  />
);

export const SmokeTimePanel = ({
  isCalibrated,
  smokeTime,
  setSmokeTime,
}: {
  isCalibrated: boolean;
  smokeTime: SmokeTimeRange;
  setSmokeTime: (val: SmokeTimeRange) => void;
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
          <Clock size={18} className="text-violet-600" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            5. Thời gian thả khói
          </h2>
        </div>
        <span className="text-slate-400 text-xs">{showPanel ? "▼" : "▲"}</span>
      </div>

      {showPanel && (
        <div className="space-y-2 mt-2">
          <label className="text-xs font-semibold text-slate-500">
            Thời gian dự kiến
          </label>
          <div className="flex items-center gap-1.5">
            {/* Từ */}
            <span className="text-xs text-slate-400 font-medium">Từ</span>
            <TimeInput
              value={smokeTime.fromH}
              onChange={(v) => setSmokeTime({ ...smokeTime, fromH: v })}
              max={23}
              placeholder="00"
            />
            <span className="text-slate-400 font-bold">:</span>
            <TimeInput
              value={smokeTime.fromM}
              onChange={(v) => setSmokeTime({ ...smokeTime, fromM: v })}
              max={59}
              placeholder="00"
            />

            {/* Đến */}
            <span className="text-xs text-slate-400 font-medium ml-1">đến</span>
            <TimeInput
              value={smokeTime.toH}
              onChange={(v) => setSmokeTime({ ...smokeTime, toH: v })}
              max={23}
              placeholder="00"
            />
            <span className="text-slate-400 font-bold">:</span>
            <TimeInput
              value={smokeTime.toM}
              onChange={(v) => setSmokeTime({ ...smokeTime, toM: v })}
              max={59}
              placeholder="00"
            />
          </div>

          {/* Hiển thị tổng thời gian */}
          {smokeTime.fromH !== "" && smokeTime.toH !== "" && (() => {
            const from = Number(smokeTime.fromH) * 60 + Number(smokeTime.fromM || 0);
            const to = Number(smokeTime.toH) * 60 + Number(smokeTime.toM || 0);
            const diff = to - from;
            if (diff > 0)
              return (
                <p className="text-[10px] text-slate-400 mt-1">
                  Tổng:{" "}
                  <span className="font-semibold text-violet-600">
                    {Math.floor(diff / 60) > 0 ? `${Math.floor(diff / 60)} giờ ` : ""}
                    {diff % 60} phút
                  </span>
                </p>
              );
            return null;
          })()}
        </div>
      )}
    </div>
  );
};
