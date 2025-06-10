import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { HomePage } from "./pages/HomePage";

// Placeholder para outras páginas
const BiblePage = () => <div className="p-4">Página da Bíblia</div>;
const PrayerPage = () => <div className="p-4">Página de Pedidos de Oração</div>;
const ProfilePage = () => <div className="p-4">Página do Perfil</div>;
const MorePage = () => <div className="p-4">Página "Mais"</div>;


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/biblia" element={<BiblePage />} />
          <Route path="/oracao" element={<PrayerPage />} />
          <Route path="/perfil" element={<ProfilePage />} />
          <Route path="/mais" element={<MorePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
