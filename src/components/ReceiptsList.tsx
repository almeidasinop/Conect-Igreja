import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from './ui/skeleton';
import { Button } from './ui/button';
import { ExternalLink } from 'lucide-react';

type Receipt = {
  id: string;
  date: string;
  description: string | null;
  amount: number;
  receipt_url: string;
  categories: { name: string } | null;
};

export const ReceiptsList = () => {
  const { toast } = useToast();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReceipts = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('id, date, description, amount, receipt_url, categories(name)')
        .not('receipt_url', 'is', null) // Apenas transações que têm um link de comprovante
        .eq('type', 'expense') // Apenas despesas
        .order('date', { ascending: false });

      if (error) throw error;
      setReceipts(data || []);
    } catch (error: any) {
      toast({ title: "Erro", description: "Falha ao carregar comprovantes.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchReceipts();
  }, [fetchReceipts]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comprovantes de Despesas</CardTitle>
        <CardDescription>Lista de todas as despesas com comprovantes anexados.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : receipts.length > 0 ? (
          <div className="space-y-2">
            {receipts.map(receipt => (
              <div key={receipt.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted">
                <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1">
                    <span className="font-mono text-sm text-muted-foreground">{new Date(receipt.date).toLocaleDateString()}</span>
                    <div>
                        <p className="font-semibold">{receipt.description || 'Despesa sem descrição'}</p>
                        <p className="text-xs text-muted-foreground">{receipt.categories?.name || 'Sem Categoria'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-red-500">{formatCurrency(receipt.amount)}</span>
                  <Button asChild variant="outline" size="sm">
                    <a href={receipt.receipt_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Ver Comprovante
                    </a>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">Nenhum comprovante encontrado.</p>
        )}
      </CardContent>
    </Card>
  );
};
