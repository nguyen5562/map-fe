import {
  Map as MapIcon,
  CheckCircle2,
  UploadCloud,
  MapPinned,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useRef, useState } from "react";
import { CalibrationPanel } from "./CalibrationPanel";
import { TargetDefensePanel } from "./TargetDefensePanel";
import { WeatherPanel } from "./WeatherPanel";
import { SmokeTimePanel } from "./SmokeTimePanel";
import { SmokeMethodPanel } from "./SmokeMethodPanel";
import { SmokeVehiclePanel } from "./SmokeVehiclePanel";
import { BattlefieldPanel } from "./BattlefieldPanel";
import { TargetPanel } from "./TargetPanel";
import { UploadProgressDialog } from "./UploadProgressDialog";

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
  smokeTime: string;
  setSmokeTime: (v: string) => void;

  // Smoke Method (Mục 5)
  smokeMethodData: any;
  setSmokeMethodData: (v: any) => void;

  // Smoke Vehicle (Mục 6)
  selectedVehicles: string[];
  setSelectedVehicles: (v: string[]) => void;

  // Battlefield (Mục 7)
  battlefieldData: any;
  setBattlefieldData: (v: any) => void;
  onCalculate: () => void;

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
  battlefieldData,
  setBattlefieldData,
  onCalculate,
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

          {/* Dropdown chọn bản đồ */}
          <select
            className="flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-1 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
            value={currentMap?.id || ""}
            onChange={(e) => {
              const smap = maps.find((m) => m.id === e.target.value);
              if (smap) setCurrentMap(smap);
            }}
          >
            <option value="" disabled>
              Chọn một bản đồ để thao tác...
            </option>
            {maps.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} {m.status !== "ready" ? "(Đang xử lý...)" : ""}
              </option>
            ))}
          </select>

          {/* Nút Tải lên — click thẳng vào file picker */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full flex items-center justify-center gap-2 h-9 rounded-md text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: isUploading
                ? "#e2e8f0"
                : "linear-gradient(135deg, #1d4ed8, #3b82f6)",
              color: isUploading ? "#94a3b8" : "#ffffff",
              border: "none",
              boxShadow: isUploading
                ? "none"
                : "0 2px 8px rgba(59,130,246,0.35)",
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
          />

          {/* STEP 8: BATTLEFIELD STRUCTURE */}
          <BattlefieldPanel
            isCalibrated={isCalibrated}
            battlefieldData={battlefieldData}
            setBattlefieldData={setBattlefieldData}
            onCalculate={onCalculate}
          />
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
    </div>
  );
};
