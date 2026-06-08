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
  desc: string;
  type: "pdf" | "video" | "drawing" | "doc" | "word";
  classified?: boolean;
};

type Section = {
  id: string;
  roman: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  accent: string;
  items: DocItem[];
};

const FILE_BADGE: Record<string, { label: string; color: string }> = {
  pdf: { label: "PDF", color: "bg-red-100 text-red-600" },
  video: { label: "VIDEO", color: "bg-purple-100 text-purple-600" },
  drawing: { label: "BẢN VẼ", color: "bg-sky-100 text-sky-600" },
  doc: { label: "DOC", color: "bg-blue-100 text-blue-600" },
  word: { label: "DOCX", color: "bg-indigo-100 text-indigo-600" },
};

const SECTIONS: Section[] = [
  {
    id: "classified",
    roman: "I",
    title: "Tài liệu mật",
    subtitle:
      "Các tài liệu nghiệp vụ kỹ thuật — Nhà xuất bản Quân đội Nhân dân Việt Nam",
    icon: <Shield size={20} className="text-red-500" />,
    accent: "red",
    items: [
      {
        title: "Điều lệnh tiểu đội thả khói",
        desc: "Quy trình, đội hình và nhiệm vụ tiểu đội thả khói ngụy trang bảo vệ mục tiêu.",
        type: "pdf",
        classified: true,
      },
      {
        title: "Điều lệnh trung đội thả khói",
        desc: "Tổ chức chỉ huy, phối hợp và thực hành trung đội thả khói trong tác chiến.",
        type: "pdf",
        classified: true,
      },
      {
        title: "Hướng dẫn sử dụng khí tài TDA-2",
        desc: "Tài liệu kỹ thuật vận hành, bảo dưỡng và xử lý sự cố khí tài TDA-2.",
        type: "pdf",
        classified: true,
      },
      {
        title: "Hướng dẫn sử dụng khí tài ДА-1",
        desc: "Tài liệu kỹ thuật vận hành khí tài ДА-1 (nguồn gốc Liên Xô).",
        type: "pdf",
        classified: true,
      },
      {
        title: "Tiêu chuẩn kỹ thuật màn khói che khuất mục tiêu",
        desc: "Quy định về chiều dài, độ dày, thời gian duy trì màn khói trong các điều kiện chiến đấu.",
        type: "pdf",
        classified: true,
      },
      {
        title: "Phương án thả khói bảo vệ các loại mục tiêu",
        desc: "Hướng dẫn lập phương án theo từng loại mục tiêu: điểm, tuyến, diện.",
        type: "pdf",
        classified: true,
      },
    ],
  },
  {
    id: "lectures",
    roman: "II",
    title: "Bài giảng & Tài liệu huấn luyện",
    subtitle: "Trường Sĩ quan Phòng hóa — Khoa Chiến thuật",
    icon: <GraduationCap size={20} className="text-violet-500" />,
    accent: "violet",
    items: [
      {
        title: "Bài giảng: Lý thuyết khói che khuất",
        desc: "Cơ sở lý thuyết về thành phần, tính chất vật lý và hóa học của màn khói quân sự.",
        type: "pdf",
      },
      {
        title: "Bài giảng: Phương pháp tính toán thả khói",
        desc: "Công thức, bảng tra và ví dụ tính toán thực hành cho từng loại tình huống.",
        type: "pdf",
      },
      {
        title: "Phim mô phỏng: Tiểu đội thả khói thực binh",
        desc: "Video thực hành triển khai tiểu đội trên thực địa trong điều kiện diễn tập.",
        type: "video",
      },
      {
        title: "Phim mô phỏng: Trung đội thả khói bảo vệ sân bay",
        desc: "Video mô phỏng phương án thả khói bảo vệ mục tiêu là sân bay.",
        type: "video",
      },
      {
        title: "Bản vẽ kỹ thuật: Khí tài TDA-2",
        desc: "Bản vẽ kết cấu, sơ đồ nguyên lý và hệ thống điều khiển khí tài TDA-2.",
        type: "drawing",
      },
      {
        title: "Bản vẽ kỹ thuật: Xe chở khí tài chuyên dụng",
        desc: "Bản vẽ lắp đặt khí tài phát khói trên xe vận tải quân sự.",
        type: "drawing",
      },
      {
        title: "Bài tập tình huống thực hành",
        desc: "Tập hợp 12 tình huống bài tập tính toán và lập phương án thả khói.",
        type: "doc",
      },
    ],
  },
  {
    id: "template",
    roman: "III",
    title: "Thuyết minh kế hoạch thả khói mẫu",
    subtitle: "Tài liệu tham khảo — Mẫu xuất file Word từ hệ thống tính toán",
    icon: <ClipboardList size={20} className="text-amber-500" />,
    accent: "amber",
    items: [
      {
        title: "Thuyết minh kế hoạch thả khói bảo vệ mục tiêu (mẫu)",
        desc: "Tài liệu đang được cập nhật — sẽ bổ sung sau.",
        type: "word",
      },
    ],
  },
  {
    id: "manual",
    roman: "IV",
    title: "Hướng dẫn sử dụng phần mềm",
    subtitle: "Hướng dẫn từng bước sử dụng hệ thống tính toán và mô phỏng",
    icon: <HelpCircle size={20} className="text-emerald-500" />,
    accent: "emerald",
    items: [
      {
        title: "Hướng dẫn sử dụng phần mềm mô phỏng khí tài phát khói",
        desc: "Tài liệu đang được cập nhật — sẽ bổ sung sau.",
        type: "doc",
      },
    ],
  },
];

