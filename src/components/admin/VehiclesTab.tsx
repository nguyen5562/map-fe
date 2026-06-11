import { useState, useEffect } from "react";
import { Plus, Trash2, Edit, X } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { vehicleService } from "../../services/vehicle.service";
import { DeleteConfirmModal } from "../ui/DeleteConfirmModal";
import { useToast } from "../../context/ToastContext";
import { Skeleton } from "../ui/Skeleton";

export const VehiclesTab = () => {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  // Modal states
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<any>(null);
  const [vehicleForm, setVehicleForm] = useState({
    id: "",
    name: "",
    desc: "",
    l: "",
    r: "",
    t: "",
    materials: "",
  });

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<any>(null);

  const loadVehicles = async () => {
    setLoading(true);
    try {
      const data = await vehicleService.getVehicles();
      setVehicles(data);
    } catch (err) {
      toast.error("Không thể tải danh sách khí tài.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const handleOpenVehicleModal = (veh: any = null) => {
    if (veh) {
      setEditingVehicle(veh);
      setVehicleForm({
        id: veh.id,
        name: veh.name,
        desc: veh.desc || "",
        l: veh.l.toString(),
        r: veh.r.toString(),
        t: veh.t.toString(),
        materials: veh.materials || "",
      });
    } else {
      setEditingVehicle(null);
      setVehicleForm({
        id: "",
        name: "",
        desc: "",
        l: "",
        r: "",
        t: "",
        materials: "",
      });
    }
    setVehicleModalOpen(true);
  };

  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !vehicleForm.id ||
      !vehicleForm.name ||
      !vehicleForm.l ||
      !vehicleForm.r ||
      !vehicleForm.t
    ) {
      toast.error("Vui lòng điền đầy đủ các thông số.");
      return;
    }
    try {
      if (editingVehicle) {
        await vehicleService.updateVehicle(editingVehicle.id, vehicleForm);
        toast.success("Cập nhật thông số khí tài thành công!");
      } else {
        await vehicleService.createVehicle(vehicleForm);
        toast.success("Thêm khí tài mới thành công!");
      }
      setVehicleModalOpen(false);
      loadVehicles();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi lưu thông số khí tài.");
    }
  };

  const requestDelete = (veh: any) => {
    setVehicleToDelete(veh);
    setDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!vehicleToDelete) return;
    setDeleteModalOpen(false);
    try {
      await vehicleService.deleteVehicle(vehicleToDelete.id);
      toast.success("Xóa khí tài thành công!");
      loadVehicles();
    } catch (err: any) {
      toast.error("Lỗi xóa khí tài.");
    } finally {
      setVehicleToDelete(null);
    }
  };

  return (
    <div className="space-y-4 text-xs">

      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
          Khí tài tạo khói mặc định
        </h3>
        <Button
          onClick={() => handleOpenVehicleModal()}
          variant="success"
          className="h-8 text-xs font-semibold gap-1.5 px-3"
        >
          <Plus size={13} /> Thêm khí tài mới
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-[11px] font-semibold uppercase tracking-wider border-b border-slate-200">
              <th className="p-4">Mã khí tài</th>
              <th className="p-4">Tên hiển thị</th>
              <th className="p-4">Mô tả</th>
              <th className="p-4 text-center">Độ dài L (m)</th>
              <th className="p-4 text-center">Độ rộng R (m)</th>
              <th className="p-4 text-center">Thời gian (phút)</th>
              <th className="p-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {loading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <tr key={idx}>
                  <td className="p-4">
                    <Skeleton className="h-4 w-16 rounded-full" />
                  </td>
                  <td className="p-4">
                    <Skeleton className="h-4 w-28 rounded-full" />
                  </td>
                  <td className="p-4">
                    <Skeleton className="h-4 w-36 rounded-full" />
                  </td>
                  <td className="p-4">
                    <Skeleton className="h-4 w-8 rounded-full mx-auto" />
                  </td>
                  <td className="p-4">
                    <Skeleton className="h-4 w-8 rounded-full mx-auto" />
                  </td>
                  <td className="p-4">
                    <Skeleton className="h-4 w-8 rounded-full mx-auto" />
                  </td>
                  <td className="p-4">
                    <Skeleton className="h-6 w-16 rounded-full ml-auto" />
                  </td>
                </tr>
              ))
            ) : vehicles.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                  Chưa có khí tài nào được định nghĩa
                </td>
              </tr>
            ) : (
              vehicles.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-mono font-bold text-slate-900">{v.id}</td>
                  <td className="p-4 font-bold">{v.name}</td>
                  <td className="p-4 text-slate-500 max-w-[200px] truncate">
                    {v.desc || "Không có"}
                  </td>
                  <td className="p-4 text-center font-mono">{v.l}</td>
                  <td className="p-4 text-center font-mono">{v.r}</td>
                  <td className="p-4 text-center font-mono">{v.t}</td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    <button
                      onClick={() => handleOpenVehicleModal(v)}
                      className="p-1.5 hover:bg-slate-100 rounded-lg text-blue-600 transition-colors"
                      title="Sửa"
                    >
                      <Edit size={13} />
                    </button>
                    <button
                      onClick={() => requestDelete(v)}
                      className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
                      title="Xóa"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL: KHÍ TÀI MẶC ĐỊNH */}
      {vehicleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-[2px]">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md mx-4 overflow-hidden shadow-xl animate-scaleUp">
            <div className="bg-slate-50 px-5 py-4 flex items-center justify-between border-b border-slate-200">
              <h4 className="text-slate-800 font-bold text-sm">
                {editingVehicle ? "SỬA CẤU HÌNH KHÍ TÀI" : "THÊM KHÍ TÀI MỚI"}
              </h4>
              <button
                onClick={() => setVehicleModalOpen(false)}
                className="text-slate-400 hover:text-slate-650 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSaveVehicle} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-650 font-semibold mb-1 block">
                    Mã khí tài (ID)
                  </label>
                  <Input
                    type="text"
                    value={vehicleForm.id}
                    onChange={(e: any) =>
                      setVehicleForm({ ...vehicleForm, id: e.target.value })
                    }
                    placeholder="HPK-2.5, TPK..."
                    disabled={!!editingVehicle}
                    className="bg-white border-slate-300 text-slate-800 placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label className="text-slate-650 font-semibold mb-1 block">
                    Tên hiển thị
                  </label>
                  <Input
                    type="text"
                    value={vehicleForm.name}
                    onChange={(e: any) =>
                      setVehicleForm({ ...vehicleForm, name: e.target.value })
                    }
                    placeholder="Hộp phát khói..."
                    className="bg-white border-slate-300 text-slate-800 placeholder:text-slate-400"
                  />
                </div>
              </div>
              <div>
                <label className="text-slate-650 font-semibold mb-1 block">
                  Mô tả ngắn
                </label>
                <Input
                  type="text"
                  value={vehicleForm.desc}
                  onChange={(e: any) =>
                    setVehicleForm({ ...vehicleForm, desc: e.target.value })
                  }
                  placeholder="Mô tả công dụng hoặc kích cỡ..."
                  className="bg-white border-slate-300 text-slate-800 placeholder:text-slate-400"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-650 font-semibold mb-1 block">
                    Độ dài L (m)
                  </label>
                  <Input
                    type="number"
                    min={0}
                    value={vehicleForm.l}
                    onChange={(e: any) => {
                      const val = e.target.value;
                      if (val === "" || parseFloat(val) >= 0) {
                        setVehicleForm({ ...vehicleForm, l: val });
                      }
                    }}
                    placeholder="120"
                    className="bg-white border-slate-300 text-slate-800 placeholder:text-slate-400 text-center"
                  />
                </div>
                <div>
                  <label className="text-slate-650 font-semibold mb-1 block">
                    Độ rộng R (m)
                  </label>
                  <Input
                    type="number"
                    min={0}
                    value={vehicleForm.r}
                    onChange={(e: any) => {
                      const val = e.target.value;
                      if (val === "" || parseFloat(val) >= 0) {
                        setVehicleForm({ ...vehicleForm, r: val });
                      }
                    }}
                    placeholder="10"
                    className="bg-white border-slate-300 text-slate-800 placeholder:text-slate-400 text-center"
                  />
                </div>
                <div>
                  <label className="text-slate-650 font-semibold mb-1 block">
                    Thời gian T (phút)
                  </label>
                  <Input
                    type="number"
                    min={0}
                    value={vehicleForm.t}
                    onChange={(e: any) => {
                      const val = e.target.value;
                      if (val === "" || parseFloat(val) >= 0) {
                        setVehicleForm({ ...vehicleForm, t: val });
                      }
                    }}
                    placeholder="3"
                    className="bg-white border-slate-300 text-slate-800 placeholder:text-slate-400 text-center"
                  />
                </div>
              </div>
              <div>
                <label className="text-slate-650 font-semibold mb-1 block">
                  Vật tư tiêu hao (Materials)
                </label>
                <textarea
                  value={vehicleForm.materials}
                  onChange={(e) =>
                    setVehicleForm({
                      ...vehicleForm,
                      materials: e.target.value,
                    })
                  }
                  placeholder="DO, FO, chất cháy, chất tạo khói..."
                  className="w-full h-16 bg-white border border-slate-300 rounded-lg p-3 text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-sm"
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setVehicleModalOpen(false)}
                  className="h-8 text-xs font-semibold"
                >
                  Hủy
                </Button>
                <Button type="submit" variant="success" className="h-8 text-xs font-semibold">
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
        message="Bạn có chắc chắn muốn xóa khí tài này?"
        label={vehicleToDelete?.name}
      />
    </div>
  );
};
