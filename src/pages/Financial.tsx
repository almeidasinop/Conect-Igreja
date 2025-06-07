import { useState, useEffect, useCallback, useMemo } from "react";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, DollarSign, TrendingUp, TrendingDown, Receipt } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoriesManagement } from "@/components/CategoriesManagement";
import { TransactionsManagement } from "@/components/TransactionsManagement";
import { FinancialChart } from "@/components/FinancialChart";
import { ReceiptsList } from "@/components/ReceiptsList";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

const CategorySummary = ({ transactions }: { transactions: any[] }) => {
  const summary = useMemo(() => {
    const categoryTotals: { [key: string]: { name: string; total: number; type: 'income' | 'expense' } } = {};

    transactions.forEach(t => {
      if (!t.categories || !t.categories.name) return;
      const categoryId = t.categories.id || t.categories.name;

      if (!categoryTotals[categoryId]) {
        categoryTotals[categoryId] = { name: t.categories.name, total: 0, type: t.type };
      }
      categoryTotals[categoryId].total += t.amount;
    });

    return Object.values(categoryTotals).sort((a, b) => b.total - a.total);
  }, [transactions]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumo por Categoria</CardTitle>
        <CardDescription>Total por categoria no período selecionado.</CardDescription>
      </CardHeader>
      <CardContent className="max-h-[300px] overflow-y-auto">
        <div className="space-y-2">
          {summary.length > 0 ? summary.map(cat => (
            <div key={`${cat.name}-${cat.type}`} className="flex justify-between items-center text-sm p-2 rounded-md hover:bg-muted">
              <div>
                <span className={`font-medium ${cat.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {cat.type === 'income' ? 'Receita: ' : 'Despesa: '}
                </span>
                <span className="text-muted-foreground">{cat.name}</span>
              </div>
              <span className={`font-semibold`}>
                {formatCurrency(cat.total)}
              </span>
            </div>
          )) : <p className="text-sm text-muted-foreground text-center py-4">Nenhuma transação no período.</p>}
        </div>
      </CardContent>
    </Card>
  );
};


const Financial = () => {
  const [allTransactions, setAllTransactions] = useState<any[]>([]);
  const [dashboardData, setDashboardData] = useState({
    periodIncome: 0,
    periodExpense: 0,
    periodBalance: 0,
    totalBalance: 0,
  });

  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
  });

  const [loading, setLoading] = useState(true);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  const fetchAllTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('transactions').select(`
        id, date, amount, description, type, receipt_url,
        categories ( id, name )
      `).order("date", { ascending: false });
      if (error) throw error;
      setAllTransactions(data || []);
    } catch (err) {
      console.error("Erro ao buscar transações:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllTransactions();
  }, [fetchAllTransactions]);

  const filteredTransactions = useMemo(() => {
    const start = date?.from || new Date(0);
    const end = date?.to || new Date();
    // Ajusta o final do dia para incluir todas as transações do dia final
    end.setHours(23, 59, 59, 999);

    return allTransactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= start && transactionDate <= end;
    });
  }, [date, allTransactions]);

  useEffect(() => {
    let periodIncome = 0;
    let periodExpense = 0;
    
    filteredTransactions.forEach(t => {
      if (t.type === 'income') {
        periodIncome += t.amount;
      } else {
        periodExpense += t.amount;
      }
    });

    let totalBalance = 0;
    allTransactions.forEach(t => {
        if (t.type === 'income') {
            totalBalance += t.amount;
        } else {
            totalBalance -= t.amount;
        }
    });

    setDashboardData({
      periodIncome,
      periodExpense,
      periodBalance: periodIncome - periodExpense,
      totalBalance,
    });
  }, [filteredTransactions, allTransactions]);


  const renderCardSkeleton = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-7 w-1/2" />
        <Skeleton className="h-3 w-full mt-2" />
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
       <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Visão Financeira
            </h1>
            <p className="text-muted-foreground">
              Analise as finanças da igreja por período.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-[300px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, "dd 'de' LLL, y", { locale: ptBR })} -{" "}
                        {format(date.to, "dd 'de' LLL, y", { locale: ptBR })}
                      </>
                    ) : (
                      format(date.from, "dd 'de' LLL, y", { locale: ptBR })
                    )
                  ) : (
                    <span>Escolha um período</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={2}
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading && allTransactions.length === 0 ? (
            <>
                {renderCardSkeleton()}
                {renderCardSkeleton()}
                {renderCardSkeleton()}
                {renderCardSkeleton()}
            </>
        ) : (
            <>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Receitas no Período</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-500">{formatCurrency(dashboardData.periodIncome)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Despesas no Período</CardTitle>
                        <TrendingDown className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-500">{formatCurrency(dashboardData.periodExpense)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Saldo do Período</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(dashboardData.periodBalance)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total em Caixa</CardTitle>
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-500">{formatCurrency(dashboardData.totalBalance)}</div>
                    </CardContent>
                </Card>
            </>
        )}
      </div>

      <Tabs defaultValue="transactions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="transactions">Transações</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
          <TabsTrigger value="receipts">Comprovantes</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-6">
          <TransactionsManagement 
             transactions={filteredTransactions} 
             onDataChange={fetchAllTransactions} 
             isLoading={loading && allTransactions.length === 0}
          />
        </TabsContent>
        
        <TabsContent value="categories" className="space-y-6">
           <CategoriesManagement />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <FinancialChart transactions={filteredTransactions} />
          <CategorySummary transactions={filteredTransactions} />
        </TabsContent>

        <TabsContent value="receipts" className="space-y-6">
          <ReceiptsList />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Financial;
