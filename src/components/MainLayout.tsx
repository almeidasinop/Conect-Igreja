import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/hooks/use-sidebar";

export const MainLayout = () => {
  const { isCollapsed } = useSidebar();

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <div className={cn(
          "flex flex-col flex-1 transition-all duration-300 ease-in-out",
        )}>
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
