import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Plus,
  Trash2,
  Edit,
  X,
  GripVertical,
  Lock,
  Film,
  FileText,
  PenTool,
  FileDown,
  AlertTriangle,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { documentService } from "../../services/document.service";
import { DeleteConfirmModal } from "../ui/DeleteConfirmModal";
import { useToast } from "../../context/ToastContext";
import { Skeleton } from "../ui/Skeleton";

const FILE_BADGE: Record<string, { label: string; color: string }> = {
  pdf: {
    label: "PDF",
    color: "bg-rose-50 text-rose-600 border border-rose-100/70",
  },
  video: {
    label: "VIDEO",
    color: "bg-indigo-50 text-indigo-600 border border-indigo-100/70",
  },
  drawing: {
    label: "BẢN VẼ",
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
    label: "HÌNH ẢNH",
    color: "bg-purple-50 text-purple-600 border border-purple-100/70",
  },
};

const TYPE_ICON: Record<string, React.ReactNode> = {
  pdf: <FileText size={10} />,
  video: <Film size={10} />,
  drawing: <PenTool size={10} />,
  word: <FileDown size={10} />,
  excel: <FileDown size={10} />,
  powerpoint: <FileText size={10} />,
  image: <ImageIcon size={10} />,
};

export const DocumentsTab = ({
  mode = "document",
}: {
  mode?: "document" | "video";
}) => {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const toast = useToast();

  // Modal Section
  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<any>(null);
  const [sectionForm, setSectionForm] = useState({
    roman: "",
    title: "",
    subtitle: "",
  });

  // Modal Doc
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<string>("");
  const [editingDoc, setEditingDoc] = useState<any>(null);
  const [docForm, setDocForm] = useState({
    title: "",
    type: "pdf",
    classified: false,
    url: "",
  });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadFileName, setUploadFileName] = useState("");
  const [uploadFileSize, setUploadFileSize] = useState("");

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "section" | "document";
    id: string;
    label: string;
    message: string;
  } | null>(null);

  // Drag and drop
  const dragItemRef = useRef<{ sectionId: string; index: number } | null>(null);
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split(".").pop()?.toLowerCase() || "";

    if (mode === "video") {
      const allowedVideoExtensions = ["mp4", "webm", "ogg"];
      if (!allowedVideoExtensions.includes(ext)) {
        toast.error(
          "Định dạng video không được hỗ trợ. Vui lòng chỉ chọn tệp .mp4, .webm, .ogg",
        );
        e.target.value = "";
        return;
      }
    } else {
      const allowedDocExtensions = [
        "doc",
        "docx",
        "xls",
        "xlsx",
        "pdf",
        "ppt",
        "pptx",
        "png",
        "jpg",
        "jpeg",
        "webp",
        "svg",
        "dwg",
        "dxf",
        "cdr",
      ];
      if (!allowedDocExtensions.includes(ext)) {
        toast.error(
          "Định dạng tệp không hỗ trợ. Vui lòng chọn tài liệu văn phòng (PDF, Word, Excel, PowerPoint) hoặc bản vẽ sơ đồ (DWG, DXF, CDR, Hình ảnh)",
        );
        e.target.value = "";
        return;
      }
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadFileName(file.name);
    setUploadFileSize(formatFileSize(file.size));

    try {
      const res = await documentService.uploadFile(file, (progressEvent) => {
        const total = progressEvent.total || 0;
        if (total > 0) {
          const percent = Math.round((progressEvent.loaded * 100) / total);
          setUploadProgress(percent);
        }
      });

      // Auto-determine document type/format based on file extension
      let detectedType = docForm.type;
      if (mode !== "video") {
        const ext = res.extension;
        if (ext === "pdf") {
          detectedType = "pdf";
        } else if (["doc", "docx"].includes(ext)) {
          detectedType = "word";
        } else if (["xls", "xlsx"].includes(ext)) {
          detectedType = "excel";
        } else if (["ppt", "pptx"].includes(ext)) {
          detectedType = "powerpoint";
        } else if (["png", "jpg", "jpeg", "webp", "svg"].includes(ext)) {
          detectedType = "image";
        } else if (["dwg", "dxf", "cdr"].includes(ext)) {
          detectedType = "drawing";
        }
      }

      // Auto-populate Title if it's currently empty
      const originalNameWithoutExt =
        file.name.substring(0, file.name.lastIndexOf(".")) || file.name;

      setDocForm((prev) => ({
        ...prev,
        title: prev.title ? prev.title : originalNameWithoutExt,
        url: res.url,
        type: mode === "video" ? "video" : detectedType,
      }));

      toast.success("Tải tệp lên thành công!");
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải tệp lên. Vui lòng thử lại.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      e.target.value = "";
    }
  };

  const loadDocuments = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await documentService.getDocumentSections(mode);
      setSections(data || []);
    } catch (err) {
      setError(true);
      toast.error("Không thể tải danh mục và tài liệu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [mode]);

  const handleOpenSectionModal = (sec: any = null) => {
    if (sec) {
      setEditingSection(sec);
      setSectionForm({
        roman: sec.roman,
        title: sec.title,
        subtitle: sec.subtitle || "",
      });
    } else {
      setEditingSection(null);
      setSectionForm({
        roman: "",
        title: "",
        subtitle: "",
      });
    }
    setSectionModalOpen(true);
  };

  const handleSaveSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectionForm.roman || !sectionForm.title) {
      toast.error("Vui lòng điền ký hiệu số La Mã và tiêu đề chuyên mục.");
      return;
    }
    try {
      const payload = { ...sectionForm, type: mode };
      if (editingSection) {
        await documentService.updateSection(editingSection.id, payload);
        toast.success("Cập nhật chuyên mục thành công!");
      } else {
        await documentService.createSection(payload);
        toast.success("Tạo chuyên mục thành công!");
      }
      setSectionModalOpen(false);
      loadDocuments();
    } catch (err: any) {
      toast.error("Lỗi lưu chuyên mục.");
    }
  };

  const handleOpenDocModal = (secId: string, doc: any = null) => {
    setSelectedSectionId(secId);
    if (doc) {
      setEditingDoc(doc);
      setDocForm({
        title: doc.title,
        type: doc.type,
        classified: doc.classified,
        url: doc.url || "",
      });
    } else {
      setEditingDoc(null);
      setDocForm({
        title: "",
        type: mode === "video" ? "video" : "pdf",
        classified: false,
        url: "",
      });
    }
    setDocModalOpen(true);
  };

  const handleSaveDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docForm.title) {
      toast.error("Vui lòng điền tên tài liệu.");
      return;
    }
    try {
      const data = { ...docForm, sectionId: selectedSectionId };
      if (editingDoc) {
        await documentService.updateDocument(editingDoc.id, data);
        toast.success("Cập nhật tài liệu thành công!");
      } else {
        await documentService.createDocument(data);
        toast.success("Thêm tài liệu thành công!");
      }
      setDocModalOpen(false);
      loadDocuments();
    } catch (err: any) {
      toast.error("Lỗi lưu tài liệu.");
    }
  };

  const requestDelete = (
    type: "section" | "document",
    id: string,
    label: string,
    message: string,
  ) => {
    setDeleteTarget({ type, id, label, message });
    setDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;
    const { type, id } = deleteTarget;
    setDeleteModalOpen(false);
    try {
      if (type === "section") {
        await documentService.deleteSection(id);
        toast.success("Xóa chuyên mục thành công!");
      } else if (type === "document") {
        await documentService.deleteDocument(id);
        toast.success("Xóa tài liệu thành công!");
      }
      loadDocuments();
    } catch (err: any) {
      toast.error(`Lỗi xóa dữ liệu.`);
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleDragStart = (sectionId: string, index: number) => {
    dragItemRef.current = { sectionId, index };
  };

  const handleDragOver = (e: React.DragEvent, key: string) => {
    e.preventDefault();
    setDragOverKey(key);
  };

  const handleDrop = async (sectionId: string, dropIndex: number) => {
    setDragOverKey(null);
    if (!dragItemRef.current) return;
    if (dragItemRef.current.sectionId !== sectionId) return;
    const dragIndex = dragItemRef.current.index;
    if (dragIndex === dropIndex) return;

    // Reorder items locally first (optimistic update)
    setSections((prev: any[]) =>
      prev.map((sec: any) => {
        if (sec.id !== sectionId) return sec;
        const items = [...sec.items];
        const [moved] = items.splice(dragIndex, 1);
        items.splice(dropIndex, 0, moved);
        return { ...sec, items };
      }),
    );

    // Persist to backend
    try {
      const section = sections.find((s: any) => s.id === sectionId);
      if (!section) return;
      const items = [...section.items];
      const [moved] = items.splice(dragIndex, 1);
      items.splice(dropIndex, 0, moved);
      await documentService.reorderDocuments(
        sectionId,
        items.map((i: any) => i.id),
      );
    } catch (err) {
      console.error("Lỗi lưu thứ tự tài liệu:", err);
      loadDocuments(); // revert on error
    }
    dragItemRef.current = null;
  };

  return (
    <div className="space-y-6 text-xs">
      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
          {mode === "video" ? "Danh mục & Video" : "Danh mục & tài liệu"}
        </h3>
        <Button
          onClick={() => handleOpenSectionModal()}
          variant="success"
          className="h-8 text-xs font-bold gap-1 px-3"
        >
          <Plus size={13} />{" "}
          {mode === "video" ? "Thêm chuyên mục video" : "Thêm chuyên mục"}
        </Button>
      </div>

      {error ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-slate-200 rounded-xl bg-white p-6 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mb-3 border border-rose-100 shadow-sm animate-bounce">
            <AlertTriangle size={20} />
          </div>
          <p className="text-slate-800 font-bold text-sm">
            Không thể tải danh sách tài liệu
          </p>
          <p className="text-slate-500 text-xs mt-1 max-w-xs leading-relaxed">
            Đã có lỗi xảy ra trong quá trình kết nối với máy chủ. Vui lòng kiểm
            tra lại kết nối mạng hoặc trạng thái máy chủ.
          </p>
          <Button
            onClick={loadDocuments}
            variant="secondary"
            className="mt-4 h-8 text-xs font-semibold px-4 border border-slate-200 hover:bg-slate-50"
          >
            Tải lại
          </Button>
        </div>
      ) : loading && sections.length === 0 ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, secIdx) => (
            <div
              key={secIdx}
              className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white"
            >
              <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-4 w-48 rounded-full" />
                  </div>
                  <Skeleton className="h-3 w-32 rounded-full" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-7 w-20 rounded-full" />
                  <Skeleton className="h-7 w-14 rounded-full" />
                </div>
              </div>
              <div className="p-4 space-y-3">
                {Array.from({ length: 3 }).map((_, docIdx) => (
                  <div
                    key={docIdx}
                    className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
                  >
                    <div className="flex items-center gap-3 w-2/3">
                      <Skeleton className="h-4 w-4 rounded-full shrink-0" />
                      <Skeleton className="h-4 w-full rounded-full" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-12 rounded-full" />
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : sections.length === 0 ? (
        <div className="py-10 text-center text-slate-400 italic">
          Chưa có chuyên mục tài liệu nào
        </div>
      ) : (
        sections.map((section) => (
          <div
            key={section.id}
            className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white"
          >
            {/* Header */}
            <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex h-5 items-center justify-center rounded bg-slate-200 px-2 font-mono text-[10px] font-bold text-slate-700 border border-slate-300 shadow-sm">
                    MỤC {section.roman}
                  </span>
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                    {section.title}
                  </h4>
                </div>
                {section.subtitle && (
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {section.subtitle}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenDocModal(section.id)}
                  className="text-[10px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white px-2 py-1 rounded-lg border border-emerald-200 transition-all flex items-center gap-1 shadow-xs"
                >
                  <Plus size={10} />{" "}
                  {mode === "video" ? "Thêm video" : "Thêm tài liệu"}
                </button>
                <button
                  onClick={() => handleOpenSectionModal(section)}
                  className="p-1 text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <Edit size={12} />
                </button>
                <button
                  onClick={() =>
                    requestDelete(
                      "section",
                      section.id,
                      section.title,
                      "Bạn có chắc chắn muốn xóa chuyên mục này cùng toàn bộ tài liệu bên trong?",
                    )
                  }
                  className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>

            {/* Items */}
            <div className="divide-y divide-slate-100">
              {section.items && section.items.length > 0 ? (
                section.items.map((item: any, idx: number) => {
                  const badge = FILE_BADGE[item.type] || FILE_BADGE.pdf;
                  const dndKey = `${section.id}-${idx}`;
                  const isDragOver = dragOverKey === dndKey;
                  return (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={() => handleDragStart(section.id, idx)}
                      onDragOver={(e) => handleDragOver(e, dndKey)}
                      onDragLeave={() => setDragOverKey(null)}
                      onDrop={() => handleDrop(section.id, idx)}
                      onDragEnd={() => {
                        setDragOverKey(null);
                        dragItemRef.current = null;
                      }}
                      className={`flex items-center justify-between p-3 px-4 transition-colors select-none ${
                        isDragOver
                          ? "bg-emerald-50 border-t-2 border-t-emerald-400"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-400 transition-colors shrink-0">
                          <GripVertical size={14} />
                        </div>
                        <span
                          className={`inline-flex items-center justify-center gap-1 text-[10px] font-bold w-[72px] py-0.5 rounded-md ${badge.color} shrink-0`}
                        >
                          {TYPE_ICON[item.type] || TYPE_ICON.pdf}
                          {badge.label}
                        </span>
                        <span className="text-xs font-semibold text-slate-700">
                          {item.title}
                        </span>
                        {item.classified && (
                          <span className="bg-rose-50 text-rose-600 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border border-rose-100 flex items-center gap-1">
                            <Lock size={9} /> MẬT
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenDocModal(section.id, item)}
                          className="p-1 text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Edit size={11} />
                        </button>
                        <button
                          onClick={() =>
                            requestDelete(
                              "document",
                              item.id,
                              item.title,
                              "Bạn có chắc chắn muốn xóa tài liệu này?",
                            )
                          }
                          className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-4 text-center text-slate-400 text-xs italic">
                  Chưa có tài liệu trong mục này
                </div>
              )}
            </div>
          </div>
        ))
      )}

      {/* MODAL: CHUYÊN MỤC TÀI LIỆU */}
      {sectionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-[2px]">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm mx-4 overflow-hidden shadow-xl animate-scaleUp">
            <div className="bg-slate-50 px-5 py-4 flex items-center justify-between border-b border-slate-200">
              <h4 className="text-slate-800 font-bold text-sm">
                {editingSection ? "SỬA CHUYÊN MỤC" : "THÊM CHUYÊN MỤC MỚI"}
              </h4>
              <button
                onClick={() => setSectionModalOpen(false)}
                className="text-slate-400 hover:text-slate-650 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSaveSection} className="p-5 space-y-4">
              <div>
                <label className="text-slate-650 font-semibold mb-1 block">
                  Ký hiệu số La Mã
                </label>
                <Input
                  type="text"
                  value={sectionForm.roman}
                  onChange={(e: any) =>
                    setSectionForm({
                      ...sectionForm,
                      roman: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="I, II, III..."
                  className="bg-white border-slate-300 text-slate-800 placeholder:text-slate-400"
                />
              </div>
              <div>
                <label className="text-slate-650 font-semibold mb-1 block">
                  Tiêu đề chuyên mục
                </label>
                <Input
                  type="text"
                  value={sectionForm.title}
                  onChange={(e: any) =>
                    setSectionForm({ ...sectionForm, title: e.target.value })
                  }
                  placeholder="Tài liệu mật, Hướng dẫn..."
                  className="bg-white border-slate-300 text-slate-800 placeholder:text-slate-400"
                />
              </div>
              <div>
                <label className="text-slate-650 font-semibold mb-1 block">
                  Mô tả phụ
                </label>
                <Input
                  type="text"
                  value={sectionForm.subtitle}
                  onChange={(e: any) =>
                    setSectionForm({
                      ...sectionForm,
                      subtitle: e.target.value,
                    })
                  }
                  placeholder="Trường Sĩ quan Phòng hóa..."
                  className="bg-white border-slate-300 text-slate-800 placeholder:text-slate-400"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSectionModalOpen(false)}
                  className="h-8 text-xs font-semibold"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  variant="success"
                  className="h-8 text-xs font-semibold"
                >
                  Lưu lại
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TÀI LIỆU CHI TIẾT */}
      {docModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-[2px]">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm mx-4 overflow-hidden shadow-xl animate-scaleUp">
            <div className="bg-slate-50 px-5 py-4 flex items-center justify-between border-b border-slate-200">
              <h4 className="text-slate-800 font-bold text-sm">
                {editingDoc
                  ? mode === "video"
                    ? "SỬA VIDEO"
                    : "SỬA TÀI LIỆU"
                  : mode === "video"
                    ? "THÊM VIDEO MỚI"
                    : "THÊM TÀI LIỆU MỚI"}
              </h4>
              <button
                onClick={() => setDocModalOpen(false)}
                className="text-slate-400 hover:text-slate-650 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSaveDoc} className="p-5 space-y-4">
              <div>
                <label className="text-slate-655 font-semibold mb-1 block">
                  {mode === "video" ? "Tên video" : "Tên tài liệu"}
                </label>
                <Input
                  type="text"
                  value={docForm.title}
                  onChange={(e: any) =>
                    setDocForm({ ...docForm, title: e.target.value })
                  }
                  placeholder={
                    mode === "video"
                      ? "Tên video hiển thị..."
                      : "Tên tài liệu hiển thị..."
                  }
                  className="bg-white border-slate-300 text-slate-800 placeholder:text-slate-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-650 font-semibold mb-1 block">
                    Định dạng
                  </label>
                  {mode === "video" ? (
                    <select
                      disabled
                      value="video"
                      className="w-full h-9 bg-slate-50 border border-slate-200 rounded-lg px-3 text-slate-500 focus:outline-none shadow-sm cursor-not-allowed"
                    >
                      <option value="video">Bài giảng Video</option>
                    </select>
                  ) : (
                    <select
                      value={docForm.type}
                      onChange={(e) =>
                        setDocForm({ ...docForm, type: e.target.value })
                      }
                      className="w-full h-9 bg-white border border-slate-300 rounded-lg px-3 text-slate-850 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-sm"
                    >
                      <option value="pdf">Tài liệu PDF (.pdf)</option>
                      <option value="word">Tài liệu Word (.doc, .docx)</option>
                      <option value="excel">
                        Tài liệu Excel (.xls, .xlsx)
                      </option>
                      <option value="powerpoint">
                        Tài liệu PowerPoint (.ppt, .pptx)
                      </option>
                      <option value="image">
                        Hình ảnh sơ đồ (.png, .jpg, .jpeg, .webp, .svg)
                      </option>
                      <option value="drawing">Bản vẽ (.dwg, .dxf, .cdr)</option>
                    </select>
                  )}
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-650 font-semibold select-none">
                    <input
                      type="checkbox"
                      checked={docForm.classified}
                      onChange={(e) =>
                        setDocForm({
                          ...docForm,
                          classified: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span>
                      {mode === "video" ? "Video MẬT" : "Tài liệu MẬT"}
                    </span>
                  </label>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-slate-650 font-semibold mb-1 block">
                    {mode === "video" ? "Tải video lên" : "Tải tài liệu lên"}
                  </label>
                  <div className="border border-dashed border-slate-200 hover:border-emerald-500 rounded-xl p-4 bg-slate-50/50 transition-colors flex flex-col items-center justify-center text-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-8 text-xs font-semibold bg-white flex items-center gap-1.5 border-slate-200"
                      onClick={() =>
                        document.getElementById("file-upload-input")?.click()
                      }
                      disabled={uploading}
                    >
                      <Upload size={14} className="text-slate-500" />
                      {uploading
                        ? "Đang tải tệp lên..."
                        : "Chọn tệp từ thiết bị"}
                    </Button>
                    <input
                      id="file-upload-input"
                      type="file"
                      className="hidden"
                      onChange={handleFileUpload}
                      accept={
                        mode === "video"
                          ? ".mp4,.webm,.ogg"
                          : ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.webp,.svg,.dwg,.dxf,.cdr"
                      }
                    />
                    <p className="text-[10px] text-slate-400">
                      {mode === "video"
                        ? "Hỗ trợ định dạng MP4, WebM, OGG..."
                        : "Hỗ trợ Văn phòng (PDF, Word, Excel, PowerPoint) hoặc Bản vẽ (DWG, DXF, CDR, Hình ảnh)"}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-slate-650 font-semibold block">
                      Đường dẫn tệp tĩnh hoặc liên kết ngoài (URL)
                    </label>
                    {docForm.url && (
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 animate-pulse">
                        Đã có liên kết file
                      </span>
                    )}
                  </div>
                  <Input
                    type="text"
                    value={docForm.url}
                    onChange={(e: any) =>
                      setDocForm({ ...docForm, url: e.target.value })
                    }
                    placeholder={
                      mode === "video"
                        ? "Ví dụ: /uploads/... hoặc liên kết Youtube..."
                        : "Ví dụ: /uploads/... hoặc liên kết ngoài..."
                    }
                    className="bg-white border-slate-300 text-slate-800 placeholder:text-slate-400 text-xs h-9"
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDocModalOpen(false)}
                  className="h-8 text-xs font-semibold"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  variant="success"
                  className="h-8 text-xs font-semibold"
                >
                  Lưu lại
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TIẾN ĐỘ TẢI LÊN */}
      {uploading &&
        createPortal(
          <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/60 backdrop-blur-[2px]">
            <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm mx-4 overflow-hidden shadow-2xl p-6 space-y-4 animate-scaleUp">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 shrink-0">
                  <Upload size={18} className="animate-bounce" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-slate-800 font-bold text-sm truncate">
                    Đang tải tệp lên...
                  </h4>
                  <p
                    className="text-[10px] text-slate-500 truncate mt-0.5"
                    title={uploadFileName}
                  >
                    {uploadFileName} ({uploadFileSize})
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/50">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-350 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="text-slate-400">
                    {uploadProgress === 100
                      ? "Đang xử lý tệp..."
                      : "Vui lòng chờ..."}
                  </span>
                  <span className="text-emerald-600">{uploadProgress}%</span>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* CONFIRM DELETE MODAL */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={executeDelete}
        message={deleteTarget?.message || ""}
        label={deleteTarget?.label}
      />
    </div>
  );
};
