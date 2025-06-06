
import { useEffect } from "react";
import { DollarSign, MessageSquare, BookOpen, Settings, Users } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Sistema de Gestão da Igreja
          </h1>
          <p className="text-muted-foreground">
            Bem-vindo ao sistema integrado de gestão da sua igreja
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            className="bg-card rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer border"
            onClick={() => window.location.href = '/members'}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Users size={24} className="text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-card-foreground">Gestão de Membros</h3>
                <p className="text-sm text-muted-foreground">Cadastre e gerencie membros, grupos e ministérios</p>
              </div>
            </div>
          </div>
          
          <div 
            className="bg-card rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer border"
            onClick={() => window.location.href = '/financial'}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg bg-green-500/10">
                <DollarSign size={24} className="text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-card-foreground">Gestão Financeira</h3>
                <p className="text-sm text-muted-foreground">Controle dízimos, ofertas e despesas</p>
              </div>
            </div>
          </div>
          
          <div 
            className="bg-card rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer border"
            onClick={() => window.location.href = '/communication'}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg bg-blue-500/10">
                <MessageSquare size={24} className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-card-foreground">Comunicação</h3>
                <p className="text-sm text-muted-foreground">Avisos, eventos e pedidos de oração</p>
              </div>
            </div>
          </div>
          
          <div 
            className="bg-card rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer border"
            onClick={() => window.location.href = '/content'}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg bg-purple-500/10">
                <BookOpen size={24} className="text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-card-foreground">Gestão de Conteúdo</h3>
                <p className="text-sm text-muted-foreground">Devocionais, mídias e materiais</p>
              </div>
            </div>
          </div>
          
          <div 
            className="bg-card rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer border"
            onClick={() => window.location.href = '/admin'}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg bg-orange-500/10">
                <Settings size={24} className="text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-card-foreground">Painel Administrativo</h3>
                <p className="text-sm text-muted-foreground">Dashboard, permissões e configurações</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
