import { Navigate, Route, Routes } from "react-router-dom";
import { AdminApiKeysPage } from "./pages/AdminApiKeysPage";
import { AdminScopesPage } from "./pages/AdminScopesPage";
import { AdminUsersPage } from "./pages/AdminUsersPage";
import { DashboardLayout } from "./components/DashboardLayout";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { SettingsPage } from "./pages/SettingsPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<DashboardLayout />}>
        <Route path="/app" element={<Navigate to="/app/home" replace />} />
        <Route path="/app/home" element={<HomePage />} />
        <Route path="/app/settings" element={<SettingsPage />} />
        <Route path="/app/admin/users" element={<AdminUsersPage />} />
        <Route path="/app/admin/scopes" element={<AdminScopesPage />} />
        <Route path="/app/admin/api-keys" element={<AdminApiKeysPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
