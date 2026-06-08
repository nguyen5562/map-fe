import { useRef, useState, useCallback, useEffect } from "react";
import {
  UploadCloud,
  X,
  FileImage,
  AlertCircle,
} from "lucide-react";

interface UploadMapDialogProps {
  isOpen: boolean;
  onClose: () => void;
  isUploading: boolean;
  uploadProgress: number;
  onUpload: (file: File) => void;
}

export function UploadMapDialog({
  isOpen,
  onClose,
  isUploading,
  uploadProgress,
  onUpload,
}: UploadMapDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Reset state khi mở lại dialog
  useEffect(() => {
    if (isOpen) {
      setSelectedFile(null);
    }
  }, [isOpen]);

  // Theo dõi khi upload hoàn thành
  useEffect(() => {
    if (!isUploading && uploadProgress === 0 && selectedFile) {
      // uploadProgress về 0 sau khi xong = upload hoàn thành
    }
  }, [isUploading, uploadProgress, selectedFile]);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.match(/image\/(png|jpeg)/)) return;
      setSelectedFile(file);
    },
    [],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset input để có thể chọn lại cùng file
    e.target.value = "";
  };

  const handleUploadClick = () => {
    if (!selectedFile || isUploading) return;
    onUpload(selectedFile);
  };

  const handleClose = () => {
    if (isUploading) return;
    onClose();
  };

  // Đóng khi click backdrop
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) handleClose();
  };

  // Format file size
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={handleBackdropClick}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(15, 23, 42, 0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: "fadeIn 0.15s ease",
      }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px) scale(0.97) } to { opacity: 1; transform: translateY(0) scale(1) } }
      `}</style>

      {/* Dialog box */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          width: "480px",
          maxWidth: "calc(100vw - 32px)",
          boxShadow:
            "0 25px 60px rgba(0,0,0,0.25), 0 8px 20px rgba(0,0,0,0.12)",
          animation: "slideUp 0.2s ease",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px 16px",
            borderBottom: "1px solid #f1f5f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <UploadCloud size={18} color="#fff" />
            </div>
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: "15px",
                  fontWeight: 700,
                  color: "#0f172a",
                }}
              >
                Tải lên Bản đồ mới
              </h2>
              <p
                style={{
                  margin: 0,
                  fontSize: "12px",
                  color: "#94a3b8",
                  marginTop: "1px",
                }}
              >
                Hỗ trợ PNG, JPEG, độ phân giải cao
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isUploading}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              border: "none",
              background: "#f1f5f9",
              color: "#64748b",
              cursor: isUploading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: isUploading ? 0.5 : 1,
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) =>
              !isUploading &&
              ((e.currentTarget as HTMLButtonElement).style.background =
                "#e2e8f0")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.background =
                "#f1f5f9")
            }
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "24px" }}>
          {/* Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${isDragging ? "#3b82f6" : selectedFile ? "#10b981" : "#cbd5e1"}`,
              borderRadius: "12px",
              background: isDragging
                ? "rgba(59,130,246,0.04)"
                : selectedFile
                  ? "rgba(16,185,129,0.04)"
                  : "#f8fafc",
              padding: "32px 24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              cursor: isUploading ? "default" : "pointer",
              transition: "all 0.2s ease",
              textAlign: "center",
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg"
              style={{ display: "none" }}
              onChange={handleInputChange}
              disabled={isUploading}
            />

            {selectedFile ? (
              <>
                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "12px",
                    background: "rgba(16,185,129,0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FileImage size={26} color="#10b981" />
                </div>
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontWeight: 600,
                      fontSize: "14px",
                      color: "#0f172a",
                    }}
                  >
                    {selectedFile.name}
                  </p>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: "12px",
                      color: "#64748b",
                    }}
                  >
                    {formatSize(selectedFile.size)} •{" "}
                    {selectedFile.type === "image/png" ? "PNG" : "JPEG"}
                  </p>
                </div>
                {!isUploading && (
                  <span
                    style={{
                      fontSize: "11px",
                      color: "#94a3b8",
                      marginTop: "-4px",
                    }}
                  >
                    Click để chọn file khác
                  </span>
                )}
              </>
            ) : (
              <>
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "14px",
                    background: isDragging
                      ? "rgba(59,130,246,0.12)"
                      : "#eef2ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s",
                  }}
                >
                  <UploadCloud
                    size={28}
                    color={isDragging ? "#3b82f6" : "#6366f1"}
                  />
                </div>
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontWeight: 600,
                      fontSize: "14px",
                      color: "#1e293b",
                    }}
                  >
                    {isDragging
                      ? "Thả file vào đây..."
                      : "Kéo thả hoặc click để chọn file"}
                  </p>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: "12px",
                      color: "#94a3b8",
                    }}
                  >
                    PNG hoặc JPEG, khuyến nghị độ phân giải cao
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div style={{ marginTop: "16px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "6px",
                }}
              >
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#1e293b",
                  }}
                >
                  Đang tải lên...
                </span>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#3b82f6",
                  }}
                >
                  {uploadProgress}%
                </span>
              </div>
              <div
                style={{
                  height: "6px",
                  background: "#e2e8f0",
                  borderRadius: "99px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${uploadProgress}%`,
                    background:
                      "linear-gradient(90deg, #3b82f6, #6366f1)",
                    borderRadius: "99px",
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
              <p
                style={{
                  fontSize: "11px",
                  color: "#94a3b8",
                  marginTop: "6px",
                  textAlign: "center",
                }}
              >
                Hệ thống sẽ tự động cắt mảnh bản đồ sau khi tải lên hoàn tất
              </p>
            </div>
          )}

          {/* Info note */}
          {!isUploading && (
            <div
              style={{
                marginTop: "16px",
                padding: "10px 14px",
                borderRadius: "8px",
                background: "#f0f9ff",
                border: "1px solid #bae6fd",
                display: "flex",
                gap: "8px",
                alignItems: "flex-start",
              }}
            >
              <AlertCircle size={14} color="#0ea5e9" style={{ marginTop: "1px", flexShrink: 0 }} />
              <p
                style={{
                  margin: 0,
                  fontSize: "11.5px",
                  color: "#0369a1",
                  lineHeight: 1.6,
                }}
              >
                Sau khi tải lên, hệ thống sẽ tự động xẻ mảnh ảnh thành Web Map
                Tiles. Quá trình có thể mất từ <strong>30 giây đến vài phút</strong> tùy
                kích thước file.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid #f1f5f9",
            display: "flex",
            gap: "10px",
            justifyContent: "flex-end",
            background: "#fafafa",
          }}
        >
          <button
            onClick={handleClose}
            disabled={isUploading}
            style={{
              padding: "9px 18px",
              borderRadius: "8px",
              border: "1.5px solid #e2e8f0",
              background: "#ffffff",
              color: "#475569",
              fontSize: "13px",
              fontWeight: 600,
              cursor: isUploading ? "not-allowed" : "pointer",
              opacity: isUploading ? 0.5 : 1,
              transition: "all 0.15s",
            }}
          >
            Huỷ
          </button>
          <button
            onClick={handleUploadClick}
            disabled={!selectedFile || isUploading}
            style={{
              padding: "9px 22px",
              borderRadius: "8px",
              border: "none",
              background:
                !selectedFile || isUploading
                  ? "#cbd5e1"
                  : "linear-gradient(135deg, #1d4ed8, #3b82f6)",
              color: !selectedFile || isUploading ? "#94a3b8" : "#ffffff",
              fontSize: "13px",
              fontWeight: 600,
              cursor: !selectedFile || isUploading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              boxShadow:
                selectedFile && !isUploading
                  ? "0 4px 12px rgba(59,130,246,0.35)"
                  : "none",
              transition: "all 0.2s",
            }}
          >
            {isUploading ? (
              <>
                <div
                  style={{
                    width: "13px",
                    height: "13px",
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "#fff",
                    borderRadius: "50%",
                    animation: "spin 0.7s linear infinite",
                  }}
                />
                <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
                Đang tải lên...
              </>
            ) : (
              <>
                <UploadCloud size={14} />
                Tải lên Bản đồ
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
