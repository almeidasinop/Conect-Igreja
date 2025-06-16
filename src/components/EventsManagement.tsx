import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { type Event, type EventRole, type Database } from '@/integrations/supabase/types';
import { useToast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/contexts/AuthContext';
import { Trash2, PlusCircle, Users, Globe, Lock } from 'lucide-react';

// Helper Type for Groups
type Group = Database['public']['Tables']['groups']['Row'];

const fromSupabaseDateTime = (isoDateTime: string | null | undefined) => {
  if (!isoDateTime) return '';
  const date = new Date(isoDateTime);
  const offset = date.getTimezoneOffset();
  const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
  return adjustedDate.toISOString().slice(0, 16);
};

export const EventsManagement = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<(Event & { event_roles: EventRole[] }) | null>(null);
  const [formData, setFormData] = useState<Partial<Event>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [roles, setRoles] = useState<Partial<EventRole>[]>([]);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleCount, setNewRoleCount] = useState(1);

  const { data: events, isLoading: isLoadingEvents } = useQuery<(Event & { event_roles: EventRole[] })[]>({
    queryKey: ['events_with_roles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('events').select(`*, event_roles ( * )`).order('start_time', { ascending: true });
      if (error) throw new Error(error.message);
      return data || [];
    },
  });
  
  const { data: groups, isLoading: isLoadingGroups } = useQuery<Group[]>({
      queryKey: ['groups'],
      queryFn: async () => {
          const { data, error } = await supabase.from('groups').select('*').order('name');
          if (error) throw new Error(error.message);
          return data || [];
      }
  });


  const uploadImage = async (file: File): Promise<string | null> => {
    if (!file) return null;
    const fileName = `${uuidv4()}-${file.name}`;
    const { data, error } = await supabase.storage.from('event-images').upload(fileName, file);
    if (error) {
      console.error('Error uploading image:', error);
      toast({ title: "Erro no Upload", description: "Não foi possível enviar a imagem.", variant: "destructive" });
      return null;
    }
    const { data: { publicUrl } } = supabase.storage.from('event-images').getPublicUrl(data.path);
    return publicUrl;
  };
  
  const mutation = useMutation({
    mutationFn: async (eventDataToSave: Partial<Event>) => {
      let imageUrl = eventDataToSave.image_url;
      if (imageFile) imageUrl = await uploadImage(imageFile);

      // Limpa os grupos alvo se o evento for público
      const finalEventData = {
        ...eventDataToSave,
        targeted_group_ids: eventDataToSave.visibility === 'public' ? null : eventDataToSave.targeted_group_ids,
      };

      const dataForSupabase = { ...finalEventData, image_url: imageUrl, start_time: finalEventData.start_time ? new Date(finalEventData.start_time).toISOString() : undefined, end_time: finalEventData.end_time ? new Date(finalEventData.end_time).toISOString() : null };
      
      let savedEvent: Event;

      if (selectedEvent) {
        const { id, created_at, event_roles, ...updateData } = dataForSupabase;
        const { data, error } = await supabase.from('events').update(updateData).eq('id', selectedEvent.id).select().single();
        if (error || !data) throw error || new Error("Falha ao atualizar o evento.");
        savedEvent = data;
      } else {
        const { data, error } = await supabase.from('events').insert({ ...dataForSupabase, author_id: user?.id }).select().single();
        if (error || !data) throw error || new Error("Falha ao criar o evento.");
        savedEvent = data;
      }
      
      const existingRoleIds = selectedEvent?.event_roles?.map(r => r.id) || [];
      const currentRoleIds = roles.map(r => r.id).filter(id => id !== undefined);

      const rolesToDelete = existingRoleIds.filter(id => !currentRoleIds.includes(id as number));
      if (rolesToDelete.length > 0) {
        const { error: deleteError } = await supabase.from('event_roles').delete().in('id', rolesToDelete);
        if (deleteError) throw deleteError;
      }

      const rolesToUpsert = roles.map(role => ({ ...role, event_id: savedEvent.id }));
      const { error: upsertError } = await supabase.from('event_roles').upsert(rolesToUpsert);
      if (upsertError) throw upsertError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events_with_roles'] });
      toast({ title: "Sucesso!", description: `Evento e escala salvos com sucesso.` });
      setOpen(false);
    },
    onError: (error: Error) => {
      console.error('Error:', error);
      toast({ title: "Erro", description: error.message || "Ocorreu um erro ao salvar.", variant: "destructive" });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };
  
  const openModal = (event: (Event & { event_roles: EventRole[] }) | null) => {
    setSelectedEvent(event);
    setImageFile(null); 
    if (event) {
        setFormData(event);
        setRoles(event.event_roles || []);
    } else {
        setFormData({ title: '', start_time: '', end_time: null, location: '', description: '', recurrence_rule: 'none', visibility: 'public', targeted_group_ids: [] });
        setRoles([]);
    }
    setOpen(true);
  };
  
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { /* ... */ },
    onSuccess: () => { /* ... */ },
    onError: (error) => toast({ title: "Erro", description: "Não foi possível deletar o evento.", variant: "destructive" })
  });

  const handleAddRole = () => {
    if (newRoleName.trim() === '') return;
    setRoles([...roles, { role_name: newRoleName, required_count: newRoleCount }]);
    setNewRoleName('');
    setNewRoleCount(1);
  };

  const handleRemoveRole = (index: number) => {
    setRoles(roles.filter((_, i) => i !== index));
  };

  const handleTargetedGroupChange = (groupId: string, checked: boolean) => {
    const currentGroupIds = formData.targeted_group_ids || [];
    if (checked) {
        setFormData({ ...formData, targeted_group_ids: [...currentGroupIds, groupId] });
    } else {
        setFormData({ ...formData, targeted_group_ids: currentGroupIds.filter(id => id !== groupId) });
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center"><h2 className="text-2xl font-bold">Gerenciamento de Eventos</h2><Button onClick={() => openModal(null)}>Novo Evento</Button></div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader><DialogTitle>{selectedEvent ? 'Editar Evento' : 'Novo Evento'}</DialogTitle><DialogDescription>Preencha os detalhes do evento e defina a escala de voluntários.</DialogDescription></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
              <div><Label htmlFor="title">Título do Evento</Label><Input id="title" value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required /></div>
              
              {/* --- CAMPO DE VISIBILIDADE ADICIONADO --- */}
              <div className="space-y-2 pt-4 border-t">
                  <Label>Visibilidade do Evento</Label>
                  {/* CORREÇÃO: Removido o `defaultValue` para tornar o componente totalmente controlado */}
                  <RadioGroup value={formData.visibility} onValueChange={(value) => setFormData({ ...formData, visibility: value as 'public' | 'internal' })} className="flex gap-4">
                      <Label htmlFor="visibility-public" className="flex items-center gap-2 border rounded-md p-3 flex-1 cursor-pointer hover:bg-gray-800"><RadioGroupItem value="public" id="visibility-public" /><Globe className="h-4 w-4 mr-1"/>Público</Label>
                      <Label htmlFor="visibility-internal" className="flex items-center gap-2 border rounded-md p-3 flex-1 cursor-pointer hover:bg-gray-800"><RadioGroupItem value="internal" id="visibility-internal" /><Lock className="h-4 w-4 mr-1"/>Interno</Label>
                  </RadioGroup>
              </div>

              {/* --- CAMPO CONDICIONAL PARA GRUPOS ALVO --- */}
              {formData.visibility === 'internal' && (
                <div className="space-y-2 p-4 border rounded-lg bg-gray-900/50">
                    <Label className="font-semibold">Notificar Grupos Específicos</Label>
                    <p className="text-sm text-gray-400">Selecione os grupos e ministérios que devem ser notificados sobre este evento.</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 pt-2 max-h-40 overflow-y-auto">
                        {isLoadingGroups ? <p>Carregando grupos...</p> : groups?.map(group => (
                            <div key={group.id} className="flex items-center space-x-2">
                                <Checkbox 
                                    id={`group-${group.id}`} 
                                    checked={formData.targeted_group_ids?.includes(group.id)}
                                    onCheckedChange={(checked) => handleTargetedGroupChange(group.id, !!checked)}
                                />
                                <Label htmlFor={`group-${group.id}`}>{group.name}</Label>
                            </div>
                        ))}
                    </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label htmlFor="start_time">Início</Label><Input id="start_time" type="datetime-local" value={fromSupabaseDateTime(formData.start_time || undefined)} onChange={(e) => setFormData({ ...formData, start_time: e.target.value })} required /></div>
                <div><Label htmlFor="end_time">Fim (Opcional)</Label><Input id="end_time" type="datetime-local" value={fromSupabaseDateTime(formData.end_time || undefined)} onChange={(e) => setFormData({ ...formData, end_time: e.target.value })} /></div>
              </div>
              <div><Label htmlFor="location">Local</Label><Input id="location" value={formData.location || ''} onChange={(e) => setFormData({ ...formData, location: e.target.value })} /></div>
              <div><Label htmlFor="description">Descrição</Label><Textarea id="description" value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /></div>
              <div><Label htmlFor="recurrence_rule">Recorrência</Label><Select value={formData.recurrence_rule || 'none'} onValueChange={(value) => setFormData({ ...formData, recurrence_rule: value })}><SelectTrigger><SelectValue placeholder="Selecione a recorrência" /></SelectTrigger><SelectContent><SelectItem value="none">Não se repete</SelectItem><SelectItem value="weekly">Semanalmente</SelectItem><SelectItem value="monthly">Mensalmente</SelectItem></SelectContent></Select></div>
              <div><Label htmlFor="image">Imagem de Capa</Label><Input id="image" type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)} /></div>
              
              <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-semibold">Escala de Voluntários</h3>
                  <div className="space-y-2">{roles.map((role, index) => (<div key={index} className="flex items-center gap-2 bg-gray-800 p-2 rounded-md"><span className="flex-1 font-medium">{role.role_name}</span><span className="text-sm text-gray-400">Vagas: {role.required_count}</span><Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveRole(index)}><Trash2 className="h-4 w-4 text-red-500" /></Button></div>))}</div>
                  <div className="flex items-end gap-2 p-2 border rounded-lg">
                      <div className="flex-1"><Label htmlFor="newRoleName">Função / Ministério</Label><Select value={newRoleName} onValueChange={setNewRoleName}><SelectTrigger disabled={isLoadingGroups}><SelectValue placeholder={isLoadingGroups ? "Carregando..." : "Selecione um ministério"} /></SelectTrigger><SelectContent>{groups?.map(group => (<SelectItem key={group.id} value={group.name}>{group.name}</SelectItem>))}</SelectContent></Select></div>
                      <div><Label htmlFor="newRoleCount">Vagas</Label><Input id="newRoleCount" type="number" className="w-20" min="1" value={newRoleCount} onChange={(e) => setNewRoleCount(Number(e.target.value))} /></div>
                      <Button type="button" onClick={handleAddRole}><PlusCircle className="h-4 w-4 mr-2" />Adicionar</Button>
                  </div>
              </div>

            <DialogFooter><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Salvando...' : 'Salvar'}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <div className="rounded-md border">
          <Table>
            <TableHeader><TableRow><TableHead>Título</TableHead><TableHead>Data</TableHead><TableHead>Visibilidade</TableHead><TableHead className="text-right pr-6">Ações</TableHead></TableRow></TableHeader>
            <TableBody>
                {isLoadingEvents ? (<TableRow><TableCell colSpan={4} className="text-center h-24">Carregando...</TableCell></TableRow>) : events?.map((event) => (
                    <TableRow key={event.id}>
                        <TableCell className="font-medium">{event.title}</TableCell>
                        <TableCell>{new Date(event.start_time).toLocaleString('pt-BR')}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 text-xs rounded-full ${event.visibility === 'public' ? 'bg-blue-900 text-blue-200' : 'bg-purple-900 text-purple-200'}`}>
                            {event.visibility === 'public' ? 'Público' : 'Interno'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => { /* Lógica para gerenciar voluntários virá aqui */ }}><Users className="h-4 w-4 mr-2"/>Escala</Button>
                          <Button variant="ghost" size="sm" onClick={() => openModal(event)}>Editar</Button>
                          <AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="sm" className="text-red-500">Deletar</Button></AlertDialogTrigger>
                            <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Tem certeza?</AlertDialogTitle><AlertDialogDescription>A ação não pode ser desfeita.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => deleteMutation.mutate(event.id)}>Continuar</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
          </Table>
      </div>
    </div>
  );
};
