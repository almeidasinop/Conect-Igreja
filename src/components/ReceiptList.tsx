import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ExternalLink, FileText } from 'lucide-react';

// Interface para garantir a tipagem dos dados
interface TransactionWithReceipt {
  id: string;
  date: string;
  description: string;
  receipt_url: string;
}

export const ReceiptList: React.FC = () => {
  const { data: transactions, isLoading, isError } = useQuery<TransactionWithReceipt[]>({
    queryKey: ['transactionsWithReceipts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('id, date, description, receipt_url')
        .not('receipt_url', 'is', null) // Busca apenas transações que tenham um link de comprovante
        .order('date', { ascending: false });
      
      if (error) throw new Error(error.message);
      return data || [];
    }
  });

  if (isLoading) {
    return (
        <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
        </div>
    );
  }

  if (isError) {
    return <Alert variant="destructive"><AlertTitle>Erro</AlertTitle><AlertDescription>Não foi possível carregar os comprovantes.</AlertDescription></Alert>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><FileText /> Comprovantes de Transações</CardTitle>
        <CardDescription>Lista de todos os lançamentos com comprovantes anexados, do mais recente para o mais antigo.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {transactions && transactions.length > 0 ? (
            transactions.map(tx => (
              <div key={tx.id} className="flex items-center justify-between p-3 bg-neutral-900 rounded-lg border border-neutral-800">
                <div>
                  <p className="font-semibold">{tx.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(tx.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                  </p>
                </div>
                <a href={tx.receipt_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm">
                    Ver Comprovante
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </a>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-8">Nenhum comprovante encontrado.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
