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
  FolderOpen,
  UploadCloud,
  Folder,
  ChevronDown,
  ChevronRight,
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
    folder: "",
  });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadFileName, setUploadFileName] = useState("");
  const [uploadFileSize, setUploadFileSize] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [isNewSectionUpload, setIsNewSectionUpload] = useState(false);

  const [uploadQueueLength, setUploadQueueLength] = useState(0);
  const [uploadCurrentIndex, setUploadCurrentIndex] = useState(0);

  const [dragOverSectionId, setDragOverSectionId] = useState<string | null>(
    null,
  );
  const [dragOverNewSection, setDragOverNewSection] = useState(false);

  const [activeDropdownSectionId, setActiveDropdownSectionId] = useState<
    string | null
  >(null);
  const [collapsedFolders, setCollapsedFolders] = useState<
    Record<string, boolean>
  >({});

  const [renameFolderModalOpen, setRenameFolderModalOpen] = useState(false);
  const [renameFolderTarget, setRenameFolderTarget] = useState<{
    sectionId: string;
    folderId?: string;
    oldName: string;
    newName: string;
  } | null>(null);

  useEffect(() => {
    const closeDropdown = () => {
      setActiveDropdownSectionId(null);
    };
    document.addEventListener("click", closeDropdown);
    return () => {
      document.removeEventListener("click", closeDropdown);
    };
  }, []);

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
    type: "section" | "document" | "folder";
    id: string;
    folderId?: string;
    folderName?: string;
    label: string;
    message: string;
  } | null>(null);

  const dragItemRef = useRef<any>(null);
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);

  const getRomanNumeral = (num: number): string => {
    const romanMap: [number, string][] = [
      [1000, "M"],
      [900, "CM"],
      [500, "D"],
      [400, "CD"],
      [100, "C"],
      [90, "XC"],
      [50, "L"],
      [40, "XL"],
      [10, "X"],
      [9, "IX"],
      [5, "V"],
      [4, "IV"],
      [1, "I"],
    ];
    let roman = "";
    let tempNum = num;
    for (const [val, char] of romanMap) {
      while (tempNum >= val) {
        roman += char;
        tempNum -= val;
      }
    }
    return roman || "I";
  };

  const readAllEntries = async (dirReader: any): Promise<any[]> => {
    let allEntries: any[] = [];
    const read = async () => {
      const entries = await new Promise<any[]>((resolve, reject) => {
        dirReader.readEntries(resolve, reject);
      });
      if (entries.length > 0) {
        allEntries = allEntries.concat(entries);
        await read();
      }
    };
    await read();
    return allEntries;
  };

  const traverseFileTree = async (item: any, fileList: File[]) => {
    if (item.isFile) {
      const file = await new Promise<File>((resolve, reject) => {
        item.file(resolve, reject);
      });
      Object.defineProperty(file, "webkitRelativePath", {
        value: item.fullPath.startsWith("/")
          ? item.fullPath.substring(1)
          : item.fullPath,
        writable: true,
      });
      fileList.push(file);
    } else if (item.isDirectory) {
      const dirReader = item.createReader();
      const entries = await readAllEntries(dirReader);
      for (const entry of entries) {
        await traverseFileTree(entry, fileList);
      }
    }
  };

  const processUploadQueue = async (
    files: File[],
    targetSectionId: string | null,
    createSectionName?: string,
  ) => {
    if (files.length === 0) return;

    setUploading(true);
    setUploadQueueLength(files.length);
    setUploadCurrentIndex(0);

    try {
      let sectionId = targetSectionId;

      if (!sectionId && createSectionName) {
        const nextRoman = getRomanNumeral(sections.length + 1);
        const newSec = await documentService.createSection({
          roman: nextRoman,
          title: createSectionName,
          subtitle: "Thư mục tải lên",
          type: mode,
        });
        sectionId = newSec.id;
      }

      if (!sectionId) {
        throw new Error("Không xác định được chuyên mục tải lên.");
      }

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadCurrentIndex(i + 1);
        setUploadFileName(file.name);
        setUploadFileSize(formatFileSize(file.size));
        setUploadProgress(0);

        const res = await documentService.uploadFile(file, (progressEvent) => {
          const total = progressEvent.total || 0;
          if (total > 0) {
            const percent = Math.round((progressEvent.loaded * 100) / total);
            setUploadProgress(percent);
          }
        });

        const ext =
          res.extension || file.name.split(".").pop()?.toLowerCase() || "";
        let detectedType = "other";
        if (mode === "video") {
          detectedType = "video";
        } else {
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
          } else {
            detectedType = ext;
          }
        }

        let folder: string | undefined = undefined;
        if (file.webkitRelativePath) {
          const parts = file.webkitRelativePath.split("/");
          if (parts.length > 1) {
            if (createSectionName) {
              if (parts.length > 2) {
                folder = parts.slice(1, parts.length - 1).join("/");
              }
            } else {
              folder = parts.slice(0, parts.length - 1).join("/");
            }
          }
        }

        const title =
          file.name.substring(0, file.name.lastIndexOf(".")) || file.name;

        await documentService.createDocument({
          title,
          type: detectedType,
          classified: false,
          url: res.url,
          sectionId,
          folder: folder || null,
        });
      }

      toast.success(
        createSectionName
          ? `Đã tạo chuyên mục "${createSectionName}" và tải lên ${files.length} tài liệu thành công!`
          : `Tải lên ${files.length} tài liệu thành công!`,
      );
      loadDocuments();
    } catch (err) {
      console.error(err);
      toast.error("Đã xảy ra lỗi trong quá trình tải tệp lên.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setUploadQueueLength(0);
      setUploadCurrentIndex(0);
      setActiveSectionId(null);
    }
  };

  const triggerFileInput = (sectionId: string) => {
    setActiveSectionId(sectionId);
    setIsNewSectionUpload(false);
    fileInputRef.current?.click();
  };

  const triggerFolderInput = (sectionId: string) => {
    setActiveSectionId(sectionId);
    setIsNewSectionUpload(false);
    folderInputRef.current?.click();
  };

  const triggerNewSectionFolderInput = () => {
    setActiveSectionId(null);
    setIsNewSectionUpload(true);
    folderInputRef.current?.click();
  };

  const handleFileInputChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    if (activeSectionId) {
      await processUploadQueue(files, activeSectionId);
    }
    e.target.value = "";
  };

  const handleFolderInputChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    if (isNewSectionUpload) {
      const firstPath = files[0].webkitRelativePath || "";
      const folderName = firstPath.split("/")[0] || "Thư mục mới";
      await processUploadQueue(files, null, folderName);
    } else if (activeSectionId) {
      await processUploadQueue(files, activeSectionId);
    }
    e.target.value = "";
  };

  const toggleDropdown = (sectionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveDropdownSectionId((prev) =>
      prev === sectionId ? null : sectionId,
    );
  };

  const handleDragOverSection = (e: React.DragEvent, sectionId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const isFileDrag = e.dataTransfer.types.includes("Files");
    if (isFileDrag) {
      setDragOverSectionId(sectionId);
    }
  };

  const handleDragLeaveSection = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverSectionId(null);
  };

  const handleDropSection = async (e: React.DragEvent, sectionId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverSectionId(null);

    const isFileDrag = e.dataTransfer.types.includes("Files");
    if (!isFileDrag) return;

    const items = Array.from(e.dataTransfer.items || []);
    if (items.length === 0) return;

    const fileList: File[] = [];
    for (const item of items) {
      const entry = item.webkitGetAsEntry ? item.webkitGetAsEntry() : null;
      if (entry) {
        await traverseFileTree(entry, fileList);
      } else {
        const file = item.getAsFile();
        if (file) fileList.push(file);
      }
    }

    if (fileList.length > 0) {
      await processUploadQueue(fileList, sectionId);
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

  const handleOpenRenameFolderModal = (
    sectionId: string,
    folderId: string,
    oldName: string,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    setRenameFolderTarget({ sectionId, folderId, oldName, newName: oldName });
    setRenameFolderModalOpen(true);
  };

  const handleRenameFolderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameFolderTarget) return;
    const { sectionId, folderId, oldName, newName } = renameFolderTarget;
    const trimmed = newName.trim();
    if (!trimmed) {
      toast.error("Tên thư mục không được để trống.");
      return;
    }
    if (trimmed === oldName) {
      setRenameFolderModalOpen(false);
      return;
    }

    try {
      await documentService.renameFolder(
        sectionId,
        folderId || oldName,
        trimmed,
      );
      toast.success("Đổi tên thư mục thành công!");
      setRenameFolderModalOpen(false);
      loadDocuments();
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi đổi tên thư mục.");
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
        folder: doc.folder || "",
      });
    } else {
      setEditingDoc(null);
      setDocForm({
        title: "",
        type: mode === "video" ? "video" : "pdf",
        classified: false,
        url: "",
        folder: "",
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
      const data = {
        ...docForm,
        sectionId: selectedSectionId,
        folder: docForm.folder || null,
      };
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
    type: "section" | "document" | "folder",
    id: string,
    label: string,
    message: string,
    folderName?: string,
    folderId?: string,
  ) => {
    setDeleteTarget({ type, id, label, message, folderName, folderId });
    setDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;
    const { type, id, folderName, folderId } = deleteTarget;
    setDeleteModalOpen(false);
    try {
      if (type === "section") {
        await documentService.deleteSection(id);
        toast.success("Xóa chuyên mục thành công!");
      } else if (type === "document") {
        await documentService.deleteDocument(id);
        toast.success("Xóa tài liệu thành công!");
      } else if (type === "folder") {
        await documentService.deleteFolder(id, folderId || folderName || "");
        toast.success(`Xóa thư mục "${folderName}" thành công!`);
      }
      loadDocuments();
    } catch (err: any) {
      toast.error(`Lỗi xóa dữ liệu.`);
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleDragStart = (
    sectionId: string,
    id: string,
    folderId: string | null,
  ) => {
    dragItemRef.current = { sectionId, type: "item", id, folderId };
  };

  const handleDragFolderStart = (
    sectionId: string,
    folderId: string,
    folderName: string,
  ) => {
    dragItemRef.current = {
      sectionId,
      type: "folder",
      id: folderId,
      folderName,
    };
  };

  const handleDragOver = (e: React.DragEvent, key: string) => {
    e.preventDefault();
    setDragOverKey(key);
  };

  const handleDrop = async (
    sectionId: string,
    targetId: string,
    targetType: "item" | "folder" | "root",
    targetFolderId: string | null = null,
  ) => {
    setDragOverKey(null);
    if (!dragItemRef.current) return;
    if (dragItemRef.current.sectionId !== sectionId) return;

    const section = sections.find((s: any) => s.id === sectionId);
    if (!section) return;

    if (dragItemRef.current.type === "item") {
      const draggedDocId = dragItemRef.current.id;
      const sourceFolderId = dragItemRef.current.folderId;

      // Case 1: Thả vào thư mục
      if (targetType === "folder") {
        if (sourceFolderId === targetId) return;
        try {
          await documentService.updateDocument(draggedDocId, {
            sectionId,
            folderId: targetId,
          });
          toast.success("Đã di chuyển tài liệu vào thư mục");
          loadDocuments();
        } catch (err) {
          toast.error("Lỗi di chuyển tài liệu");
        }
      }
      // Case 2: Thả vào tài liệu khác để đổi thứ tự
      else if (targetType === "item") {
        if (draggedDocId === targetId) return;

        try {
          // Cập nhật thư mục nếu đổi thư mục
          if (sourceFolderId !== targetFolderId) {
            await documentService.updateDocument(draggedDocId, {
              sectionId,
              folderId: targetFolderId || null,
            });
          }

          // Lấy tất cả danh sách ID cùng cấp để sắp xếp
          let siblingIds: string[] = [];
          if (targetFolderId) {
            const targetFolder = section.folders.find(
              (f: any) => f.id === targetFolderId,
            );
            siblingIds = targetFolder
              ? targetFolder.items.map((i: any) => i.id)
              : [];
          } else {
            const rootItemsList = [
              ...(section.folders || []).map((f: any) => ({
                id: f.id,
                type: "folder",
                order: f.order,
              })),
              ...(section.items || []).map((doc: any) => ({
                id: doc.id,
                type: "document",
                order: doc.order,
              })),
            ].sort((a, b) => a.order - b.order);
            siblingIds = rootItemsList.map((r: any) => r.id);
          }

          const dragIdx = siblingIds.indexOf(draggedDocId);
          const dropIdx = siblingIds.indexOf(targetId);

          if (dropIdx !== -1) {
            const newSiblingIds = [...siblingIds];
            if (dragIdx !== -1) {
              newSiblingIds.splice(dragIdx, 1);
            }
            const targetIdxInNew = newSiblingIds.indexOf(targetId);
            newSiblingIds.splice(targetIdxInNew, 0, draggedDocId);

            await documentService.reorderDocuments(sectionId, newSiblingIds);
          }
          loadDocuments();
        } catch (err) {
          console.error("Lỗi lưu thứ tự tài liệu:", err);
          loadDocuments();
        }
      }
    }
    // Case 3: Kéo thả thư mục để đổi thứ tự
    else if (dragItemRef.current.type === "folder") {
      const draggedFolderId = dragItemRef.current.id;

      if (targetType === "folder") {
        if (draggedFolderId === targetId) return;

        try {
          const rootItemsList = [
            ...(section.folders || []).map((f: any) => ({
              id: f.id,
              type: "folder",
              order: f.order,
            })),
            ...(section.items || []).map((doc: any) => ({
              id: doc.id,
              type: "document",
              order: doc.order,
            })),
          ].sort((a, b) => a.order - b.order);

          const siblingIds = rootItemsList.map((r: any) => r.id);
          const dragIdx = siblingIds.indexOf(draggedFolderId);
          const dropIdx = siblingIds.indexOf(targetId);

          if (dragIdx !== -1 && dropIdx !== -1) {
            const newSiblingIds = [...siblingIds];
            const [moved] = newSiblingIds.splice(dragIdx, 1);
            newSiblingIds.splice(dropIdx, 0, moved);

            await documentService.reorderDocuments(sectionId, newSiblingIds);
            toast.success("Đã đổi thứ tự thư mục");
            loadDocuments();
          }
        } catch (err) {
          console.error("Lỗi di chuyển thư mục:", err);
          loadDocuments();
        }
      }
    }
    dragItemRef.current = null;
  };

  return (
    <div className="space-y-6 text-xs relative">
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
            onDragOver={(e) => handleDragOverSection(e, section.id)}
            onDragLeave={handleDragLeaveSection}
            onDrop={(e) => handleDropSection(e, section.id)}
            className={`relative border rounded-xl overflow-hidden shadow-sm bg-white transition-all duration-200 ${
              dragOverSectionId === section.id
                ? "border-emerald-500 ring-2 ring-emerald-500/20 scale-[1.01]"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            {/* DRAG OVER CARD OVERLAY */}
            {dragOverSectionId === section.id && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-emerald-50/90 backdrop-blur-[1px] text-emerald-700 animate-fadeIn pointer-events-none">
                <UploadCloud size={28} className="animate-bounce mb-2" />
                <p className="font-bold text-xs">
                  Thả tệp tin/thư mục tại đây để tải lên
                </p>
                <p className="text-[10px] text-emerald-600 mt-0.5">
                  Tự động thêm vào Mục {section.roman}
                </p>
              </div>
            )}

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
                <div className="relative">
                  <button
                    onClick={(e) => toggleDropdown(section.id, e)}
                    className="text-[10px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg border border-emerald-200 transition-all flex items-center gap-1 shadow-xs"
                  >
                    <Plus size={10} /> Tải lên <ChevronDown size={10} />
                  </button>
                  {activeDropdownSectionId === section.id && (
                    <div className="absolute right-0 mt-1 z-30 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 min-w-[120px] space-y-0.5 animate-scaleUp">
                      <button
                        onClick={() => {
                          setActiveDropdownSectionId(null);
                          triggerFileInput(section.id);
                        }}
                        className="w-full text-left text-[10px] font-semibold text-slate-700 hover:bg-slate-50 px-2 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                      >
                        <FileText size={12} className="text-slate-400" /> Tải
                        tệp tin
                      </button>
                      {mode !== "video" && (
                        <button
                          onClick={() => {
                            setActiveDropdownSectionId(null);
                            triggerFolderInput(section.id);
                          }}
                          className="w-full text-left text-[10px] font-semibold text-slate-700 hover:bg-slate-50 px-2 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                        >
                          <FolderOpen size={12} className="text-slate-400" />{" "}
                          Tải thư mục
                        </button>
                      )}
                    </div>
                  )}
                </div>
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
              {(() => {
                const foldersEmpty =
                  !section.folders || section.folders.length === 0;
                const itemsEmpty = !section.items || section.items.length === 0;

                if (foldersEmpty && itemsEmpty) {
                  return (
                    <div className="p-4 text-center text-slate-400 text-xs italic">
                      Chưa có tài liệu trong mục này
                    </div>
                  );
                }

                // Interleaved root elements
                const rootElements = [
                  ...(section.folders || []).map((f: any) => ({
                    type: "folder" as const,
                    id: f.id,
                    name: f.name,
                    order: f.order,
                    folder: f,
                  })),
                  ...(section.items || []).map((doc: any) => ({
                    type: "document" as const,
                    id: doc.id,
                    name: doc.title,
                    order: doc.order,
                    doc,
                  })),
                ].sort((a, b) => a.order - b.order);

                return rootElements.map((entry) => {
                  if (entry.type === "folder") {
                    const folder = entry.folder;
                    const collapseKey = `${section.id}-${folder.id}`;
                    const isCollapsed = collapsedFolders[collapseKey];
                    const toggleCollapse = (e: React.MouseEvent) => {
                      e.stopPropagation();
                      setCollapsedFolders((prev) => ({
                        ...prev,
                        [collapseKey]: !prev[collapseKey],
                      }));
                    };

                    const isFolderDragOver = dragOverKey === folder.id;

                    return (
                      <div
                        key={folder.id}
                        className="divide-y divide-slate-100"
                      >
                        {/* Folder row */}
                        <div
                          draggable
                          onDragStart={() =>
                            handleDragFolderStart(
                              section.id,
                              folder.id,
                              folder.name,
                            )
                          }
                          onClick={toggleCollapse}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDragOver(e, folder.id);
                          }}
                          onDragLeave={() => setDragOverKey(null)}
                          onDrop={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (!dragItemRef.current) return;
                            if (dragItemRef.current.sectionId !== section.id)
                              return;

                            if (dragItemRef.current.type === "item") {
                              const draggedDocId = dragItemRef.current.id;
                              if (dragItemRef.current.folderId === folder.id)
                                return;

                              try {
                                await documentService.updateDocument(
                                  draggedDocId,
                                  {
                                    folderId: folder.id,
                                    sectionId: section.id,
                                  },
                                );
                                toast.success(
                                  `Đã di chuyển tài liệu vào thư mục "${folder.name}"`,
                                );
                                loadDocuments();
                              } catch (err) {
                                console.error(err);
                                toast.error("Lỗi di chuyển tài liệu");
                              }
                            } else if (dragItemRef.current.type === "folder") {
                              const draggedFolderId = dragItemRef.current.id;
                              if (draggedFolderId === folder.id) return;

                              try {
                                const rootItemsList = [
                                  ...(section.folders || []).map((f: any) => ({
                                    id: f.id,
                                    type: "folder",
                                    order: f.order,
                                  })),
                                  ...(section.items || []).map((doc: any) => ({
                                    id: doc.id,
                                    type: "document",
                                    order: doc.order,
                                  })),
                                ].sort((a, b) => a.order - b.order);

                                const siblingIds = rootItemsList.map(
                                  (r: any) => r.id,
                                );
                                const dragIdx =
                                  siblingIds.indexOf(draggedFolderId);
                                const dropIdx = siblingIds.indexOf(folder.id);

                                if (dragIdx !== -1 && dropIdx !== -1) {
                                  const newSiblingIds = [...siblingIds];
                                  const [moved] = newSiblingIds.splice(
                                    dragIdx,
                                    1,
                                  );
                                  newSiblingIds.splice(dropIdx, 0, moved);

                                  await documentService.reorderDocuments(
                                    section.id,
                                    newSiblingIds,
                                  );
                                  toast.success(`Đã di chuyển thư mục`);
                                  loadDocuments();
                                }
                              } catch (err) {
                                console.error(err);
                                toast.error("Lỗi di chuyển thư mục");
                              }
                            }
                            dragItemRef.current = null;
                            setDragOverKey(null);
                          }}
                          className={`flex items-center justify-between p-2.5 px-4 cursor-grab active:cursor-grabbing select-none transition-colors border-b border-slate-100 ${
                            isFolderDragOver
                              ? "bg-emerald-50 border-t-2 border-t-emerald-400"
                              : "bg-slate-50/50 hover:bg-slate-100/50"
                          }`}
                        >
                          <div className="flex items-center gap-2 text-slate-700">
                            {isCollapsed ? (
                              <ChevronRight
                                size={13}
                                className="text-slate-400"
                              />
                            ) : (
                              <ChevronDown
                                size={13}
                                className="text-slate-400"
                              />
                            )}
                            <Folder
                              size={14}
                              className="text-amber-500 fill-amber-500 shrink-0"
                            />
                            <span className="text-xs font-bold">
                              {folder.name}
                            </span>
                            <span className="text-[9px] font-bold text-slate-400 bg-slate-200/60 px-1.5 py-0.2 rounded-full">
                              {folder.items.length} tệp
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) =>
                                handleOpenRenameFolderModal(
                                  section.id,
                                  folder.id,
                                  folder.name,
                                  e,
                                )
                              }
                              className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-slate-200/60 rounded transition-colors"
                              title="Đổi tên thư mục"
                            >
                              <Edit size={12} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                requestDelete(
                                  "folder",
                                  folder.id,
                                  folder.name,
                                  `Bạn có chắc chắn muốn xóa thư mục "${folder.name}" cùng toàn bộ tài liệu bên trong? Hành động này không thể hoàn tác.`,
                                  folder.name,
                                  folder.id,
                                );
                              }}
                              className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                              title="Xóa thư mục"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>

                        {/* Folder documents */}
                        {!isCollapsed &&
                          folder.items.map((item: any) => {
                            const badge = FILE_BADGE[item.type] || {
                              label: (item.type || "file").toUpperCase(),
                              color:
                                "bg-slate-100 text-slate-650 border border-slate-200",
                            };
                            const icon = TYPE_ICON[item.type] || (
                              <FileText size={10} />
                            );
                            const isItemDragOver = dragOverKey === item.id;

                            return (
                              <div
                                key={item.id}
                                draggable
                                onDragStart={() =>
                                  handleDragStart(
                                    section.id,
                                    item.id,
                                    folder.id,
                                  )
                                }
                                onDragOver={(e) => handleDragOver(e, item.id)}
                                onDragLeave={() => setDragOverKey(null)}
                                onDrop={() =>
                                  handleDrop(
                                    section.id,
                                    item.id,
                                    "item",
                                    folder.id,
                                  )
                                }
                                onDragEnd={() => {
                                  setDragOverKey(null);
                                  dragItemRef.current = null;
                                }}
                                className={`flex items-center justify-between p-3 px-4 pl-9 transition-colors select-none border-b border-slate-100 last:border-b-0 ${
                                  isItemDragOver
                                    ? "bg-emerald-50 border-t-2 border-t-emerald-400"
                                    : "hover:bg-slate-50"
                                }`}
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-400 transition-colors shrink-0">
                                    <GripVertical size={14} />
                                  </div>
                                  <span
                                    className={`inline-flex items-center justify-center gap-1 text-[10px] font-bold w-[72px] py-0.5 rounded-md ${badge.color} shrink-0`}
                                  >
                                    {icon}
                                    {badge.label}
                                  </span>
                                  <span
                                    className="text-xs font-semibold text-slate-700 truncate"
                                    title={item.title}
                                  >
                                    {item.title}
                                  </span>
                                  {item.classified && (
                                    <span className="bg-rose-50 text-rose-650 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border border-rose-100 flex items-center gap-1 shrink-0">
                                      <Lock size={9} /> MẬT
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1 shrink-0 ml-4">
                                  <button
                                    onClick={() =>
                                      handleOpenDocModal(section.id, item)
                                    }
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
                          })}
                      </div>
                    );
                  }

                  // Root document
                  const item = entry.doc;
                  const badge = FILE_BADGE[item.type] || {
                    label: (item.type || "file").toUpperCase(),
                    color:
                      "bg-slate-100 text-slate-650 border border-slate-200",
                  };
                  const icon = TYPE_ICON[item.type] || <FileText size={10} />;
                  const isItemDragOver = dragOverKey === item.id;

                  return (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={() =>
                        handleDragStart(section.id, item.id, null)
                      }
                      onDragOver={(e) => handleDragOver(e, item.id)}
                      onDragLeave={() => setDragOverKey(null)}
                      onDrop={() =>
                        handleDrop(section.id, item.id, "item", null)
                      }
                      onDragEnd={() => {
                        setDragOverKey(null);
                        dragItemRef.current = null;
                      }}
                      className={`flex items-center justify-between p-3 px-4 transition-colors select-none ${
                        isItemDragOver
                          ? "bg-emerald-50 border-t-2 border-t-emerald-400"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-400 transition-colors shrink-0">
                          <GripVertical size={14} />
                        </div>
                        <span
                          className={`inline-flex items-center justify-center gap-1 text-[10px] font-bold w-[72px] py-0.5 rounded-md ${badge.color} shrink-0`}
                        >
                          {icon}
                          {badge.label}
                        </span>
                        <span
                          className="text-xs font-semibold text-slate-700 truncate"
                          title={item.title}
                        >
                          {item.title}
                        </span>
                        {item.classified && (
                          <span className="bg-rose-50 text-rose-655 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border border-rose-100 flex items-center gap-1 shrink-0">
                            <Lock size={9} /> MẬT
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0 ml-4">
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
                });
              })()}
            </div>
          </div>
        ))
      )}

      {/* KHU VỰC THẢ ĐỂ TẠO CHUYÊN MỤC MỚI */}
      {mode !== "video" && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            const isFileDrag = e.dataTransfer.types.includes("Files");
            if (isFileDrag) {
              setDragOverNewSection(true);
            }
          }}
          onDragLeave={() => setDragOverNewSection(false)}
          onDrop={async (e) => {
            e.preventDefault();
            setDragOverNewSection(false);
            const isFileDrag = e.dataTransfer.types.includes("Files");
            if (!isFileDrag) return;

            const items = Array.from(e.dataTransfer.items || []);
            if (items.length === 0) return;

            const fileList: File[] = [];
            for (const item of items) {
              const entry = item.webkitGetAsEntry
                ? item.webkitGetAsEntry()
                : null;
              if (entry) {
                await traverseFileTree(entry, fileList);
              } else {
                const file = item.getAsFile();
                if (file) fileList.push(file);
              }
            }

            if (fileList.length > 0) {
              const firstPath = fileList[0].webkitRelativePath || "";
              const folderName =
                firstPath.split("/")[0] || "Chuyên mục mới từ kéo thả";
              await processUploadQueue(fileList, null, folderName);
            }
          }}
          className={`border-2 border-dashed rounded-xl p-8 transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
            dragOverNewSection
              ? "border-emerald-500 bg-emerald-50 text-emerald-700 scale-[1.01]"
              : "border-slate-350 bg-slate-50/50 hover:bg-slate-50 text-slate-500"
          }`}
          onClick={triggerNewSectionFolderInput}
        >
          <UploadCloud
            size={28}
            className={`mb-2 ${dragOverNewSection ? "animate-bounce" : ""}`}
          />
          <p className="font-bold text-xs">
            Kéo thả thư mục vào đây để tải lên
          </p>
          <p className="text-[10px] text-slate-400 mt-1">
            Hoặc nhấp vào đây để chọn thư mục từ thiết bị. Chuyên mục mới sẽ tự
            động được tạo.
          </p>
        </div>
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
                <label className="text-slate-655 font-semibold mb-1 block">
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

              {mode !== "video" && (
                <div>
                  <label className="text-slate-650 font-semibold mb-1 block">
                    Thư mục con (Không bắt buộc)
                  </label>
                  <Input
                    type="text"
                    value={docForm.folder}
                    onChange={(e: any) =>
                      setDocForm({ ...docForm, folder: e.target.value })
                    }
                    placeholder="Ví dụ: Sách hướng dẫn, Bản vẽ sơ đồ..."
                    className="bg-white border-slate-300 text-slate-800 placeholder:text-slate-400 text-xs"
                  />
                </div>
              )}

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
                      <option value="zip">Tệp nén (.zip, .rar)</option>
                      <option value="txt">Văn bản thuần (.txt)</option>
                      <option value="other">Định dạng khác</option>
                    </select>
                  )}
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-655 font-semibold select-none">
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
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-slate-655 font-semibold block">
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
                  <h4 className="text-slate-850 font-bold text-sm truncate">
                    {uploadQueueLength > 1
                      ? `Đang tải lên (${uploadCurrentIndex}/${uploadQueueLength} tệp)...`
                      : "Đang tải tệp lên..."}
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
                    style={{
                      width: `${
                        uploadQueueLength > 1
                          ? ((uploadCurrentIndex - 1) / uploadQueueLength) *
                              100 +
                            uploadProgress / uploadQueueLength
                          : uploadProgress
                      }%`,
                    }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="text-slate-400">
                    {uploadProgress === 100
                      ? "Đang xử lý tệp..."
                      : "Vui lòng chờ..."}
                  </span>
                  <span className="text-emerald-600">
                    {uploadQueueLength > 1
                      ? Math.round(
                          ((uploadCurrentIndex - 1) / uploadQueueLength) * 100 +
                            uploadProgress / uploadQueueLength,
                        )
                      : uploadProgress}
                    %
                  </span>
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

      {/* MODAL: ĐỔI TÊN THƯ MỤC */}
      {renameFolderModalOpen && renameFolderTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-[2px]">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm mx-4 overflow-hidden shadow-2xl animate-scaleUp text-xs">
            <div className="bg-slate-50 px-5 py-4 flex items-center justify-between border-b border-slate-200">
              <h4 className="text-slate-850 font-bold text-sm flex items-center gap-1.5">
                <Edit size={16} className="text-emerald-600" /> Đổi tên thư mục
              </h4>
              <button
                onClick={() => setRenameFolderModalOpen(false)}
                className="text-slate-400 hover:text-slate-650 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleRenameFolderSubmit} className="p-5 space-y-4">
              <div>
                <label className="text-slate-650 font-semibold mb-1 block">
                  Tên thư mục mới
                </label>
                <Input
                  type="text"
                  value={renameFolderTarget.newName}
                  onChange={(e: any) =>
                    setRenameFolderTarget({
                      ...renameFolderTarget,
                      newName: e.target.value,
                    })
                  }
                  placeholder="Nhập tên thư mục..."
                  className="bg-white border-slate-300 text-slate-800 placeholder:text-slate-400"
                  autoFocus
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRenameFolderModalOpen(false)}
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

      {/* INPUT ẨN ĐỂ CHỌN TỆP VÀ THƯ MỤC */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileInputChange}
      />
      <input
        ref={folderInputRef}
        type="file"
        multiple
        {...({ webkitdirectory: "", directory: "" } as any)}
        className="hidden"
        onChange={handleFolderInputChange}
      />
    </div>
  );
};
