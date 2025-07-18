import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface Category {
  id: string;
  name: string;
}

interface TransactionFormProps {
  onClose: () => void;
  onSave: () => void;
  transaction?: any;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ onClose, onSave, transaction }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    type: 'expense',
    category_id: '',
    member_id: null,
    receipt_url: '',
    user_id: '', // Adicionei user_id ao estado inicial
  });

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Estado para controlar o envio

  const { data: categoriesData } = useQuery<{ data: Category[] | null }>({
    queryKey: ['transaction_categories'],
    queryFn: async () => supabase.from('transaction_categories').select('*'),
  });
  
  const { data: membersData } = useQuery({
    queryKey: ['all_profiles_for_select'],
    queryFn: async () => supabase.from('profiles').select('id, full_name'),
  });

  useEffect(() => {
    // Obter usuário atual ao carregar o componente
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      
      // Se não houver transação (criação), definir user_id
      if (!transaction) {
        setFormData(prev => ({
          ...prev,
          user_id: user?.id || ''
        }));
      }
    };
    
    fetchUser();
  }, []);

  useEffect(() => {
    if (transaction) {
      setFormData({
        ...transaction,
        date: transaction.date ? new Date(transaction.date).toISOString().split('T')[0] : '',
        // Garantir que user_id está presente mesmo ao editar
        user_id: transaction.user_id || (currentUser?.id || '')
      });
    }
  }, [transaction, currentUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    const finalValue = value === 'null' ? null : value;
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    if (!formData.description || !formData.amount || !formData.category_id) {
      toast({ title: "Erro", description: "Descrição, valor e categoria são obrigatórios.", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }
    
    // Verificação do usuário atual
    if (!currentUser) {
      toast({ 
        title: "Erro de autenticação", 
        description: "Usuário não identificado. Faça login novamente.", 
        variant: "destructive" 
      });
      setIsSubmitting(false);
      return;
    }

    const payload = {
      id: transaction?.id,
      date: formData.date,
      description: formData.description,
      amount: Number(formData.amount),
      type: formData.type,
      category_id: formData.category_id,
      member_id: formData.member_id,
      receipt_url: formData.receipt_url,
      // Garantir que o user_id está presente
      user_id: formData.user_id || currentUser.id,
    };

    try {
      const { error } = await supabase.from('transactions').upsert(payload);

      if (error) {
        console.error('Erro completo:', error);
        toast({ 
          title: "Erro ao salvar", 
          description: error.message || 'Erro desconhecido ao salvar a transação', 
          variant: "destructive" 
        });
      } else {
        toast({ 
          title: "Sucesso!", 
          description: "Transação salva com sucesso." 
        });
        onSave();
      }
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({ 
        title: "Erro", 
        description: "Ocorreu um erro inesperado ao salvar a transação.", 
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{transaction ? 'Editar' : 'Novo'} Lançamento</DialogTitle>
          <DialogDescription>Preencha os detalhes da transação abaixo.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Data <span className="text-red-500">*</span></Label>
              <Input 
                id="date" 
                name="date" 
                type="date" 
                value={formData.date} 
                onChange={handleChange} 
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Valor (R$) <span className="text-red-500">*</span></Label>
              <Input 
                id="amount" 
                name="amount" 
                type="number" 
                step="0.01" 
                placeholder="0.00" 
                value={formData.amount} 
                onChange={handleChange} 
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição <span className="text-red-500">*</span></Label>
            <Input 
              id="description" 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo <span className="text-red-500">*</span></Label>
              <Select 
                name="type" 
                value={formData.type} 
                onValueChange={(v) => handleSelectChange('type', v)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Entrada</SelectItem>
                  <SelectItem value="expense">Saída</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category_id">Categoria <span className="text-red-500">*</span></Label>
              <Select 
                name="category_id" 
                value={formData.category_id} 
                onValueChange={(v) => handleSelectChange('category_id', v)}
              >
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {categoriesData?.data?.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="member_id">Membro (Opcional)</Label>
            <Select 
              name="member_id" 
              value={formData.member_id || undefined} 
              onValueChange={(v) => handleSelectChange('member_id', v)}
            >
              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                {membersData?.data?.map(mem => (
                  <SelectItem key={mem.id} value={mem.id}>{mem.full_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="receipt_url">Link do Comprovante (Opcional)</Label>
            <Input 
              id="receipt_url" 
              name="receipt_url" 
              value={formData.receipt_url || ''} 
              onChange={handleChange} 
              placeholder="https://..."
            />
          </div>
        </div>
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};