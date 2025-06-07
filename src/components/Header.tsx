import { NavLink } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Home,
  Users,
  DollarSign,
  MessageSquare,
  BookOpen,
  Settings,
  Church,
  PanelLeft,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Início", icon: Home },
  { href: "/members", label: "Membros", icon: Users },
  { href: "/financial", label: "Financeiro", icon: DollarSign },
  { href: "/communication", label: "Comunicação", icon: MessageSquare },
  { href: "/content", label: "Conteúdo", icon: BookOpen },
  { href: "/admin", label: "Admin", icon: Settings },
];

export const Header = () => {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
          <nav className="grid gap-6 text-lg font-medium">
             <div className="flex items-center gap-2 text-lg font-semibold">
                <Church className="h-6 w-6 text-primary" />
                <span>Gestor Igreja</span>
            </div>
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-2.5 ${
                    isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`
                }
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
      {/* Aqui pode adicionar outros elementos do cabeçalho, como Breadcrumbs ou um menu de utilizador */}
    </header>
  );
};
