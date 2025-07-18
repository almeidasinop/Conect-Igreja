import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Pencil, Trash2, Tag } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  created_at: string;
}

const CategoryForm = ({ category, onSave, onCancel }: { category?: Category, onSave: () => void, onCancel: () => void }) => {
    const [name, setName] = useState(category?.name || '');
    const { toast } = useToast();

    const handleSubmit = async () => {
        if (!name) {
            toast({ title: "Erro", description: "O nome da categoria é obrigatório.", variant: "destructive" });
            return;
        }

        const { error } = await supabase.from('transaction_categories').upsert({ id: category?.id, name });

        if (error) {
            toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "Sucesso!", description: `Categoria ${category ? 'atualizada' : 'criada'} com sucesso.` });
            onSave();
        }
    };

    return (
        <Dialog open onOpenChange={onCancel}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{category ? 'Editar' : 'Nova'} Categoria</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <Label htmlFor="name">Nome da Categoria</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">Cancelar</Button>
                    </DialogClose>
                    <Button onClick={handleSubmit}>Salvar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

// CORREÇÃO: O nome do componente foi alterado para ser mais específico.
export const FinancialCategoriesManagement: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: categories, isLoading, isError } = useQuery<Category[]>({
    queryKey: ['transaction_categories_list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transaction_categories')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw new Error(error.message);
      return data || [];
    },
  });

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleNew = () => {
    setEditingCategory(undefined);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
  };

  const handleSave = () => {
    queryClient.invalidateQueries({ queryKey: ['transaction_categories_list'] });
    handleCloseForm();
  };

  const handleDelete = async (categoryId: string) => {
    if (!window.confirm("Tem certeza que deseja apagar esta categoria? Esta ação não pode ser desfeita.")) {
        return;
    }
    const { error } = await supabase.from('transaction_categories').delete().eq('id', categoryId);
    if (error) {
        toast({ title: "Erro ao apagar", description: "Não foi possível apagar a categoria. Verifique se ela não está sendo usada em alguma transação.", variant: "destructive" });
    } else {
        toast({ title: "Sucesso!", description: "Categoria apagada." });
        queryClient.invalidateQueries({ queryKey: ['transaction_categories_list'] });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                <CardTitle className="flex items-center gap-2"><Tag /> Gestão de Categorias</CardTitle>
                <CardDescription>Adicione, edite ou remova as categorias para suas transações.</CardDescription>
            </div>
            <Button onClick={handleNew}><PlusCircle className="mr-2 h-4 w-4" /> Nova Categoria</Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && <Skeleton className="h-40 w-full" />}
        {isError && <Alert variant="destructive"><AlertTitle>Erro</AlertTitle><AlertDescription>Não foi possível carregar as categorias.</AlertDescription></Alert>}
        
        <div className="space-y-2">
            {categories && categories.map(cat => (
                <div key={cat.id} className="flex items-center justify-between p-3 bg-neutral-900 rounded-lg">
                    <span className="font-medium">{cat.name}</span>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(cat)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(cat.id)} className="text-red-500 hover:text-red-400"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                </div>
            ))}
        </div>

        {showForm && <CategoryForm category={editingCategory} onSave={handleSave} onCancel={handleCloseForm} />}
      </CardContent>
    </Card>
  );
};
