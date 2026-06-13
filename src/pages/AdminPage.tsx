import { useState } from "react";
import { Users, FileText, Truck, Shield, Film } from "lucide-react";
import { Map as MapIcon } from "lucide-react";
import { UsersTab } from "../components/admin/UsersTab";
import { DocumentsTab } from "../components/admin/DocumentsTab";
import { VehiclesTab } from "../components/admin/VehiclesTab";
import { MapsTab } from "../components/admin/MapsTab";

type TabType = "users" | "documents" | "videos" | "vehicles" | "maps";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>("users");

  return (
    <div className="min-h-[calc(100vh-48px)] bg-slate-50/70 text-xs">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-sm shadow-emerald-200 shrink-0">
            <Shield size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight">
              Hệ thống Quản trị
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Quản lý tài khoản, danh mục tài liệu và thông số khí tài mặc định
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-5">
          {/* LEFT SIDEBAR TABS */}
          <div className="w-full md:w-52 shrink-0">
            <nav className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              {[
                {
                  id: "users" as TabType,
                  label: "Tài khoản",
                  icon: <Users size={15} />,
                },
                {
                  id: "documents" as TabType,
                  label: "Tài liệu",
                  icon: <FileText size={15} />,
                },
                {
                  id: "videos" as TabType,
                  label: "Video",
                  icon: <Film size={15} />,
                },
                {
                  id: "vehicles" as TabType,
                  label: "Khí tài mặc định",
                  icon: <Truck size={15} />,
                },
                {
                  id: "maps" as TabType,
                  label: "Bản đồ",
                  icon: <MapIcon size={15} />,
                },
              ].map((tab, idx) => (
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
                  <span
                    className={
                      activeTab === tab.id
                        ? "text-emerald-600"
                        : "text-slate-400"
                    }
                  >
                    {tab.icon}
                  </span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* RIGHT CONTENT WORKSPACE */}
          <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm min-h-[500px] overflow-hidden">
            <div className="p-5">
              {activeTab === "users" && <UsersTab />}
              {activeTab === "documents" && <DocumentsTab mode="document" />}
              {activeTab === "videos" && <DocumentsTab mode="video" />}
              {activeTab === "vehicles" && <VehiclesTab />}
              {activeTab === "maps" && <MapsTab />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
