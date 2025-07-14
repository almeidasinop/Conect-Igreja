import React from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  CalendarDays, 
  HeartHandshake, 
  Heart, 
  Newspaper, 
  BookOpen, 
  ChevronRight,
  LogOut,
  Settings
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Componente de Cabeçalho Padrão
const PageHeader = ({ title }: { title: string }) => (
  <header className="sticky top-0 bg-black z-10 p-4 text-center border-b border-neutral-800">
    <h1 className="text-xl font-bold">{title}</h1>
  </header>
);

// Componente para cada item da lista
const ListItem = ({ icon: Icon, title, description, to }: { icon: React.ElementType, title: string, description: string, to: string }) => (
  <Link to={to} className="flex items-center gap-4 p-4 bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors">
    <div className="bg-neutral-800 p-3 rounded-full">
      <Icon className="h-6 w-6 text-emerald-400" />
    </div>
    <div className="flex-1">
      <p className="font-bold text-white">{title}</p>
      <p className="text-sm text-neutral-400">{description}</p>
    </div>
    <ChevronRight className="text-neutral-500" />
  </Link>
);

// Lista de itens de navegação
const navItems = [
  { icon: User, title: 'Meu Perfil', description: 'Gerencie suas informações e cadastro', to: '/app/profile' },
  { icon: CalendarDays, title: 'Agenda e Horários', description: 'Veja nossos cultos e eventos', to: '/app/schedule' },
  { icon: HeartHandshake, title: 'Pedidos de Oração', description: 'Envie seu pedido ou ore conosco', to: '/app/prayer-request' },
  { icon: Heart, title: 'Envolva-se', description: 'Contribua com dízimos e ofertas', to: '/app/giving' },
  { icon: Newspaper, title: 'Notícias e Avisos', description: 'Fique por dentro das novidades', to: '/app/announcements' },
  { icon: BookOpen, title: 'Bíblia', description: 'Leia a Palavra de Deus', to: '/app/biblia' },
];

// Componente Principal da Página
const MorePage: React.FC = () => {
  const { user } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // O AuthProvider irá redirecionar o usuário automaticamente
  };

  return (
    <div className="flex flex-col h-full bg-black text-white">
      <PageHeader title="Mais Opções" />
      
      <main className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {navItems.map(item => (
            <ListItem key={item.title} {...item} />
          ))}
        </div>

        {/* Seção de Configurações e Logout */}
        {user && (
          <div className="mt-8 pt-4 border-t border-neutral-800 space-y-4">
             <button 
                onClick={handleLogout} 
                className="w-full flex items-center gap-4 p-4 bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors text-red-400"
              >
                <div className="bg-neutral-800 p-3 rounded-full">
                    <LogOut className="h-6 w-6" />
                </div>
                <div className="flex-1 text-left">
                    <p className="font-bold">Sair</p>
                    <p className="text-sm text-neutral-500">Encerrar sua sessão no aplicativo</p>
                </div>
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default MorePage;
