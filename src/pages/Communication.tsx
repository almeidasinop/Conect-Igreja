import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnnouncementsManagement } from "@/components/AnnouncementsManagement";
import { EventsManagement } from "@/components/EventsManagement";

const Communication = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Comunicação e Engajamento
        </h1>
        <p className="text-muted-foreground">
          Central de comunicação com os membros da igreja
        </p>
      </div>

      <Tabs defaultValue="announcements" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="announcements">Mural de Avisos</TabsTrigger>
          <TabsTrigger value="events">Eventos</TabsTrigger>
          <TabsTrigger value="prayers">Pedidos de Oração</TabsTrigger>
          <TabsTrigger value="messages">Mensagens</TabsTrigger>
        </TabsList>

        <TabsContent value="announcements">
          <AnnouncementsManagement />
        </TabsContent>

        <TabsContent value="events">
           <EventsManagement />
        </TabsContent>

        <TabsContent value="prayers">
          <Card>
            <CardHeader>
              <CardTitle>Pedidos de Oração</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Funcionalidade de pedidos de oração em desenvolvimento...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <CardTitle>Envio de Mensagens</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Funcionalidade de envio de e-mails e SMS em desenvolvimento...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Communication;
