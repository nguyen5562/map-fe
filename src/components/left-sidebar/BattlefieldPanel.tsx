import { useState } from "react";
import {
  Layers,
  ChevronDown,
  ChevronUp,
  MapPin,
  Flame,
  Eye,
  Shield,
} from "lucide-react";
import L from "leaflet";
import { Button } from "../ui/Button";
import { useSimulation } from "../../context/SimulationContext";

export type PositionEntry = {
  rawCoords: L.LatLng | null;
  distance: string; // metres, computed from center
  direction: string; // compass label
  bufferColor?: string;
};

export type BattlefieldData = {
  firePoints: PositionEntry;
  commandPost: PositionEntry;
  reserveUnit: PositionEntry;
};

// ── Compass helpers ────────────────────────────────────────────────────────────
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

export function angleToDirection(angleDeg: number): string {
  // Normalize angle to [0, 360)
  const a = ((angleDeg % 360) + 360) % 360;
  const idx = Math.round(a / 45) % 8;
  return DIRECTIONS[idx];
}

// ── Field config ──────────────────────────────────────────────────────────────
type BattlefieldKey = keyof BattlefieldData;

const FIELD_CONFIG: {
  key: BattlefieldKey;
  label: string;
  // SVG icon (inline) matching the military symbols from the brief
  symbolSvg: string;
  selectingKey: "firePoints" | "commandPost" | "reserveUnit";
}[] = [
  {
    key: "firePoints",
    label: "Vị trí điểm hỏa",
    // Hình 1: hình chữ nhật ngang + cột zíc zắc quay bên phải (chỉ viền đỏ)
    symbolSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="20" viewBox="0 0 52 40">
      <rect x="2" y="2" width="48" height="26" rx="1" fill="none" stroke="#ff0000" stroke-width="3"/>
      <path d="M 26,28 L 26,33 L 31,33 L 31,38" fill="none" stroke="#ff0000" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    selectingKey: "firePoints",
  },
  {
    key: "reserveUnit",
    label: "Vị trí bộ phận dự bị, bảo đảm",
    // Hình 2: TRÁI = + (nhỏ) trên đỉnh trái √; PHẢI = H trên đỉnh trái √ (chỉ viền đen)
    symbolSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="24" viewBox="0 0 72 48">
      <path d="M 12,22 L 16,32 L 22,14 L 32,14" fill="none" stroke="#000000" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
      <line x1="15" y1="14" x2="15" y2="20" stroke="#000000" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="12" y1="17" x2="18" y2="17" stroke="#000000" stroke-width="2.5" stroke-linecap="round"/>
      
      <path d="M 46,22 L 50,32 L 56,14 L 66,14" fill="none" stroke="#000000" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
      <line x1="46" y1="14" x2="46" y2="22" stroke="#000000" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="52" y1="14" x2="52" y2="22" stroke="#000000" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="46" y1="18" x2="52" y2="18" stroke="#000000" stroke-width="2.5"/>
    </svg>`,
    selectingKey: "reserveUnit",
  },
  {
    key: "commandPost",
    label: "Vị trí bộ phận chỉ huy",
    // Hình 3: TRÁI = tam giác + H bên trong; PHẢI = tam giác rỗng + cột đỉnh (chỉ viền đen)
    symbolSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="24" viewBox="0 0 72 48">
      <polygon points="18,4 34,44 2,44" fill="none" stroke="#000000" stroke-width="2.5" stroke-linejoin="round"/>
      <line x1="12" y1="24" x2="12" y2="36" stroke="#000000" stroke-width="2"/>
      <line x1="24" y1="24" x2="24" y2="36" stroke="#000000" stroke-width="2"/>
      <line x1="12" y1="30" x2="24" y2="30" stroke="#000000" stroke-width="2"/>
      <line x1="54" y1="2"  x2="54" y2="6"  stroke="#000000" stroke-width="2.5" stroke-linecap="round"/>
      <polygon points="54,6 70,44 38,44" fill="none" stroke="#000000" stroke-width="2.5" stroke-linejoin="round"/>
    </svg>`,
    selectingKey: "commandPost",
  },
];

