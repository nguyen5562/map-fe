import { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Send,
  X,
  Plus,
  User,
  Shield,
  Clock,
} from "lucide-react";
import { feedbackService } from "../../services/feedback.service";
import { useToast } from "../../context/ToastContext";

interface FeedbackReply {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    name: string | null;
    role: string;
  };
}

interface FeedbackItem {
  id: string;
  type: string;
  title: string;
  content: string;
  status: string;
  adminRead: boolean;
  userRead: boolean;
  createdAt: string;
  replies: FeedbackReply[];
  user: {
    id: string;
    username: string;
    name: string | null;
    role: string;
  };
}

interface FeedbackModalProps {
  onClose: () => void;
  initialFeedbackId?: string | null;
}

export default function FeedbackModal({ onClose, initialFeedbackId }: FeedbackModalProps) {
  const toast = useToast();
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loadingList, setLoadingList] = useState(true);

  // Form State
  const [type, setType] = useState("BUG");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Reply State
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  const replyEndRef = useRef<HTMLDivElement>(null);

  // Load user feedbacks
  const loadFeedbacks = async () => {
    try {
      const data = await feedbackService.getMyFeedbacks();
      setFeedbacks(data);
      if (data.length > 0) {
        if (initialFeedbackId) {
          const matched = data.find((item: any) => item.id === initialFeedbackId);
          if (matched) {
            setSelectedFeedback(matched);
            setIsCreating(false);
            return;
          }
        }
        if (!selectedFeedback && !isCreating) {
          setSelectedFeedback(data[0]);
        }
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Không thể tải danh sách phản hồi.");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadFeedbacks();
  }, [initialFeedbackId]);

  useEffect(() => {
    const handleReload = () => {
      feedbackService
        .getMyFeedbacks()
        .then((data) => {
          setFeedbacks(data);
          if (selectedFeedback) {
            const updated = data.find((item: any) => item.id === selectedFeedback.id);
            if (updated) {
              setSelectedFeedback(updated);
            }
          }
        })
        .catch((err) => console.error("Error reloading feedbacks list:", err));
    };

    window.addEventListener("reloadFeedbacksList", handleReload);
    return () => {
      window.removeEventListener("reloadFeedbacksList", handleReload);
    };
  }, [selectedFeedback?.id]);

  // Mark selected feedback as read
  useEffect(() => {
    if (selectedFeedback && !selectedFeedback.userRead) {
      feedbackService
        .markAsRead(selectedFeedback.id)
        .then(() => {
          selectedFeedback.userRead = true;
          setFeedbacks((prev) =>
            prev.map((item) =>
              item.id === selectedFeedback.id ? { ...item, userRead: true } : item
            )
          );
          // Reload navbar notifications
          window.dispatchEvent(new Event("reloadNotifications"));
        })
        .catch((err) => console.error("Error marking feedback as read:", err));
    }
  }, [selectedFeedback?.id]);

  // Scroll to bottom when reply list or selected feedback changes
  useEffect(() => {
    replyEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedFeedback?.replies]);

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("Vui lòng điền đầy đủ tiêu đề và nội dung.");
      return;
    }

    setSubmittingFeedback(true);
    try {
      const newFeedback = await feedbackService.createFeedback({ type, title, content });
      toast.success("Gửi phản hồi thành công!");
      
      // Reset form
      setTitle("");
      setContent("");
      setIsCreating(false);

      // Reload feedbacks list and select new one
      const data = await feedbackService.getMyFeedbacks();
      setFeedbacks(data);
      const updatedItem = data.find((item: any) => item.id === newFeedback.id);
      if (updatedItem) {
        setSelectedFeedback(updatedItem);
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Gửi phản hồi thất bại. Vui lòng thử lại.");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFeedback || !replyText.trim()) return;

    setSubmittingReply(true);
    try {
      const newReply = await feedbackService.addReply(selectedFeedback.id, replyText);
      
      // Update selected feedback UI state immediately
      const updatedReplies = [...(selectedFeedback.replies || []), newReply];
      const updatedFeedback = { ...selectedFeedback, replies: updatedReplies };
      setSelectedFeedback(updatedFeedback);
      
      // Update in main list
      setFeedbacks(prev => prev.map(item => item.id === selectedFeedback.id ? updatedFeedback : item));
      setReplyText("");
    } catch (err: any) {
      console.error(err);
      toast.error("Không thể gửi phản hồi.");
    } finally {
      setSubmittingReply(false);
    }
  };

  const getTypeLabel = (t: string) => {
    switch (t) {
      case "BUG":
        return { label: "Báo lỗi", color: "bg-red-50 text-red-650 border-red-100" };
      case "SUGGESTION":
        return { label: "Góp ý", color: "bg-amber-50 text-amber-650 border-amber-100" };
      default:
        return { label: "Khác", color: "bg-slate-100 text-slate-650 border-slate-200" };
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden shadow-2xl animate-scaleUp">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between border-b border-white/10 shrink-0">
          <h4 className="text-white font-bold text-sm flex items-center gap-2">
            <MessageSquare size={16} className="text-emerald-500" />
            HỖ TRỢ & PHẢN HỒI Ý KIẾN
          </h4>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content container */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Left panel: Feedback List */}
          <div className="w-1/3 border-r border-slate-100 flex flex-col bg-slate-50/50 shrink-0">
            <div className="p-3 border-b border-slate-100 flex justify-between items-center shrink-0">
              <span className="font-bold text-slate-700 text-xs uppercase">Danh sách yêu cầu</span>
              <button
                onClick={() => {
                  setIsCreating(true);
                  setSelectedFeedback(null);
                }}
                className="flex items-center gap-1 h-7 px-2.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-all active:scale-95"
              >
                <Plus size={12} />
                Gửi phản hồi
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {loadingList ? (
                <div className="flex justify-center items-center py-12">
                  <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : feedbacks.length === 0 ? (
                <div className="text-center py-12 text-slate-450 text-xs">
                  Bạn chưa gửi phản hồi nào.
                </div>
              ) : (
                feedbacks.map((item) => {
                  const isActive = selectedFeedback?.id === item.id;
                  const typeInfo = getTypeLabel(item.type);
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setIsCreating(false);
                        setSelectedFeedback(item);
                      }}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all duration-150 relative ${
                        isActive
                          ? "bg-white border-emerald-500 shadow-sm ring-1 ring-emerald-500/10"
                          : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1.5 mb-1.5">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${typeInfo.color}`}>
                          {typeInfo.label}
                        </span>
                        <span className={`text-[9px] font-bold ${
                          item.status === "RESOLVED"
                            ? "text-emerald-600"
                            : "text-amber-600 animate-pulse"
                        }`}>
                          {item.status === "RESOLVED" ? "Đã giải quyết" : "Đang chờ"}
                        </span>
                      </div>
                      <h5 className="font-bold text-slate-800 text-xs truncate max-w-full flex items-center gap-1.5">
                        {item.title}
                        {!item.userRead && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" title="Tin nhắn mới" />
                        )}
                      </h5>
                      <p className="text-[10px] text-slate-450 mt-1 flex items-center gap-1">
                        <Clock size={10} />
                        {new Date(item.createdAt).toLocaleDateString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right panel: Chat detail or Form */}
          <div className="flex-1 flex flex-col bg-white overflow-hidden">
            {isCreating ? (
              /* CREATE FEEDBACK FORM */
              <form onSubmit={handleSubmitFeedback} className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto">
                <h4 className="text-slate-800 font-bold text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
                  Gửi phản hồi / Báo lỗi mới
                </h4>

                <div>
                  <label className="text-slate-600 font-semibold mb-1.5 block text-xs">
                    Loại phản hồi
                  </label>
                  <div className="flex gap-4">
                    {[
                      { id: "BUG", label: "Báo lỗi phần mềm", desc: "Sự cố, tính toán sai, lỗi hiển thị" },
                      { id: "SUGGESTION", label: "Đóng góp ý kiến", desc: "Đề xuất tính năng mới, giao diện" },
                      { id: "OTHER", label: "Yêu cầu khác", desc: "Câu hỏi hoặc ý kiến khác" }
                    ].map((opt) => (
                      <label
                        key={opt.id}
                        className={`flex-1 p-3 rounded-xl border cursor-pointer transition-all ${
                          type === opt.id
                            ? "border-emerald-500 bg-emerald-50/20 text-emerald-800 font-semibold"
                            : "border-slate-200 hover:border-slate-350 text-slate-650"
                        }`}
                      >
                        <input
                          type="radio"
                          name="feedbackType"
                          value={opt.id}
                          checked={type === opt.id}
                          onChange={() => setType(opt.id)}
                          className="sr-only"
                        />
                        <div className="text-xs">{opt.label}</div>
                        <div className="text-[10px] text-slate-450 font-normal mt-0.5 leading-tight">{opt.desc}</div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-slate-600 font-semibold mb-1.5 block text-xs">
                    Tiêu đề
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="VD: Lỗi hiển thị xe khói HPK-2.5 trên bản đồ"
                    className="w-full h-9 bg-white border border-slate-300 hover:border-slate-400 focus:border-emerald-500 rounded-lg px-3 text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-sm"
                  />
                </div>

                <div className="flex-1 flex flex-col min-h-[150px]">
                  <label className="text-slate-600 font-semibold mb-1.5 block text-xs">
                    Nội dung chi tiết
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Vui lòng mô tả chi tiết lỗi gặp phải hoặc ý kiến đóng góp của bạn..."
                    className="flex-1 w-full bg-white border border-slate-300 hover:border-slate-400 focus:border-emerald-500 rounded-lg p-3 text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-sm resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreating(false);
                      if (feedbacks.length > 0) {
                        setSelectedFeedback(feedbacks[0]);
                      }
                    }}
                    className="h-9 px-4 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-650 font-semibold transition-colors text-xs"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={submittingFeedback}
                    className="h-9 px-5 rounded-lg font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-1.5 text-xs"
                  >
                    {submittingFeedback && (
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    )}
                    Gửi phản hồi
                  </button>
                </div>
              </form>
            ) : selectedFeedback ? (
              /* CHAT DETAIL PANEL */
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Chat Header */}
                <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between shrink-0">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                      {selectedFeedback.title}
                    </h4>
                    <p className="text-[10px] text-slate-450 mt-0.5">
                      Gửi bởi bạn lúc {new Date(selectedFeedback.createdAt).toLocaleString("vi-VN")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      selectedFeedback.status === "RESOLVED"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}>
                      {selectedFeedback.status === "RESOLVED" ? "Đã giải quyết" : "Đang chờ giải quyết"}
                    </span>
                  </div>
                </div>

                {/* Messages Timeline */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
                  {/* Original feedback content as first message */}
                  <div className="flex items-start gap-3 max-w-[85%]">
                    <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 shrink-0 shadow-xs border border-slate-100">
                      <User size={13} />
                    </div>
                    <div className="bg-white border border-slate-150 rounded-2xl rounded-tl-none p-3 shadow-xs">
                      <div className="font-semibold text-slate-700 text-[10px]">Bạn (Người gửi)</div>
                      <p className="text-slate-800 text-xs mt-1 whitespace-pre-wrap leading-relaxed">
                        {selectedFeedback.content}
                      </p>
                      <div className="text-[9px] text-slate-450 text-right mt-1.5">
                        {new Date(selectedFeedback.createdAt).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Replies */}
                  {selectedFeedback.replies && selectedFeedback.replies.map((reply) => {
                    const isSelf = reply.user.role !== "admin";
                    return (
                      <div
                        key={reply.id}
                        className={`flex items-start gap-3 max-w-[85%] ${
                          isSelf ? "" : "ml-auto flex-row-reverse"
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-xs border ${
                          isSelf
                            ? "bg-slate-200 text-slate-600 border-slate-100"
                            : "bg-emerald-600 text-white border-emerald-500"
                        }`}>
                          {isSelf ? <User size={13} /> : <Shield size={13} />}
                        </div>
                        <div className={`p-3 rounded-2xl shadow-xs border ${
                          isSelf
                            ? "bg-white border-slate-150 rounded-tl-none"
                            : "bg-emerald-50/50 border-emerald-100 rounded-tr-none"
                        }`}>
                          <div className="flex items-center gap-1.5 justify-between">
                            <span className={`font-bold text-[10px] ${isSelf ? "text-slate-700" : "text-emerald-800"}`}>
                              {isSelf ? "Bạn" : `${reply.user.name || "Ban quản trị"}`}
                            </span>
                            {!isSelf && (
                              <span className="bg-emerald-600 text-white text-[8px] font-black uppercase px-1 rounded shrink-0">
                                Admin
                              </span>
                            )}
                          </div>
                          <p className="text-slate-800 text-xs mt-1 whitespace-pre-wrap leading-relaxed">
                            {reply.content}
                          </p>
                          <div className="text-[9px] text-slate-450 text-right mt-1.5">
                            {new Date(reply.createdAt).toLocaleTimeString("vi-VN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={replyEndRef} />
                </div>

                {/* Reply Form */}
                <form
                  onSubmit={handleSendReply}
                  className="p-3 border-t border-slate-100 bg-white flex items-center gap-2 shrink-0"
                >
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Nhập nội dung phản hồi lại..."
                    className="flex-1 h-9 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 focus:border-emerald-500 rounded-lg px-4 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-inner"
                  />
                  <button
                    type="submit"
                    disabled={submittingReply || !replyText.trim()}
                    className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition disabled:opacity-55 active:scale-95 shrink-0"
                  >
                    {submittingReply ? (
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Send size={14} />
                    )}
                  </button>
                </form>
              </div>
            ) : (
              /* EMPTY STATE */
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-450">
                <MessageSquare size={36} className="text-slate-300 mb-3" />
                <p className="text-xs">Vui lòng chọn phản hồi ở cột bên trái hoặc gửi phản hồi mới.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
