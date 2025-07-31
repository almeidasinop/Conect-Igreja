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
import { useToast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/contexts/AuthContext';
import { type Database } from '@/integrations/supabase/types';

type Announcement = Database['public']['Tables']['announcements']['Row'];

export const AnnouncementsManagement = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState<Partial<Announcement>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);

  const { data: announcements, isLoading } = useQuery<Announcement[]>({
    queryKey: ['announcements'],
    queryFn: async () => {
      const { data, error } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return data || [];
    },
  });

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!file) return null;
    const fileName = `${uuidv4()}-${file.name}`;
    const { data, error } = await supabase.storage.from('announcement-images').upload(fileName, file);
    if (error) {
      console.error('Error uploading image:', error);
      toast({ title: "Erro no Upload", description: "Não foi possível enviar a imagem.", variant: "destructive" });
      return null;
    }
    const { data: { publicUrl } } = supabase.storage.from('announcement-images').getPublicUrl(data.path);
    return publicUrl;
  };

  const mutation = useMutation({
    mutationFn: async (announcementData: Partial<Announcement>) => {
      let imageUrl = announcementData.image_url;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
        if (!imageUrl) throw new Error("Falha no upload da imagem impediu o salvamento.");
      }

      const dataForSupabase = { ...announcementData, image_url: imageUrl };

      if (selectedAnnouncement) {
        const { id, created_at, author_id, ...updateData } = dataForSupabase;
        const { error } = await supabase.from('announcements').update(updateData).eq('id', selectedAnnouncement.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('announcements').insert({ ...dataForSupabase, author_id: user?.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast({ title: "Sucesso!", description: `Aviso ${selectedAnnouncement ? 'atualizado' : 'criado'} com sucesso.` });
      setOpen(false);
    },
    onError: (error: Error) => {
      console.error('Error:', error);
      toast({ title: "Erro ao Salvar", description: error.message, variant: "destructive" });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };
  
  const openModal = (announcement: Announcement | null) => {
    setSelectedAnnouncement(announcement);
    setImageFile(null); 
    setFormData(announcement ? announcement : { title: '', content: '' });
    setOpen(true);
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const announcementToDelete = announcements?.find(a => a.id === id);
      if (announcementToDelete?.image_url) {
        const fileName = announcementToDelete.image_url.split('/').pop();
        if(fileName) await supabase.storage.from('announcement-images').remove([fileName]);
      }
      const { error } = await supabase.from('announcements').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['announcements'] });
        toast({ title: "Sucesso!", description: "Aviso deletado." });
    },
    onError: () => toast({ title: "Erro", description: "Não foi possível deletar o aviso.", variant: "destructive" })
  });

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Mural de Avisos</h2>
        <Button onClick={() => openModal(null)}>Novo Aviso</Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedAnnouncement ? 'Editar Aviso' : 'Novo Aviso'}</DialogTitle>
            <DialogDescription>
                Crie ou edite um aviso para o mural da igreja.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Título</Label>
                <Input id="title" value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
              </div>
              <div>
                <Label htmlFor="content">Conteúdo</Label>
                <Textarea id="content" value={formData.content || ''} onChange={(e) => setFormData({ ...formData, content: e.target.value })} required />
              </div>
              <div>
                <Label htmlFor="image">Imagem (Opcional)</Label>
                <Input id="image" type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)} />
              </div>
              {formData.image_url && !imageFile && (
                <div>
                    <Label>Prévia da Imagem</Label>
                    <img src={formData.image_url} alt="Prévia" className="w-full h-auto rounded-md mt-2 object-cover max-h-48 border" />
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
                      <TableHead>Data</TableHead>
                      <TableHead className="text-right pr-6">Ações</TableHead>
                  </TableRow>
              </TableHeader>
              <TableBody>
                  {isLoading ? (
                      <TableRow><TableCell colSpan={3} className="text-center h-24">Carregando avisos...</TableCell></TableRow>
                  ) : announcements?.map((announcement) => (
                      <TableRow key={announcement.id}>
                          <TableCell className="font-medium">{announcement.title}</TableCell>
                          <TableCell>{new Date(announcement.created_at).toLocaleDateString('pt-BR')}</TableCell>
                          <TableCell className="text-right">
                              <Button variant="ghost" size="sm" onClick={() => openModal(announcement)}>Editar</Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">Deletar</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                        <AlertDialogDescription>Essa ação não pode ser desfeita e excluirá o aviso permanentemente.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => deleteMutation.mutate(announcement.id)}>Continuar</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
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
