import React from 'react';
import { NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  Users,
  DollarSign,
  MessageSquare,
  BookOpen,
  Settings,
  Church,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { useSidebar } from "@/hooks/use-sidebar";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "./ui/tooltip";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { href: "/", label: "Início", icon: Home },
  { href: "/members", label: "Membros", icon: Users },
  { href: "/financial", label: "Financeiro", icon: DollarSign },
  { href: "/communication", label: "Comunicação", icon: MessageSquare },
  { href: "/content", label: "Conteúdo", icon: BookOpen },
];

const adminNavItems = [
    { href: "/admin", label: "Admin", icon: Settings },
]

// Componente reutilizável para cada item da barra lateral, garantindo consistência
const SidebarItem = ({ item, isCollapsed, onClick }: {
  item: { href?: string; label: string; icon: React.ElementType },
  isCollapsed: boolean,
  onClick?: () => void,
}) => {
    // Definindo as classes base para os itens do menu
    const baseClasses = "flex items-center gap-4 rounded-lg px-3 py-2 text-neutral-300 transition-all hover:text-white hover:bg-[#404040] font-medium cursor-pointer";
    const collapsedClasses = isCollapsed && "justify-center";

    // O conteúdo visual do item
    const content = (
        <div
            role="button"
            tabIndex={0}
            onClick={onClick}
            onKeyDown={(e) => { if (onClick && (e.key === 'Enter' || e.key === ' ')) onClick(); }}
        >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            <span className={cn("truncate", isCollapsed && "hidden")}>{item.label}</span>
        </div>
    );

    return (
        <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
                {item.href ? (
                    // Se for um link de navegação
                    <NavLink to={item.href}>
                        {({isActive}) => React.cloneElement(content, {className: cn(baseClasses, collapsedClasses, isActive && "bg-[#404040] text-white")})}
                    </NavLink>
                ) : (
                    // Se for um botão de ação (como Sair)
                     React.cloneElement(content, {className: cn(baseClasses, collapsedClasses)})
                )}
            </TooltipTrigger>
            {isCollapsed && (
                <TooltipContent side="right" className="bg-[#191919] text-white border-neutral-700">
                    <p>{item.label}</p>
                </TooltipContent>
            )}
        </Tooltip>
    );
};


export const Sidebar = () => {
  const { isCollapsed, toggleSidebar } = useSidebar();
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <TooltipProvider>
        <aside
          className={cn(
            "hidden border-r border-neutral-800 bg-[#191919] text-white md:flex h-screen flex-col sticky top-0 transition-all duration-300 ease-in-out",
            isCollapsed ? "w-20" : "w-64"
          )}
        >
            <div className="flex h-14 items-center border-b border-neutral-800 px-4 lg:h-[60px] lg:px-6">
                <NavLink to="/" className="flex items-center gap-2 font-semibold">
                    <Church className="h-6 w-6 text-white" />
                    <span className={cn("truncate", isCollapsed && "hidden")}>Gestor Igreja</span>
                </NavLink>
            </div>
            
            <nav className="flex flex-col gap-1 p-2 flex-1">
                {navItems.map((item) => <SidebarItem key={item.href} item={item} isCollapsed={isCollapsed} />)}
            </nav>

            <div className="mt-auto p-2 border-t border-neutral-800">
                <div className="flex items-center gap-3 p-2 mb-2">
                    <div className="rounded-full bg-primary h-9 w-9 flex-shrink-0 flex items-center justify-center text-primary-foreground font-bold">
                        {user?.email?.substring(0,1).toUpperCase()}
                    </div>
                    <div className={cn("flex flex-col", isCollapsed && "hidden")}>
                        <span className="text-sm font-semibold truncate">{user?.email}</span>
                        <span className="text-xs text-neutral-400">Admin</span>
                    </div>
                </div>

                {adminNavItems.map((item) => <SidebarItem key={item.href} item={item} isCollapsed={isCollapsed} />)}
                
                <SidebarItem item={{ label: 'Sair', icon: LogOut }} isCollapsed={isCollapsed} onClick={handleSignOut} />

                <div className="h-px w-full bg-neutral-800 my-2" />

                <Button variant="ghost" className="w-full justify-center h-10 text-neutral-300 hover:text-white hover:bg-[#404040]" onClick={toggleSidebar}>
                  {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                </Button>
            </div>
        </aside>
    </TooltipProvider>
  );
};
