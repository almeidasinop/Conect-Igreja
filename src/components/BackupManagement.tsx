import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DownloadCloud, History } from "lucide-react";

export const BackupManagement = () => {
  const handleBackup = () => {
    alert("Funcionalidade de backup a ser implementada. Irá gerar um export dos dados principais.");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Backup e Restauração</CardTitle>
        <CardDescription>
          Crie cópias de segurança dos seus dados ou visualize backups anteriores.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-6 border rounded-lg flex flex-col items-center justify-center text-center">
          <DownloadCloud className="w-12 h-12 mb-4 text-primary" />
          <h3 className="text-lg font-semibold mb-2">Criar Novo Backup</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Gere uma cópia de segurança completa dos dados da sua igreja. Este processo pode demorar alguns minutos.
          </p>
          <Button onClick={handleBackup}>
            Iniciar Backup Agora
          </Button>
        </div>
        <div className="p-6 border rounded-lg">
           <div className="flex items-center gap-3 mb-4">
             <History className="w-6 h-6 text-muted-foreground"/>
             <h3 className="text-lg font-semibold">Histórico de Backups</h3>
           </div>
           <div className="text-center text-muted-foreground py-8">
                <p>Nenhum backup anterior encontrado.</p>
           </div>
        </div>
      </CardContent>
    </Card>
  );
};
