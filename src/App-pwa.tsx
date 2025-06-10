import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { PermissionsProvider } from "./contexts/PermissionsContext";
import { MainLayout } from "./components/MainLayout";
import Login from "./pages/Login";
import Index from "./pages/Index";
import Members from "./pages/Members";
import Financial from "./pages/Financial";
import Communication from "./pages/Communication";
import Content from "./pages/Content";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <PermissionsProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route element={<MainLayout />}>
                <Route path="/" element={<Index />} />
                <Route path="/members" element={<Members />} />
                <Route path="/financial" element={<Financial />} />
                <Route path="/communication" element={<Communication />} />
                <Route path="/content" element={<Content />} />
                <Route path="/admin" element={<Admin />} />
              </Route>
              <Route path="/pwa.html" element={<Navigate to="/" />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </PermissionsProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