const ACCENT_STYLES: Record<
  string,
  { header: string; hover: string; chevron: string; ext: string; badge: string }
> = {
  red: {
    header: "border-red-100",
    hover: "hover:bg-red-50/40",
    chevron: "group-hover:text-red-500",
    ext: "group-hover:text-red-400",
    badge: "bg-red-50 border-red-100",
  },
  violet: {
    header: "border-violet-100",
    hover: "hover:bg-violet-50/40",
    chevron: "group-hover:text-violet-500",
    ext: "group-hover:text-violet-400",
    badge: "bg-violet-50 border-violet-100",
  },
  amber: {
    header: "border-amber-100",
    hover: "hover:bg-amber-50/40",
    chevron: "group-hover:text-amber-500",
    ext: "group-hover:text-amber-400",
    badge: "bg-amber-50 border-amber-100",
  },
  emerald: {
    header: "border-emerald-100",
    hover: "hover:bg-emerald-50/40",
    chevron: "group-hover:text-emerald-500",
    ext: "group-hover:text-emerald-400",
    badge: "bg-emerald-50 border-emerald-100",
  },
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
              <p className="text-slate-400 text-xs">Phiên bản 1.0.0 — 2026</p>
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
            © 2026 Binh chủng Hóa học — Quân đội Nhân dân Việt Nam
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

  return (
    <div className="min-h-[calc(100vh-48px)] bg-slate-50 p-6">
      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
              <BookOpen size={28} className="text-emerald-600" />
              Tài liệu
            </h1>
            <p className="text-slate-500 mt-1 text-sm">
              Tài liệu kỹ thuật, bài giảng, mẫu thuyết minh và hướng dẫn sử dụng
              phần mềm.
            </p>
          </div>
          <button
            onClick={() => setShowAbout(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 transition-all text-xs font-semibold shadow-sm"
          >
            <Info size={14} />
            Về phần mềm
          </button>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {SECTIONS.map((section) => {
            const acc = ACCENT_STYLES[section.accent];

            return (
              <div
                key={section.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
              >
                {/* Section header */}
                <button
                  onClick={() =>
                    setActiveSection(
                      activeSection === section.id ? null : section.id,
                    )
                  }
                  className={`w-full flex items-center justify-between gap-4 p-5 border-b ${acc.header} bg-slate-50/50 text-left hover:bg-slate-100/50 transition-colors`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 font-black text-base whitespace-nowrap">
                        Phần {section.roman}
                      </span>
                      <div className="w-px h-8 bg-slate-200" />
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-sm">
                        {section.icon}
                      </div>
                    </div>
                    <div className="text-left">
                      <h2 className="font-bold text-slate-800 text-base">
                        {section.title}
                      </h2>
                      <p className="text-slate-500 text-xs mt-0.5">
                        {section.subtitle}
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    size={16}
                    className={`text-slate-400 shrink-0 transition-transform ${activeSection === section.id ? "" : "rotate-90"}`}
                  />
                </button>

                {/* Doc list for all sections */}
                {activeSection !== section.id && (
                  <div className="divide-y divide-slate-100">
                    {section.items.map((item, i) => {
                      const badge = FILE_BADGE[item.type];
                      return (
                        <div
                          key={i}
                          className={`flex items-center justify-between px-5 py-4 ${acc.hover} transition-colors cursor-pointer group`}
                        >
                          <div className="flex items-start gap-3">
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded ${badge.color} shrink-0 mt-0.5`}
                            >
                              {TYPE_ICON[item.type]}
                              {badge.label}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-slate-700">
                                  {item.title}
                                </p>
                                {item.classified && (
                                  <span className="inline-flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded bg-red-100 text-red-600 border border-red-200 uppercase">
                                    <Lock size={9} /> MẬT
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <ExternalLink
                            size={14}
                            className={`text-slate-300 ${acc.ext} shrink-0 ml-4 transition-colors`}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Part III: extra note about Word export */}
                {/* {activeSection !== section.id && section.id === 'template' && (
                  <div className="px-5 py-3 bg-amber-50/60 border-t border-amber-100 flex items-center gap-2">
                    <Play size={13} className="text-amber-500 shrink-0" />
                    <p className="text-xs text-amber-700">
                      Các mẫu thuyết minh trên được tự động tạo ra khi nhấn <strong>Xuất File Word</strong> trong trang Mô phỏng sau khi tính toán xong.
                    </p>
                  </div>
                )} */}
              </div>
            );
          })}
        </div>

        {/* Authors section */}
        <div className="mt-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-start gap-4 p-5 border-b border-slate-100 bg-slate-50/50">
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-sm">
              <Users size={20} className="text-emerald-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-base">
                Thông tin phần mềm & Tác giả
              </h2>
              <p className="text-slate-500 text-xs mt-0.5">
                Hệ thống mô phỏng tính toán khí tài phát khói — Phiên bản 1.0.0
              </p>
            </div>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {AUTHORS.map((a, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-100"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs shrink-0">
                      {i + 1}
                    </div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                      Tác giả {i + 1}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-800">
                    {a.rank} {a.name}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {a.role} {a.unit}
                  </p>
                  <p className="text-xs text-emerald-600 font-medium">
                    {a.school}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-center text-slate-400 text-xs mt-5 pt-4 border-t border-slate-100">
              © 2026 Binh chủng Hóa học — Quân đội Nhân dân Việt Nam
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
