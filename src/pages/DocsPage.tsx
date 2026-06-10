import { useState } from "react";
import {
  BookOpen,
  ChevronRight,
  FileText,
  ExternalLink,
  Users,
  Info,
  X,
  Monitor,
  Shield,
  GraduationCap,
  ClipboardList,
  HelpCircle,
  Lock,
  Film,
  PenTool,
  FileDown,
} from "lucide-react";

// ── AUTHORS ──────────────────────────────────────────────
const AUTHORS = [
  {
    name: "Nguyễn Văn Hưng",
    rank: "Trung tá",
    role: "Phó Chủ nhiệm",
    unit: "Phòng Hậu cần - Kỹ thuật",
    school: "Trường Sĩ quan Phòng hóa",
  },
  {
    name: "Đặng Quang Dũng",
    rank: "Thượng tá",
    role: "Phó Chủ nhiệm",
    unit: "Khoa Chiến thuật",
    school: "Trường Sĩ quan Phòng hóa",
  },
  {
    name: "Nguyễn Khôi Nguyên",
    rank: "Trung úy",
    role: "Trợ lý",
    unit: "Phòng Hậu cần - Kỹ thuật",
    school: "Trường Sĩ quan Phòng hóa",
  },
];

// ── SECTION TYPES ─────────────────────────────────────────
type DocItem = {
  title: string;
  type: "pdf" | "video" | "drawing" | "doc" | "word";
  classified?: boolean;
};

type Section = {
  id: string;
  roman: string;
  title: string;
  subtitle: string;
  accent: string;
  items: DocItem[];
};

import { documentService } from "../services/document.service";
import { useEffect } from "react";

const FILE_BADGE: Record<string, { label: string; color: string }> = {
  pdf: { label: "PDF", color: "bg-rose-50 text-rose-600 border border-rose-100/70" },
  video: { label: "VIDEO", color: "bg-indigo-50 text-indigo-600 border border-indigo-100/70" },
  drawing: { label: "BẢN VẼ", color: "bg-sky-50 text-sky-600 border border-sky-100/70" },
  doc: { label: "DOC", color: "bg-emerald-50 text-emerald-600 border border-emerald-100/70" },
  word: { label: "DOCX", color: "bg-blue-50 text-blue-600 border border-blue-100/70" },
};

const ACCENT_STYLES: Record<
  string,
  { borderBar: string; iconBg: string; iconBorder: string; hover: string; ext: string }
> = {
  red: {
    borderBar: "border-l-rose-500",
    iconBg: "bg-rose-50",
    iconBorder: "border-rose-200",
    hover: "hover:bg-rose-50/40",
    ext: "group-hover:text-rose-500",
  },
  violet: {
    borderBar: "border-l-violet-500",
    iconBg: "bg-violet-50",
    iconBorder: "border-violet-200",
    hover: "hover:bg-violet-50/40",
    ext: "group-hover:text-violet-500",
  },
  amber: {
    borderBar: "border-l-amber-500",
    iconBg: "bg-amber-50",
    iconBorder: "border-amber-200",
    hover: "hover:bg-amber-50/40",
    ext: "group-hover:text-amber-500",
  },
  emerald: {
    borderBar: "border-l-emerald-500",
    iconBg: "bg-emerald-50",
    iconBorder: "border-emerald-200",
    hover: "hover:bg-emerald-50/40",
    ext: "group-hover:text-emerald-500",
  },
};

const getSectionIcon = (accent: string) => {
  switch (accent) {
    case "red":
      return <Shield size={18} className="text-rose-500" />;
    case "violet":
      return <GraduationCap size={18} className="text-violet-500" />;
    case "amber":
      return <ClipboardList size={18} className="text-amber-500" />;
    default:
      return <HelpCircle size={18} className="text-emerald-500" />;
  }
};

const TYPE_ICON: Record<string, React.ReactNode> = {
  pdf: <FileText size={13} />,
  video: <Film size={13} />,
  drawing: <PenTool size={13} />,
  doc: <FileDown size={13} />,
  word: <FileText size={13} />,
};

