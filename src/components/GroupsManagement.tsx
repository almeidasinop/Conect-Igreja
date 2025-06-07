import { useState, useEffect, useMemo, useCallback } from "react";
import { Plus, Users, Calendar, MapPin, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { GroupMembersManager } from "./GroupMembersManager";
import { Skeleton } from "./ui/skeleton";

export const GroupsManagement = () => {
  const { toast } = useToast();
  const [groups, setGroups] = useState<any[]>([]);
  const [customTypes, setCustomTypes] = useState<{ id: number, name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState<any>(null);
  
  const [managingGroupMembers, setManagingGroupMembers] = useState<any | null>(null);

  const [groupData, setGroupData] = useState({
    name: "",
    description: "",
    type: "",
    new_type_name: "", // Campo para o novo tipo
    meeting_day: "",
    meeting_time: "",
    location: "",
  });
  
  const standardTypes = [
    { value: "Ministério", label: "Ministério" },
    { value: "Célula", label: "Célula" },
    { value: "Departamento", label: "Departamento" },
  ];

  const combinedTypes = useMemo(() => {
    const customTypeOptions = customTypes.map(t => ({ value: t.name, label: t.name }));
    return [...standardTypes, ...customTypeOptions, { value: "other", label: "Outro..." }];
  }, [customTypes]);


  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const groupsPromise = supabase
        .from("groups")
        .select(`*, leader:leader_id(full_name), member_groups(count)`)
        .order("created_at", { ascending: false });

      const typesPromise = supabase.from("group_types").select("id, name");

      const [groupsResult, typesResult] = await Promise.all([groupsPromise, typesPromise]);

      if (groupsResult.error) throw groupsResult.error;
      setGroups(groupsResult.data || []);

      if (typesResult.error) throw typesResult.error;
      setCustomTypes(typesResult.data || []);

    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao carregar dados: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const handleSaveGroup = async () => {
    let finalGroupType = groupData.type;

    if (groupData.type === 'other') {
        if (!groupData.new_type_name) {
            toast({ title: "Erro de Validação", description: "Por favor, especifique o nome do novo tipo.", variant: "destructive" });
            return;
        }
        // Salva o novo tipo na tabela group_types
        const { data: newType, error } = await supabase.from("group_types").insert({ name: groupData.new_type_name }).select().single();
        if (error) {
            toast({ title: "Erro ao Salvar Tipo", description: "Este tipo de grupo já existe.", variant: "destructive" });
            return;
        }
        finalGroupType = newType.name;
    }

    if (!groupData.name || !finalGroupType) {
      toast({ title: "Erro de Validação", description: "Nome e tipo são campos obrigatórios.", variant: "destructive" });
      return;
    }

    const dataToSave = {
        name: groupData.name,
        description: groupData.description || null,
        type: finalGroupType,
        meeting_day: groupData.meeting_day || null,
        meeting_time: groupData.meeting_time || null,
        location: groupData.location || null,
    };

    try {
      let error;

      if (editingGroup) {
        // CORREÇÃO: Destruturação do erro para verificação
        ({ error } = await supabase.from("groups").update(dataToSave).eq("id", editingGroup.id));
      } else {
        // CORREÇÃO: Destruturação do erro para verificação
        ({ error } = await supabase.from("groups").insert([dataToSave]));
      }

      // CORREÇÃO: Verificação do erro antes de mostrar o sucesso
      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      toast({ title: "Sucesso!", description: `Grupo ${editingGroup ? 'atualizado' : 'criado'} com sucesso.` });
      setShowGroupForm(false);
      setEditingGroup(null);
      setGroupData({ name: "", description: "", type: "", new_type_name: "", meeting_day: "", meeting_time: "", location: "" });
      fetchInitialData();
    } catch (error: any) {
      toast({ title: "Erro ao Salvar", description: error.message, variant: "destructive" });
    }
  };

  const handleEditGroup = (group: any) => {
    setEditingGroup(group);
    setGroupData({
      name: group.name,
      description: group.description || "",
      type: group.type,
      new_type_name: "",
      meeting_day: group.meeting_day || "",
      meeting_time: group.meeting_time || "",
      location: group.location || "",
    });
    setShowGroupForm(true);
  };

  const deleteGroup = async (groupId: string) => {
    if (!confirm("Tem a certeza de que deseja excluir este grupo? Esta ação não pode ser desfeita.")) return;
    try {
      // CORREÇÃO: Adicionada verificação de erro
      const { error } = await supabase.from("groups").delete().eq("id", groupId);
      if(error) throw error;

      toast({ title: "Sucesso!", description: "Grupo excluído com sucesso." });
      fetchInitialData();
    } catch (error: any) {
      toast({ title: "Erro ao Excluir", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Grupos e Ministérios</h2>
        <Button onClick={() => { setEditingGroup(null); setGroupData({ name: "", description: "", type: "", new_type_name: "", meeting_day: "", meeting_time: "", location: "" }); setShowGroupForm(true); }}>
          <Plus size={20} className="mr-2" />
          Novo Grupo
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-64 w-full" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
            <Card key={group.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                    <div className="flex-1 pr-2">
                        <CardTitle className="text-lg">{group.name}</CardTitle>
                        <Badge variant="secondary" className="mt-2">{group.type}</Badge>
                    </div>
                    <div className="flex">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditGroup(group)}><Edit size={16} /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => deleteGroup(group.id)}><Trash2 size={16} /></Button>
                    </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    {group.description && <p className="text-sm text-muted-foreground line-clamp-2">{group.description}</p>}
                    <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center"><Users size={14} className="mr-2 flex-shrink-0" /><span>{group.member_groups?.[0]?.count || 0} membros</span></div>
                    {group.meeting_day && <div className="flex items-center"><Calendar size={14} className="mr-2 flex-shrink-0" /><span>{group.meeting_day} {group.meeting_time && `às ${group.meeting_time}`}</span></div>}
                    {group.location && <div className="flex items-center"><MapPin size={14} className="mr-2 flex-shrink-0" /><span>{group.location}</span></div>}
                    </div>
                </CardContent>
                </div>
                <CardFooter>
                <Button className="w-full mt-2" variant="outline" onClick={() => setManagingGroupMembers(group)}><Users size={16} className="mr-2"/>Gerenciar Membros</Button>
                </CardFooter>
            </Card>
            ))}
        </div>
      )}

      {groups.length === 0 && !loading && (
        <Card><CardContent className="p-8 text-center"><p className="text-muted-foreground">Nenhum grupo cadastrado ainda.</p></CardContent></Card>
      )}

      <Dialog open={showGroupForm} onOpenChange={(isOpen) => { if (!isOpen) { setEditingGroup(null); setGroupData({ name: "", description: "", type: "", new_type_name: "", meeting_day: "", meeting_time: "", location: "" })}; setShowGroupForm(isOpen); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingGroup ? "Editar Grupo" : "Novo Grupo"}</DialogTitle>
            <DialogDescription>
              Preencha os detalhes para criar ou editar um grupo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Grupo *</Label>
              <Input id="name" value={groupData.name} onChange={(e) => setGroupData(prev => ({ ...prev, name: e.target.value }))} placeholder="Nome do grupo"/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Tipo *</Label>
              <Select value={groupData.type} onValueChange={(value) => setGroupData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                <SelectContent>
                    {combinedTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {groupData.type === 'other' && (
                <div className="space-y-2 pl-2 border-l-2">
                    <Label htmlFor="new_type_name">Nome do Novo Tipo *</Label>
                    <Input id="new_type_name" value={groupData.new_type_name} onChange={(e) => setGroupData(prev => ({ ...prev, new_type_name: e.target.value}))} placeholder="Ex: Ação Social"/>
                </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea id="description" value={groupData.description} onChange={(e) => setGroupData(prev => ({ ...prev, description: e.target.value }))} placeholder="Descrição do grupo" rows={3}/>
            </div>
          </div>
          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowGroupForm(false)}>Cancelar</Button>
            <Button onClick={handleSaveGroup}>{editingGroup ? "Atualizar Grupo" : "Criar Grupo"}</Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {managingGroupMembers && (
        <GroupMembersManager 
          group={managingGroupMembers}
          onClose={() => setManagingGroupMembers(null)}
          onSave={() => {
            setManagingGroupMembers(null);
            fetchInitialData();
          }}
        />
      )}
    </div>
  );
};
