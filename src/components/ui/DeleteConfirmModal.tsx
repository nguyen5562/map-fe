import { X, AlertTriangle } from "lucide-react";
import { Button } from "./Button";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  label?: string;
}

export const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "CẢNH BÁO XÓA",
  message,
  label,
}: DeleteConfirmModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-[2px]">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm mx-4 overflow-hidden shadow-xl animate-scaleUp text-xs">
        <div className="bg-slate-50 px-5 py-4 flex items-center justify-between border-b border-slate-200">
          <h4 className="text-rose-600 font-bold text-sm flex items-center gap-1.5">
            <AlertTriangle size={16} /> {title}
          </h4>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="text-slate-600 leading-relaxed font-semibold">
            {message}
          </div>
          {label && (
            <div className="bg-slate-50 border border-slate-150 rounded-lg p-3 font-mono text-slate-800 break-all">
              {label}
            </div>
          )}
          <div className="flex gap-3 justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-8 text-xs font-semibold"
            >
              Hủy
            </Button>
            <Button
              onClick={onConfirm}
              variant="danger"
              className="h-8 text-xs font-semibold"
            >
              Đồng ý xóa
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
