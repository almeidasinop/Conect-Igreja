import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "./components/MainLayout";
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
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/members" element={<Members />} />
            <Route path="/financial" element={<Financial />} />
            <Route path="/communication" element={<Communication />} />
            <Route path="/content" element={<Content />} />
            <Route path="/admin" element={<Admin />} />
          </Route>
          {/* A rota NotFound fica fora do layout principal */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

// CORREÇÃO: Adicionada a linha de exportação em falta.
export default App;
