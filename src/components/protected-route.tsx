import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/stores/auth";

export function ProtectedRoute() {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export function AdminRoute() {
  const { user } = useAuthStore();
  if (user?.role !== "admin") return <Navigate to="/" replace />;
  return <Outlet />;
}
