import { useState } from "react";
import { BookOpen, Play, FileText, Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Content = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Gestão de Conteúdo
            </h1>
            <p className="text-muted-foreground">
              Central de conteúdos e materiais da igreja
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Upload size={20} />
            Novo Conteúdo
          </Button>
        </div>

        <Tabs defaultValue="devotionals" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="devotionals">Devocionais</TabsTrigger>
            <TabsTrigger value="media">Biblioteca de Mídias</TabsTrigger>
            <TabsTrigger value="materials">Materiais de Apoio</TabsTrigger>
          </TabsList>

          <TabsContent value="devotionals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen size={24} />
                  Devocionais e Estudos Bíblicos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Card className="border-l-4 border-l-primary">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold mb-2">A Importância da Oração</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            Estudo bíblico sobre a oração na vida cristã...
                          </p>
                          <span className="text-xs text-muted-foreground">Publicado há 1 dia</span>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download size={16} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-l-4 border-l-secondary">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold mb-2">Devocional Diário - Salmo 23</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            Reflexão sobre o Salmo 23 e a proteção divina...
                          </p>
                          <span className="text-xs text-muted-foreground">Publicado há 3 dias</span>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download size={16} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="media" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play size={24} />
                  Biblioteca de Mídias
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center">
                        <Play size={32} className="text-muted-foreground" />
                      </div>
                      <h4 className="font-semibold mb-2">Pregação - Fé e Esperança</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Pastor João Silva - 15/12/2024
                      </p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Play size={16} />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download size={16} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center">
                        <Play size={32} className="text-muted-foreground" />
                      </div>
                      <h4 className="font-semibold mb-2">Louvor - Noite de Adoração</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Ministério de Louvor - 10/12/2024
                      </p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Play size={16} />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download size={16} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="materials" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText size={24} />
                  Materiais de Apoio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Funcionalidade de materiais de apoio em desenvolvimento...
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Content;