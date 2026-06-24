import { useState, useEffect } from "react";
import { Plus, Trash2, Edit, X, AlertTriangle } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { userService } from "../../services/user.service";
import { DeleteConfirmModal } from "../ui/DeleteConfirmModal";
import { useToast } from "../../context/ToastContext";
import { Skeleton } from "../ui/Skeleton";

export const UsersTab = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const toast = useToast();

  // Modal states
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userForm, setUserForm] = useState({
    username: "",
    password: "",
    name: "",
    role: "user",
  });

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);

  const loadUsers = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await userService.getUsers();
      setUsers(data);
    } catch (err) {
      setError(true);
      toast.error("Không thể tải danh sách tài khoản.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleOpenUserModal = (user: any = null) => {
    if (user) {
      setEditingUser(user);
      setUserForm({
        username: user.username,
        password: "",
        name: user.name || "",
        role: user.role,
      });
    } else {
      setEditingUser(null);
      setUserForm({
        username: "",
        password: "",
        name: "",
        role: "user",
      });
    }
    setUserModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.username || (!editingUser && !userForm.password)) {
      toast.error("Vui lòng điền tên đăng nhập và mật khẩu.");
      return;
    }
    try {
      if (editingUser) {
        const updateData: any = {
          name: userForm.name,
          role: userForm.role,
        };
        if (userForm.password) updateData.password = userForm.password;
        await userService.updateUser(editingUser.id, updateData);
        toast.success("Cập nhật tài khoản thành công!");
      } else {
        await userService.createUser(userForm);
        toast.success("Tạo tài khoản thành công!");
      }
      setUserModalOpen(false);
      loadUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi lưu tài khoản.");
    }
  };

  const requestDelete = (user: any) => {
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!userToDelete) return;
    setDeleteModalOpen(false);
    try {
      await userService.deleteUser(userToDelete.id);
      toast.success("Xóa tài khoản thành công!");
      loadUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi xóa tài khoản.");
    } finally {
      setUserToDelete(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
          Danh sách tài khoản
        </h3>
        <Button
          onClick={() => handleOpenUserModal()}
          variant="success"
          className="h-8 text-xs font-semibold gap-1.5 px-3"
        >
          <Plus size={13} /> Thêm tài khoản
        </Button>
      </div>

      {error ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-slate-200 rounded-xl bg-white p-6 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mb-3 border border-rose-100 shadow-sm animate-bounce">
            <AlertTriangle size={20} />
          </div>
          <p className="text-slate-800 font-bold text-sm">
            Không thể tải danh sách tài khoản
          </p>
          <p className="text-slate-500 text-xs mt-1 max-w-xs leading-relaxed">
            Đã có lỗi xảy ra trong quá trình kết nối với máy chủ. Vui lòng kiểm
            tra lại kết nối mạng hoặc trạng thái máy chủ.
          </p>
          <Button
            onClick={loadUsers}
            variant="secondary"
            className="mt-4 h-8 text-xs font-semibold px-4 border border-slate-200 hover:bg-slate-50"
          >
            Tải lại
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[11px] font-semibold uppercase tracking-wider border-b border-slate-200">
                <th className="p-4">Tên đăng nhập</th>
                <th className="p-4">Họ và tên</th>
                <th className="p-4">Vai trò</th>
                <th className="p-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={idx}>
                    <td className="p-4">
                      <Skeleton className="h-4 w-36 rounded-full" />
                    </td>
                    <td className="p-4">
                      <Skeleton className="h-4 w-48 rounded-full" />
                    </td>
                    <td className="p-4">
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </td>
                    <td className="p-4">
                      <Skeleton className="h-6 w-20 rounded-full ml-auto" />
                    </td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-10 text-center text-slate-400"
                  >
                    Chưa có tài khoản nào
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="p-4 font-mono font-semibold text-slate-900">
                      {u.username}
                    </td>
                    <td className="p-4 text-slate-650">
                      {u.name || "Chưa cập nhật"}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          u.role === "admin"
                            ? "bg-rose-50 text-rose-600 border border-rose-100"
                            : "bg-sky-50 text-sky-600 border border-sky-100"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => handleOpenUserModal(u)}
                          className="p-1.5 rounded-md bg-slate-100 hover:bg-blue-100 text-slate-500 hover:text-blue-600 transition-colors"
                          title="Sửa"
                        >
                          <Edit size={12} />
                        </button>
                        <button
                          onClick={() => requestDelete(u)}
                          disabled={u.username === "admin"}
                          className="p-1.5 rounded-md bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                          title="Xóa"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL: TÀI KHOẢN */}
      {userModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-[2px]">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm mx-4 overflow-hidden shadow-xl animate-scaleUp text-xs">
            <div className="bg-slate-50 px-5 py-4 flex items-center justify-between border-b border-slate-200">
              <h4 className="text-slate-800 font-bold text-sm">
                {editingUser ? "CẬP NHẬT TÀI KHẢN" : "TẠO TÀI KHẢN MỚI"}
              </h4>
              <button
                onClick={() => setUserModalOpen(false)}
                className="text-slate-400 hover:text-slate-650 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSaveUser} className="p-5 space-y-4">
              <div>
                <label className="text-slate-650 font-semibold mb-1 block">
                  Tên đăng nhập
                </label>
                <Input
                  type="text"
                  value={userForm.username}
                  onChange={(e: any) =>
                    setUserForm({ ...userForm, username: e.target.value })
                  }
                  placeholder="admin, hungnv..."
                  disabled={!!editingUser}
                  className="bg-white border-slate-300 text-slate-800 placeholder:text-slate-400"
                />
              </div>
              <div>
                <label className="text-slate-650 font-semibold mb-1 block">
                  Mật khẩu {editingUser && "(Để trống nếu không đổi)"}
                </label>
                <Input
                  type="password"
                  value={userForm.password}
                  onChange={(e: any) =>
                    setUserForm({ ...userForm, password: e.target.value })
                  }
                  placeholder={
                    editingUser ? "Không thay đổi..." : "Nhập mật khẩu..."
                  }
                  className="bg-white border-slate-300 text-slate-800 placeholder:text-slate-400"
                />
              </div>
              <div>
                <label className="text-slate-650 font-semibold mb-1 block">
                  Họ và tên
                </label>
                <Input
                  type="text"
                  value={userForm.name}
                  onChange={(e: any) =>
                    setUserForm({ ...userForm, name: e.target.value })
                  }
                  placeholder="Nguyễn Văn Hùng..."
                  className="bg-white border-slate-300 text-slate-800 placeholder:text-slate-400"
                />
              </div>
              <div>
                <label className="text-slate-650 font-semibold mb-1 block">
                  Vai trò
                </label>
                <select
                  value={userForm.role}
                  onChange={(e) =>
                    setUserForm({ ...userForm, role: e.target.value })
                  }
                  className="w-full h-9 bg-white border border-slate-300 rounded-lg px-3 text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-sm"
                >
                  <option value="user">User (Người dùng)</option>
                  <option value="admin">Admin (Quản trị viên)</option>
                </select>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setUserModalOpen(false)}
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

      {/* DELETE MODAL */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={executeDelete}
        message="Bạn có chắc chắn muốn xóa tài khoản này?"
        label={userToDelete?.username}
      />
    </div>
  );
};
