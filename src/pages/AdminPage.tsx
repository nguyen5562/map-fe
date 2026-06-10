import { useState, useEffect } from "react";
import {
  Users,
  FileText,
  Truck,
  Plus,
  Trash2,
  Edit,
  X,
  Check,
  Shield,
  AlertTriangle,
  Film,
  PenTool,
  FileDown,
  Lock,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { userService } from "../services/user.service";
import { documentService } from "../services/document.service";
import { vehicleService } from "../services/vehicle.service";

const FILE_BADGE: Record<string, { label: string; color: string }> = {
  pdf: { label: "PDF", color: "bg-rose-50 text-rose-600 border border-rose-100/70" },
  video: { label: "VIDEO", color: "bg-indigo-50 text-indigo-600 border border-indigo-100/70" },
  drawing: { label: "BẢN VẼ", color: "bg-sky-50 text-sky-600 border border-sky-100/70" },
  doc: { label: "DOC", color: "bg-emerald-50 text-emerald-600 border border-emerald-100/70" },
  word: { label: "DOCX", color: "bg-blue-50 text-blue-600 border border-blue-100/70" },
};

const TYPE_ICON: Record<string, React.ReactNode> = {
  pdf: <FileText size={11} />,
  video: <Film size={11} />,
  drawing: <PenTool size={11} />,
  doc: <FileDown size={11} />,
  word: <FileText size={11} />,
};

type TabType = "users" | "documents" | "vehicles";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>("users");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Data states
  const [users, setUsers] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);

  // Modals visibility states
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);

  // Editing forms state
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userForm, setUserForm] = useState({
    username: "",
    password: "",
    name: "",
    role: "user",
  });

  const [editingSection, setEditingSection] = useState<any>(null);
  const [sectionForm, setSectionForm] = useState({
    roman: "",
    title: "",
    subtitle: "",
    accent: "emerald",
  });

  const [selectedSectionId, setSelectedSectionId] = useState<string>("");
  const [editingDoc, setEditingDoc] = useState<any>(null);
  const [docForm, setDocForm] = useState({
    title: "",
    type: "pdf",
    classified: false,
    url: "",
  });

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

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      if (activeTab === "users") {
        const data = await userService.getUsers();
        setUsers(data);
      } else if (activeTab === "documents") {
        const data = await documentService.getDocumentSections();
        setSections(data);
      } else if (activeTab === "vehicles") {
        const data = await vehicleService.getVehicles();
        setVehicles(data);
      }
    } catch (err: any) {
      console.error(err);
      setError("Không thể kết nối tới máy chủ. Vui lòng kiểm tra lại backend.");
    } finally {
      setLoading(false);
    }
  };

  const showSuccessMessage = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 3000);
  };

  // User Actions
  const handleOpenUserModal = (user: any = null) => {
    if (user) {
      setEditingUser(user);
      setUserForm({
        username: user.username,
        password: "", // Leave blank for edit unless they want to change
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
      setError("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.");
      return;
    }
    try {
      if (editingUser) {
        const updateData: any = {
          username: userForm.username,
          name: userForm.name,
          role: userForm.role,
        };
        if (userForm.password) updateData.password = userForm.password;
        await userService.updateUser(editingUser.id, updateData);
        showSuccessMessage("Cập nhật tài khoản thành công!");
      } else {
        await userService.createUser(userForm);
        showSuccessMessage("Tạo tài khoản thành công!");
      }
      setUserModalOpen(false);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Lỗi lưu tài khoản.");
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa tài khoản này?")) return;
    try {
      await userService.deleteUser(id);
      showSuccessMessage("Xóa tài khoản thành công!");
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Lỗi xóa tài khoản.");
    }
  };

  // Section Actions
  const handleOpenSectionModal = (sec: any = null) => {
    if (sec) {
      setEditingSection(sec);
      setSectionForm({
        roman: sec.roman,
        title: sec.title,
        subtitle: sec.subtitle || "",
        accent: sec.accent,
      });
    } else {
      setEditingSection(null);
      setSectionForm({
        roman: "",
        title: "",
        subtitle: "",
        accent: "emerald",
      });
    }
    setSectionModalOpen(true);
  };

  const handleSaveSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectionForm.roman || !sectionForm.title) {
      setError("Vui lòng điền ký hiệu số La Mã và tiêu đề chuyên mục.");
      return;
    }
    try {
      if (editingSection) {
        await documentService.updateSection(editingSection.id, sectionForm);
        showSuccessMessage("Cập nhật chuyên mục thành công!");
      } else {
        await documentService.createSection(sectionForm);
        showSuccessMessage("Tạo chuyên mục thành công!");
      }
      setSectionModalOpen(false);
      loadData();
    } catch (err: any) {
      setError("Lỗi lưu chuyên mục.");
    }
  };

  const handleDeleteSection = async (id: string) => {
    if (
      !window.confirm(
        "Bạn có chắc chắn muốn xóa chuyên mục này cùng toàn bộ tài liệu bên trong?"
      )
    )
      return;
    try {
      await documentService.deleteSection(id);
      showSuccessMessage("Xóa chuyên mục thành công!");
      loadData();
    } catch (err: any) {
      setError("Lỗi xóa chuyên mục.");
    }
  };

  // Document Actions
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
        type: "pdf",
        classified: false,
        url: "",
      });
    }
    setDocModalOpen(true);
  };

  const handleSaveDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docForm.title) {
      setError("Vui lòng điền tên tài liệu.");
      return;
    }
    try {
      const data = { ...docForm, sectionId: selectedSectionId };
      if (editingDoc) {
        await documentService.updateDocument(editingDoc.id, data);
        showSuccessMessage("Cập nhật tài liệu thành công!");
      } else {
        await documentService.createDocument(data);
        showSuccessMessage("Thêm tài liệu thành công!");
      }
      setDocModalOpen(false);
      loadData();
    } catch (err: any) {
      setError("Lỗi lưu tài liệu.");
    }
  };

  const handleDeleteDoc = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa tài liệu này?")) return;
    try {
      await documentService.deleteDocument(id);
      showSuccessMessage("Xóa tài liệu thành công!");
      loadData();
    } catch (err: any) {
      setError("Lỗi xóa tài liệu.");
    }
  };

  // Vehicle Actions
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
      setError("Vui lòng điền đầy đủ các thông số.");
      return;
    }
    try {
      if (editingVehicle) {
        await vehicleService.updateVehicle(editingVehicle.id, vehicleForm);
        showSuccessMessage("Cập nhật thông số khí tài thành công!");
      } else {
        await vehicleService.createVehicle(vehicleForm);
        showSuccessMessage("Thêm khí tài mới thành công!");
      }
      setVehicleModalOpen(false);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Lỗi lưu thông số khí tài.");
    }
  };

  const handleDeleteVehicle = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa khí tài này?")) return;
    try {
      await vehicleService.deleteVehicle(id);
      showSuccessMessage("Xóa khí tài thành công!");
      loadData();
    } catch (err: any) {
      setError("Lỗi xóa khí tài.");
    }
  };

  return (
    <div className="min-h-[calc(100vh-48px)] bg-slate-50/70">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-sm shadow-emerald-200 shrink-0">
            <Shield size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight">Hệ thống Quản trị</h1>
            <p className="text-xs text-slate-500 mt-0.5">Quản lý tài khoản, danh mục tài liệu và thông số khí tài mặc định</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-4">

        {/* Feedback Messages */}
        {error && (
          <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 rounded-lg px-4 py-3 text-xs text-rose-700">
            <AlertTriangle size={14} className="shrink-0 text-rose-500" />
            <div className="flex-1 font-medium">{error}</div>
            <button onClick={() => setError("")} className="text-rose-400 hover:text-rose-700 transition-colors">
              <X size={14} />
            </button>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 text-xs text-emerald-700">
            <Check size={14} className="shrink-0 text-emerald-500" />
            <div className="flex-1 font-medium">{success}</div>
            <button onClick={() => setSuccess("")} className="text-emerald-400 hover:text-emerald-700 transition-colors">
              <X size={14} />
            </button>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-5">
          {/* LEFT SIDEBAR TABS */}
          <div className="w-full md:w-52 shrink-0">
            <nav className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              {([
                { id: "users" as TabType, label: "Tài khoản", icon: <Users size={15} /> },
                { id: "documents" as TabType, label: "Tài liệu", icon: <FileText size={15} /> },
                { id: "vehicles" as TabType, label: "Khí tài mặc định", icon: <Truck size={15} /> },
              ]).map((tab, idx) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold transition-all text-left border-l-2 ${
                    idx > 0 ? "border-t border-slate-100" : ""
                  } ${
                    activeTab === tab.id
                      ? "border-l-emerald-500 bg-emerald-50 text-emerald-700"
                      : "border-l-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >
                  <span className={activeTab === tab.id ? "text-emerald-600" : "text-slate-400"}>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* RIGHT CONTENT WORKSPACE */}
          <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm min-h-[500px] overflow-hidden">
            {/* Loading State */}
            {loading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="flex items-center justify-between py-3 border-b border-slate-100 animate-pulse">
                    <div className="flex gap-4">
                      <div className="h-3 bg-slate-100 rounded w-24" />
                      <div className="h-3 bg-slate-100 rounded w-32" />
                    </div>
                    <div className="h-3 bg-slate-100 rounded w-16" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-5">
                {/* ── TAB 1: USERS ── */}
                {activeTab === "users" && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-semibold text-slate-700">Danh sách tài khoản</h3>
                      <Button
                        onClick={() => handleOpenUserModal()}
                        variant="success"
                        className="h-8 text-xs font-semibold gap-1.5 px-3"
                      >
                        <Plus size={13} /> Thêm tài khoản
                      </Button>
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-slate-200">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-slate-500 text-[11px] font-semibold uppercase tracking-wider">
                            <th className="px-4 py-3 border-b border-slate-200">Tên đăng nhập</th>
                            <th className="px-4 py-3 border-b border-slate-200">Họ và tên</th>
                            <th className="px-4 py-3 border-b border-slate-200">Vai trò</th>
                            <th className="px-4 py-3 border-b border-slate-200 text-right">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {users.length === 0 ? (
                            <tr><td colSpan={4} className="px-4 py-10 text-center text-slate-400 text-xs">Chưa có tài khoản nào</td></tr>
                          ) : users.map((u) => (
                            <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-4 py-3 font-mono font-semibold text-slate-900">{u.username}</td>
                              <td className="px-4 py-3 text-slate-600">{u.name || "Chưa cập nhật"}</td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  u.role === "admin"
                                    ? "bg-rose-50 text-rose-600 border border-rose-100"
                                    : "bg-sky-50 text-sky-600 border border-sky-100"
                                }`}>
                                  {u.role}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex justify-end gap-1">
                                  <button
                                    onClick={() => handleOpenUserModal(u)}
                                    className="p-1.5 rounded-md bg-slate-100 hover:bg-blue-100 text-slate-500 hover:text-blue-600 transition-colors"
                                    title="Sửa"
                                  >
                                    <Edit size={12} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteUser(u.id)}
                                    disabled={u.username === "admin"}
                                    className="p-1.5 rounded-md bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                                    title="Xóa"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ── TAB 2: DOCUMENTS ── */}
                {activeTab === "documents" && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                        Danh mục & tài liệu
                      </h3>
                      <Button
                        onClick={() => handleOpenSectionModal()}
                        variant="success"
                        className="h-8 text-xs font-bold gap-1 px-3"
                      >
                        <Plus size={14} /> Thêm chuyên mục
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {sections.map((section) => (
                        <div
                          key={section.id}
                          className="border border-slate-200 bg-white rounded-xl overflow-hidden shadow-sm"
                        >
                          {/* Section header */}
                          <div className="bg-slate-50 p-4 flex justify-between items-center border-b border-slate-200">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-black text-slate-500">
                                  Phần {section.roman}
                                </span>
                                <span className="text-slate-300">|</span>
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
                                className="text-[10px] font-bold bg-emerald-55 text-emerald-700 hover:bg-emerald-600 hover:text-white px-2 py-1 rounded-lg border border-emerald-200 transition-all flex items-center gap-1 shadow-xs"
                              >
                                <Plus size={10} /> Thêm tài liệu
                              </button>
                              <button
                                onClick={() => handleOpenSectionModal(section)}
                                className="p-1 text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                              >
                                <Edit size={12} />
                              </button>
                              <button
                                onClick={() => handleDeleteSection(section.id)}
                                className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>

                          {/* Items */}
                          <div className="divide-y divide-slate-100">
                            {section.items && section.items.length > 0 ? (
                              section.items.map((item: any) => {
                                const badge = FILE_BADGE[item.type] || FILE_BADGE.pdf;
                                return (
                                  <div
                                    key={item.id}
                                    className="flex items-center justify-between p-3 px-4 hover:bg-slate-50 transition-colors"
                                  >
                                    <div className="flex items-center gap-3">
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
                                        onClick={() => handleDeleteDoc(item.id)}
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
                      ))}
                    </div>
                  </div>
                )}

                {/* ── TAB 3: VEHICLES ── */}
                {activeTab === "vehicles" && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                        Cấu hình khí tài mặc định
                      </h3>
                      <Button
                        onClick={() => handleOpenVehicleModal()}
                        variant="success"
                        className="h-8 text-xs font-bold gap-1 px-3"
                      >
                        <Plus size={14} /> Thêm khí tài
                      </Button>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold">
                            <th className="p-4">Ký hiệu (ID)</th>
                            <th className="p-4">Tên gọi</th>
                            <th className="p-4">Mô tả</th>
                            <th className="p-4 text-center">Chiều dài (m)</th>
                            <th className="p-4 text-center">Chiều rộng (m)</th>
                            <th className="p-4 text-center">Thời gian (phút)</th>
                            <th className="p-4 text-right">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {vehicles.map((v) => (
                            <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="p-4 font-mono font-bold text-slate-900">
                                {v.id}
                              </td>
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
                                  onClick={() => handleDeleteVehicle(v.id)}
                                  className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
                                  title="Xóa"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── MODAL: TÀI KHOẢN ── */}
      {userModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-[2px]">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm mx-4 overflow-hidden shadow-xl animate-scaleUp">
            <div className="bg-slate-50 px-5 py-4 flex items-center justify-between border-b border-slate-200">
              <h4 className="text-slate-800 font-bold text-sm">
                {editingUser ? "CẬP NHẬT TÀI KHOẢN" : "TẠO TÀI KHOẢN MỚI"}
              </h4>
              <button
                onClick={() => setUserModalOpen(false)}
                className="text-slate-400 hover:text-slate-650 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSaveUser} className="p-5 space-y-4 text-xs">
              <div>
                <label className="text-slate-600 font-semibold mb-1 block">Tên đăng nhập</label>
                <Input
                  type="text"
                  value={userForm.username}
                  onChange={(e: any) => setUserForm({ ...userForm, username: e.target.value })}
                  placeholder="admin, hungnv..."
                  disabled={!!editingUser}
                  className="bg-white border-slate-300 text-slate-800 placeholder:text-slate-400"
                />
              </div>
              <div>
                <label className="text-slate-600 font-semibold mb-1 block">
                  Mật khẩu {editingUser && "(Để trống nếu không đổi)"}
                </label>
                <Input
                  type="password"
                  value={userForm.password}
                  onChange={(e: any) => setUserForm({ ...userForm, password: e.target.value })}
                  placeholder={editingUser ? "Không thay đổi..." : "Nhập mật khẩu..."}
                  className="bg-white border-slate-300 text-slate-800 placeholder:text-slate-400"
                />
              </div>
              <div>
                <label className="text-slate-600 font-semibold mb-1 block">Họ và tên</label>
                <Input
                  type="text"
                  value={userForm.name}
                  onChange={(e: any) => setUserForm({ ...userForm, name: e.target.value })}
                  placeholder="Nguyễn Văn Hùng..."
                  className="bg-white border-slate-300 text-slate-800 placeholder:text-slate-400"
                />
              </div>
              <div>
                <label className="text-slate-600 font-semibold mb-1 block">Vai trò</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
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
                  className="h-8 text-xs"
                >
                  Hủy
                </Button>
                <Button type="submit" variant="success" className="h-8 text-xs">
                  Lưu lại
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: CHUYÊN MỤC TÀI LIỆU ── */}
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
            <form onSubmit={handleSaveSection} className="p-5 space-y-4 text-xs">
              <div>
                <label className="text-slate-600 font-semibold mb-1 block">Ký hiệu số La Mã</label>
                <Input
                  type="text"
                  value={sectionForm.roman}
                  onChange={(e: any) =>
                    setSectionForm({ ...sectionForm, roman: e.target.value.toUpperCase() })
                  }
                  placeholder="I, II, III..."
                  className="bg-white border-slate-300 text-slate-800 placeholder:text-slate-400"
                />
              </div>
              <div>
                <label className="text-slate-600 font-semibold mb-1 block">Tiêu đề chuyên mục</label>
                <Input
                  type="text"
                  value={sectionForm.title}
                  onChange={(e: any) => setSectionForm({ ...sectionForm, title: e.target.value })}
                  placeholder="Tài liệu mật, Hướng dẫn..."
                  className="bg-white border-slate-300 text-slate-800 placeholder:text-slate-400"
                />
              </div>
              <div>
                <label className="text-slate-600 font-semibold mb-1 block">Mô tả phụ</label>
                <Input
                  type="text"
                  value={sectionForm.subtitle}
                  onChange={(e: any) =>
                    setSectionForm({ ...sectionForm, subtitle: e.target.value })
                  }
                  placeholder="Trường Sĩ quan Phòng hóa..."
                  className="bg-white border-slate-300 text-slate-800 placeholder:text-slate-400"
                />
              </div>
              <div>
                <label className="text-slate-600 font-semibold mb-1 block">Tông màu chủ đạo</label>
                <select
                  value={sectionForm.accent}
                  onChange={(e) => setSectionForm({ ...sectionForm, accent: e.target.value })}
                  className="w-full h-9 bg-white border border-slate-300 rounded-lg px-3 text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-sm"
                >
                  <option value="emerald">Xanh lục (Emerald)</option>
                  <option value="red">Đỏ (Red)</option>
                  <option value="violet">Tím (Violet)</option>
                  <option value="amber">Cam hổ phách (Amber)</option>
                </select>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSectionModalOpen(false)}
                  className="h-8 text-xs"
                >
                  Hủy
                </Button>
                <Button type="submit" variant="success" className="h-8 text-xs">
                  Lưu lại
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: TÀI LIỆU CHI TIẾT ── */}
      {docModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-[2px]">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm mx-4 overflow-hidden shadow-xl animate-scaleUp">
            <div className="bg-slate-50 px-5 py-4 flex items-center justify-between border-b border-slate-200">
              <h4 className="text-slate-800 font-bold text-sm">
                {editingDoc ? "SỬA TÀI LIỆU" : "THÊM TÀI LIỆU MỚI"}
              </h4>
              <button
                onClick={() => setDocModalOpen(false)}
                className="text-slate-400 hover:text-slate-650 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSaveDoc} className="p-5 space-y-4 text-xs">
              <div>
                <label className="text-slate-600 font-semibold mb-1 block">Tên tài liệu</label>
                <Input
                  type="text"
                  value={docForm.title}
                  onChange={(e: any) => setDocForm({ ...docForm, title: e.target.value })}
                  placeholder="Lý thuyết khói che khuất..."
                  className="bg-white border-slate-300 text-slate-800 placeholder:text-slate-400"
                />
              </div>
              <div>
                <label className="text-slate-600 font-semibold mb-1 block">Định dạng file</label>
                <select
                  value={docForm.type}
                  onChange={(e) => setDocForm({ ...docForm, type: e.target.value })}
                  className="w-full h-9 bg-white border border-slate-300 rounded-lg px-3 text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-sm"
                >
                  <option value="pdf">Tập tin PDF</option>
                  <option value="video">Đoạn Video</option>
                  <option value="drawing">Bản vẽ thiết kế</option>
                  <option value="doc">File văn bản (DOC)</option>
                  <option value="word">File Word mẫu (DOCX)</option>
                </select>
              </div>
              <div>
                <label className="text-slate-600 font-semibold mb-1 block">Đường dẫn file (URL)</label>
                <Input
                  type="text"
                  value={docForm.url}
                  onChange={(e: any) => setDocForm({ ...docForm, url: e.target.value })}
                  placeholder="/uploads/docs/document.pdf hoặc link ngoài..."
                  className="bg-white border-slate-300 text-slate-800 placeholder:text-slate-400"
                />
              </div>
              <div className="pt-1">
                <label className="flex items-center gap-2 text-slate-700 font-semibold select-none cursor-pointer">
                  <input
                    type="checkbox"
                    checked={docForm.classified}
                    onChange={(e) => setDocForm({ ...docForm, classified: e.target.checked })}
                    className="w-4 h-4 accent-emerald-600 border-slate-300 rounded cursor-pointer shrink-0"
                  />
                  <span>Đây là tài liệu mật (Classified)</span>
                </label>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDocModalOpen(false)}
                  className="h-8 text-xs"
                >
                  Hủy
                </Button>
                <Button type="submit" variant="success" className="h-8 text-xs">
                  Lưu lại
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: KHÍ TÀI MẶC ĐỊNH ── */}
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
                  <label className="text-slate-600 font-semibold mb-1 block">Mã khí tài (ID)</label>
                  <Input
                    type="text"
                    value={vehicleForm.id}
                    onChange={(e: any) => setVehicleForm({ ...vehicleForm, id: e.target.value })}
                    placeholder="HPK-2.5, TPK..."
                    disabled={!!editingVehicle}
                    className="bg-white border-slate-300 text-slate-800 placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label className="text-slate-600 font-semibold mb-1 block">Tên hiển thị</label>
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
                <label className="text-slate-600 font-semibold mb-1 block">Mô tả ngắn</label>
                <Input
                  type="text"
                  value={vehicleForm.desc}
                  onChange={(e: any) => setVehicleForm({ ...vehicleForm, desc: e.target.value })}
                  placeholder="Mô tả công dụng hoặc kích cỡ..."
                  className="bg-white border-slate-300 text-slate-800 placeholder:text-slate-400"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-600 font-semibold mb-1 block">Độ dài L (m)</label>
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
                  <label className="text-slate-600 font-semibold mb-1 block">Độ rộng R (m)</label>
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
                  <label className="text-slate-600 font-semibold mb-1 block">Thời gian T (phút)</label>
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
                <label className="text-slate-600 font-semibold mb-1 block">Vật tư tiêu hao (Materials)</label>
                <textarea
                  value={vehicleForm.materials}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, materials: e.target.value })}
                  placeholder="DO, FO, chất cháy, chất tạo khói..."
                  className="w-full h-16 bg-white border border-slate-300 rounded-lg p-3 text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-sm"
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setVehicleModalOpen(false)}
                  className="h-8 text-xs"
                >
                  Hủy
                </Button>
                <Button type="submit" variant="success" className="h-8 text-xs">
                  Lưu lại
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
