import { BookOpen, ChevronRight, FileText, Bookmark, ExternalLink } from 'lucide-react';

type DocSection = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  docs: { title: string; desc: string }[];
};

const SECTIONS: DocSection[] = [
  {
    id: 'regulations',
    title: 'Quy định & Tiêu chuẩn',
    description: 'Các văn bản pháp quy, quy định kỹ thuật liên quan đến khí tài phát khói.',
    icon: <FileText size={20} className="text-blue-500" />,
    docs: [
      { title: 'Quy chuẩn kỹ thuật quốc gia về khí tài phát khói', desc: 'Các thông số kỹ thuật cơ bản và tiêu chuẩn kiểm tra chất lượng.' },
      { title: 'Quy định sử dụng an toàn', desc: 'Hướng dẫn an toàn khi triển khai và vận hành khí tài.' },
      { title: 'Tiêu chuẩn đánh giá hiệu quả màn khói', desc: 'Phương pháp đo lường và đánh giá hiệu quả che khuất.' },
    ],
  },
  {
    id: 'methods',
    title: 'Phương pháp tính toán',
    description: 'Tài liệu hướng dẫn các công thức và phương pháp tính toán trong hệ thống.',
    icon: <Bookmark size={20} className="text-violet-500" />,
    docs: [
      { title: 'Công thức tính diện tích màn khói', desc: 'Cơ sở toán học cho việc tính toán diện tích cần bao phủ.' },
      { title: 'Phương pháp bố trí khí tài theo địa hình', desc: 'Hướng dẫn tối ưu hóa vị trí đặt khí tài.' },
      { title: 'Tính toán ảnh hưởng của khí tượng', desc: 'Mô hình tính toán tác động của gió, nhiệt độ đến màn khói.' },
    ],
  },
  {
    id: 'reference',
    title: 'Tài liệu tham khảo',
    description: 'Nghiên cứu, báo cáo và tài liệu học thuật liên quan.',
    icon: <BookOpen size={20} className="text-amber-500" />,
    docs: [
      { title: 'Báo cáo nghiên cứu hiệu quả màn khói trong điều kiện thực địa', desc: 'Số liệu thực nghiệm từ các bài huấn luyện.' },
      { title: 'So sánh các loại khí tài phát khói', desc: 'Bảng so sánh thông số kỹ thuật các loại khí tài.' },
      { title: 'Hướng dẫn sử dụng hệ thống phần mềm', desc: 'Tài liệu hướng dẫn người dùng cho phiên bản hiện tại.' },
    ],
  },
];

export default function DocsPage() {
  return (
    <div className="min-h-[calc(100vh-48px)] bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <BookOpen size={28} className="text-blue-600" />
            Tài liệu tham khảo
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Tổng hợp các tài liệu kỹ thuật, quy định và phương pháp tính toán liên quan đến hệ thống.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {SECTIONS.map(section => (
            <div key={section.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Section header */}
              <div className="flex items-start gap-4 p-5 border-b border-slate-100 bg-slate-50/50">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-sm">
                  {section.icon}
                </div>
                <div>
                  <h2 className="font-bold text-slate-800 text-base">{section.title}</h2>
                  <p className="text-slate-500 text-xs mt-0.5">{section.description}</p>
                </div>
              </div>

              {/* Doc list */}
              <div className="divide-y divide-slate-100">
                {section.docs.map((doc, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-5 py-4 hover:bg-blue-50/40 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-start gap-3">
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500 mt-0.5 transition-colors shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-slate-700 group-hover:text-blue-700 transition-colors">
                          {doc.title}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">{doc.desc}</p>
                      </div>
                    </div>
                    <ExternalLink size={14} className="text-slate-300 group-hover:text-blue-400 shrink-0 ml-4 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p className="text-center text-slate-400 text-xs mt-8">
          Nội dung đang được cập nhật. Liên hệ quản trị viên để được hỗ trợ thêm tài liệu.
        </p>
      </div>
    </div>
  );
}
