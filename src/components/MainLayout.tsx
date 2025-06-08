import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "./ui/skeleton";

export const MainLayout = () => {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Se o carregamento terminou e não há sessão, redireciona para o login
    if (!loading && !session) {
      navigate('/login');
    }
  }, [session, loading, navigate]);

  // Mostra um estado de carregamento enquanto a sessão é verificada
  if (loading) {
    return (
      <div className="flex min-h-screen w-full">
        <Skeleton className="hidden md:flex h-screen w-64" />
        <div className="flex flex-col flex-1">
            <Skeleton className="h-14 w-full" />
            <div className="p-6">
                <Skeleton className="h-40 w-full"/>
            </div>
        </div>
      </div>
    );
  }

  // Se houver sessão, renderiza o layout normal
  return session ? (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  ) : null; // Retorna null enquanto redireciona para evitar piscar o conteúdo
};
