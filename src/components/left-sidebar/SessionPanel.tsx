import {
  BookMarked,
  ChevronDown,
  ChevronUp,
  Clock,
  Download,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
  Edit3,
  X,
  Check,
  FilePlus,
} from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";
import { useSimulation } from "../../context/SimulationContext";

export const SessionPanel = () => {
  const sessions = useSimulation((s) => s.sessions);
  const isSessionsLoading = useSimulation((s) => s.isSessionsLoading);
  const saveSession = useSimulation((s) => s.saveSession);
  const updateCurrentSession = useSimulation((s) => s.updateCurrentSession);
  const loadSession = useSimulation((s) => s.loadSession);
  const renameSession = useSimulation((s) => s.renameSession);
  const deleteSession = useSimulation((s) => s.deleteSession);
  const activeSessionId = useSimulation((s) => s.activeSessionId);
  const resetCurrentSession = useSimulation((s) => s.resetCurrentSession);
  const pointsList = useSimulation((s) => s.pointsList);

  const activeSession = sessions.find((s) => s.id === activeSessionId) ?? null;

  const [newSessionConfirmOpen, setNewSessionConfirmOpen] = useState(false);

  const handleNewSessionClick = () => {
    if (pointsList.length > 0) {
      setNewSessionConfirmOpen(true);
    } else {
      resetCurrentSession();
    }
  };

  const handleConfirmNewSession = () => {
    resetCurrentSession();
    setNewSessionConfirmOpen(false);
  };

  const [isExpanded, setIsExpanded] = useState(true);

  // Save modal
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete confirm modal
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Inline rename state
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = saveName.trim();
    if (!name) return;
    setIsSaving(true);
    await saveSession(name);
    setIsSaving(false);
    setSaveName("");
    setSaveModalOpen(false);
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    await updateCurrentSession();
    setIsUpdating(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    await deleteSession(deleteTarget.id);
    setIsDeleting(false);
    setDeleteTarget(null);
  };

  const handleStartRename = (id: string, currentName: string) => {
    setRenamingId(id);
    setRenameValue(currentName);
  };

  const handleConfirmRename = async (id: string) => {
    const name = renameValue.trim();
    if (name) await renameSession(id, name);
    setRenamingId(null);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <BookMarked size={18} className="text-indigo-600" />
          <span className="text-sm font-bold uppercase tracking-wide text-slate-700">
            Phương Án Đã Lưu
          </span>
          {sessions.length > 0 && (
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold">
              {sessions.length}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp size={14} className="text-slate-400" />
        ) : (
          <ChevronDown size={14} className="text-slate-400" />
        )}
      </button>

      {isExpanded && (
        <div className="p-3 space-y-2">
          {/* Nút hành động lưu */}
          <div className="flex flex-col gap-1.5">
            {/* Nút Lập phương án mới */}
            <button
              onClick={handleNewSessionClick}
              className="w-full flex items-center justify-center gap-1.5 h-8 rounded-lg text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors"
            >
              <FilePlus size={13} />
              Lập phương án mới
            </button>

            {/* Nút Cập nhật — chỉ hiện khi đang có session active */}
            {activeSession && (
              <button
                onClick={handleUpdate}
                disabled={isUpdating}
                className="w-full flex items-center justify-center gap-1.5 h-8 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isUpdating ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <RefreshCw size={12} />
                )}
                Cập nhật "{activeSession.name}"
              </button>
            )}

            {/* Nút Lưu mới */}
            <button
              onClick={() => {
                setSaveName("");
                setSaveModalOpen(true);
              }}
              className="w-full flex items-center justify-center gap-1.5 h-8 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition-colors"
            >
              <Plus size={13} />
              Lưu thành phương án mới
            </button>
          </div>

          {/* Danh sách */}
          {isSessionsLoading ? (
            <div className="flex items-center justify-center py-4 gap-2 text-slate-400 text-xs">
              <Loader2 size={14} className="animate-spin" />
              Đang tải...
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-4 text-xs text-slate-400 italic">
              Chưa có phương án nào
            </div>
          ) : (
            <div className="space-y-1.5 max-h-52 overflow-y-auto">
              {sessions.map((sess) => (
                <div
                  key={sess.id}
                  className="group flex items-start gap-2 p-2.5 rounded-lg border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/40 transition-all"
                >
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    {renamingId === sess.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleConfirmRename(sess.id);
                            if (e.key === "Escape") setRenamingId(null);
                          }}
                          className="flex-1 h-6 text-xs bg-white border border-indigo-400 rounded px-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                          autoFocus
                        />
                        <button
                          onClick={() => handleConfirmRename(sess.id)}
                          className="text-emerald-600 hover:text-emerald-700"
                        >
                          <Check size={13} />
                        </button>
                        <button
                          onClick={() => setRenamingId(null)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs font-semibold text-slate-700 truncate leading-tight">
                        {sess.name}
                      </p>
                    )}
                    <div className="flex items-center gap-1 mt-0.5 text-[10px] text-slate-400">
                      <Clock size={10} />
                      {formatDate(sess.updatedAt)}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleStartRename(sess.id, sess.name)}
                      title="Đổi tên"
                      className="w-6 h-6 flex items-center justify-center rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-100 transition-colors"
                    >
                      <Edit3 size={11} />
                    </button>
                    <button
                      onClick={() => loadSession(sess.id)}
                      title="Tải phương án này"
                      className="w-6 h-6 flex items-center justify-center rounded text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                    >
                      <Download size={12} />
                    </button>
                    <button
                      onClick={() =>
                        setDeleteTarget({ id: sess.id, name: sess.name })
                      }
                      title="Xóa phương án"
                      className="w-6 h-6 flex items-center justify-center rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Save Modal ── */}
      {saveModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-[2px]">
            <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm mx-4 overflow-hidden shadow-xl">
              <div className="bg-slate-50 px-5 py-4 flex items-center justify-between border-b border-slate-200">
                <h4 className="text-slate-800 font-bold text-sm flex items-center gap-2">
                  <BookMarked size={14} className="text-indigo-600" />
                  LƯU PHƯƠNG ÁN
                </h4>
                <button
                  type="button"
                  onClick={() => setSaveModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
                <div>
                  <label className="text-slate-600 font-semibold mb-1 block">
                    Tên phương án
                  </label>
                  <input
                    type="text"
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    placeholder="Ví dụ: Phương án khói Bắc..."
                    className="w-full h-9 bg-white border border-slate-300 rounded-lg px-3 text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm"
                    autoFocus
                    maxLength={80}
                  />
                </div>
                <div className="flex gap-3 justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setSaveModalOpen(false)}
                    className="h-8 px-4 rounded-lg text-xs border border-slate-300 hover:bg-slate-50 text-slate-600 font-semibold transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={!saveName.trim() || isSaving}
                    className="h-8 px-4 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
                  >
                    {isSaving && <Loader2 size={12} className="animate-spin" />}
                    Lưu lại
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}

      {/* ── Delete Confirm Modal ── */}
      {deleteTarget &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-[2px]">
            <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm mx-4 overflow-hidden shadow-xl">
              <div className="bg-rose-50 px-5 py-4 flex items-center justify-between border-b border-rose-100">
                <h4 className="text-rose-700 font-bold text-sm">
                  XAC NHAN XOA
                </h4>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <p className="text-xs text-slate-600">
                  Ban co chac muon xoa phuong an{" "}
                  <span className="font-bold text-slate-800">
                    "{deleteTarget.name}"
                  </span>{" "}
                  ? Hanh dong nay khong the hoan tac.
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(null)}
                    className="h-8 px-4 rounded-lg text-xs border border-slate-300 hover:bg-slate-50 text-slate-600 font-semibold transition-colors"
                  >
                    Huy
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="h-8 px-4 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
                  >
                    {isDeleting && (
                      <Loader2 size={12} className="animate-spin" />
                    )}
                    Xoa
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* ── New Session Confirm Modal ── */}
      {newSessionConfirmOpen &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-[2px]">
            <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm mx-4 overflow-hidden shadow-xl">
              <div className="bg-slate-50 px-5 py-4 flex items-center justify-between border-b border-slate-200">
                <h4 className="text-slate-800 font-bold text-sm flex items-center gap-2">
                  <FilePlus size={14} className="text-indigo-600" />
                  XÁC NHẬN LẬP PHƯƠNG ÁN MỚI
                </h4>
                <button
                  type="button"
                  onClick={() => setNewSessionConfirmOpen(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="p-5 space-y-4 text-xs">
                <p className="text-slate-600 leading-relaxed">
                  Bạn có chắc chắn muốn lập phương án mới? Toàn bộ các điểm khói
                  hiện tại trên bản đồ sẽ bị xóa.
                </p>
                <div className="flex gap-3 justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setNewSessionConfirmOpen(false)}
                    className="h-8 px-4 rounded-lg text-xs border border-slate-300 hover:bg-slate-50 text-slate-600 font-semibold transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmNewSession}
                    className="h-8 px-4 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                  >
                    Đồng ý
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};
