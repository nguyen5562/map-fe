import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 1500); // auto dismiss after 1.5 seconds
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (message: string) => addToast("success", message),
    error: (message: string) => addToast("error", message),
    info: (message: string) => addToast("info", message),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast container */}
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none items-center">
        {toasts.map((t) => {
          const typeConfig = {
            success: {
              bg: "bg-emerald-50 border-emerald-250 text-emerald-900 shadow-emerald-500/5",
              icon: (
                <CheckCircle2 className="text-emerald-500 shrink-0" size={16} />
              ),
            },
            error: {
              bg: "bg-rose-50 border-rose-250 text-rose-900 shadow-rose-500/5",
              icon: (
                <AlertTriangle className="text-rose-500 shrink-0" size={16} />
              ),
            },
            info: {
              bg: "bg-blue-50 border-blue-250 text-blue-900 shadow-blue-500/5",
              icon: <Info className="text-blue-500 shrink-0" size={16} />,
            },
          }[t.type];

          return (
            <div
              key={t.id}
              className={`flex items-center gap-3 px-4 py-3 border rounded-xl shadow-lg pointer-events-auto transition-all duration-300 animate-toast-slide-in ${typeConfig.bg}`}
            >
              {typeConfig.icon}
              <div className="flex-1 text-xs font-semibold">{t.message}</div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-slate-600 transition-colors shrink-0"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
