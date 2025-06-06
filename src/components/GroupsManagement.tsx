import { useState, useEffect } from "react";
import { Plus, Users, Calendar, MapPin, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const GroupsManagement = () => {
  const { toast } = useToast();
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState<any>(null);
  const [groupData, setGroupData] = useState({
    name: "",
    description: "",
    type: "",
    meeting_day: "",
    meeting_time: "",
    location: "",
  });

  const fetchGroups = async () => {
    try {
      const { data, error } = await supabase
        .from("groups")
        .select(`
          *,
          leader:leader_id(full_name),
          member_groups(count)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setGroups(data || []);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao carregar grupos: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleSaveGroup = async () => {
    if (!groupData.name || !groupData.type) {
      toast({
        title: "Erro",
        description: "Nome e tipo são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingGroup) {
        const { error } = await supabase
          .from("groups")
          .update(groupData)
          .eq("id", editingGroup.id);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Grupo atualizado com sucesso!",
        });
      } else {
        const { error } = await supabase
          .from("groups")
          .insert(groupData);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Grupo criado com sucesso!",
        });
      }

      setShowGroupForm(false);
      setEditingGroup(null);
      setGroupData({
        name: "",
        description: "",
        type: "",
        meeting_day: "",
        meeting_time: "",
        location: "",
      });
      fetchGroups();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao salvar grupo: " + error.message,
        variant: "destructive",
      });
    }
  };

  const handleEditGroup = (group: any) => {
    setEditingGroup(group);
    setGroupData({
      name: group.name,
      description: group.description || "",
      type: group.type,
      meeting_day: group.meeting_day || "",
      meeting_time: group.meeting_time || "",
      location: group.location || "",
    });
    setShowGroupForm(true);
  };

  const deleteGroup = async (groupId: string) => {
    if (!confirm("Tem certeza que deseja excluir este grupo?")) return;

    try {
      const { error } = await supabase
        .from("groups")
        .delete()
        .eq("id", groupId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Grupo excluído com sucesso!",
      });

      fetchGroups();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao excluir grupo: " + error.message,
        variant: "destructive",
      });
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      ministry: "Ministério",
      cell: "Célula",
      department: "Departamento",
      other: "Outro"
    };
    return labels[type] || type;
  };

  const getTypeBadgeVariant = (type: string) => {
    const variants: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
      ministry: "default",
      cell: "secondary",
      department: "outline",
      other: "destructive"
    };
    return variants[type] || "default";
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Grupos e Ministérios</h2>
        <Button onClick={() => setShowGroupForm(true)}>
          <Plus size={20} className="mr-2" />
          Novo Grupo
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <Card key={group.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{group.name}</CardTitle>
                  <Badge variant={getTypeBadgeVariant(group.type)} className="mt-2">
                    {getTypeLabel(group.type)}
                  </Badge>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditGroup(group)}
                  >
                    <Edit size={14} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteGroup(group.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {group.description && (
                <p className="text-sm text-muted-foreground">
                  {group.description}
                </p>
              )}

              <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users size={14} className="mr-2" />
                  {group.member_groups?.[0]?.count || 0} membros
                </div>

                {group.meeting_day && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar size={14} className="mr-2" />
                    {group.meeting_day} {group.meeting_time && `às ${group.meeting_time}`}
                  </div>
                )}

                {group.location && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin size={14} className="mr-2" />
                    {group.location}
                  </div>
                )}
              </div>

              {group.leader && (
                <div className="pt-2 border-t">
                  <p className="text-sm font-medium">
                    Líder: {group.leader.full_name}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {groups.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              Nenhum grupo cadastrado ainda.
            </p>
          </CardContent>
        </Card>
      )}

      <Dialog open={showGroupForm} onOpenChange={setShowGroupForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingGroup ? "Editar Grupo" : "Novo Grupo"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Grupo *</Label>
              <Input
                id="name"
                value={groupData.name}
                onChange={(e) => setGroupData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nome do grupo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo *</Label>
              <Select value={groupData.type} onValueChange={(value) => setGroupData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ministry">Ministério</SelectItem>
                  <SelectItem value="cell">Célula</SelectItem>
                  <SelectItem value="department">Departamento</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={groupData.description}
                onChange={(e) => setGroupData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição do grupo"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="meeting_day">Dia da Reunião</Label>
                <Input
                  id="meeting_day"
                  value={groupData.meeting_day}
                  onChange={(e) => setGroupData(prev => ({ ...prev, meeting_day: e.target.value }))}
                  placeholder="Ex: Domingo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="meeting_time">Horário</Label>
                <Input
                  id="meeting_time"
                  type="time"
                  value={groupData.meeting_time}
                  onChange={(e) => setGroupData(prev => ({ ...prev, meeting_time: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Local</Label>
              <Input
                id="location"
                value={groupData.location}
                onChange={(e) => setGroupData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Local da reunião"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button variant="outline" onClick={() => setShowGroupForm(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveGroup}>
              {editingGroup ? "Atualizar" : "Criar Grupo"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};