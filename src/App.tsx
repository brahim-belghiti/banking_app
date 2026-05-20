import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuthStore } from "@/stores/auth";
import { ProtectedRoute, AdminRoute } from "@/components/protected-route";
import LoginPage from "./pages/login";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
  const { isLoading, loadUser } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  if (isLoading) return <div>Loading...</div>;

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<div>Dashboard</div>} />
            <Route path="/accounts/:id" element={<div>Account Detail</div>} />

            <Route element={<AdminRoute />}>
              <Route path="/users" element={<div>Users</div>} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
