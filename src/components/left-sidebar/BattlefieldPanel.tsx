import { useState } from "react";
import { Layers, Calculator } from "lucide-react";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";

type BattlefieldData = {
  routes: string;
  firePoints: string;
  commandPost: string;
  reserveUnit: string;
};

export const BattlefieldPanel = ({
  isCalibrated,
  battlefieldData,
  setBattlefieldData,
  onCalculate,
}: {
  isCalibrated: boolean;
  battlefieldData: BattlefieldData;
  setBattlefieldData: (data: BattlefieldData) => void;
  onCalculate: () => void;
}) => {
  const [showPanel, setShowPanel] = useState(true);

  const fields = [
    {
      key: "routes" as const,
      label: "Các tuyến (điện)",
      placeholder: "Nhập số tuyến...",
      icon: "📍",
    },
    {
      key: "firePoints" as const,
      label: "Vị trí điểm hỏa",
      placeholder: "Nhập vị trí điểm hỏa...",
      icon: "🔥",
    },
    {
      key: "commandPost" as const,
      label: "Vị trí chỉ huy, quan sát",
      placeholder: "Nhập vị trí chỉ huy...",
      icon: "🎖️",
    },
    {
      key: "reserveUnit" as const,
      label: "Vị trí bộ phận dự bị, bảo đảm",
      placeholder: "Nhập vị trí dự bị...",
      icon: "🛡️",
    },
  ];

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
            7. Thành phần, cấu trúc trận địa khói
          </h2>
        </div>
        <span className="text-slate-400 text-xs">{showPanel ? "▼" : "▲"}</span>
      </div>

      {showPanel && (
        <div className="space-y-3 mt-2">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                <span>{f.icon}</span> {f.label}
              </label>
              <Input
                value={battlefieldData[f.key]}
                onChange={(e: any) =>
                  setBattlefieldData({
                    ...battlefieldData,
                    [f.key]: e.target.value,
                  })
                }
                placeholder={f.placeholder}
              />
            </div>
          ))}

          {/* TÍNH TOÁN Button */}
          <Button
            onClick={onCalculate}
            variant="danger"
            className="w-full mt-3 font-bold shadow-lg text-base py-2.5 tracking-wide"
          >
            <Calculator size={20} className="mr-2" />
            TÍNH TOÁN
          </Button>
        </div>
      )}
    </div>
  );
};
