import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { type Event } from '@/integrations/supabase/types';
import { useToast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/contexts/AuthContext';

// Função para formatar a string de data ISO do Supabase para o formato do input datetime-local
const fromSupabaseDateTime = (isoDateTime: string | null | undefined) => {
  if (!isoDateTime) return '';
  const date = new Date(isoDateTime);
  const offset = date.getTimezoneOffset();
  const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
  return adjustedDate.toISOString().slice(0, 16);
};

// Componente de Gestão de Eventos
export const EventsManagement = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState<Partial<Event>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);

  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ['events'],
    queryFn: async () => {
      const { data, error } = await supabase.from('events').select('*').order('start_time', { ascending: true });
      if (error) throw new Error(error.message);
      return data || [];
    },
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

      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
        if (!imageUrl) throw new Error("A falha no upload da imagem impediu o salvamento.");
      }
      
      const dataForSupabase = { 
        ...eventDataToSave, 
        image_url: imageUrl,
        start_time: eventDataToSave.start_time ? new Date(eventDataToSave.start_time).toISOString() : undefined,
        end_time: eventDataToSave.end_time ? new Date(eventDataToSave.end_time).toISOString() : null,
      };

      if (selectedEvent) {
        // CORREÇÃO: Removemos o 'id' e 'created_at' do objeto antes de enviar para o update.
        const { id, created_at, ...updateData } = dataForSupabase;
        const { error } = await supabase.from('events').update(updateData).eq('id', selectedEvent.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('events').insert({ ...dataForSupabase, author_id: user?.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({ title: "Sucesso!", description: `Evento ${selectedEvent ? 'atualizado' : 'criado'} com sucesso.` });
      setOpen(false);
    },
    onError: (error: Error) => {
      console.error('Error:', error);
      toast({ title: "Erro", description: error.message || "Ocorreu um erro ao salvar o evento.", variant: "destructive" });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };
  
  const openModal = (event: Event | null) => {
    setSelectedEvent(event);
    setImageFile(null); 
    if (event) {
        setFormData({
            ...event,
            start_time: fromSupabaseDateTime(event.start_time),
            end_time: fromSupabaseDateTime(event.end_time),
        });
    } else {
        setFormData({ title: '', start_time: '', end_time: null, location: '', description: '' });
    }
    setOpen(true);
  };
  
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
        const eventToDelete = events?.find(e => e.id === id);
        if (eventToDelete?.image_url) {
            const fileName = eventToDelete.image_url.split('/').pop();
            if(fileName) await supabase.storage.from('event-images').remove([fileName]);
        }
        const { error } = await supabase.from('events').delete().eq('id', id);
        if (error) throw error;
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['events'] });
        toast({ title: "Sucesso!", description: "Evento deletado." });
    },
    onError: (error) => {
        toast({ title: "Erro", description: "Não foi possível deletar o evento.", variant: "destructive" });
        console.error("Delete error:", error);
    }
  });

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gerenciamento de Eventos</h2>
        <Button onClick={() => openModal(null)}>Novo Evento</Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedEvent ? 'Editar Evento' : 'Novo Evento'}</DialogTitle>
            <DialogDescription>
                Preencha os detalhes abaixo. Clique em salvar quando terminar.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Título do Evento</Label>
                <Input id="title" value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
              </div>
              <div>
                <Label htmlFor="start_time">Início</Label>
                <Input id="start_time" type="datetime-local" value={formData.start_time || ''} onChange={(e) => setFormData({ ...formData, start_time: e.target.value })} required />
              </div>
              <div>
                <Label htmlFor="end_time">Fim (Opcional)</Label>
                <Input id="end_time" type="datetime-local" value={formData.end_time || ''} onChange={(e) => setFormData({ ...formData, end_time: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="location">Local</Label>
                <Input id="location" value={formData.location || ''} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea id="description" value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="image">Imagem de Capa</Label>
                <Input id="image" type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)} />
              </div>
              {formData.image_url && !imageFile && (
                <div>
                    <Label>Prévia da Imagem Atual</Label>
                    <img src={formData.image_url} alt="Prévia do Evento" className="w-full h-auto rounded-md mt-2 object-cover max-h-48 border" />
                </div>
              )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Salvando...' : 'Salvar'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <div className="rounded-md border">
          <Table>
              <TableHeader>
                  <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Data de Início</TableHead>
                      <TableHead>Local</TableHead>
                      <TableHead className="text-right pr-6">Ações</TableHead>
                  </TableRow>
              </TableHeader>
              <TableBody>
                  {isLoading ? (
                      <TableRow><TableCell colSpan={4} className="text-center h-24">Carregando eventos...</TableCell></TableRow>
                  ) : events && events.length > 0 ? (
                      events.map((event) => (
                          <TableRow key={event.id}>
                              <TableCell className="font-medium">{event.title}</TableCell>
                              <TableCell>{new Date(event.start_time).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</TableCell>
                              <TableCell>{event.location}</TableCell>
                              <TableCell className="text-right">
                                  <Button variant="ghost" size="sm" onClick={() => openModal(event)}>Editar</Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">Deletar</Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Essa ação não pode ser desfeita. Isso excluirá permanentemente o evento e removerá a imagem associada do armazenamento.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => deleteMutation.mutate(event.id)}>Continuar</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                              </TableCell>
                          </TableRow>
                      ))
                  ) : (
                    <TableRow><TableCell colSpan={4} className="text-center h-24 text-muted-foreground">Nenhum evento encontrado.</TableCell></TableRow>
                  )}
              </TableBody>
          </Table>
      </div>
    </div>
  );
};
