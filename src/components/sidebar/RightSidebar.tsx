import { ChevronLeft, ChevronRight, ClipboardList } from "lucide-react";

type RightSidebarProps = {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
};

export const RightSidebar = ({ isOpen, setIsOpen }: RightSidebarProps) => {
  return (
    <div
      className={`relative h-full transition-all duration-300 ease-in-out flex-shrink-0 z-[1001] ${
        isOpen ? "w-[380px]" : "w-0"
      }`}
    >
      {/* SIDEBAR CONTENT */}
      <div
        className={`absolute top-0 right-0 w-[380px] h-full bg-white border-l border-slate-200 flex flex-col shadow-sm transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-100/50">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
            <ClipboardList size={14} /> Kết quả tính toán
          </h2>
        </div>

        {/* Scrollable Content Area */}
        <div className="p-4 flex-1 overflow-y-auto space-y-6">
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <ClipboardList size={48} className="mb-3 opacity-40" />
            <p className="text-sm font-medium text-center">
              Chưa có kết quả tính toán
            </p>
            <p className="text-xs text-center mt-1">
              Nhập thông số bên trái và nhấn TÍNH TOÁN
            </p>
          </div>
        </div>
      </div>

      {/* TOGGLE BUTTON — positioned on the LEFT edge of the sidebar wrapper */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`absolute top-1/2 -translate-y-1/2 w-6 h-16 bg-white border border-slate-200 rounded-l-md shadow-md flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-blue-600 focus:outline-none z-[1002] transition-all duration-300 ease-in-out ${
          isOpen ? "left-[-24px] border-r-0" : "left-[-24px] border-r-0"
        }`}
      >
        {isOpen ? (
          <ChevronRight size={16} />
        ) : (
          <ChevronLeft size={16} />
        )}
      </button>
    </div>
  );
};
