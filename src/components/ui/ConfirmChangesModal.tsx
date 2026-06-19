import { X, AlertTriangle } from "lucide-react";
import { Button } from "./Button";

interface ConfirmChangesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  onDiscard: () => void;
  title?: string;
  message: string;
}

export const ConfirmChangesModal = ({
  isOpen,
  onClose,
  onSave,
  onDiscard,
  title = "XÁC NHẬN THAY ĐỔI",
  message,
}: ConfirmChangesModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-[2px]">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md mx-4 overflow-hidden shadow-xl animate-scaleUp text-xs">
        <div className="bg-slate-50 px-5 py-4 flex items-center justify-between border-b border-slate-200">
          <h4 className="text-amber-600 font-bold text-sm flex items-center gap-1.5">
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
          <div className="text-slate-600 leading-relaxed font-semibold text-sm">
            {message}
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-9 text-xs font-semibold px-4"
            >
              Quay lại
            </Button>
            <Button
              onClick={onDiscard}
              type="button"
              variant="danger"
              className="h-9 text-xs font-semibold px-4"
            >
              Hủy thay đổi & Tiếp tục
            </Button>
            <Button
              onClick={onSave}
              type="button"
              variant="success"
              className="h-9 text-xs font-semibold px-4"
            >
              Lưu & Tiếp tục
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
