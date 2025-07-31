import { useState, useEffect, useCallback } from "react";
import { Plus, Edit, Trash2, ArrowDown, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter, // <-- CORREÇÃO: Componente adicionado aqui
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "./ui/skeleton";

type Category = {
  id: number;
  name: string;
  description: string | null;
  type: 'income' | 'expense';
};

export const CategoriesManagement = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "expense" as 'income' | 'expense',
  });

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("categories").select("*").order("name");
      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      toast({ title: "Erro", description: "Falha ao carregar categorias.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const resetForm = () => {
    setEditingCategory(null);
    setFormData({ name: "", description: "", type: "expense" });
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      type: category.type,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.name) {
      toast({ title: "Erro de Validação", description: "O nome da categoria é obrigatório.", variant: "destructive" });
      return;
    }
    
    setLoading(true);
    try {
      const { error } = editingCategory
        ? await supabase.from("categories").update(formData).eq("id", editingCategory.id)
        : await supabase.from("categories").insert(formData);

      if (error) throw error;
      
      toast({ title: "Sucesso!", description: `Categoria ${editingCategory ? 'atualizada' : 'criada'} com sucesso.` });
      setShowForm(false);
      resetForm();
      fetchCategories();
    } catch (error: any) {
      toast({ title: "Erro ao Salvar", description: error.message, variant: "destructive" });
    } finally {
        setLoading(false);
    }
  };
  
  const handleDelete = async (categoryId: number) => {
    if (!confirm("Tem a certeza de que deseja apagar esta categoria?")) return;
    
    try {
        const { error } = await supabase.from("categories").delete().eq("id", categoryId);
        if (error) throw error;
        toast({ title: "Sucesso!", description: "Categoria apagada com sucesso." });
        fetchCategories();
    } catch (error: any) {
        toast({ title: "Erro ao Apagar", description: error.message, variant: "destructive" });
    }
  };

  const getTypeBadge = (type: 'income' | 'expense') => {
    const isIncome = type === 'income';
    return (
      <Badge variant={isIncome ? "default" : "destructive"} className="flex items-center gap-1">
        {isIncome ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
        {isIncome ? 'Entrada' : 'Saída'}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Categorias Financeiras</CardTitle>
        <Button onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Nova Categoria
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
           <div className="space-y-2">
             <Skeleton className="h-10 w-full" />
             <Skeleton className="h-10 w-full" />
           </div>
        ) : categories.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Nenhuma categoria encontrada.</p>
        ) : (
          <div className="space-y-2">
            {categories.map(cat => (
              <div key={cat.id} className="flex items-center justify-between p-2 border rounded-md">
                <div className="flex items-center gap-4">
                  {getTypeBadge(cat.type)}
                  <div>
                    <p className="font-medium">{cat.name}</p>
                    {cat.description && <p className="text-xs text-muted-foreground">{cat.description}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(cat)}>
                    <Edit size={16} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(cat.id)}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Editar" : "Nova"} Categoria</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Categoria</Label>
              <Input id="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
             <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select value={formData.type} onValueChange={(value: 'income' | 'expense') => setFormData({...formData, type: value})}>
                  <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="income">Entrada (Receita)</SelectItem>
                      <SelectItem value="expense">Saída (Despesa)</SelectItem>
                  </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição (Opcional)</Label>
              <Textarea id="description" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={loading}>{loading ? "A guardar..." : "Guardar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
