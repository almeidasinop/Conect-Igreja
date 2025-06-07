import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, BookText, Video, FileText } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "./ui/badge";

type ContentItem = {
  id: number;
  title: string;
  description: string | null;
  type: string;
  content: string;
  created_at: string;
};

const contentTypeConfig = {
    devotional: { label: "Devocional", icon: BookText },
    sermon_video: { label: "Vídeo do Sermão", icon: Video },
    study_pdf: { label: "Estudo (PDF)", icon: FileText },
};

export const ContentManagement = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "devotional",
    content: "",
  });

  const fetchContent = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("content_items")
        .select(`*`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      toast({ title: "Erro", description: "Falha ao carregar conteúdo.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const resetForm = () => {
    setEditingItem(null);
    setFormData({ title: "", description: "", type: "devotional", content: "" });
  };

  const handleEdit = (item: ContentItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || "",
      type: item.type,
      content: item.content,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.content) {
      toast({ title: "Erro de Validação", description: "Título e conteúdo/link são obrigatórios.", variant: "destructive" });
      return;
    }
    
    try {
      const { error } = editingItem
        ? await supabase.from("content_items").update(formData).eq("id", editingItem.id)
        : await supabase.from("content_items").insert([formData]);

      if (error) throw error;
      
      toast({ title: "Sucesso!", description: `Conteúdo ${editingItem ? 'atualizado' : 'publicado'} com sucesso.` });
      setShowForm(false);
      resetForm();
      fetchContent();
    } catch (error: any) {
      toast({ title: "Erro ao Salvar", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem a certeza de que deseja apagar este item de conteúdo?")) return;
    
    try {
        const { error } = await supabase.from("content_items").delete().eq("id", id);
        if (error) throw error;
        toast({ title: "Sucesso!", description: "Conteúdo apagado com sucesso." });
        fetchContent();
    } catch (error: any) {
        toast({ title: "Erro ao Apagar", description: error.message, variant: "destructive" });
    }
  };
  
  const renderContent = (item: ContentItem) => {
    const Icon = contentTypeConfig[item.type as keyof typeof contentTypeConfig]?.icon || BookText;

    if (item.type === 'devotional') {
        return <p className="text-sm text-muted-foreground whitespace-pre-wrap">{item.content}</p>;
    }
    return (
        <Button asChild variant="secondary" size="sm">
            <a href={item.content} target="_blank" rel="noopener noreferrer">
                <Icon className="mr-2 h-4 w-4" />
                Abrir Link
            </a>
        </Button>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Biblioteca de Conteúdo</CardTitle>
          <CardDescription>Adicione e gira devocionais, estudos e vídeos.</CardDescription>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Novo Conteúdo
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Nenhum conteúdo adicionado.</p>
        ) : (
          <div className="space-y-4">
            {items.map(item => (
              <Card key={item.id}>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle>{item.title}</CardTitle>
                            <CardDescription>
                                Publicado em {format(new Date(item.created_at), "dd/MM/yyyy")}
                            </CardDescription>
                        </div>
                        <Badge variant="outline">
                            {contentTypeConfig[item.type as keyof typeof contentTypeConfig]?.label || 'Conteúdo'}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                  {item.description && <p className="text-sm mb-4">{item.description}</p>}
                  {renderContent(item)}
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
            <DialogTitle>{editingItem ? "Editar" : "Novo"} Conteúdo</DialogTitle>
             <DialogDescription>
                Preencha os detalhes para publicar um novo material.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input id="title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
            </div>
             <div className="space-y-2">
              <Label htmlFor="type">Tipo de Conteúdo</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value, content: ''})}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="devotional">Devocional</SelectItem>
                      <SelectItem value="sermon_video">Vídeo do Sermão</SelectItem>
                      <SelectItem value="study_pdf">Estudo (PDF)</SelectItem>
                  </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição (Opcional)</Label>
              <Textarea id="description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3}/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">{formData.type === 'devotional' ? 'Conteúdo do Devocional' : 'Link do Conteúdo'}</Label>
              {formData.type === 'devotional' ? (
                <Textarea id="content" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} rows={8}/>
              ) : (
                <Input id="content" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} placeholder="https://youtube.com/... ou https://drive.google.com/..."/>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={handleSave}>{editingItem ? "Guardar Alterações" : "Publicar Conteúdo"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
