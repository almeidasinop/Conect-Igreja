import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type Announcement = {
  id: number;
  title: string;
  content: string;
  created_at: string;
};

export const AnnouncementsManagement = () => {
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState({ title: "", content: "" });

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("announcements")
        .select(`*`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error: any) {
      toast({ title: "Erro", description: "Falha ao carregar avisos.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const resetForm = () => {
    setEditingAnnouncement(null);
    setFormData({ title: "", content: "" });
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({ title: announcement.title, content: announcement.content });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.content) {
      toast({ title: "Erro de Validação", description: "Título e conteúdo são obrigatórios.", variant: "destructive" });
      return;
    }
    
    try {
      const { error } = editingAnnouncement
        ? await supabase.from("announcements").update(formData).eq("id", editingAnnouncement.id)
        : await supabase.from("announcements").insert([formData]);

      if (error) throw error;
      
      toast({ title: "Sucesso!", description: `Aviso ${editingAnnouncement ? 'atualizado' : 'publicado'} com sucesso.` });
      setShowForm(false);
      resetForm();
      fetchAnnouncements();
    } catch (error: any) {
      toast({ title: "Erro ao Salvar", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem a certeza de que deseja apagar este aviso?")) return;
    
    try {
        const { error } = await supabase.from("announcements").delete().eq("id", id);
        if (error) throw error;
        toast({ title: "Sucesso!", description: "Aviso apagado com sucesso." });
        fetchAnnouncements();
    } catch (error: any) {
        toast({ title: "Erro ao Apagar", description: error.message, variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Mural de Avisos</CardTitle>
          <CardDescription>Crie e gira os comunicados da igreja.</CardDescription>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Novo Aviso
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : announcements.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Nenhum aviso publicado.</p>
        ) : (
          <div className="space-y-4">
            {announcements.map(item => (
              <Card key={item.id}>
                <CardHeader>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>
                    Publicado em {format(new Date(item.created_at), "dd 'de' MMMM, yyyy 'às' HH:mm", { locale: ptBR })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{item.content}</p>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}><Edit size={16}/></Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(item.id)}><Trash2 size={16}/></Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
       <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAnnouncement ? "Editar" : "Novo"} Aviso</DialogTitle>
             <DialogDescription>
                Escreva o comunicado que ficará visível no mural para os membros.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input id="title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Ex: Culto de Domingo" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Conteúdo</Label>
              <Textarea id="content" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} placeholder="Escreva aqui os detalhes do aviso..." rows={5}/>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={handleSave}>{editingAnnouncement ? "Guardar Alterações" : "Publicar Aviso"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
