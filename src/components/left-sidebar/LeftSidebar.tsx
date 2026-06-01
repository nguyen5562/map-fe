import {
  Map as MapIcon,
  CheckCircle2,
  UploadCloud,
  MapPinned,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { CalibrationPanel } from "./CalibrationPanel";
import { TargetDefensePanel } from "./TargetDefensePanel";
import { WeatherPanel } from "./WeatherPanel";
import { SmokeTimePanel } from "./SmokeTimePanel";
import { SmokeMethodPanel } from "./SmokeMethodPanel";
import { SmokeVehiclePanel } from "./SmokeVehiclePanel";
import { BattlefieldPanel } from "./BattlefieldPanel";
import { TargetPanel } from "./TargetPanel";

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
  handleUpload,
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
  return (
    <div
      className={`relative h-full transition-all duration-300 ease-in-out flex-shrink-0 z-[1001] ${
        isSidebarOpen ? "w-[340px]" : "w-0"
      }`}
    >
      {/* SIDEBAR CONTENT */}
      <div
        className={`absolute top-0 left-0 w-[340px] h-full bg-white border-r border-slate-200 flex flex-col shadow-sm transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Map Library Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-100/50">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1">
            <MapPinned size={14} /> Thư viện Bản đồ
          </h2>
          <div className="flex gap-2">
            <select
              className="flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-1 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <label
              className={`flex items-center justify-center bg-white hover:bg-slate-50 border border-slate-300 rounded-md cursor-pointer text-slate-700 shadow-sm transition-all overflow-hidden ${isUploading ? "w-24 px-2" : "w-10 px-0"}`}
            >
              {isUploading ? (
                <div className="flex flex-col items-center justify-center w-full gap-1">
                  <span className="text-[10px] font-bold text-blue-600 leading-none">
                    {uploadProgress}%
                  </span>
                  <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              ) : (
                <UploadCloud size={18} />
              )}
              <input
                type="file"
                className="hidden"
                accept="image/png, image/jpeg"
                onChange={handleUpload}
                disabled={isUploading}
              />
            </label>
          </div>
        </div>

        {/* Status Header */}
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

        {/* Scrollable Panels Area */}
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

          {/* STEP 3: WEATHER */}
          <WeatherPanel
            isCalibrated={isCalibrated}
            showWeather={showWeather}
            setShowWeather={setShowWeather}
            weatherActive={weatherActive}
            setWeatherActive={setWeatherActive}
            weatherData={weatherData}
            setWeatherData={setWeatherData}
          />

          {/* STEP 4: SMOKE TIME */}
          <SmokeTimePanel
            isCalibrated={isCalibrated}
            smokeTime={smokeTime}
            setSmokeTime={setSmokeTime}
          />

          {/* STEP 5: SMOKE METHOD */}
          <SmokeMethodPanel
            isCalibrated={isCalibrated}
            smokeMethodData={smokeMethodData}
            setSmokeMethodData={setSmokeMethodData}
          />

          {/* STEP 6: SMOKE VEHICLE */}
          <SmokeVehiclePanel
            isCalibrated={isCalibrated}
            selectedVehicles={selectedVehicles}
            setSelectedVehicles={setSelectedVehicles}
          />

          {/* STEP 7: BATTLEFIELD STRUCTURE */}
          <BattlefieldPanel
            isCalibrated={isCalibrated}
            battlefieldData={battlefieldData}
            setBattlefieldData={setBattlefieldData}
            onCalculate={onCalculate}
          />

          {/* STEP 8: FIND & CHECK COORDS */}
          <TargetPanel
            isCalibrated={isCalibrated}
            currentRealCoords={currentRealCoords}
            searchX={searchX}
            setSearchX={setSearchX}
            searchY={searchY}
            setSearchY={setSearchY}
            handleSearch={handleSearch}
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
