import { useState, useEffect } from "react";
import { Edit, Trash2, X, AlertTriangle } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { mapService } from "../../services/map.service";
import { userService } from "../../services/user.service";
import { DeleteConfirmModal } from "../ui/DeleteConfirmModal";
import { useToast } from "../../context/ToastContext";
import { Skeleton } from "../ui/Skeleton";

export const MapsTab = () => {
  const [maps, setMaps] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const toast = useToast();

  // Rename states
  const [renameMapModalOpen, setRenameMapModalOpen] = useState(false);
  const [mapToRename, setMapToRename] = useState<any>(null);
  const [newMapName, setNewMapName] = useState("");

  // Delete modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [mapToDelete, setMapToDelete] = useState<any>(null);

  const loadData = async () => {
    setLoading(true);
    setError(false);
    try {
      const [mapsData, usersData] = await Promise.all([
        mapService.getAllMaps(),
        userService.getUsers(),
      ]);
      setMaps(mapsData);
      setUsers(usersData);
    } catch (err) {
      setError(true);
      toast.error("Không thể tải danh sách bản đồ.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRenameMap = (map: any) => {
    setMapToRename(map);
    setNewMapName(map.name);
    setRenameMapModalOpen(true);
  };

  const handleSaveMapRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMapName.trim() || !mapToRename) {
      toast.error("Vui lòng điền tên bản đồ.");
      return;
    }
    try {
      await mapService.renameMap(mapToRename.id, newMapName.trim());
      toast.success("Đổi tên bản đồ thành công!");
      setRenameMapModalOpen(false);
      loadData();
    } catch (err) {
      toast.error("Lỗi đổi tên bản đồ.");
    }
  };

  const requestDelete = (map: any) => {
    setMapToDelete(map);
    setDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!mapToDelete) return;
    setDeleteModalOpen(false);
    try {
      await mapService.deleteMap(mapToDelete.id);
      toast.success("Xóa bản đồ thành công!");
      loadData();
    } catch (err: any) {
      toast.error("Lỗi xóa bản đồ.");
    } finally {
      setMapToDelete(null);
    }
  };

  return (
    <div className="space-y-4 text-xs">
      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
          Quản lý bản đồ
        </h3>
      </div>

      {error ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-slate-200 rounded-xl bg-white p-6 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mb-3 border border-rose-100 shadow-sm animate-bounce">
            <AlertTriangle size={20} />
          </div>
          <p className="text-slate-800 font-bold text-sm">
            Không thể tải danh sách bản đồ
          </p>
          <p className="text-slate-500 text-xs mt-1 max-w-xs leading-relaxed">
            Đã có lỗi xảy ra trong quá trình kết nối với máy chủ. Vui lòng kiểm
            tra lại kết nối mạng hoặc trạng thái máy chủ.
          </p>
          <Button
            onClick={loadData}
            variant="secondary"
            className="mt-4 h-8 text-xs font-semibold px-4 border border-slate-200 hover:bg-slate-50"
          >
            Tải lại
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[11px] font-semibold uppercase tracking-wider border-b border-slate-200">
                <th className="p-4">Tên bản đồ</th>
                <th className="p-4">Người đăng</th>
                <th className="p-4 text-center">Kích thước</th>
                <th className="p-4 text-center">Trạng thái</th>
                <th className="p-4 text-center">Ngày tải lên</th>
                <th className="p-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading && maps.length === 0 ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={idx}>
                    <td className="p-4">
                      <Skeleton className="h-4 w-40 rounded-full" />
                    </td>
                    <td className="p-4">
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </td>
                    <td className="p-4">
                      <Skeleton className="h-4 w-20 rounded-full mx-auto" />
                    </td>
                    <td className="p-4">
                      <Skeleton className="h-5 w-16 rounded-full mx-auto" />
                    </td>
                    <td className="p-4">
                      <Skeleton className="h-4 w-24 rounded-full mx-auto" />
                    </td>
                    <td className="p-4">
                      <Skeleton className="h-6 w-16 rounded-full ml-auto" />
                    </td>
                  </tr>
                ))
              ) : maps.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-slate-400"
                  >
                    Chưa có bản đồ nào được tải lên
                  </td>
                </tr>
              ) : (
                maps.map((m) => {
                  const uploader = users.find((u) => u.id === m.userId);
                  const uploaderName = uploader
                    ? uploader.name || uploader.username
                    : "Hệ thống";
                  return (
                    <tr
                      key={m.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td
                        className="p-4 font-bold text-slate-900 max-w-[280px] truncate"
                        title={m.name}
                      >
                        {m.name}
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          {uploaderName}
                        </span>
                      </td>
                      <td className="p-4 text-center font-mono text-slate-500">
                        {m.width && m.height ? `${m.width} × ${m.height}` : "—"}
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            m.status === "ready"
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                              : m.status === "processing"
                                ? "bg-amber-50 text-amber-600 border border-amber-100 animate-pulse"
                                : "bg-rose-50 text-rose-600 border border-rose-100"
                          }`}
                        >
                          {m.status === "ready"
                            ? "Sẵn sàng"
                            : m.status === "processing"
                              ? "Đang xử lý"
                              : "Lỗi"}
                        </span>
                      </td>
                      <td className="p-4 text-center text-slate-500 font-mono">
                        {new Date(m.createdAt).toLocaleDateString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="p-4 text-right flex justify-end gap-2">
                        <button
                          onClick={() => handleRenameMap(m)}
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-blue-600 transition-colors"
                          title="Sửa tên bản đồ"
                        >
                          <Edit size={13} />
                        </button>
                        <button
                          onClick={() => requestDelete(m)}
                          className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
                          title="Xóa bản đồ"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL: ĐỔI TÊN BẢN ĐỒ */}
      {renameMapModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-[2px]">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm mx-4 overflow-hidden shadow-xl animate-scaleUp">
            <div className="bg-slate-50 px-5 py-4 flex items-center justify-between border-b border-slate-200">
              <h4 className="text-slate-800 font-bold text-sm">
                ĐỔI TÊN BẢN ĐỒ
              </h4>
              <button
                onClick={() => setRenameMapModalOpen(false)}
                className="text-slate-400 hover:text-slate-650 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <form
              onSubmit={handleSaveMapRename}
              className="p-5 space-y-4 text-xs"
            >
              <div>
                <label className="text-slate-650 font-semibold mb-1 block">
                  Tên bản đồ mới
                </label>
                <Input
                  type="text"
                  value={newMapName}
                  onChange={(e: any) => setNewMapName(e.target.value)}
                  placeholder="Nhập tên bản đồ mới..."
                  className="bg-white border-slate-300 text-slate-800 placeholder:text-slate-400"
                  autoFocus
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRenameMapModalOpen(false)}
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

      {/* CONFIRM DELETE MODAL */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={executeDelete}
        message="Bạn có chắc chắn muốn xóa bản đồ này? Hành động này sẽ xóa vĩnh viễn tệp bản đồ và dữ liệu hiệu chuẩn!"
        label={mapToDelete?.name}
      />
    </div>
  );
};
