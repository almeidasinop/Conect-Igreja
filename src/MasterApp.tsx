import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { PermissionsProvider } from "./contexts/PermissionsContext";
import AppAdmin from './App';      // O nosso painel de administração
import AppPwa from './App-pwa';  // O nosso PWA para o usuário

const queryClient = new QueryClient();

// Este é o único componente que deve ter o BrowserRouter
const MasterApp = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <PermissionsProvider>
            <Routes>
              {/* Se o URL começar com /app, carrega o PWA */}
              <Route path="/app/*" element={<AppPwa />} />
              
              {/* Para todas as outras rotas, carrega o Painel Admin */}
              <Route path="/*" element={<AppAdmin />} />
            </Routes>
          </PermissionsProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default MasterApp;
