import { Routes, Route } from "react-router-dom";
import { AppShell } from "./components/pwa/AppShell";
import HomePage from "./pages/pwa/HomePage";
import { BiblePage } from "./pages/pwa/BiblePage";
import AnnouncementPage from "./pages/pwa/AnnouncementPage";
import AnnouncementsListPage from "./pages/pwa/AnnouncementsListPage";

// Placeholders para outras páginas que você já tinha
const PrayerPage = () => <div className="p-4 text-white">Página de Pedidos de Oração</div>;
const ProfilePage = () => <div className="p-4 text-white">Página do Perfil</div>;
const MorePage = () => <div className="p-4 text-white">Página "Mais"</div>;

function AppPwa() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        {/* Rotas que você já tinha */}
        <Route index element={<HomePage />} />
        <Route path="biblia" element={<BiblePage />} />
        <Route path="oracao" element={<PrayerPage />} />
        <Route path="perfil" element={<ProfilePage />} />
        <Route path="mais" element={<MorePage />} />

        {/* Novas rotas que adicionamos */}
        <Route path="announcements" element={<AnnouncementsListPage />} />
        <Route path="announcement/:id" element={<AnnouncementPage />} />
      </Route>
    </Routes>
  );
}

export default AppPwa;
