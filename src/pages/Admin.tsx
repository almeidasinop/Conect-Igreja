import { useState, useEffect, useCallback } from "react";
import { UserManagement } from "@/components/UserManagement";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Users, Shield, DatabaseBackup } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { BackupManagement } from "@/components/BackupManagement";
import { PermissionsManagement } from "@/components/PermissionsManagement"; // Importar o novo componente

const Admin = () => {
  const [stats, setStats] = useState({ totalUsers: 0, totalAdmins: 0 });
  const [loading, setLoading] = useState(true);

  const fetchAdminStats = useCallback(async () => {
    setLoading(true);
    try {
      // Usamos 'any' para evitar problemas com a contagem em tipos gerados
      const { data, error, count } = await supabase
        .from("profiles")
        .select("role", { count: "exact" }) as any;
      
      if (error) throw error;
      
      const totalUsers = count || 0;
      const totalAdmins = data.filter((p: {role: string}) => p.role === 'admin').length;

      setStats({ totalUsers, totalAdmins });

    } catch (err) {
      console.error("Erro ao buscar estatísticas do admin:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminStats();
  }, [fetchAdminStats]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Painel Administrativo
        </h1>
        <p className="text-muted-foreground">
          Configurações gerais e gestão de acessos do sistema.
        </p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Utilizadores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-1/3" /> : <div className="text-2xl font-bold">{stats.totalUsers}</div>}
            <p className="text-xs text-muted-foreground">Utilizadores com acesso ao sistema</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administradores</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{stats.totalAdmins}</div>}
             <p className="text-xs text-muted-foreground">Utilizadores com permissões elevadas</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Último Backup</CardTitle>
            <DatabaseBackup className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold">Nunca</div>
             <p className="text-xs text-muted-foreground">Recomenda-se backups semanais</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">Gestão de Utilizadores</TabsTrigger>
          <TabsTrigger value="permissions">Permissões de Papéis</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>
        
        <TabsContent value="permissions">
           <PermissionsManagement />
        </TabsContent>

        <TabsContent value="backup">
            <BackupManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
