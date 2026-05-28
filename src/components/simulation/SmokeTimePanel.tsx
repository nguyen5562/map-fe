import { useState } from 'react';
import { Clock } from 'lucide-react';
import { Input } from '../ui/Input';

export const SmokeTimePanel = ({
  isCalibrated,
  smokeTime,
  setSmokeTime,
}: {
  isCalibrated: boolean;
  smokeTime: string;
  setSmokeTime: (val: string) => void;
}) => {
  const [showPanel, setShowPanel] = useState(true);

  return (
    <div
      className={`space-y-4 p-4 rounded-xl border bg-white border-slate-200 shadow-sm transition-opacity ${
        !isCalibrated ? 'opacity-30 pointer-events-none' : ''
      }`}
    >
      <div
        className="flex items-center justify-between border-b border-slate-200 pb-2 cursor-pointer"
        onClick={() => setShowPanel(!showPanel)}
      >
        <div className="flex items-center gap-2">
          <Clock size={18} className="text-violet-600" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            4. Thời gian thả khói
          </h2>
        </div>
        <span className="text-slate-400 text-xs">
          {showPanel ? '▼' : '▲'}
        </span>
      </div>

      {showPanel && (
        <div className="space-y-2 mt-2">
          <label className="text-xs font-semibold text-slate-500">
            Thời gian dự kiến
          </label>
          <div className="flex items-center gap-2">
            <Input
              value={smokeTime}
              onChange={(e: any) => setSmokeTime(e.target.value)}
              placeholder="Thời gian dự kiến"
            />
            <span className="text-sm text-slate-500 font-medium whitespace-nowrap">
              phút
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
