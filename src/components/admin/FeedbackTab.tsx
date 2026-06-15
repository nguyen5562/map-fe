import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  MessageSquare,
  Send,
  User,
  Shield,
  Clock,
  Inbox,
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

export function FeedbackTab() {
  const toast = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Reply State
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  const replyEndRef = useRef<HTMLDivElement>(null);

  const loadAllFeedbacks = async () => {
    try {
      const data = await feedbackService.getAllFeedbacks();
      setFeedbacks(data);
      
      const state = location.state as { feedbackId?: string } | null;
      const targetFeedbackId = state?.feedbackId;
      
      if (targetFeedbackId) {
        const matched = data.find((item: any) => item.id === targetFeedbackId);
        if (matched) {
          setSelectedFeedback(matched);
          // Clear history state once consumed
          navigate(location.pathname, { replace: true, state: {} });
          return;
        }
      }
      
      if (selectedFeedback) {
        const updated = data.find((item: any) => item.id === selectedFeedback.id);
        if (updated) setSelectedFeedback(updated);
      } else if (data.length > 0) {
        setSelectedFeedback(data[0]);
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Không thể tải danh sách phản hồi hệ thống.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllFeedbacks();
  }, []);

  // Sync selected feedback with location state changes
  useEffect(() => {
    const state = location.state as { feedbackId?: string } | null;
    if (state?.feedbackId && feedbacks.length > 0) {
      const matched = feedbacks.find((item) => item.id === state.feedbackId);
      if (matched) {
        setSelectedFeedback(matched);
        // Clear history state once consumed
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [location.state, feedbacks, navigate, location.pathname]);

  useEffect(() => {
    replyEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedFeedback?.replies]);

  // Mark selected feedback as read for admin
  useEffect(() => {
    if (selectedFeedback && !selectedFeedback.adminRead) {
      feedbackService
        .markAsRead(selectedFeedback.id)
        .then(() => {
          selectedFeedback.adminRead = true;
          setFeedbacks((prev) =>
            prev.map((item) =>
              item.id === selectedFeedback.id ? { ...item, adminRead: true } : item
            )
          );
          // Dispatch event to reload notification count in Navbar
          window.dispatchEvent(new Event("reloadNotifications"));
        })
        .catch((err) => console.error("Error marking feedback as read for admin:", err));
    }
  }, [selectedFeedback?.id]);

  // Listen for navigation clicks from notifications
  useEffect(() => {
    const handleSelectFeedback = (e: Event) => {
      const customEvent = e as CustomEvent;
      const feedbackId = customEvent.detail?.feedbackId;
      if (feedbackId) {
        const found = feedbacks.find((item) => item.id === feedbackId);
        if (found) {
          setSelectedFeedback(found);
        } else {
          feedbackService.getAllFeedbacks().then((data) => {
            setFeedbacks(data);
            const matched = data.find((item: any) => item.id === feedbackId);
            if (matched) setSelectedFeedback(matched);
          });
        }
      }
    };

    window.addEventListener("selectFeedbackAdmin", handleSelectFeedback);
    return () => {
      window.removeEventListener("selectFeedbackAdmin", handleSelectFeedback);
    };
  }, [feedbacks]);

  useEffect(() => {
    const handleReload = () => {
      feedbackService
        .getAllFeedbacks()
        .then((data) => {
          setFeedbacks(data);
          if (selectedFeedback) {
            const updated = data.find((item: any) => item.id === selectedFeedback.id);
            if (updated) {
              setSelectedFeedback(updated);
            }
          }
        })
        .catch((err) => console.error("Error reloading admin feedbacks list:", err));
    };

    window.addEventListener("reloadFeedbacksList", handleReload);
    return () => {
      window.removeEventListener("reloadFeedbacksList", handleReload);
    };
  }, [selectedFeedback?.id]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFeedback || !replyText.trim()) return;

    setSubmittingReply(true);
    try {
      const newReply = await feedbackService.addReply(selectedFeedback.id, replyText);
      
      // If currently pending, we can automatically mark status as RESOLVED or leave it
      // Let's just update the local replies state
      const updatedReplies = [...(selectedFeedback.replies || []), newReply];
      const updatedFeedback = { ...selectedFeedback, replies: updatedReplies };
      setSelectedFeedback(updatedFeedback);
      
      setFeedbacks(prev => prev.map(item => item.id === selectedFeedback.id ? updatedFeedback : item));
      setReplyText("");
    } catch (err: any) {
      console.error(err);
      toast.error("Không thể gửi phản hồi.");
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await feedbackService.updateStatus(id, newStatus);
      toast.success("Cập nhật trạng thái thành công!");
      
      // Update locally
      setFeedbacks(prev => prev.map(item => {
        if (item.id === id) {
          const updated = { ...item, status: newStatus };
          if (selectedFeedback?.id === id) {
            setSelectedFeedback(updated);
          }
          return updated;
        }
        return item;
      }));
    } catch (err: any) {
      console.error(err);
      toast.error("Cập nhật trạng thái thất bại.");
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

  const filteredFeedbacks = feedbacks.filter((item) => {
    if (statusFilter === "ALL") return true;
    return item.status === statusFilter;
  });

  return (
    <div className="flex h-[550px] overflow-hidden -m-5 bg-white rounded-xl">
      {/* Left List */}
      <div className="w-1/3 border-r border-slate-100 flex flex-col bg-slate-50/50 shrink-0">
        {/* Filter */}
        <div className="p-3 border-b border-slate-100 flex items-center justify-between shrink-0">
          <span className="font-bold text-slate-700 text-xs uppercase">Yêu cầu hỗ trợ</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-7 px-1.5 bg-white border border-slate-200 text-slate-600 rounded text-[11px] font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="ALL">Tất cả</option>
            <option value="PENDING">Chờ xử lý</option>
            <option value="RESOLVED">Đã giải quyết</option>
          </select>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredFeedbacks.length === 0 ? (
            <div className="text-center py-12 text-slate-450 text-xs flex flex-col items-center gap-1">
              <Inbox size={24} className="text-slate-300" />
              Không có phản hồi nào.
            </div>
          ) : (
            filteredFeedbacks.map((item) => {
              const isActive = selectedFeedback?.id === item.id;
              const typeInfo = getTypeLabel(item.type);
              const senderName = item.user.name || item.user.username;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedFeedback(item)}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all duration-150 ${
                    isActive
                      ? "bg-white border-emerald-500 shadow-sm ring-1 ring-emerald-500/10"
                      : "bg-white border-slate-200 hover:border-slate-350"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5 mb-1.5">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${typeInfo.color}`}>
                      {typeInfo.label}
                    </span>
                    <span className={`text-[9px] font-bold ${
                      item.status === "RESOLVED"
                        ? "text-emerald-650"
                        : "text-amber-600 animate-pulse"
                    }`}>
                      {item.status === "RESOLVED" ? "Đã giải quyết" : "Chờ xử lý"}
                    </span>
                  </div>
                  <h5 className="font-bold text-slate-800 text-xs truncate max-w-full flex items-center gap-1.5">
                    {item.title}
                    {!item.adminRead && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" title="Phản hồi mới" />
                    )}
                  </h5>
                  <div className="flex items-center justify-between text-[10px] text-slate-450 mt-1.5">
                    <span className="font-semibold text-slate-650 truncate max-w-[120px]">
                      @{senderName}
                    </span>
                    <span className="flex items-center gap-0.5 shrink-0">
                      <Clock size={9} />
                      {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Detail */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        {selectedFeedback ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div>
                <h4 className="font-bold text-slate-800 text-sm">
                  {selectedFeedback.title}
                </h4>
                <p className="text-[10px] text-slate-450 mt-0.5 flex items-center gap-1.5">
                  <span>Người gửi: <span className="font-bold text-slate-600">@{selectedFeedback.user.name || selectedFeedback.user.username}</span></span>
                  <span>•</span>
                  <span>Gửi lúc: {new Date(selectedFeedback.createdAt).toLocaleString("vi-VN")}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 font-semibold">Trạng thái:</span>
                <select
                  value={selectedFeedback.status}
                  onChange={(e) => handleStatusChange(selectedFeedback.id, e.target.value)}
                  className={`h-7 px-2 border rounded text-xs font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                    selectedFeedback.status === "RESOLVED"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}
                >
                  <option value="PENDING">Chờ xử lý</option>
                  <option value="RESOLVED">Đã giải quyết</option>
                </select>
              </div>
            </div>

            {/* Conversation */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
              {/* Original content */}
              <div className="flex items-start gap-3 max-w-[85%]">
                <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-650 shrink-0 border border-slate-150">
                  <User size={13} />
                </div>
                <div className="bg-white border border-slate-150 rounded-2xl rounded-tl-none p-3 shadow-xs">
                  <div className="font-semibold text-slate-700 text-[10px]">@{selectedFeedback.user.name || selectedFeedback.user.username}</div>
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
                const isSelf = reply.user.role === "admin";
                return (
                  <div
                    key={reply.id}
                    className={`flex items-start gap-3 max-w-[85%] ${
                      isSelf ? "ml-auto flex-row-reverse" : ""
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border shadow-xs ${
                      isSelf
                        ? "bg-emerald-600 text-white border-emerald-500"
                        : "bg-slate-200 text-slate-650 border-slate-150"
                    }`}>
                      {isSelf ? <Shield size={13} /> : <User size={13} />}
                    </div>
                    <div className={`p-3 rounded-2xl border shadow-xs ${
                      isSelf
                        ? "bg-emerald-50/50 border-emerald-100 rounded-tr-none"
                        : "bg-white border-slate-150 rounded-tl-none"
                    }`}>
                      <div className="flex items-center gap-1.5 justify-between">
                        <span className={`font-bold text-[10px] ${isSelf ? "text-emerald-800" : "text-slate-700"}`}>
                          {isSelf ? `${reply.user.name || "Ban quản trị (Bạn)"}` : `@${reply.user.name || reply.user.username}`}
                        </span>
                        {isSelf && (
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

            {/* Reply Input */}
            <form
              onSubmit={handleSendReply}
              className="p-3 border-t border-slate-100 bg-white flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Nhập câu trả lời hỗ trợ..."
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
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-450">
            <MessageSquare size={36} className="text-slate-300 mb-3" />
            <p className="text-xs">Vui lòng chọn phản hồi bên cột trái để xem chi tiết.</p>
          </div>
        )}
      </div>
    </div>
  );
}
