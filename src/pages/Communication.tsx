import { useState } from "react";
import { MessageSquare, Bell, Calendar, Send, Users, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Communication = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Comunicação e Engajamento
            </h1>
            <p className="text-muted-foreground">
              Central de comunicação com os membros da igreja
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Send size={20} />
            Nova Comunicação
          </Button>
        </div>

        <Tabs defaultValue="announcements" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="announcements">Mural de Avisos</TabsTrigger>
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
            <TabsTrigger value="events">Eventos</TabsTrigger>
            <TabsTrigger value="prayers">Pedidos de Oração</TabsTrigger>
            <TabsTrigger value="messages">Mensagens</TabsTrigger>
          </TabsList>

          <TabsContent value="announcements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare size={24} />
                  Mural de Avisos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Card className="border-l-4 border-l-primary">
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2">Culto de Ação de Graças</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Convite especial para o culto de ação de graças no próximo domingo às 19h.
                      </p>
                      <span className="text-xs text-muted-foreground">Publicado há 2 horas</span>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-l-4 border-l-secondary">
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2">Reunião de Liderança</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Reunião mensal de liderança agendada para sexta-feira às 20h.
                      </p>
                      <span className="text-xs text-muted-foreground">Publicado ontem</span>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell size={24} />
                  Notificações Push
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Funcionalidade de notificações push em desenvolvimento...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar size={24} />
                  Agenda de Eventos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Funcionalidade de gestão de eventos em desenvolvimento...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prayers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users size={24} />
                  Pedidos de Oração
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Funcionalidade de pedidos de oração em desenvolvimento...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail size={24} />
                  Envio de Mensagens
                </CardTitle>
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
    </div>
  );
};

export default Communication;