// ── Panel component ───────────────────────────────────────────────────────────
export const BattlefieldPanel = () => {
  const isCalibrated = useSimulation((s) => s.isCalibrated);
  const battlefieldData = useSimulation((s) => s.battlefieldData);
  const battlefieldScale = useSimulation((s) => s.battlefieldScale);
  const setBattlefieldScale = useSimulation((s) => s.setBattlefieldScale);
  const isSelectingFor = useSimulation((s) => s.isSelectingFor);
  const setIsSelectingFor = useSimulation((s) => s.setIsSelectingFor);
  const commandPostLevel = useSimulation((s) => s.commandPostLevel);
  const setCommandPostLevel = useSimulation((s) => s.setCommandPostLevel);
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
          <p className="text-xs text-slate-400 mt-1">
            Chọn từng vị trí trực tiếp trên bản đồ.
          </p>

          {/* Tỉ lệ kích thước ký hiệu */}
          <div className="flex items-center justify-between bg-rose-50/50 rounded-lg border border-rose-100 p-2.5">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold text-slate-700">
                Tỉ lệ kích thước ký hiệu
              </span>
              <span className="text-[10px] text-slate-400">
                Mặc định là 1 (từ 0.1 trở lên)
              </span>
            </div>
            <input
              type="number"
              min="0.1"
              step="0.1"
              value={battlefieldScale}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val)) {
                  setBattlefieldScale(Math.max(0.1, val));
                }
              }}
              className="w-16 h-8 text-center text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {FIELD_CONFIG.map(({ key, label, selectingKey }) => {
            const entry = battlefieldData[key] as PositionEntry;
            const isSelecting = isSelectingFor === selectingKey;
            const hasCoords = entry.rawCoords !== null;

            // Get the old label icon
            let labelIcon = null;
            if (key === "firePoints") {
              labelIcon = (
                <Flame size={14} className="text-orange-500 shrink-0" />
              );
            } else if (key === "commandPost") {
              labelIcon = <Eye size={14} className="text-blue-500 shrink-0" />;
            } else if (key === "reserveUnit") {
              labelIcon = (
                <Shield size={14} className="text-emerald-500 shrink-0" />
              );
            }

            return (
              <div
                key={key}
                className="bg-slate-50 rounded-lg border border-slate-200 p-3 space-y-2"
              >
                {/* Label + button row */}
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                    {labelIcon}
                    {label}
                  </label>
                  <Button
                    variant={isSelecting ? "primary" : "outline"}
                    className="h-7 text-xs px-2 shrink-0"
                    onClick={(e: any) => {
                      e.stopPropagation();
                      setIsSelectingFor(
                        isSelecting ? null : (selectingKey as any),
                      );
                    }}
                  >
                    <MapPin size={11} className="mr-1" />
                    {isSelecting
                      ? "Đang chọn..."
                      : hasCoords
                        ? "Chọn lại"
                        : "Chọn"}
                  </Button>
                </div>

                {/* Info display: distance + direction */}
                {hasCoords ? (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-slate-400 font-medium">
                        Cách (m)
                      </span>
                      <div className="h-8 rounded-md border border-slate-200 bg-white px-2 flex items-center text-xs font-semibold text-slate-700">
                        {entry.distance}
                      </div>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-slate-400 font-medium">
                        Hướng
                      </span>
                      <div className="h-8 rounded-md border border-slate-200 bg-white px-2 flex items-center text-xs font-semibold text-slate-700">
                        {entry.direction}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-8 rounded-md border border-dashed border-slate-300 bg-white flex items-center justify-center">
                    <span className="text-xs text-slate-400">
                      Chưa chọn vị trí
                    </span>
                  </div>
                )}

                {/* Màu đệm của riêng ký hiệu này */}
                <div className="flex flex-col gap-1.5 pt-1.5 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 font-medium">
                    Màu đệm (viền)
                  </span>
                  <div className="grid grid-cols-6 gap-1 justify-items-center">
                    {[
                      { value: "none", label: "Không", class: "bg-slate-100 border-slate-300" },
                      { value: "#ef4444", label: "Đỏ", class: "bg-[#ef4444]" },
                      { value: "#f97316", label: "Cam", class: "bg-[#f97316]" },
                      { value: "#eab308", label: "Vàng", class: "bg-[#eab308]" },
                      { value: "#84cc16", label: "Lá mạ", class: "bg-[#84cc16]" },
                      { value: "#22c55e", label: "Lá cây", class: "bg-[#22c55e]" },
                      { value: "#0d9488", label: "Teal", class: "bg-[#0d9488]" },
                      { value: "#06b6d4", label: "Xanh lơ", class: "bg-[#06b6d4]" },
                      { value: "#3b82f6", label: "Xanh biển", class: "bg-[#3b82f6]" },
                      { value: "#a855f7", label: "Tím", class: "bg-[#a855f7]" },
                      { value: "#ec4899", label: "Hồng", class: "bg-[#ec4899]" },
                      { value: "#6b7280", label: "Xám", class: "bg-[#6b7280]" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        title={opt.label}
                        onClick={() =>
                          setBattlefieldData({
                            ...battlefieldData,
                            [key]: {
                              ...entry,
                              bufferColor: opt.value,
                            },
                          })
                        }
                        className={`w-5 h-5 rounded-full ${opt.class} border transition-all relative flex items-center justify-center ${
                          (entry.bufferColor || "none") === opt.value
                            ? "border-slate-800 scale-110 shadow-sm ring-1 ring-offset-0.5 ring-slate-400"
                            : "border-slate-200 hover:scale-105"
                        }`}
                      >
                        {(entry.bufferColor || "none") === opt.value && (
                          <span className={`w-1 h-1 rounded-full ${opt.value === "#ffffff" ? "bg-black" : "bg-white"}`} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Level selector - only for commandPost */}
                {key === "commandPost" && (
                  <div className="flex flex-col gap-1.5 pt-1 border-t border-slate-100">
                    <span className="text-[10px] text-slate-400 font-medium">
                      Cấp chỉ huy
                    </span>
                    <div className="flex gap-1">
                      {(["squad", "platoon", "company"] as const).map((lvl) => (
                        <button
                          key={lvl}
                          onClick={() => setCommandPostLevel(lvl)}
                          className={`flex-1 h-7 text-[10px] font-semibold rounded-md border transition-colors ${
                            commandPostLevel === lvl
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white text-slate-500 border-slate-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"
                          }`}
                        >
                          {lvl === "squad"
                            ? "Tiểu đội"
                            : lvl === "platoon"
                              ? "Trung đội"
                              : "Đại đội"}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
