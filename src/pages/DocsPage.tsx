import { useState, useEffect } from "react";
import {
  BookOpen,
  ChevronRight,
  FileText,
  ExternalLink,
  Users,
  Info,
  X,
  Monitor,
  Lock,
  PenTool,
  FileDown,
  Search,
  AlertTriangle,
  Mail,
  Image as ImageIcon,
} from "lucide-react";
import { documentService } from "../services/document.service";
import { resolveBackendUrl } from "../utils/url";
import { Skeleton } from "../components/ui/Skeleton";

// ── AUTHORS ──────────────────────────────────────────────
const AUTHORS = [
  {
    name: "Nguyễn Văn Hưng",
    rank: "Trung tá, ThS",
    email: "hungnv@bchh.bqp",
    role: "Phó Chủ nhiệm",
    unit: "Phòng Hậu cần - Kỹ thuật",
    school: "Trường Sĩ quan Phòng hóa",
  },
  {
    name: "Đặng Quang Dũng",
    rank: "Thượng tá, ThS",
    email: "dungdq@bchh.bqp",
    role: "Phó Chủ nhiệm",
    unit: "Khoa Chiến thuật",
    school: "Trường Sĩ quan Phòng hóa",
  },
  {
    name: "Nguyễn Khôi Nguyên",
    rank: "Trung úy",
    email: "nguyennk@bchh.bqp",
    role: "Trợ lý",
    unit: "Phòng Hậu cần - Kỹ thuật",
    school: "Trường Sĩ quan Phòng hóa",
  },
];

// ── SECTION TYPES ─────────────────────────────────────────
type DocItem = {
  title: string;
  type: "pdf" | "drawing" | "word" | "excel" | "powerpoint" | "image";
  classified?: boolean;
};

type Section = {
  id: string;
  roman: string;
  title: string;
  subtitle: string;
  items: DocItem[];
};

const FILE_BADGE: Record<string, { label: string; color: string }> = {
  pdf: {
    label: "PDF",
    color: "bg-rose-50 text-rose-600 border border-rose-100/70",
  },
  drawing: {
    label: "DRAWING",
    color: "bg-sky-50 text-sky-600 border border-sky-100/70",
  },
  word: {
    label: "WORD",
    color: "bg-blue-50 text-blue-600 border border-blue-100/70",
  },
  excel: {
    label: "EXCEL",
    color: "bg-green-50 text-green-700 border border-green-100/70",
  },
  powerpoint: {
    label: "SLIDE",
    color: "bg-orange-50 text-orange-600 border border-orange-100/70",
  },
  image: {
    label: "IMAGE",
    color: "bg-purple-50 text-purple-600 border border-purple-100/70",
  },
};

const TYPE_ICON: Record<string, React.ReactNode> = {
  pdf: <FileText size={13} />,
  drawing: <PenTool size={13} />,
  word: <FileText size={13} />,
  excel: <FileDown size={13} />,
  powerpoint: <FileText size={13} />,
  image: <ImageIcon size={13} />,
};

