import { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';
import { Input } from '../ui/Input';

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

  // Auto-calculate area when length and width change
  useEffect(() => {
    const l = parseFloat(targetDefenseData.length);
    const w = parseFloat(targetDefenseData.width);
    if (!isNaN(l) && !isNaN(w) && l > 0 && w > 0) {
      setTargetDefenseData({
        ...targetDefenseData,
        area: (l * w).toFixed(0),
      });
    }
  }, [targetDefenseData.length, targetDefenseData.width]);

  return (
    <div
      className={`space-y-4 p-4 rounded-xl border bg-white border-slate-200 shadow-sm transition-opacity ${
        !isCalibrated ? 'opacity-30 pointer-events-none' : ''
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
        <span className="text-slate-400 text-xs">
          {showPanel ? '▼' : '▲'}
        </span>
      </div>

      {showPanel && (
        <div className="space-y-3 mt-2">
          {/* Mục tiêu bảo vệ */}
          <div>
            <label className="text-xs font-semibold text-slate-500">
              Mục tiêu bảo vệ
            </label>
            <select
              value={targetDefenseData.targetType}
              onChange={(e) =>
                setTargetDefenseData({
                  ...targetDefenseData,
                  targetType: e.target.value,
                })
              }
              className="flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold mt-1"
            >
              <option value="Trận địa hỏa lực">Trận địa hỏa lực</option>
              <option value="Sở chỉ huy">Sở chỉ huy</option>
              <option value="Kho tàng">Kho tàng</option>
              <option value="Cầu đường">Cầu đường</option>
              <option value="Bến vượt">Bến vượt</option>
              <option value="Trận địa tên lửa">Trận địa tên lửa</option>
              <option value="Đội hình hành quân">Đội hình hành quân</option>
              <option value="Khác">Khác</option>
            </select>
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
              placeholder="Trận địa hỏa lực"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Tự tính = Dài × Rộng, hoặc nhập thủ công
            </p>
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
                = {(
                  parseFloat(targetDefenseData.area) *
                  parseFloat(targetDefenseData.coverageMultiplier)
                ).toLocaleString()}{' '}
                m²
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
