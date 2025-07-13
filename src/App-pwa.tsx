import { Routes, Route } from "react-router-dom";
import { AppShell } from "@/components/pwa/AppShell";

// Importe as suas páginas do PWA
import HomePage from "./pages/pwa/HomePage";
import { BiblePage } from "./pages/pwa/BiblePage";
import ProfilePage from "./pages/pwa/ProfilePage";
import AnnouncementsListPage from "./pages/pwa/AnnouncementsListPage";
import AnnouncementPage from "./pages/pwa/AnnouncementPage";

// Placeholders para outras páginas que você já tinha
const PrayerPage = () => <div className="p-4 text-white">Página de Pedidos de Oração</div>;
const MorePage = () => <div className="p-4 text-white">Página "Mais"</div>;

function AppPwa() {
  return (
    // Esta estrutura está correta. O AppShell atua como um "molde"
    // para todas as rotas aninhadas.
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="biblia" element={<BiblePage />} />
        <Route path="oracao" element={<PrayerPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="mais" element={<MorePage />} />
        <Route path="announcements" element={<AnnouncementsListPage />} />
        <Route path="announcement/:id" element={<AnnouncementPage />} />
      </Route>
    </Routes>
  );
}

export default AppPwa;