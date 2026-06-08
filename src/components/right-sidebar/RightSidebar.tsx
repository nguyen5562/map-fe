import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileText,
  Map as MapIcon,
  Layers,
  Target,
  Clock,
  Car,
  Box,
  Container,
  TriangleAlert,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
export type CalculationResults = {
  // Bố trí trận địa khói
  straightLine_vehicles?: number;
  straightLine_routes?: number;
  circularLine_vehicles?: number;
  circularLine_routes?: number;
  pointDefense_vehicles?: number;
  // Tổng số PTPK
  kh1_fuel_lit?: number;
  hpk_boxes?: number;
  tpk_cans?: number;
  // Thời gian
  coverTime_min?: number;
};

type RightSidebarProps = {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  results?: CalculationResults;
};

// ─── Helper: một hàng kết quả ─────────────────────────────────────────────────
const ResultRow = ({
  label,
  value,
  unit,
  icon,
  highlight,
}: {
  label: string;
  value?: number;
  unit?: string;
  icon?: React.ReactNode;
  highlight?: boolean;
}) => (
  <div
    className={`flex items-center gap-2 py-1.5 border-b border-slate-100 last:border-0 ${
      highlight ? "bg-emerald-50/60 -mx-2 px-2 rounded" : ""
    }`}
  >
    {icon && <span className="text-slate-400 flex-shrink-0">{icon}</span>}
    <span className="text-xs text-slate-600 leading-tight flex-1">{label}</span>
    <span
      className={`min-w-[56px] text-right text-sm font-bold border rounded px-1.5 py-0.5 flex-shrink-0 tabular-nums ${
        highlight
          ? "border-emerald-300 bg-emerald-100 text-emerald-800"
          : "border-slate-200 bg-slate-50 text-slate-800"
      }`}
    >
      {value ?? "-"}
    </span>
    {unit && (
      <span className="text-[10px] text-slate-400 w-16 flex-shrink-0">
        {unit}
      </span>
    )}
  </div>
);

// ─── Helper: tiêu đề nhóm nhỏ ────────────────────────────────────────────────
const GroupLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pt-2 pb-0.5">
    {children}
  </p>
);

// ─── Main component ───────────────────────────────────────────────────────────
export const RightSidebar = ({
  isOpen,
  setIsOpen,
  results = {},
}: RightSidebarProps) => {
  const hasResults = Object.values(results).some((v) => v !== undefined);

  return (
    <div
      className={`relative h-full transition-all duration-300 ease-in-out flex-shrink-0 z-[1001] ${
        isOpen ? "w-[340px]" : "w-0"
      }`}
    >
      {/* ── SIDEBAR CONTENT ── */}
      <div
        className={`absolute top-0 right-0 w-[340px] h-full bg-white border-l border-slate-200 flex flex-col shadow-sm transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-100/50 flex-shrink-0">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <ClipboardList size={14} />
            Kết quả tính toán
          </h2>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">

          {/* Empty state */}
          {!hasResults && (
            <div className="flex flex-col items-center justify-center py-10 text-slate-300">
              <TriangleAlert size={36} className="mb-2 opacity-50" />
              <p className="text-xs font-medium text-center text-slate-400">
                Chưa có kết quả
              </p>
              <p className="text-[11px] text-center mt-0.5 text-slate-300">
                Nhập thông số bên trái và nhấn TÍNH TOÁN
              </p>
            </div>
          )}

          {/* ── 1. BỐ TRÍ TRẬN ĐỊA KHÓI ── */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm space-y-1">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2 mb-1">
              <Layers size={15} className="text-blue-600" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                Bố trí trận địa khói
              </h3>
            </div>

            <GroupLabel>Tuyến thẳng</GroupLabel>
            <ResultRow
              label="Số phương tiện bố trí trên một tuyến"
              value={results.straightLine_vehicles}
              unit="xe/hộp"
            />
            <ResultRow
              label="Số tuyến cần bố trí"
              value={results.straightLine_routes}
              unit="tuyến"
            />

            <GroupLabel>Tuyến hình vòng</GroupLabel>
            <ResultRow
              label="Số PTPK bố trí trên 1 tuyến hình vòng"
              value={results.circularLine_vehicles}
              unit="xe/hộp"
            />
            <ResultRow
              label="Số tuyến hình vòng cần bố trí"
              value={results.circularLine_routes}
              unit="tuyến"
            />

            <GroupLabel>Theo điểm (khu vực)</GroupLabel>
            <ResultRow
              label="Số PTPK bố trí trên 1 điểm"
              value={results.pointDefense_vehicles}
              unit="xe/hộp"
            />

            <div className="flex items-center justify-center pt-2">
              <span className="text-slate-300 font-bold tracking-widest text-sm">
                ✦ ✦ ✦
              </span>
            </div>
          </div>

          {/* ── 2. TỔNG SỐ PTPK CẦN SỬ DỤNG ── */}
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/30 shadow-sm space-y-1">
            <div className="flex items-center gap-2 border-b border-amber-200 pb-2 mb-1">
              <Target size={15} className="text-amber-600" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                Tổng số PTPK cần sử dụng
              </h3>
            </div>

            <ResultRow
              label="Xe thả khói KH-1"
              value={results.kh1_fuel_lit}
              unit="lít (DO/FO)"
              icon={<Car size={14} />}
            />
            <ResultRow
              label="Hộp phát khói"
              value={results.hpk_boxes}
              unit="Hộp"
              icon={<Box size={14} />}
            />
            <ResultRow
              label="Thùng phát khói"
              value={results.tpk_cans}
              unit="Thùng"
              icon={<Container size={14} />}
            />
          </div>

          {/* ── 3. THỜI GIAN PHỦ MÀN KHÓI ── */}
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 shadow-sm space-y-1">
            <div className="flex items-center gap-2 border-b border-emerald-200 pb-2 mb-1">
              <Clock size={15} className="text-emerald-600" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                Thời gian phủ màn khói
              </h3>
            </div>

            <ResultRow
              label="Thời gian cần thiết để màn khói phủ kín mục tiêu"
              value={results.coverTime_min}
              unit="phút"
              highlight
            />
          </div>
        </div>

        {/* ── EXPORT BUTTONS ── */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/80 space-y-2 flex-shrink-0">
          <div className="grid grid-cols-2 gap-2">
            <button
              className="flex items-center justify-center gap-1.5 h-9 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm active:scale-[0.98]"
              disabled={!hasResults}
              title="Xuất báo cáo Word"
            >
              <FileText size={14} />
              XUẤT THUYẾT MINH
            </button>
            <button
              className="flex items-center justify-center gap-1.5 h-9 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm active:scale-[0.98]"
              disabled={!hasResults}
              title="Xuất bản đồ"
            >
              <MapIcon size={14} />
              XUẤT BẢN ĐỒ
            </button>
          </div>
          <p className="text-[10px] text-slate-400 text-center">
            {hasResults
              ? "Nhấn để xuất kết quả tính toán"
              : "Cần có kết quả trước khi xuất"}
          </p>
        </div>
      </div>

      {/* ── TOGGLE BUTTON ── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute top-1/2 -translate-y-1/2 left-[-24px] w-6 h-16 bg-white border border-r-0 border-slate-200 rounded-l-md shadow-md flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-blue-600 focus:outline-none z-[1002] transition-colors"
      >
        {isOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </div>
  );
};
