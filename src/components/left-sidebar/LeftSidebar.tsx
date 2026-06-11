import {
  Map as MapIcon,
  CheckCircle2,
  UploadCloud,
  MapPinned,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Calculator,
  Plus,
  Edit3,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import type { SmokeTimeRange } from "./SmokeTimePanel";
import { CalibrationPanel } from "./CalibrationPanel";
import { TargetDefensePanel } from "./TargetDefensePanel";
import { WeatherPanel } from "./WeatherPanel";
import { SmokeTimePanel } from "./SmokeTimePanel";
import { SmokeMethodPanel } from "./SmokeMethodPanel";
import { SmokeVehiclePanel, type VehicleConfig } from "./SmokeVehiclePanel";
import { BattlefieldPanel } from "./BattlefieldPanel";
import { TargetPanel } from "./TargetPanel";
import { UploadProgressDialog } from "./UploadProgressDialog";
import { PointsListPanel } from "./PointsListPanel";


type LeftSidebarProps = {
  // Sidebar toggle
  isSidebarOpen: boolean;
  setIsSidebarOpen: (v: boolean) => void;

  // Map library
  maps: any[];
  currentMap: any;
  setCurrentMap: (m: any) => void;
  isUploading: boolean;
  uploadProgress: number;
  handleUpload: (e: any) => void;
  handleUploadFile: (file: File) => void;
  onRenameMap: (mapId: string, name: string) => void;

  // Calibration
  isCalibrated: boolean;
  setIsCalibrated: (v: boolean) => void;
  showCalibration: boolean;
  setShowCalibration: (v: boolean) => void;
  p1: any;
  setP1: (v: any) => void;
  p2: any;
  setP2: (v: any) => void;
  isSelectingFor: "p1" | "p2" | null;
  setIsSelectingFor: (v: "p1" | "p2" | null) => void;
  calculateCalibration: () => void;

  // Target Defense (Mục 2)
  targetDefenseData: any;
  setTargetDefenseData: (v: any) => void;

  // Weather (Mục 3)
  showWeather: boolean;
  setShowWeather: (v: boolean) => void;
  weatherActive: boolean;
  setWeatherActive: (v: boolean) => void;
  weatherData: any;
  setWeatherData: (v: any) => void;

  // Smoke Time (Mục 4)
  smokeTime: SmokeTimeRange;
  setSmokeTime: (v: SmokeTimeRange) => void;

  // Smoke Method (Mục 5)
  smokeMethodData: any;
  setSmokeMethodData: (v: any) => void;

  // Smoke Vehicle (Mục 6)
  selectedVehicles: string[];
  setSelectedVehicles: (v: string[]) => void;
  vehicleConfigs: Record<string, VehicleConfig>;
  setVehicleConfigs: React.Dispatch<React.SetStateAction<Record<string, VehicleConfig>>>;

  // Battlefield (Mục 7)
  battlefieldData: any;
  setBattlefieldData: (v: any) => void;
  onCalculate: () => void;
  pointsList: any[];
  onDeletePoint: (id: string) => void;
  onAddPoint: () => void;
  onRenamePoint: (id: string, name: string) => void;
  selectedPointId: string | null;
  onSelectPoint: (id: string) => void;

  // Target / Search (Mục 8)
  currentRealCoords: { x: number; y: number } | null;
  searchX: string;
  setSearchX: (v: string) => void;
  searchY: string;
  setSearchY: (v: string) => void;
  handleSearch: () => void;
};

export const LeftSidebar = ({
  isSidebarOpen,
  setIsSidebarOpen,
  maps,
  currentMap,
  setCurrentMap,
  isUploading,
  uploadProgress,
  handleUploadFile,
  onRenameMap,
  isCalibrated,
  setIsCalibrated,
  showCalibration,
  setShowCalibration,
  p1,
  setP1,
  p2,
  setP2,
  isSelectingFor,
  setIsSelectingFor,
  calculateCalibration,
  targetDefenseData,
  setTargetDefenseData,
  showWeather,
  setShowWeather,
  weatherActive,
  setWeatherActive,
  weatherData,
  setWeatherData,
  smokeTime,
  setSmokeTime,
  smokeMethodData,
  setSmokeMethodData,
  selectedVehicles,
  setSelectedVehicles,
  vehicleConfigs,
  setVehicleConfigs,
  battlefieldData,
  setBattlefieldData,
  onCalculate,
  pointsList,
  onDeletePoint,
  onAddPoint,
  onRenamePoint,
  selectedPointId,
  onSelectPoint,
  currentRealCoords,
  searchX,
  setSearchX,
  searchY,
  setSearchY,
  handleSearch,
}: LeftSidebarProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showProgress, setShowProgress] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [isMapDropdownOpen, setIsMapDropdownOpen] = useState(false);

  // Rename modal state
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [newMapName, setNewMapName] = useState("");

  const handleSaveRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMapName.trim() !== "") {
      onRenameMap(currentMap.id, newMapName.trim());
      setRenameModalOpen(false);
    }
  };

  const handleFileChosen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFileName(file.name);
    setShowProgress(true);
    handleUploadFile(file);
    // Reset input để có thể chọn lại cùng file
    e.target.value = "";
  };

  return (
    <div
      className={`relative h-full transition-all duration-300 ease-in-out flex-shrink-0 z-[1001] ${
        isSidebarOpen ? "w-[340px]" : "w-0"
      }`}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg"
        className="hidden"
        onChange={handleFileChosen}
        disabled={isUploading}
      />

      {/* Progress Dialog — hiện sau khi chọn file */}
      <UploadProgressDialog
        isOpen={showProgress}
        onClose={() => setShowProgress(false)}
        fileName={uploadedFileName}
        isUploading={isUploading}
        uploadProgress={uploadProgress}
        mapStatus={currentMap?.status}
      />

      {/* SIDEBAR CONTENT */}
      <div
        className={`absolute top-0 left-0 w-[340px] h-full bg-white border-r border-slate-200 flex flex-col shadow-sm transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* ── Map Library Header ── */}
        <div className="p-4 border-b border-slate-200 bg-slate-100/50">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1">
            <MapPinned size={14} /> Thư viện Bản đồ
          </h2>

          {/* Dropdown chọn bản đồ custom */}
          <div className="relative mb-2">
            <div className="flex gap-2 items-center">
              <button
                onClick={() => setIsMapDropdownOpen(!isMapDropdownOpen)}
                className="flex h-9 flex-1 items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-1 text-sm font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-left transition-all"
              >
                <span className="truncate">
                  {currentMap?.name ? `${currentMap.name} ${currentMap.status !== "ready" ? "(Đang xử lý...)" : ""}` : "Chọn một bản đồ..."}
                </span>
                <ChevronDown size={14} className="text-slate-400 shrink-0 ml-1" />
              </button>

              {currentMap && (
                <button
                  type="button"
                  onClick={() => {
                    setNewMapName(currentMap.name);
                    setRenameModalOpen(true);
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-350 bg-white hover:bg-slate-50 text-slate-600 hover:text-blue-600 transition-colors shadow-sm shrink-0"
                  title="Đổi tên bản đồ"
                >
                  <Edit3 size={14} />
                </button>
              )}
            </div>
            
            {isMapDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-30" 
                  onClick={() => setIsMapDropdownOpen(false)} 
                />
                <div className="absolute left-0 right-0 mt-1 max-h-60 overflow-auto rounded-lg border border-slate-250 bg-white py-1 shadow-lg z-40">
                  {maps.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        setCurrentMap(m);
                        setIsMapDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-slate-50 transition-colors flex items-center justify-between ${
                        currentMap?.id === m.id ? "bg-slate-50/70 font-semibold text-blue-600" : "text-slate-700"
                      }`}
                    >
                      <span className="truncate">{m.name}</span>
                      {m.status !== "ready" && (
                        <span className="text-[10px] text-amber-500 font-medium shrink-0 ml-1">(Đang xử lý...)</span>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Nút Tải lên — click thẳng vào file picker */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full flex items-center justify-center gap-2 h-9 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            style={{
              background: isUploading
                ? "#e2e8f0"
                : "linear-gradient(135deg, #1d4ed8, #3b82f6)",
              color: isUploading ? "#94a3b8" : "#ffffff",
              border: "none",
              boxShadow: isUploading
                ? "none"
                : "0 2px 8px rgba(59,130,246,0.25)",
              letterSpacing: "0.01em",
            }}
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <UploadCloud size={15} />
                Tải lên bản đồ mới
              </>
            )}
          </button>
        </div>

        {/* ── Status Header ── */}
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${isCalibrated ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}
            >
              <MapIcon size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">
                Tính toán Khí tài phát khói
              </h1>
              <p className="text-sm font-medium flex items-center gap-1">
                Trạng thái:{" "}
                {isCalibrated ? (
                  <span className="text-emerald-600 flex items-center">
                    <CheckCircle2 size={14} className="mr-1" /> Đã hiệu chuẩn
                  </span>
                ) : (
                  <span className="text-rose-600 font-bold">
                    Cần hiệu chuẩn
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* ── Scrollable Panels ── */}
        <div
          className={`p-4 flex-1 overflow-y-auto space-y-6 ${!currentMap || currentMap.status !== "ready" ? "opacity-50 pointer-events-none" : ""}`}
        >
          {/* LIST OF SAVED POINTS */}
          <PointsListPanel
            pointsList={pointsList}
            onDeletePoint={onDeletePoint}
            onRenamePoint={onRenamePoint}
            selectedPointId={selectedPointId}
            onSelectPoint={onSelectPoint}
          />

          {/* STEP 1: CALIBRATION */}
          <CalibrationPanel
            isCalibrated={isCalibrated}
            setIsCalibrated={setIsCalibrated}
            showCalibration={showCalibration}
            setShowCalibration={setShowCalibration}
            p1={p1}
            setP1={setP1}
            p2={p2}
            setP2={setP2}
            isSelectingFor={isSelectingFor}
            setIsSelectingFor={setIsSelectingFor}
            calculateCalibration={calculateCalibration}
          />

          {/* STEP 2: TARGET DEFENSE */}
          <TargetDefensePanel
            isCalibrated={isCalibrated}
            targetDefenseData={targetDefenseData}
            setTargetDefenseData={setTargetDefenseData}
          />

          {/* STEP 3: FIND & CHECK COORDS (chuyển lên từ mục 8) */}
          <TargetPanel
            isCalibrated={isCalibrated}
            currentRealCoords={currentRealCoords}
            searchX={searchX}
            setSearchX={setSearchX}
            searchY={searchY}
            setSearchY={setSearchY}
            handleSearch={handleSearch}
          />

          {/* STEP 4: WEATHER */}
          <WeatherPanel
            isCalibrated={isCalibrated}
            showWeather={showWeather}
            setShowWeather={setShowWeather}
            weatherActive={weatherActive}
            setWeatherActive={setWeatherActive}
            weatherData={weatherData}
            setWeatherData={setWeatherData}
          />

          {/* STEP 5: SMOKE TIME */}
          <SmokeTimePanel
            isCalibrated={isCalibrated}
            smokeTime={smokeTime}
            setSmokeTime={setSmokeTime}
          />

          {/* STEP 6: SMOKE METHOD */}
          <SmokeMethodPanel
            isCalibrated={isCalibrated}
            smokeMethodData={smokeMethodData}
            setSmokeMethodData={setSmokeMethodData}
            targetDefenseData={targetDefenseData}
          />

          {/* STEP 7: SMOKE VEHICLE */}
          <SmokeVehiclePanel
            isCalibrated={isCalibrated}
            selectedVehicles={selectedVehicles}
            setSelectedVehicles={setSelectedVehicles}
            vehicleConfigs={vehicleConfigs}
            setVehicleConfigs={setVehicleConfigs}
          />

          {/* STEP 8: BATTLEFIELD STRUCTURE */}
          <BattlefieldPanel
            isCalibrated={isCalibrated}
            battlefieldData={battlefieldData}
            setBattlefieldData={setBattlefieldData}
          />

        </div>

        {/* ── Sticky Action Footer ── */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/80 backdrop-blur-sm grid grid-cols-2 gap-2 shrink-0">
          <button
            onClick={onAddPoint}
            disabled={!isCalibrated || !currentRealCoords}
            className="flex items-center justify-center gap-1.5 h-10 rounded-lg text-xs font-bold tracking-wide transition-all border border-slate-300 hover:bg-slate-105 text-slate-700 bg-white disabled:opacity-40 disabled:cursor-not-allowed shadow-sm active:scale-[0.98]"
          >
            <Plus size={14} />
            ĐIỂM KẾ TIẾP
          </button>
          <button
            onClick={onCalculate}
            disabled={!isCalibrated || (pointsList.length === 0 && !currentRealCoords)}
            className="flex items-center justify-center gap-1.5 h-10 rounded-lg text-xs font-bold tracking-wide transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #dc2626, #ef4444)",
              color: "#ffffff",
              boxShadow: "0 3px 10px rgba(220,38,38,0.25)",
            }}
          >
            <Calculator size={14} />
            TÍNH TOÁN
          </button>
        </div>
      </div>

      {/* TOGGLE BUTTON */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={`absolute top-1/2 -translate-y-1/2 w-6 h-16 bg-white border border-slate-200 rounded-r-md shadow-md flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-blue-600 focus:outline-none z-[1002] transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "left-[340px] border-l-0" : "left-0 border-l"
        }`}
      >
        {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>

      {/* RENAME MAP MODAL */}
      {renameModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-[2px]">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm mx-4 overflow-hidden shadow-xl animate-scaleUp">
            <div className="bg-slate-50 px-5 py-4 flex items-center justify-between border-b border-slate-200">
              <h4 className="text-slate-800 font-bold text-sm">
                ĐỔI TÊN BẢN ĐỒ
              </h4>
              <button
                type="button"
                onClick={() => setRenameModalOpen(false)}
                className="text-slate-400 hover:text-slate-650 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSaveRename} className="p-5 space-y-4 text-xs">
              <div>
                <label className="text-slate-600 font-semibold mb-1 block">
                  Tên bản đồ mới
                </label>
                <input
                  type="text"
                  value={newMapName}
                  onChange={(e) => setNewMapName(e.target.value)}
                  placeholder="Nhập tên bản đồ mới..."
                  className="w-full h-9 bg-white border border-slate-300 rounded-lg px-3 text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-sm"
                  autoFocus
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setRenameModalOpen(false)}
                  className="h-8 px-4 rounded-lg text-xs border border-slate-300 hover:bg-slate-50 text-slate-600 font-semibold transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="h-8 px-4 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
                >
                  Lưu lại
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
