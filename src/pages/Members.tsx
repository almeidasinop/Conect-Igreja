import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MemberForm } from "@/components/MemberForm";
import { MembersList } from "@/components/MembersList";
import { GroupsManagement } from "@/components/GroupsManagement";
import MembershipReports from "@/components/MembershipReports";

const Members = () => {
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [editingMember, setEditingMember] = useState<any | null>(null);
  const [formKey, setFormKey] = useState(Date.now());
  
  const queryClient = useQueryClient();

  const handleEditMember = (member: any) => {
    setEditingMember(member);
    setFormKey(Date.now());
    setShowMemberForm(true);
  };
  
  const handleNewMember = () => {
    setEditingMember(null);
    setFormKey(Date.now());
    setShowMemberForm(true);
  }

  const closeForm = () => {
    setShowMemberForm(false);
  }

  const handleSave = () => {
    // Invalida as queries para forçar a atualização dos dados
    queryClient.invalidateQueries({ queryKey: ['membersWithProfiles'] });
    queryClient.invalidateQueries({ queryKey: ['membershipReport'] });
    closeForm();
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
                {/* A barra de busca agora está dentro do componente DataTable, então a removemos daqui. */}
                <MembersList onEdit={handleEditMember} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="groups" className="space-y-6">
            <GroupsManagement />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <MembershipReports />
          </TabsContent>
        </Tabs>

        {showMemberForm && (
          <MemberForm
            key={formKey}
            member={editingMember}
            onClose={closeForm}
            onSave={handleSave}
          />
        )}
    </div>
  );
};

export default Members;
