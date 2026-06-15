import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  UploadCloud,
  X,
  CheckCircle2,
  AlertCircle,
  Layers,
  Loader2,
} from "lucide-react";

type Phase = "uploading" | "processing" | "done" | "error";

interface UploadProgressDialogProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  isUploading: boolean;
  uploadProgress: number;
  mapStatus?: string; // 'processing' | 'ready' | 'error'
}

function getPhase(
  isUploading: boolean,
  mapStatus?: string,
): Phase {
  if (isUploading) return "uploading";
  if (mapStatus === "processing") return "processing";
  if (mapStatus === "ready") return "done";
  if (mapStatus === "error") return "error";
  return "uploading";
}

export function UploadProgressDialog({
  isOpen,
  onClose,
  fileName,
  isUploading,
  uploadProgress,
  mapStatus,
}: UploadProgressDialogProps) {
  const phase = getPhase(isUploading, mapStatus);
  const [autoClosing, setAutoClosing] = useState(false);

  // Auto-close 2.5s sau khi done
  useEffect(() => {
    if (phase === "done") {
      setAutoClosing(true);
      const t = setTimeout(() => {
        onClose();
        setAutoClosing(false);
      }, 2500);
      return () => clearTimeout(t);
    }
  }, [phase, onClose]);

  if (!isOpen) return null;

  const canClose = phase === "done" || phase === "error";

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && canClose) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(15, 23, 42, 0.55)",
        backdropFilter: "blur(3px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: "fdIn 0.15s ease",
      }}
    >
      <style>{`
        @keyframes fdIn { from { opacity:0 } to { opacity:1 } }
        @keyframes slUp { from { opacity:0; transform:translateY(20px) scale(0.96) } to { opacity:1; transform:translateY(0) scale(1) } }
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.4 } }
      `}</style>

      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          width: "420px",
          maxWidth: "calc(100vw - 32px)",
          boxShadow: "0 24px 56px rgba(0,0,0,0.22), 0 6px 16px rgba(0,0,0,0.10)",
          animation: "slUp 0.22s ease",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "18px 20px 14px",
            borderBottom: "1px solid #f1f5f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background:
              phase === "done"
                ? "linear-gradient(135deg,#f0fdf4,#fff)"
                : phase === "error"
                  ? "linear-gradient(135deg,#fff1f2,#fff)"
                  : "linear-gradient(135deg,#ecfdf5,#fff)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {/* Icon theo phase */}
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background:
                  phase === "done"
                    ? "#dcfce7"
                    : phase === "error"
                      ? "#fee2e2"
                      : "#d1fae5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {phase === "done" ? (
                <CheckCircle2 size={18} color="#16a34a" />
              ) : phase === "error" ? (
                <AlertCircle size={18} color="#dc2626" />
              ) : phase === "processing" ? (
                <Layers size={18} color="#059669" />
              ) : (
                <UploadCloud size={18} color="#059669" />
              )}
            </div>

            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#0f172a",
                }}
              >
                {phase === "uploading" && "Đang tải lên bản đồ..."}
                {phase === "processing" && "Đang xử lý bản đồ..."}
                {phase === "done" && "Hoàn tất!"}
                {phase === "error" && "Xử lý thất bại"}
              </h2>
              <p
                style={{
                  margin: "2px 0 0",
                  fontSize: "11.5px",
                  color: "#94a3b8",
                  maxWidth: "240px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {fileName}
              </p>
            </div>
          </div>

          {canClose && (
            <button
              onClick={onClose}
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "8px",
                border: "none",
                background: "#f1f5f9",
                color: "#64748b",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: "24px 20px" }}>
          {/* Phase: UPLOADING */}
          {phase === "uploading" && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <span style={{ fontSize: "12px", color: "#475569", fontWeight: 600 }}>
                  Đang tải file lên máy chủ
                </span>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#059669" }}>
                  {uploadProgress}%
                </span>
              </div>
              {/* Progress bar */}
              <div
                style={{
                  height: "8px",
                  background: "#e2e8f0",
                  borderRadius: "99px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${uploadProgress}%`,
                    background: "linear-gradient(90deg,#10b981,#059669)",
                    borderRadius: "99px",
                    transition: "width 0.3s ease",
                  }}
                />
              </div>

              {/* Steps */}
              <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <Step
                  status="active"
                  label="Tải file lên máy chủ"
                  sub={`${uploadProgress}% hoàn thành`}
                />
                <Step status="pending" label="Xẻ mảnh bản đồ (Tiling)" sub="Chờ upload hoàn tất" />
                <Step status="pending" label="Bản đồ sẵn sàng" sub="" />
              </div>
            </div>
          )}

          {/* Phase: PROCESSING (tiling) */}
          {phase === "processing" && (
            <div>
              {/* Animated bar */}
              <div
                style={{
                  height: "8px",
                  background: "#e2e8f0",
                  borderRadius: "99px",
                  overflow: "hidden",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: "100%",
                    background: "linear-gradient(90deg, #10b981 0%, #34d399 50%, #10b981 100%)",
                    backgroundSize: "200% 100%",
                    borderRadius: "99px",
                    animation: "shimmer 1.5s infinite linear",
                  }}
                />
                <style>{`@keyframes shimmer { from { background-position: 200% 0 } to { background-position: -200% 0 } }`}</style>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <Step status="done" label="Tải file lên máy chủ" sub="Hoàn tất" />
                <Step status="active" label="Xẻ mảnh bản đồ (Tiling)" sub="Đang cắt ảnh thành các tile 256×256px..." />
                <Step status="pending" label="Bản đồ sẵn sàng" sub="" />
              </div>

              <p style={{ fontSize: "11px", color: "#94a3b8", marginTop: "16px", textAlign: "center" }}>
                Tuỳ kích thước file, quá trình này có thể mất từ 30 giây đến vài phút
              </p>
            </div>
          )}

          {/* Phase: DONE */}
          {phase === "done" && (
            <div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
                <Step status="done" label="Tải file lên máy chủ" sub="Hoàn tất" />
                <Step status="done" label="Xẻ mảnh bản đồ (Tiling)" sub="Hoàn tất" />
                <Step status="done" label="Bản đồ sẵn sàng" sub="Đã được nạp lên bản đồ" />
              </div>
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <CheckCircle2 size={14} color="#16a34a" />
                <p style={{ margin: 0, fontSize: "12px", color: "#15803d", fontWeight: 500 }}>
                  {autoClosing ? "Tự động đóng sau vài giây..." : "Bản đồ đã sẵn sàng sử dụng!"}
                </p>
              </div>
            </div>
          )}

          {/* Phase: ERROR */}
          {phase === "error" && (
            <div>
              <div
                style={{
                  padding: "12px 14px",
                  borderRadius: "8px",
                  background: "#fff1f2",
                  border: "1px solid #fecdd3",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "8px",
                }}
              >
                <AlertCircle size={14} color="#dc2626" style={{ marginTop: "1px", flexShrink: 0 }} />
                <p style={{ margin: 0, fontSize: "12px", color: "#b91c1c", lineHeight: 1.6 }}>
                  Quá trình xử lý bản đồ thất bại. Vui lòng thử lại với file khác hoặc kiểm tra định dạng PNG/JPEG.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {canClose && (
          <div
            style={{
              padding: "12px 20px 16px",
              display: "flex",
              justifyContent: "flex-end",
              borderTop: "1px solid #f1f5f9",
            }}
          >
            <button
              onClick={onClose}
              style={{
                padding: "8px 20px",
                borderRadius: "8px",
                border: "none",
                background:
                  phase === "done"
                    ? "linear-gradient(135deg,#16a34a,#22c55e)"
                    : "#ef4444",
                color: "#fff",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                boxShadow:
                  phase === "done"
                    ? "0 4px 12px rgba(22,163,74,0.3)"
                    : "0 4px 12px rgba(239,68,68,0.3)",
              }}
            >
              {phase === "done" ? "Tuyệt vời!" : "Đóng"}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

// Step item component
function Step({
  status,
  label,
  sub,
}: {
  status: "done" | "active" | "pending";
  label: string;
  sub: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      {/* Icon */}
      <div
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "50%",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            status === "done"
              ? "#dcfce7"
              : status === "active"
                ? "#d1fae5"
                : "#f1f5f9",
        }}
      >
        {status === "done" ? (
          <CheckCircle2 size={15} color="#16a34a" />
        ) : status === "active" ? (
          <Loader2
            size={15}
            color="#059669"
            style={{ animation: "spin 1s linear infinite" }}
          />
        ) : (
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#cbd5e1",
            }}
          />
        )}
      </div>

      {/* Text */}
      <div>
        <p
          style={{
            margin: 0,
            fontSize: "13px",
            fontWeight: status === "pending" ? 400 : 600,
            color:
              status === "pending"
                ? "#94a3b8"
                : status === "active"
                  ? "#1e293b"
                  : "#15803d",
          }}
        >
          {label}
        </p>
        {sub && (
          <p
            style={{
              margin: 0,
              fontSize: "11px",
              color: status === "active" ? "#059669" : "#94a3b8",
              marginTop: "1px",
              animation: status === "active" ? "pulse 2s infinite" : "none",
            }}
          >
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}
