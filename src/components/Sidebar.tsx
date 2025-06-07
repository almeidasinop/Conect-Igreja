import { NavLink } from "react-router-dom";
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
} from "lucide-react";
import { useSidebar } from "@/hooks/use-sidebar";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "./ui/tooltip";
import { cn } from "@/lib/utils";

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

export const Sidebar = () => {
  const { isCollapsed, toggleSidebar } = useSidebar();

  const renderNavLink = (item: typeof navItems[0]) => (
    <TooltipProvider key={item.href} delayDuration={0}>
        <Tooltip>
            <TooltipTrigger asChild>
                 <NavLink
                    to={item.href}
                    className={({ isActive }) =>
                    cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                        isActive && "bg-muted text-primary",
                        isCollapsed && "justify-center"
                    )
                    }
                >
                    <item.icon className="h-5 w-5" />
                    <span className={cn("truncate", isCollapsed && "hidden")}>{item.label}</span>
                </NavLink>
            </TooltipTrigger>
            {isCollapsed && (
                <TooltipContent side="right">
                    <p>{item.label}</p>
                </TooltipContent>
            )}
        </Tooltip>
    </TooltipProvider>
  )

  return (
    <aside
      className={cn(
        "hidden border-r bg-muted/40 md:flex h-screen flex-col sticky top-0 transition-all duration-300 ease-in-out",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <NavLink to="/" className="flex items-center gap-2 font-semibold">
                <Church className="h-6 w-6 text-primary" />
                <span className={cn(isCollapsed && "hidden")}>Gestor Igreja</span>
            </NavLink>
        </div>
      <nav className="flex flex-col gap-2 p-2 flex-1">
        {navItems.map(renderNavLink)}
      </nav>
      <div className="mt-auto p-2 border-t">
        {adminNavItems.map(renderNavLink)}
        <Button variant="outline" size="icon" className="w-full mt-2" onClick={toggleSidebar}>
          {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>
    </aside>
  );
};
