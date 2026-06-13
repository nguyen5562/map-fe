import { useState, useEffect } from "react";
import {
  Film,
  Play,
  Search,
  Lock,
  X,
  SlidersHorizontal,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { documentService } from "../services/document.service";
import { Skeleton } from "../components/ui/Skeleton";
import { resolveBackendUrl } from "../const/apiConfig";

type VideoItem = {
  id: string;
  title: string;
  type: string;
  url: string | null;
  classified: boolean;
  sectionId: string;
  sectionTitle?: string;
  sectionRoman?: string;
};

type Section = {
  id: string;
  roman: string;
  title: string;
  items: any[];
};

// const isDirectVideoFile = (url: string | null) => {
//   if (!url) return false;
//   const cleanUrl = url.toLowerCase().split("?")[0];
//   return (
//     cleanUrl.endsWith(".mp4") ||
//     cleanUrl.endsWith(".webm") ||
//     cleanUrl.endsWith(".ogg") ||
//     cleanUrl.startsWith("uploads/") ||
//     cleanUrl.startsWith("/uploads/")
//   );
// };

export default function VideosPage() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);

  const loadVideos = () => {
    setLoading(true);
    setError(false);
    documentService
      .getDocumentSections("video")
      .then((data: any[]) => {
        const allVideos: VideoItem[] = [];
        const validSections: Section[] = [];

        (data || [])
          .filter((sec: any) => sec.type === "video")
          .forEach((sec) => {
            const sectionVideos = (sec.items || [])
              .filter((item: any) => item.type === "video")
              .map((item: any) => ({
                ...item,
                sectionTitle: sec.title,
                sectionRoman: sec.roman,
              }));

            if (sectionVideos.length > 0) {
              allVideos.push(...sectionVideos);
              validSections.push({
                id: sec.id,
                roman: sec.roman,
                title: sec.title,
                items: sectionVideos,
              });
            }
          });

        setVideos(allVideos);
        setSections(validSections);
      })
      .catch((err) => {
        console.error("Lỗi tải danh sách video từ BE:", err);
        setError(true);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadVideos();
  }, []);

  // Filtered videos based on section and search query
  const filteredVideos = videos.filter((video) => {
    const matchesSection =
      selectedSectionId === "all" || video.sectionId === selectedSectionId;
    const matchesSearch = video.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesSection && matchesSearch;
  });

  return (
    <div className="min-h-[calc(100vh-48px)] bg-slate-50/70 text-xs">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-sm shadow-emerald-200">
              <Film size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 tracking-tight">
                Thư viện Video mô phỏng
              </h1>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Các video mô phỏng, hướng dẫn thực hành và vận hành khí tài phát
                khói
              </p>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-72 shrink-0">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Tìm kiếm video..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg pl-9 pr-4 text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-sm"
            />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6">
        {error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-slate-200 rounded-xl bg-white p-6 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mb-3 border border-rose-100 shadow-sm animate-bounce">
              <AlertTriangle size={20} />
            </div>
            <p className="text-slate-800 font-bold text-sm">
              Không thể tải thư viện video
            </p>
            <p className="text-slate-500 text-xs mt-1 max-w-xs leading-relaxed">
              Đã có lỗi xảy ra trong quá trình kết nối với máy chủ. Vui lòng
              kiểm tra lại kết nối mạng hoặc trạng thái máy chủ.
            </p>
            <button
              onClick={loadVideos}
              className="mt-4 h-8 text-xs font-semibold px-4 border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors flex items-center justify-center bg-white text-slate-700 shadow-xs"
            >
              Tải lại
            </button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white border border-slate-200 rounded-xl p-3 space-y-3 shadow-xs"
              >
                <Skeleton className="h-40 w-full rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-1/3 rounded-full" />
                  <Skeleton className="h-5 w-5/6 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <Film size={24} className="text-slate-400" />
            </div>
            <p className="text-slate-700 font-semibold text-sm">
              Chưa có video nào
            </p>
            <p className="text-slate-400 text-xs mt-1">
              Liên hệ quản trị viên để thêm video bài giảng.
            </p>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar Filter for Desktop */}
            <div className="w-full md:w-56 shrink-0 space-y-2">
              <div className="flex items-center gap-2 px-2 py-1 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <SlidersHorizontal size={12} />
                <span>Chuyên mục</span>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <button
                  onClick={() => setSelectedSectionId("all")}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left font-semibold transition-all border-l-2 ${
                    selectedSectionId === "all"
                      ? "border-l-emerald-600 bg-emerald-50/50 text-emerald-700"
                      : "border-l-transparent text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span>Tất cả video</span>
                  <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">
                    {videos.length}
                  </span>
                </button>
                {sections.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => setSelectedSectionId(sec.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left font-semibold transition-all border-t border-slate-100 border-l-2 ${
                      selectedSectionId === sec.id
                        ? "border-l-emerald-600 bg-emerald-50/50 text-emerald-700"
                        : "border-l-transparent text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span className="truncate pr-2">
                      Mục {sec.roman}: {sec.title}
                    </span>
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold shrink-0">
                      {sec.items.length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Video Cards Grid */}
            <div className="flex-1">
              {filteredVideos.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-xl py-20 px-6 text-center shadow-xs">
                  <p className="text-slate-500 font-semibold text-sm">
                    Không tìm thấy video nào
                  </p>
                  <p className="text-slate-400 text-xs mt-1">
                    Vui lòng thử lại với từ khóa hoặc chuyên mục khác.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredVideos.map((video) => {
                    return (
                      <div
                        key={video.id}
                        onClick={() => setActiveVideo(video)}
                        className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col group cursor-pointer"
                      >
                        {/* Video Thumbnail Area */}
                        <div className="relative aspect-video w-full bg-slate-900 flex items-center justify-center overflow-hidden">
                          {/* Rich Aesthetic Gradient background */}
                          <div className="absolute inset-0 bg-gradient-to-tr from-emerald-950 via-slate-900 to-slate-800 opacity-90 transition-transform duration-300 group-hover:scale-105" />
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.15)_0%,transparent_70%)]" />

                          {/* Play Button Overlay */}
                          <div className="relative z-10 w-12 h-12 rounded-full bg-white/10 group-hover:bg-emerald-600 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:border-emerald-400/30 text-white shadow-lg transition-all duration-300 group-hover:scale-110">
                            <Play
                              size={18}
                              fill="currentColor"
                              className="ml-0.5"
                            />
                          </div>

                          {/* Classified badge */}
                          {video.classified && (
                            <div className="absolute top-2 left-2 z-10 bg-rose-600/90 backdrop-blur-sm text-white text-[9px] font-black uppercase px-2 py-0.5 rounded border border-rose-500/40 flex items-center gap-1 shadow-sm">
                              <Lock size={8} /> MẬT
                            </div>
                          )}

                          {/* Section Badge */}
                          {video.sectionRoman && (
                            <div className="absolute bottom-2 right-2 z-10 bg-slate-900/80 backdrop-blur-sm text-slate-300 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border border-white/10">
                              MỤC {video.sectionRoman}
                            </div>
                          )}
                        </div>

                        {/* Title and metadata */}
                        <div className="p-4 flex-1 flex flex-col justify-between gap-3 bg-white">
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold block mb-1">
                              {video.sectionTitle}
                            </span>
                            <h3 className="font-bold text-slate-800 text-xs line-clamp-2 leading-snug group-hover:text-emerald-600 transition-colors">
                              {video.title}
                            </h3>
                          </div>

                          <div className="flex items-center justify-between text-[10px] font-bold text-emerald-600 group-hover:text-emerald-700 pt-2 border-t border-slate-50">
                            <span className="flex items-center gap-1">
                              Xem video
                              <ChevronRight
                                size={10}
                                className="transition-transform group-hover:translate-x-0.5"
                              />
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* VIDEO PLAYER MODAL */}
      {activeVideo && activeVideo.url && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setActiveVideo(null)}
        >
          <div
            className="w-full max-w-7xl h-[90vh] mx-4 overflow-hidden rounded-2xl bg-slate-950 shadow-2xl border border-white/10 flex flex-col animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-slate-900 px-5 py-3.5 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-2 mr-4 min-w-0">
                <Film size={14} className="text-emerald-400 shrink-0" />
                <h3 className="text-white font-bold text-xs truncate">
                  {activeVideo.title}
                </h3>
                {activeVideo.classified && (
                  <span className="bg-rose-600/90 text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded border border-rose-500/40 flex items-center gap-1 shrink-0 shadow-sm">
                    <Lock size={8} /> MẬT
                  </span>
                )}
              </div>
              <button
                onClick={() => setActiveVideo(null)}
                className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
              >
                <X size={16} />
              </button>
            </div>

            {/* Video Player Box */}
            <div className="flex-1 bg-black flex items-center justify-center overflow-hidden">
              <video
                src={resolveBackendUrl(activeVideo.url)}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="max-w-5xl mx-auto px-6">
        <p className="text-center text-slate-400 text-xs mt-8 pb-5 border-t border-slate-200 pt-5">
          © 2026 Binh chủng Hóa học - Quân đội Nhân dân Việt Nam
        </p>
      </div>
    </div>
  );
}
