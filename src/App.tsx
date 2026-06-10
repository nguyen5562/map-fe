import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DocsPage from "./pages/DocsPage";
import SimulationPage from "./pages/SimulationPage";
import AdminPage from "./pages/AdminPage";
import Navbar from "./layout/Navbar";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const isAuth = sessionStorage.getItem("auth") === "true";
  if (!isAuth) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const isAuth = sessionStorage.getItem("auth") === "true";
  const role = sessionStorage.getItem("userRole");
  if (!isAuth) return <Navigate to="/login" replace />;
  if (role !== "admin") return <Navigate to="/simulation" replace />;
  return <>{children}</>;
}

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Navbar />
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected */}
      <Route
        path="/simulation"
        element={
          <RequireAuth>
            <AppLayout>
              <SimulationPage />
            </AppLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/docs"
        element={
          <RequireAuth>
            <AppLayout>
              <DocsPage />
            </AppLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AppLayout>
              <AdminPage />
            </AppLayout>
          </RequireAdmin>
        }
      />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/simulation" replace />} />
      <Route path="*" element={<Navigate to="/simulation" replace />} />
    </Routes>
  );
}

export default App;
