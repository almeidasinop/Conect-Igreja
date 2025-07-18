import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DataTable } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TransactionForm } from './TransactionForm';
import { columns, type TransactionWithDetails } from './TransactionsColumns';

export const TransactionsList: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any | null>(null);
  const queryClient = useQueryClient();

  // CORREÇÃO: A busca de dados foi separada para ser mais robusta.
  const { data, isLoading, isError } = useQuery({
    queryKey: ['all_transactions_and_relations'],
    queryFn: async () => {
      // 1. Busca todas as transações
      const { data: transactions, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });
      if (txError) throw new Error(txError.message);

      // 2. Busca todas as categorias
      const { data: categories, error: catError } = await supabase
        .from('transaction_categories')
        .select('id, name');
      if (catError) throw new Error(catError.message);

      // 3. Busca todos os perfis
      const { data: profiles, error: profError } = await supabase
        .from('profiles')
        .select('id, full_name');
      if (profError) throw new Error(profError.message);

      // 4. Junta os dados no código
      const categoriesMap = new Map(categories.map(c => [c.id, c.name]));
      const profilesMap = new Map(profiles.map(p => [p.id, p.full_name]));

      const combinedData = (transactions || []).map(tx => ({
        ...tx,
        category_name: categoriesMap.get(tx.category_id) || 'Sem Categoria',
        member_name: profilesMap.get(tx.member_id) || 'N/A',
      }));

      return combinedData;
    },
  });

  const handleOpenForm = (transaction?: any) => {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  };

  const handleSave = () => {
    queryClient.invalidateQueries({ queryKey: ['all_transactions_and_relations'] });
    queryClient.invalidateQueries({ queryKey: ['financialDashboardReport'] });
    setIsFormOpen(false);
    setEditingTransaction(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => handleOpenForm()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Novo Lançamento
        </Button>
      </div>
      
      {isLoading && <Skeleton className="h-64 w-full" />}
      {isError && <Alert variant="destructive"><AlertTitle>Erro</AlertTitle><AlertDescription>Não foi possível carregar as transações.</AlertDescription></Alert>}
      
      {data && (
        <DataTable
          columns={columns({ onEdit: handleOpenForm })}
          data={data}
          filterColumnId="description"
          filterPlaceholder="Buscar por descrição..."
        />
      )}

      {isFormOpen && (
        <TransactionForm
          transaction={editingTransaction}
          onClose={() => setIsFormOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};
