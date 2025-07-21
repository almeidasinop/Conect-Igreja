import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { Home, BookOpen, Heart, User, MoreHorizontal, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBadging } from "@/hooks/useBadging";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Hook para detectar se é um dispositivo móvel
const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return isMobile;
}

const DesktopWarning = () => (
    <div className="flex flex-col items-center justify-center h-screen bg-[#101010] text-white p-4 font-sans">
        <Smartphone size={64} className="mb-4 text-neutral-500" />
        <h1 className="text-2xl font-bold mb-2">Experiência Otimizada para Celular</h1>
        <p className="text-neutral-400 text-center max-w-md">
            Este app foi feito pra funcionar melhor no celular. Acesse direto do seu smartphone pra aproveitar a experiência completa!
        </p>
    </div>
);

const navItems = [
    { href: "/app/", label: "Início", icon: Home },
    { href: "/app/biblia", label: "Bíblia", icon: BookOpen },
    { href: "/app/prayer-request", label: "Oração", icon: Heart },
    { href: "/app/profile", label: "Perfil", icon: User },
    { href: "/app/mais", label: "Mais", icon: MoreHorizontal },
];

export const AppShell = () => {
    const isMobile = useIsMobile();
    const { pathname } = useLocation();
    const { setBadge } = useBadging();

    // Busca o número de eventos nos próximos 7 dias
    const { data: upcomingEventsCount } = useQuery<number>({
        queryKey: ['upcoming_events_count'],
        queryFn: async () => {
            const today = new Date();
            const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

            const { count, error } = await supabase
                .from('events')
                .select('*', { count: 'exact', head: true })
                .gte('start_time', today.toISOString())
                .lte('start_time', nextWeek.toISOString());

            if (error) {
                console.error("Erro ao buscar contagem de eventos:", error);
                return 0;
            }
            return count || 0;
        },
        staleTime: 1000 * 60 * 30,
    });

    // Atualiza o badge
    useEffect(() => {
        if (upcomingEventsCount !== undefined) {
            setBadge(upcomingEventsCount);
        }
    }, [upcomingEventsCount, setBadge]);

    if (!isMobile) {
        return <DesktopWarning />;
    }

    return (
        <div className="flex flex-col h-screen bg-black text-white">
            <main className="flex-1 overflow-y-auto">
                <Outlet />
            </main>

            {/* Barra de Navegação Inferior */}
            <footer className="sticky bottom-0 left-0 right-0 bg-neutral-900 border-t border-neutral-800 z-30">
                <nav className="flex justify-around items-center h-16">
                    {navItems.map(({ href, label, icon: Icon }) => (
                        <NavLink
                            key={label}
                            to={href}
                            end={href === "/app/"}
                            className={({ isActive }) =>
                                cn(
                                    'flex flex-col items-center justify-center w-full text-xs gap-1 transition-colors duration-200',
                                    isActive ? "text-white" : "text-neutral-400 hover:text-white"
                                )
                            }
                        >
                            <Icon className="h-6 w-6" />
                            <span>{label}</span>
                        </NavLink>
                    ))}
                </nav>
            </footer>
        </div>
    );
};

export default AppShell;