// ── ABOUT MODAL ───────────────────────────────────────────
function AboutModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-slate-900 px-6 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <img
              src="/favicon.ico"
              alt="Logo"
              className="w-9 h-9 object-contain"
            />
            <div>
              <h2 className="text-white font-bold text-base tracking-tight">
                Tổ hợp Chương trình tính toán, mô phỏng Khí tài phát khói trong huấn luyện và thực hiện nhiệm vụ của Bộ đội Hóa học
              </h2>
              <p className="text-slate-400 text-xs pt-2">Phiên bản 1.0.0 - 2026</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition p-1 rounded-lg hover:bg-white/10"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6 space-y-5 overflow-y-auto">
          <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
            <Monitor size={18} className="text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-slate-700">
                Hệ thống hỗ trợ mô phỏng và tính toán
              </p>
              <p className="text-slate-500 text-xs mt-0.5">
                phương án triển khai màn khói ngụy trang bảo vệ mục tiêu trong
                tác chiến.
              </p>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users size={15} className="text-slate-500" />
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                Nhóm tác giả
              </h3>
            </div>
            <div className="space-y-2">
              {AUTHORS.map((a, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100"
                >
                  <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center shrink-0 text-slate-600 font-bold text-xs">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {a.rank} {a.name}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {a.role} {a.unit}
                    </p>
                    <p className="text-xs text-emerald-600 font-medium mt-1">
                      {a.school}
                    </p>
                    {a.email && (
                      <p className="text-xs text-slate-450 font-mono mt-1 flex items-center gap-1">
                        <Mail size={10} className="text-slate-400 shrink-0" />
                        <span>{a.email}</span>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper to extract file extension
const getFileExtension = (url: string | null | undefined): string => {
  if (!url) return "";
  const cleanUrl = url.split("?")[0];
  const parts = cleanUrl.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
};

// ── MAIN PAGE ─────────────────────────────────────────────
export default function DocsPage() {
  const [showAbout, setShowAbout] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeDoc, setActiveDoc] = useState<any | null>(null);

  const handleDownload = (
    e: React.MouseEvent,
    url: string | null,
    title: string,
  ) => {
    e.preventDefault();
    if (!url) return;
    const fullUrl = resolveBackendUrl(url);
    const filename = url.split("/").pop() || `${title}.pdf`;

    fetch(fullUrl)
      .then((res) => {
        if (!res.ok) throw new Error("Mạng có lỗi");
        return res.blob();
      })
      .then((blob) => {
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(blobUrl);
      })
      .catch((err) => {
        console.error("Lỗi khi tải file:", err);
        window.open(fullUrl, "_blank");
      });
  };

  const loadDocuments = () => {
    setLoading(true);
    setError(false);
    documentService
      .getDocumentSections("document")
      .then((data: any[]) => {
        // Filter out videos from items, and exclude sections that become empty
        const filtered = (data || [])
          .filter((sec: any) => sec.type !== "video")
          .map((sec: any) => ({
            ...sec,
            items: (sec.items || []).filter(
              (item: any) => item.type !== "video",
            ),
          }))
          .filter((sec: any) => sec.items.length > 0);

        setSections(filtered);
        if (filtered && filtered.length > 0) {
          setActiveSection(filtered[0].id);
        } else {
          setActiveSection(null);
        }
      })
      .catch((err) => {
        console.error("Lỗi tải tài liệu từ BE:", err);
        setError(true);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  // Filtered sections and items based on search query
  const filteredSections = sections
    .map((sec) => ({
      ...sec,
      items: sec.items.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    }))
    .filter((sec) => sec.items.length > 0);

  return (
    <div className="min-h-[calc(100vh-48px)] bg-slate-50/70">
      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}

      {/* DOCUMENT VIEWER MODAL */}
      {activeDoc && activeDoc.url && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-xs"
          onClick={() => setActiveDoc(null)}
        >
          <div
            className="w-full max-w-7xl h-[90vh] mx-4 overflow-hidden rounded-2xl bg-slate-950 shadow-2xl border border-white/10 flex flex-col animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-slate-900 px-5 py-3.5 flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5 mr-4 min-w-0">
                <span className="text-emerald-400 shrink-0">
                  {TYPE_ICON[activeDoc.type] || <FileText size={15} />}
                </span>
                <h3 className="text-white font-bold text-xs truncate">
                  {activeDoc.title}
                </h3>
                {activeDoc.classified && (
                  <span className="bg-rose-600/95 text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded border border-rose-500/40 flex items-center gap-1 shrink-0 shadow-sm">
                    <Lock size={8} /> MẬT
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) =>
                    handleDownload(e, activeDoc.url, activeDoc.title)
                  }
                  className="bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white transition-all px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-bold mr-2 shadow-md shadow-emerald-950/30 hover:scale-[1.02]"
                  title="Tải xuống tài liệu"
                >
                  <FileDown size={14} />
                  <span className="hidden sm:inline">Tải xuống</span>
                </button>
                <button
                  onClick={() => setActiveDoc(null)}
                  className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 bg-slate-900 overflow-hidden relative flex items-center justify-center">
              {(() => {
                const ext = getFileExtension(activeDoc.url);
                const fullUrl = resolveBackendUrl(activeDoc.url);

                if (ext === "pdf") {
                  return (
                    <iframe
                      src={`${fullUrl}#toolbar=1`}
                      className="w-full h-full border-none bg-slate-900"
                      title={activeDoc.title}
                    />
                  );
                }

                if (
                  ["png", "jpg", "jpeg", "svg", "gif", "webp"].includes(ext)
                ) {
                  return (
                    <div className="w-full h-full overflow-auto flex items-center justify-center p-4 bg-slate-950/20">
                      <img
                        src={fullUrl}
                        alt={activeDoc.title}
                        className="max-w-full max-h-full object-contain rounded shadow-lg bg-white"
                      />
                    </div>
                  );
                }

                // Default fallback for Word/Excel files or files that cannot be viewed inline
                return (
                  <div className="flex flex-col items-center justify-center text-center p-8 text-slate-400 max-w-sm mx-auto animate-in fade-in zoom-in-95">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-slate-300 mb-4 border border-white/10 shadow-inner">
                      <FileText size={30} />
                    </div>
                    <p className="font-bold text-white text-sm">
                      Định dạng file không hỗ trợ xem trực tiếp
                    </p>
                    <p className="text-xs text-slate-450 mt-1 leading-relaxed">
                      Trình duyệt không hỗ trợ hiển thị trực tiếp định dạng tệp
                      tin này ({ext.toUpperCase()}). Vui lòng tải về máy để xem.
                    </p>
                    <button
                      onClick={(e) =>
                        handleDownload(e, activeDoc.url, activeDoc.title)
                      }
                      className="mt-5 inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-600/20 hover:scale-[1.02]"
                    >
                      <FileDown size={14} />
                      Tải tài liệu về máy
                    </button>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-sm shadow-emerald-200 shrink-0">
              <BookOpen size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 tracking-tight">
                Thư viện tài liệu
              </h1>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Tài liệu kỹ thuật, bài giảng và hướng dẫn sử dụng phần mềm
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search bar */}
            <div className="relative w-full md:w-64 shrink-0">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Tìm kiếm tài liệu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg pl-9 pr-4 text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-sm"
              />
            </div>

            <button
              onClick={() => setShowAbout(true)}
              className="flex items-center gap-1.5 h-9 px-4 rounded-lg border border-slate-200 bg-white text-slate-650 hover:text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50 transition-all text-xs font-semibold shadow-sm shrink-0"
            >
              <Info size={14} />
              Về phần mềm
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6">
        {/* Loading State */}
        {error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-slate-200 rounded-xl bg-white p-6 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mb-3 border border-rose-100 shadow-sm animate-bounce">
              <AlertTriangle size={20} />
            </div>
            <p className="text-slate-800 font-bold text-sm">
              Không thể tải thư viện tài liệu
            </p>
            <p className="text-slate-500 text-xs mt-1 max-w-xs leading-relaxed">
              Đã có lỗi xảy ra trong quá trình kết nối với máy chủ. Vui lòng
              kiểm tra lại kết nối mạng hoặc trạng thái máy chủ.
            </p>
            <button
              onClick={loadDocuments}
              className="mt-4 h-8 text-xs font-semibold px-4 border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors flex items-center justify-center bg-white text-slate-700 shadow-xs"
            >
              Tải lại
            </button>
          </div>
        ) : loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white border border-slate-200 rounded-xl p-5 space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-4 w-48 rounded-full" />
                  </div>
                  <Skeleton className="h-3 w-32 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : sections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <BookOpen size={24} className="text-slate-400" />
            </div>
            <p className="text-slate-700 font-semibold text-sm">
              Chưa có tài liệu nào
            </p>
            <p className="text-slate-400 text-xs mt-1">
              Liên hệ quản trị viên để thêm tài liệu.
            </p>
          </div>
        ) : filteredSections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <Search size={24} className="text-slate-400" />
            </div>
            <p className="text-slate-700 font-semibold text-sm">
              Không tìm thấy tài liệu phù hợp
            </p>
            <p className="text-slate-400 text-xs mt-1">
              Thử lại bằng từ khóa hoặc cụm từ khác.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSections.map((section) => {
              const isOpen = searchQuery !== "" || activeSection === section.id;

              return (
                <div
                  key={section.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
                >
                  {/* Section header */}
                  <button
                    onClick={() => setActiveSection(isOpen ? null : section.id)}
                    className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-slate-50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Phần {section.roman}
                          </span>
                        </div>
                        <h2 className="font-bold text-slate-800 text-sm leading-tight">
                          {section.title}
                        </h2>
                        {section.subtitle && (
                          <p className="text-slate-400 text-xs mt-0.5">
                            {section.subtitle}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {section.items?.length > 0 && (
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                          {section.items.length} tài liệu
                        </span>
                      )}
                      <ChevronRight
                        size={15}
                        className={`text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
                      />
                    </div>
                  </button>

                  {/* Content */}
                  <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isOpen
                        ? "max-h-[2000px] opacity-100"
                        : "max-h-0 opacity-0 pointer-events-none"
                    }`}
                  >
                    <div className="border-t border-slate-100">
                      {section.items && section.items.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                          {section.items.map((item: any, i: number) => {
                            const badge =
                              FILE_BADGE[item.type] || FILE_BADGE.pdf;
                            return (
                              <div
                                key={i}
                                onClick={() => {
                                  if (item.url) setActiveDoc(item);
                                }}
                                className={`flex items-center justify-between px-5 py-3.5 ${
                                  item.url
                                    ? "hover:bg-emerald-50/40 cursor-pointer"
                                    : "cursor-default"
                                } transition-colors group`}
                              >
                                <div className="flex items-center gap-3">
                                  <span
                                    className={`inline-flex items-center justify-center gap-1 text-[10px] font-bold w-[72px] py-0.5 rounded-md ${badge.color} shrink-0`}
                                  >
                                    {TYPE_ICON[item.type] || TYPE_ICON.pdf}
                                    {badge.label}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium text-slate-700">
                                      {item.title}
                                    </p>
                                    {item.classified && (
                                      <span className="inline-flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-100 uppercase">
                                        <Lock size={9} /> MẬT
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {item.url && (
                                  <ExternalLink
                                    size={13}
                                    className="text-emerald-600 hover:text-emerald-700 shrink-0 ml-4 transition-colors"
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 px-5 py-5 text-slate-400">
                          <FileText size={16} className="text-slate-300" />
                          <p className="text-xs">
                            Chưa có tài liệu trong chuyên mục này
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-slate-400 text-xs mt-8 pt-5 border-t border-slate-200">
          © 2026 Binh chủng Hóa học - Quân đội Nhân dân Việt Nam
        </p>
      </div>
    </div>
  );
}
