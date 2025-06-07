import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Edit, Trash2, Link as LinkIcon } from "lucide-react";

// Tipos atualizados para refletir a estrutura de dados aninhada
type Profile = { full_name: string } | null;
type Member = { id: string; profiles: Profile } | null;
type Category = { id: string; name: string } | null;

type Transaction = {
  id: string;
  date: string;
  amount: number;
  description: string | null;
  type: "income" | "expense";
  category_id: string | null;
  member_id: string | null;
  receipt_url: string | null;
  categories: Category;
  members: Member;
};

type CategoryOption = {
  id: string;
  name: string;
  type: "income" | "expense";
};

type MemberOption = {
    id: string;
    profiles: { full_name: string } | null;
}

interface TransactionsManagementProps {
    transactions: Transaction[];
    onDataChange: () => void;
    isLoading: boolean;
}

export const TransactionsManagement = ({ transactions, onDataChange, isLoading }: TransactionsManagementProps) => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    amount: "", // ALTERAÇÃO: Campo de valor agora é uma string para facilitar a digitação
    description: "",
    type: "income" as "income" | "expense",
    category_id: "",
    member_id: "",
    receipt_url: "",
  });

  const fetchInitialData = useCallback(async () => {
    try {
      const { data: catData, error: catError } = await supabase.from('categories').select('id, name, type');
      if (catError) throw catError;
      setCategories(catData || []);

      const { data: memData, error: memError } = await supabase.from('members').select('id, profiles(full_name)');
      if (memError) throw memError;
      setMembers(memData || []);

    } catch(error: any) {
        toast({ title: "Erro", description: "Falha ao carregar dados de apoio.", variant: "destructive" });
    }
  }, [toast]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);
  
  const resetForm = () => {
    setEditingTransaction(null);
    setFormData({
        date: new Date().toISOString().split("T")[0],
        amount: "", // ALTERAÇÃO: Resetar para string vazia
        description: "",
        type: "income",
        category_id: "",
        member_id: "",
        receipt_url: "",
    });
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormData({
        date: new Date(transaction.date).toISOString().split("T")[0],
        // ALTERAÇÃO: Converte o número do BD para uma string com vírgula para edição
        amount: String(transaction.amount).replace('.', ','), 
        description: transaction.description || "",
        type: transaction.type,
        category_id: transaction.categories?.id || "",
        member_id: transaction.members?.id || "null",
        receipt_url: transaction.receipt_url || "",
    });
    setShowForm(true);
  }

  const handleSave = async () => {
    // ALTERAÇÃO: Converte a string (com vírgula) para um número antes de salvar
    const amountAsNumber = parseFloat(formData.amount.replace(',', '.')) || 0;

    if (!amountAsNumber || !formData.category_id) {
        toast({ title: "Erro de Validação", description: "Valor e categoria são obrigatórios.", variant: "destructive" });
        return;
    }

    try {
        const dataToSave = {
            date: formData.date,
            amount: amountAsNumber, // Usa o número convertido
            description: formData.description,
            type: formData.type,
            category_id: parseInt(formData.category_id, 10),
            member_id: (formData.member_id && formData.member_id !== "null") ? formData.member_id : null,
            receipt_url: formData.receipt_url || null,
        };
        
        const { error } = editingTransaction 
            ? await supabase.from('transactions').update(dataToSave).eq('id', editingTransaction.id)
            : await supabase.from('transactions').insert(dataToSave);
        
        if (error) {
          console.error("Erro do Supabase ao guardar:", error);
          throw error;
        }
        toast({ title: "Sucesso!", description: "Transação guardada com sucesso." });
        setShowForm(false);
        resetForm();
        onDataChange();
    } catch (error: any) {
        toast({ title: "Erro ao Guardar", description: error.message, variant: "destructive" });
    }
  }

  const handleDelete = async (transactionId: string) => {
    if(!confirm("Tem a certeza que quer apagar esta transação?")) return;
    try {
        const { error } = await supabase.from('transactions').delete().eq('id', transactionId);
        if (error) throw error;
        toast({ title: "Sucesso!", description: "Transação apagada." });
        onDataChange();
    } catch (error: any) {
        toast({ title: "Erro ao Apagar", description: error.message, variant: "destructive" });
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }
  
  const filteredCategories = categories.filter(c => c.type === formData.type);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Lançamentos no Período</CardTitle>
        <Button onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Novo Lançamento
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Membro</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">A carregar...</TableCell>
                </TableRow>
            ) : transactions.length > 0 ? (
              transactions.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>{new Date(t.date).toLocaleDateString()}</TableCell>
                  <TableCell>{t.description || "-"}</TableCell>
                  <TableCell>{t.categories?.name || 'N/A'}</TableCell>
                  <TableCell>{t.members?.profiles?.full_name || 'N/A'}</TableCell>
                  <TableCell className={`text-right font-medium ${t.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                    {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(t)}><Edit size={16} /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(t.id)}><Trash2 size={16} /></Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Nenhuma transação encontrada para o período selecionado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTransaction ? "Editar" : "Nova"} Transação</DialogTitle>
            <DialogDescription>
                Registe aqui as entradas e saídas financeiras.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select value={formData.type} onValueChange={(v: "income" | "expense") => setFormData({...formData, type: v, category_id: ''})}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="income">Entrada</SelectItem>
                            <SelectItem value="expense">Saída</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="date">Data</Label>
                    <Input id="date" type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="amount">Valor (R$)</Label>
                    {/* ALTERAÇÃO: Input agora é 'text' e o onChange é mais simples */}
                    <Input
                      id="amount"
                      type="text"
                      inputMode="decimal"
                      placeholder="100,50"
                      value={formData.amount}
                      onChange={e => {
                        // Permite apenas números e um único separador (vírgula ou ponto)
                        const value = e.target.value;
                        if (/^[0-9]*[,.]?[0-9]{0,2}$/.test(value)) {
                            setFormData({...formData, amount: value });
                        }
                      }}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Select value={formData.category_id} onValueChange={v => setFormData({...formData, category_id: v})}>
                        <SelectTrigger><SelectValue placeholder="Selecione..."/></SelectTrigger>
                        <SelectContent>
                            {filteredCategories.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="space-y-2">
                <Label>Membro (Opcional)</Label>
                <Select value={formData.member_id} onValueChange={v => setFormData({...formData, member_id: v})}>
                    <SelectTrigger><SelectValue placeholder="Selecione um membro..."/></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="null">Nenhum</SelectItem>
                        {members.map(m => m.profiles && <SelectItem key={m.id} value={m.id}>{m.profiles.full_name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição (Opcional)</Label>
              <Input id="description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>

            {formData.type === 'expense' && (
                <div className="space-y-2">
                <Label htmlFor="receipt_url">Link do Comprovante (Opcional)</Label>
                <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        id="receipt_url" 
                        value={formData.receipt_url} 
                        onChange={e => setFormData({...formData, receipt_url: e.target.value})}
                        placeholder="https://drive.google.com/sua-nota"
                        className="pl-10"
                    />
                </div>
                </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
