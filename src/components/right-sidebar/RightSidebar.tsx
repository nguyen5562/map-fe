import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileText,
  Map as MapIcon,
  Layers,
  Target,
  Clock,
  Crosshair,
  TriangleAlert,
  MapPin,
  BarChart3,
} from "lucide-react";
import { useSimulation } from "../../context/SimulationContext";

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

// Helper to determine the singular count unit from DB unit string
const getCountUnit = (config: any) => {
  if (!config) return "cái";
  const unit = (config.unit || "").toLowerCase();
  if (unit.includes("lít") || unit.includes("lit")) {
    return "xe";
  }
  return config.unit || "cái";
};

export const RightSidebar = () => {
  const isOpen = useSimulation((s) => s.isRightSidebarOpen);
  const setIsOpen = useSimulation((s) => s.setIsRightSidebarOpen);
  const pointsList = useSimulation((s) => s.pointsList);
  const selectedPointId = useSimulation((s) => s.selectedPointId);
  const rawResults = useSimulation((s) => s.results);
  const vehicleConfigs = useSimulation((s) => s.vehicleConfigs);

  const [activeTab, setActiveTab] = useState<"detail" | "summary">("detail");

  useEffect(() => {
    if (pointsList.length < 2) {
      setActiveTab("detail");
    }
  }, [pointsList.length]);

  const hasResults = rawResults
    ? Object.values(rawResults).some((v) => v !== undefined)
    : false;

  // Selected Point details
  const selectedPoint =
    pointsList.find((p) => p.id === selectedPointId) ||
    pointsList[pointsList.length - 1];

  // Selected vehicle info
  const selectedVehicleId = selectedPoint?.selectedVehicles?.[0] || "HPK-2.5";
  const selectedConfig =
    selectedPoint?.vehicleConfigs?.[selectedVehicleId] ||
    vehicleConfigs[selectedVehicleId];
  const countUnit = getCountUnit(selectedConfig);

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

        {/* Tab Selector (only shows if there are 2 or more points) */}
        {hasResults && pointsList.length >= 2 && (
          <div className="flex border-b border-slate-200 bg-slate-50/50 p-1 gap-1 flex-shrink-0">
            <button
              onClick={() => setActiveTab("detail")}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === "detail"
                  ? "bg-white text-blue-600 shadow-sm border border-slate-200"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/50"
              }`}
            >
              Chi tiết
            </button>
            <button
              onClick={() => setActiveTab("summary")}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === "summary"
                  ? "bg-white text-blue-600 shadow-sm border border-slate-200"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/50"
              }`}
            >
              Tổng hợp ({pointsList.length})
            </button>
          </div>
        )}

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

          {/* ── Tab: CHI TIẾT ── */}
          {hasResults && activeTab === "detail" && selectedPoint && (
            <>
              {/* Point Indicator Title */}
              <div className="px-1 text-[11px] font-bold text-blue-600 uppercase tracking-wide flex items-center gap-1.5">
                <MapPin size={13} className="text-blue-600 shrink-0" />
                <span>Đang xem:</span>
                <span className="underline">{selectedPoint.name}</span>
              </div>

              {/* 1. BỐ TRÍ TRẬN ĐỊA KHÓI */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm space-y-1">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2 mb-1">
                  <Layers size={15} className="text-blue-600" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                    Bố trí trận địa khói
                  </h3>
                </div>

                {selectedPoint.results.vehicleBreakdown ? (
                  Object.entries(selectedPoint.results.vehicleBreakdown).map(
                    ([vid, vres]: [string, any]) => {
                      const vConfig =
                        selectedPoint.vehicleConfigs?.[vid] ||
                        vehicleConfigs[vid];
                      const vUnit = getCountUnit(vConfig);
                      return (
                        <div
                          key={vid}
                          className="border-t border-slate-100 pt-2 mt-2 first:border-0 first:pt-0 first:mt-0"
                        >
                          <div className="text-[11.5px] font-bold text-slate-650 mb-1">
                            • {vConfig?.name || vid} ({vres.weight}%)
                          </div>
                          {vres.straightLine_vehicles > 0 && (
                            <>
                              <ResultRow
                                label="Số tuyến khói cần bố trí (N)"
                                value={vres.straightLine_routes}
                                unit="tuyến"
                              />
                              <ResultRow
                                label="Số PT bố trí trên 1 tuyến (A)"
                                value={vres.straightLine_vehicles}
                                unit={vUnit}
                              />
                            </>
                          )}
                          {vres.circularLine_vehicles > 0 && (
                            <>
                              <ResultRow
                                label="Số tuyến khói cần bố trí (N)"
                                value={vres.circularLine_routes}
                                unit="tuyến"
                              />
                              <ResultRow
                                label="Số PT bố trí trên 1 tuyến (A)"
                                value={vres.circularLine_vehicles}
                                unit={vUnit}
                              />
                            </>
                          )}
                          <ResultRow
                            label="Số PT phát khối trên 1 điểm (a = T/t)"
                            value={vres.pointVehicles}
                            unit={vUnit}
                          />
                        </div>
                      );
                    },
                  )
                ) : (
                  <>
                    {selectedPoint.results.straightLine_vehicles > 0 && (
                      <>
                        <GroupLabel>Tuyến thẳng</GroupLabel>
                        <ResultRow
                          label="Số tuyến khói cần bố trí (N)"
                          value={selectedPoint.results.straightLine_routes}
                          unit="tuyến"
                        />
                        <ResultRow
                          label="Số PT bố trí trên 1 tuyến (A)"
                          value={selectedPoint.results.straightLine_vehicles}
                          unit={countUnit}
                        />
                      </>
                    )}

                    {selectedPoint.results.circularLine_vehicles > 0 && (
                      <>
                        <GroupLabel>Tuyến hình vòng</GroupLabel>
                        <ResultRow
                          label="Số tuyến khói cần bố trí (N)"
                          value={selectedPoint.results.circularLine_routes}
                          unit="tuyến"
                        />
                        <ResultRow
                          label="Số PT bố trí trên 1 tuyến (A)"
                          value={selectedPoint.results.circularLine_vehicles}
                          unit={countUnit}
                        />
                      </>
                    )}

                    <ResultRow
                      label="Số PT phát khối trên 1 điểm (a = T/t)"
                      value={selectedPoint.results.pointVehicles}
                      unit={countUnit}
                      icon={<Crosshair size={14} />}
                    />
                  </>
                )}

                <div className="flex items-center justify-center pt-2">
                  <span className="text-slate-300 font-bold tracking-widest text-sm">
                    ✦ ✦ ✦
                  </span>
                </div>
              </div>

              {/* 2. TỔNG SỐ PTPK CẦN SỬ DỤNG */}
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/30 shadow-sm space-y-1">
                <div className="flex items-center gap-2 border-b border-amber-200 pb-2 mb-1">
                  <Target size={15} className="text-amber-600" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                    Tổng số PTPK cần sử dụng
                  </h3>
                </div>

                {selectedPoint.results.vehicleBreakdown ? (
                  <>
                    <ResultRow
                      label="Tổng số phương tiện (tất cả)"
                      value={selectedPoint.results.totalVehicles}
                      unit="phương tiện"
                      highlight
                    />
                    <div className="mt-2 pl-2 border-l-2 border-amber-300 space-y-1">
                      {Object.entries(
                        selectedPoint.results.vehicleBreakdown,
                      ).map(([vid, vres]: [string, any]) => {
                        const vConfig =
                          selectedPoint.vehicleConfigs?.[vid] ||
                          vehicleConfigs[vid];
                        const vUnit = getCountUnit(vConfig);
                        return (
                          <div
                            key={vid}
                            className="flex justify-between text-xs text-slate-650"
                          >
                            <span>
                              {vConfig?.name || vid} ({vres.weight}%):
                            </span>
                            <span className="font-bold text-slate-750">
                              {vres.totalVehicles} {vUnit}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <ResultRow
                    label={selectedConfig?.name || selectedVehicleId}
                    value={selectedPoint.results.totalVehicles}
                    unit={countUnit}
                    highlight
                  />
                )}

                <p className="text-[10px] text-slate-400 mt-1">
                  = A × N × hệ số dự phòng
                </p>
              </div>

              {/* 3. THỜI GIAN PHỦ MÀN KHÓI */}
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 shadow-sm space-y-1">
                <div className="flex items-center gap-2 border-b border-emerald-200 pb-2 mb-1">
                  <Clock size={15} className="text-emerald-600" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                    Thời gian phủ màn khói
                  </h3>
                </div>

                <ResultRow
                  label="Thời gian cần thiết để màn khói phủ kín mục tiêu"
                  value={selectedPoint.results.coverTime_min}
                  unit="phút"
                  highlight
                />
              </div>
            </>
          )}

          {/* ── Tab: TỔNG HỢP ── */}
          {hasResults && activeTab === "summary" && pointsList.length >= 2 && (
            <>
              {/* Summary Indicator Title */}
              <div className="px-1 text-[11px] font-bold text-indigo-650 uppercase tracking-wide flex items-center gap-1.5">
                <BarChart3 size={13} className="text-indigo-650 shrink-0" />
                <span>Đang xem:</span>
                <span className="underline">Tổng hợp toàn bộ các trận địa</span>
              </div>

              {/* 1. TỔNG SỐ PTPK CẦN SỬ DỤNG TOÀN BẢN ĐỒ */}
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/30 shadow-sm space-y-1">
                <div className="flex items-center gap-2 border-b border-amber-200 pb-2 mb-1">
                  <Target size={15} className="text-amber-600" />
                  <h3 className="text-sm font-bold uppercase tracking-tighter text-slate-700">
                    Tổng số PTPK toàn bản đồ
                  </h3>
                </div>

                <ResultRow
                  label="Tổng số phương tiện"
                  value={rawResults?.totalVehicles}
                  unit="phương tiện"
                  highlight
                />
                {rawResults?.vehicleBreakdown &&
                  Object.keys(rawResults.vehicleBreakdown).length > 0 && (
                    <div className="mt-2 pl-2 border-l-2 border-amber-300 space-y-1">
                      {Object.entries(rawResults.vehicleBreakdown).map(
                        ([vid, vres]: [string, any]) => {
                          const vConfig = vehicleConfigs[vid];
                          const vUnit = getCountUnit(vConfig);
                          return (
                            <div
                              key={vid}
                              className="flex justify-between text-xs text-slate-650"
                            >
                              <span>{vConfig?.name || vid}:</span>
                              <span className="font-bold text-slate-750">
                                {vres.totalVehicles} {vUnit}
                              </span>
                            </div>
                          );
                        },
                      )}
                    </div>
                  )}
              </div>

              {/* 2. PHÂN RÃ CHI TIẾT TỪNG TRẬN ĐỊA */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
                  Chi tiết từng trận địa
                </h3>

                {pointsList.map((p) => {
                  const joinedVehiclesName =
                    p.selectedVehicles?.length > 0
                      ? p.selectedVehicles
                          .map(
                            (vid: string) =>
                              (p.vehicleConfigs?.[vid] || vehicleConfigs[vid])
                                ?.name || vid,
                          )
                          .join(" + ")
                      : "HPK-2.5";

                  return (
                    <div
                      key={p.id}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5 text-[11px] shadow-sm hover:border-blue-300 transition-colors"
                    >
                      <div className="flex justify-between items-center border-b border-slate-200/60 pb-1 gap-1">
                        <span className="font-bold text-slate-800 shrink-0">
                          {p.name}
                        </span>
                        <span
                          className="font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded text-[10px] truncate max-w-[200px]"
                          title={joinedVehiclesName}
                        >
                          {joinedVehiclesName}
                        </span>
                      </div>

                      <div className="space-y-2 text-slate-650">
                        {p.results?.vehicleBreakdown ? (
                          Object.entries(p.results.vehicleBreakdown).map(
                            ([vid, vres]: [string, any]) => {
                              const vConfig =
                                p.vehicleConfigs?.[vid] || vehicleConfigs[vid];
                              const pCountUnit = getCountUnit(vConfig);
                              return (
                                <div
                                  key={vid}
                                  className="border-t border-slate-100/80 pt-1.5 first:border-0 first:pt-0"
                                >
                                  <div className="text-[10px] font-bold text-slate-500 mb-0.5">
                                    {vConfig?.name || vid} ({vres.weight}%)
                                  </div>
                                  {vres.straightLine_vehicles > 0 && (
                                    <>
                                      <div className="flex justify-between pl-1">
                                        <span>Số tuyến thẳng (N):</span>
                                        <span className="font-medium text-slate-750">
                                          {vres.straightLine_routes} tuyến
                                        </span>
                                      </div>
                                      <div className="flex justify-between pl-1">
                                        <span>Số PT/tuyến (A):</span>
                                        <span className="font-medium text-slate-750">
                                          {vres.straightLine_vehicles}{" "}
                                          {pCountUnit}
                                        </span>
                                      </div>
                                    </>
                                  )}
                                  {vres.circularLine_vehicles > 0 && (
                                    <>
                                      <div className="flex justify-between pl-1">
                                        <span>Số tuyến vòng (N):</span>
                                        <span className="font-medium text-slate-750">
                                          {vres.circularLine_routes} tuyến
                                        </span>
                                      </div>
                                      <div className="flex justify-between pl-1">
                                        <span>Số PT/tuyến (A):</span>
                                        <span className="font-medium text-slate-750">
                                          {vres.circularLine_vehicles}{" "}
                                          {pCountUnit}
                                        </span>
                                      </div>
                                    </>
                                  )}
                                  <div className="flex justify-between pl-1">
                                    <span>Số PT/điểm (a):</span>
                                    <span className="font-medium text-slate-750">
                                      {vres.pointVehicles} {pCountUnit}
                                    </span>
                                  </div>
                                  <div className="flex justify-between pl-1">
                                    <span>Tổng PT:</span>
                                    <span className="font-semibold text-amber-750">
                                      {vres.totalVehicles} {pCountUnit}
                                    </span>
                                  </div>
                                </div>
                              );
                            },
                          )
                        ) : (
                          // Fallback to single vehicle layout
                          <>
                            {p.results?.straightLine_vehicles > 0 && (
                              <>
                                <div className="flex justify-between">
                                  <span>Số tuyến thẳng (N):</span>
                                  <span className="font-medium text-slate-700">
                                    {p.results.straightLine_routes} tuyến
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Số PT/tuyến (A):</span>
                                  <span className="font-medium text-slate-700">
                                    {p.results.straightLine_vehicles}{" "}
                                    {getCountUnit(
                                      p.vehicleConfigs?.[
                                        p.selectedVehicles?.[0] || "HPK-2.5"
                                      ] ||
                                        vehicleConfigs[
                                          p.selectedVehicles?.[0] || "HPK-2.5"
                                        ],
                                    )}
                                  </span>
                                </div>
                              </>
                            )}
                            {p.results?.circularLine_vehicles > 0 && (
                              <>
                                <div className="flex justify-between">
                                  <span>Số tuyến vòng (N):</span>
                                  <span className="font-medium text-slate-700">
                                    {p.results.circularLine_routes} tuyến
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Số PT/tuyến (A):</span>
                                  <span className="font-medium text-slate-700">
                                    {p.results.circularLine_vehicles}{" "}
                                    {getCountUnit(
                                      p.vehicleConfigs?.[
                                        p.selectedVehicles?.[0] || "HPK-2.5"
                                      ] ||
                                        vehicleConfigs[
                                          p.selectedVehicles?.[0] || "HPK-2.5"
                                        ],
                                    )}
                                  </span>
                                </div>
                              </>
                            )}

                            <div className="flex justify-between">
                              <span>Số PT/điểm (a):</span>
                              <span className="font-medium text-slate-700">
                                {p.results?.pointVehicles}{" "}
                                {getCountUnit(
                                  p.vehicleConfigs?.[
                                    p.selectedVehicles?.[0] || "HPK-2.5"
                                  ] ||
                                    vehicleConfigs[
                                      p.selectedVehicles?.[0] || "HPK-2.5"
                                    ],
                                )}
                              </span>
                            </div>
                          </>
                        )}

                        <div className="flex justify-between border-t border-slate-200/60 pt-1 mt-1">
                          <span className="font-bold text-slate-755">
                            Tổng cộng PT:
                          </span>
                          <span className="font-bold text-amber-700">
                            {p.results?.totalVehicles} phương tiện
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Thời gian phủ lớn nhất:</span>
                          <span className="font-bold text-emerald-700">
                            {p.results?.coverTime_min} phút
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
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
