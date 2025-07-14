import { Routes, Route } from "react-router-dom";
import { AppShell } from "@/components/pwa/AppShell";

// Importe as suas páginas do PWA
import HomePage from "./pages/pwa/HomePage";
import { BiblePage } from "./pages/pwa/BiblePage";
import ProfilePage from "./pages/pwa/ProfilePage";
import AnnouncementsListPage from "./pages/pwa/AnnouncementsListPage";
import AnnouncementPage from "./pages/pwa/AnnouncementPage";
import DevotionalPage from "./pages/pwa/DevotionalPage";
import PrayerRequestPage from "./pages/pwa/PrayerRequestPage";
import GivingPage from "./pages/pwa/GivingPage";
import SchedulePage from "./pages/pwa/SchedulePage";
import MorePage from "./pages/pwa/MorePage";

// Placeholders para outras páginas que você já tinha
const PrayerPage = () => <div className="p-4 text-white">Página de Pedidos de Oração</div>;

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
        <Route path="devotional/:date" element={<DevotionalPage />} />
        <Route path="prayer-request" element={<PrayerRequestPage />} />
        <Route path="giving" element={<GivingPage />} />
        <Route path="schedule" element={<SchedulePage />} />
      </Route>
    </Routes>
  );
}

export default AppPwa;