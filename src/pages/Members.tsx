import { useState } from "react";
import { Plus, Search, Filter, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MemberForm } from "@/components/MemberForm";
import { MembersList } from "@/components/MembersList";
import { GroupsManagement } from "@/components/GroupsManagement";

const Members = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [editingMember, setEditingMember] = useState<any | null>(null);
  // CORREÇÃO: Adicionado um estado de 'key' para forçar o formulário a recarregar
  const [formKey, setFormKey] = useState(Date.now());

  const handleEditMember = (member: any) => {
    setEditingMember(member);
    setFormKey(Date.now()); // Muda a key para um novo valor único
    setShowMemberForm(true);
  };
  
  const handleNewMember = () => {
    setEditingMember(null);
    setFormKey(Date.now()); // Muda a key para forçar a recriação com estado limpo
    setShowMemberForm(true);
  }

  const closeForm = () => {
    setShowMemberForm(false);
  }

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Gestão de Membros
            </h1>
            <p className="text-muted-foreground">
              Gerencie membros, grupos e ministérios da igreja
            </p>
          </div>
          <Button
            onClick={handleNewMember}
            className="flex items-center gap-2"
          >
            <Plus size={20} />
            Novo Membro
          </Button>
        </div>

        <Tabs defaultValue="members" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="members">Membros</TabsTrigger>
            <TabsTrigger value="groups">Grupos & Ministérios</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users size={24} />
                  Lista de Membros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                    <Input
                      placeholder="Buscar membros..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter size={16} className="mr-2" />
                    Filtros
                  </Button>
                </div>
                <MembersList searchTerm={searchTerm} onEdit={handleEditMember} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="groups" className="space-y-6">
            <GroupsManagement />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios de Membresia</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Funcionalidade de relatórios em desenvolvimento...
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {showMemberForm && (
          <MemberForm
            key={formKey} // CORREÇÃO: A 'key' é passada para o formulário
            member={editingMember}
            onClose={closeForm}
            onSave={() => {
              closeForm();
            }}
          />
        )}
    </div>
  );
};

export default Members;
