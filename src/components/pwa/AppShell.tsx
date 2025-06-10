import React, { useState, useEffect } from 'react';
import { Outlet, NavLink } from "react-router-dom";
import { Home, BookOpen, Heart, User, MoreHorizontal, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";

// Hook para detetar se é um dispositivo móvel
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
        <h1 className="text-2xl font-bold mb-2">Experiência Otimizada para Telemóvel</h1>
        <p className="text-neutral-400 text-center max-w-md">
            Este aplicativo foi desenhado para uma experiência móvel. Para o visualizar corretamente, por favor, aceda a partir de um smartphone ou use as ferramentas de desenvolvimento do seu navegador para simular um dispositivo móvel.
        </p>
    </div>
);

export const AppShell = () => {
    const isMobile = useIsMobile();

    if (!isMobile) {
        return <DesktopWarning />;
    }

    const navItems = [
        { href: "/app/", label: "Início", icon: Home },
        { href: "/app/biblia", label: "Bíblia", icon: BookOpen },
        { href: "/app/oracao", label: "Oração", icon: Heart },
        { href: "/app/perfil", label: "Perfil", icon: User },
        { href: "/app/mais", label: "Mais", icon: MoreHorizontal },
    ];
    
    return (
        <div className="bg-[#101010] min-h-screen text-white font-sans">
            <main className="pb-24">
                <Outlet />
            </main>

            {/* Barra de Navegação Inferior */}
            <nav className="fixed bottom-0 left-0 right-0 bg-[#191919] border-t border-neutral-800 flex justify-around h-20 shadow-lg">
                {navItems.map((item) => (
                    <NavLink
                        key={item.href}
                        to={item.href}
                        end // Garante que a rota "Início" só fica ativa na página exata
                        className={({ isActive }) => 
                            cn(
                                'flex flex-col items-center justify-center p-2 w-full text-xs gap-1 transition-colors duration-200',
                                isActive ? 'text-white' : 'text-neutral-400 hover:text-white'
                            )
                        }
                    >
                        <item.icon size={28} />
                        <span className="mt-1">{item.label}</span>
                    </NavLink>
                ))}
            </nav>
        </div>
    );
};
