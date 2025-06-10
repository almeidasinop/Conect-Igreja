import { Routes, Route } from "react-router-dom";
import { MainLayout } from "./components/MainLayout";
import Login from "./pages/Login";
import Index from "./pages/Index";
import Members from "./pages/Members";
import Financial from "./pages/Financial";
import Communication from "./pages/Communication";
import Content from "./pages/Content";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

// Este componente já não precisa dos providers ou do BrowserRouter,
// pois eles estão no MasterApp.tsx
function AppAdmin() {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      
      <Route element={<MainLayout />}>
        <Route path="/" element={<Index />} />
        <Route path="members" element={<Members />} />
        <Route path="financial" element={<Financial />} />
        <Route path="communication" element={<Communication />} />
        <Route path="content" element={<Content />} />
        <Route path="admin" element={<Admin />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

// A exportação do componente com o nome 'AppAdmin' foi renomeada para 'default'
// para corresponder ao que o MasterApp espera.
export default AppAdmin;
