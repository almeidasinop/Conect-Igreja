import { Routes, Route } from "react-router-dom";
// CORREÇÃO: Os caminhos agora apontam para as novas subpastas 'pwa'
import { AppShell } from "./components/pwa/AppShell";
import { HomePage } from "./pages/pwa/HomePage";
import { BiblePage } from "./pages/pwa/BiblePage";

// Placeholder para outras páginas
const PrayerPage = () => <div className="p-4 text-white">Página de Pedidos de Oração</div>;
const ProfilePage = () => <div className="p-4 text-white">Página do Perfil</div>;
const MorePage = () => <div className="p-4 text-white">Página "Mais"</div>;

function AppPwa() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="biblia" element={<BiblePage />} />
        <Route path="oracao" element={<PrayerPage />} />
        <Route path="perfil" element={<ProfilePage />} />
        <Route path="mais" element={<MorePage />} />
      </Route>
    </Routes>
  );
}

export default AppPwa;