// ── ABOUT MODAL ───────────────────────────────────────────
function AboutModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-slate-900 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/favicon.ico"
              alt="Logo"
              className="w-9 h-9 object-contain"
            />
            <div>
              <h2 className="text-white font-bold text-base">
                Mô phỏng Khí tài phát khói
              </h2>
              <p className="text-slate-400 text-xs">Phiên bản 1.0.0 - 2026</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition p-1 rounded-lg hover:bg-white/10"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6 space-y-5">
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
                    <p className="text-xs text-slate-500">
                      {a.role} {a.unit}
                    </p>
                    <p className="text-xs text-emerald-600 font-medium">
                      {a.school}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-center text-slate-400 text-xs pt-2 border-t border-slate-100">
            © 2026 Binh chủng Hóa học - Quân đội Nhân dân Việt Nam
          </p>
        </div>
      </div>
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────
export default function DocsPage() {
  const [showAbout, setShowAbout] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    documentService.getDocumentSections()
      .then((data: any[]) => {
        setSections(data || []);
        if (data && data.length > 0) setActiveSection(data[0].id);
      })
      .catch((err) => console.error("Lỗi tải tài liệu từ BE:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-[calc(100vh-48px)] bg-slate-50/70">
      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}

      {/* Page Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-sm shadow-emerald-200">
              <BookOpen size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">Thư viện tài liệu</h1>
              <p className="text-slate-500 text-xs mt-0.5">Tài liệu kỹ thuật, bài giảng và hướng dẫn sử dụng phần mềm</p>
            </div>
          </div>
          <button
            onClick={() => setShowAbout(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50 transition-all text-xs font-semibold shadow-sm"
          >
            <Info size={14} />
            Về phần mềm
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6">
        {/* Loading State */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white border border-slate-200 rounded-xl overflow-hidden animate-pulse">
                <div className="h-16 bg-slate-100" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-slate-100 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : sections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <BookOpen size={24} className="text-slate-400" />
            </div>
            <p className="text-slate-700 font-semibold text-sm">Chưa có tài liệu nào</p>
            <p className="text-slate-400 text-xs mt-1">Liên hệ quản trị viên để thêm tài liệu.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sections.map((section) => {
              const acc = ACCENT_STYLES[section.accent] || ACCENT_STYLES.emerald;
              const sectionIcon = getSectionIcon(section.accent);
              const isOpen = activeSection === section.id;

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
                    <div className="flex items-center gap-4">
                      {/* Accent color bar + icon */}
                      <div className={`w-9 h-9 rounded-lg ${acc.iconBg} border ${acc.iconBorder} flex items-center justify-center shrink-0`}>
                        {sectionIcon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phần {section.roman}</span>
                        </div>
                        <h2 className="font-bold text-slate-800 text-sm leading-tight">{section.title}</h2>
                        {section.subtitle && (
                          <p className="text-slate-400 text-xs mt-0.5">{section.subtitle}</p>
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

                  {/* Left accent bar */}
                  <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0 pointer-events-none"
                    }`}
                  >
                    <div className={`border-t border-slate-100 border-l-[3px] ${acc.borderBar}`}>
                      {section.items && section.items.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                          {section.items.map((item: any, i: number) => {
                            const badge = FILE_BADGE[item.type] || FILE_BADGE.pdf;
                            return (
                              <div
                                key={i}
                                onClick={() => { if (item.url) window.open(item.url, "_blank"); }}
                                className={`flex items-center justify-between px-5 py-3.5 ${
                                  item.url ? `${acc.hover} cursor-pointer` : "cursor-default"
                                } transition-colors group`}
                              >
                                <div className="flex items-center gap-3">
                                  <span className={`inline-flex items-center justify-center gap-1 text-[10px] font-bold w-[72px] py-0.5 rounded-md ${badge.color} shrink-0`}>
                                    {TYPE_ICON[item.type] || TYPE_ICON.pdf}
                                    {badge.label}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium text-slate-700">{item.title}</p>
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
                                    className={`text-slate-300 ${acc.ext} shrink-0 ml-4 transition-colors`}
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 px-5 py-5 text-slate-400">
                          <FileText size={16} className="text-slate-300" />
                          <p className="text-xs">Chưa có tài liệu trong chuyên mục này</p>
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

