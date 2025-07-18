import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign, TrendingUp, TrendingDown, Scale, PieChart, ExternalLink, Landmark } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Pie, Cell } from 'recharts';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { TransactionsList } from '@/components/TransactionsList';
import { cn } from '@/lib/utils';
import { FinancialCategoriesManagement } from '@/components/FinancialCategoriesManagement';
import { ReceiptList } from '@/components/ReceiptList'; // Importa o novo componente

// --- COMPONENTES ---

// Componente de Card para exibir uma estatística (com novo estilo)
const StatCard = ({ title, value, icon: Icon, currency = false, colorClass = "text-white" }: { title: string, value: number, icon: React.ElementType, currency?: boolean, colorClass?: string }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className={cn("text-2xl font-bold", colorClass)}>
        {currency ? value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : value}
      </div>
    </CardContent>
  </Card>
);

// Interfaces para os dados dos relatórios
interface FinancialSummary { total_income: number; total_expense: number; balance: number; }
interface MonthlyFlow { month: string; income: number; expense: number; }
interface CategoryDistribution { category_name: string; total_amount: number; }
interface FinancialReportData {
  summary: FinancialSummary;
  monthlyFlow: MonthlyFlow[];
  incomeDistribution: CategoryDistribution[];
  expenseDistribution: CategoryDistribution[];
  totalBalance: number; // Novo campo para o saldo total
}

const FinancialDashboard: React.FC = () => {
    const { data, isLoading, isError, error } = useQuery<FinancialReportData>({
        queryKey: ['financialDashboardReportV2'],
        queryFn: async () => {
          const [
            summaryResult,
            flowResult,
            incomeResult,
            expenseResult,
            totalBalanceResult
          ] = await Promise.allSettled([
            supabase.rpc('get_financial_summary_current_month'),
            supabase.rpc('get_monthly_cash_flow', { num_months: 6 }),
            supabase.rpc('get_transaction_distribution_current_month', { p_type: 'income' }),
            supabase.rpc('get_transaction_distribution_current_month', { p_type: 'expense' }),
            supabase.rpc('get_total_balance') // Chamada para a nova função
          ]);
    
          // Função para verificar e extrair dados ou lançar erro
          const extractData = (result: PromiseSettledResult<any>, name: string) => {
              if (result.status === 'rejected') {
                  console.error(`Erro em ${name}:`, result.reason);
                  throw new Error(`Falha ao buscar dados de ${name}.`);
              }
              return result.value.data;
          }

          return {
            summary: extractData(summaryResult, 'summary')[0],
            monthlyFlow: extractData(flowResult, 'monthlyFlow'),
            incomeDistribution: extractData(incomeResult, 'incomeDistribution'),
            expenseDistribution: extractData(expenseResult, 'expenseDistribution'),
            totalBalance: extractData(totalBalanceResult, 'totalBalance')
          };
        },
        staleTime: 1000 * 60 * 15,
      });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"><Skeleton className="h-28 w-full" /><Skeleton className="h-28 w-full" /><Skeleton className="h-28 w-full" /><Skeleton className="h-28 w-full" /></div>
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (isError) {
    return <Alert variant="destructive"><AlertTitle>Erro ao Carregar Dados</AlertTitle><AlertDescription>{error?.message || 'Não foi possível carregar os dados financeiros.'}</AlertDescription></Alert>;
  }
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

  return (
    <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Receitas no Período" value={data?.summary.total_income || 0} icon={TrendingUp} currency colorClass="text-green-500" />
            <StatCard title="Despesas no Período" value={data?.summary.total_expense || 0} icon={TrendingDown} currency colorClass="text-red-500" />
            <StatCard title="Saldo do Período" value={data?.summary.balance || 0} icon={Scale} currency />
            <StatCard title="Total em Caixa" value={data?.totalBalance || 0} icon={Landmark} currency colorClass="text-blue-500" />
        </div>
        
        <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp /> Fluxo de Caixa Mensal</CardTitle><CardDescription>Receitas vs. Despesas nos últimos 6 meses</CardDescription></CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={data?.monthlyFlow || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))' }} fontSize={12} />
                        <YAxis tickFormatter={(value) => `R$${value/1000}k`} tick={{ fill: 'hsl(var(--muted-foreground))' }} fontSize={12} />
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} formatter={(value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
                        <Legend />
                        <Bar dataKey="income" name="Receitas" fill="#22c55e" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="expense" name="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><PieChart /> Origem das Entradas (Mês)</CardTitle></CardHeader>
                <CardContent>
                     <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={data?.incomeDistribution || []} dataKey="total_amount" nameKey="category_name" cx="50%" cy="50%" outerRadius={100} label>
                                {(data?.incomeDistribution || []).map((entry, index) => ( <Cell key={`cell-income-${index}`} fill={COLORS[index % COLORS.length]} /> ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><PieChart /> Destino das Saídas (Mês)</CardTitle></CardHeader>
                <CardContent>
                     <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={data?.expenseDistribution || []} dataKey="total_amount" nameKey="category_name" cx="50%" cy="50%" outerRadius={100} label>
                                {(data?.expenseDistribution || []).map((entry, index) => ( <Cell key={`cell-expense-${index}`} fill={COLORS[index % COLORS.length]} /> ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    </div>
  );
};

// Componente principal da página, que agora usa abas
const FinancialPage: React.FC = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Visão Financeira</h1>
                <p className="text-muted-foreground">Analise as finanças da igreja por período.</p>
            </div>

            <Tabs defaultValue="dashboard" className="space-y-6">
                <TabsList className="grid grid-cols-4">
                    <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                    <TabsTrigger value="transactions">Transações</TabsTrigger>
                    <TabsTrigger value="categories">Categorias</TabsTrigger>
                    <TabsTrigger value="receipts">Comprovantes</TabsTrigger>
                </TabsList>

                <TabsContent value="dashboard">
                    <FinancialDashboard />
                </TabsContent>
                <TabsContent value="transactions">
                    <TransactionsList />
                </TabsContent>
                <TabsContent value="categories">
                    <FinancialCategoriesManagement />
                </TabsContent>
                <TabsContent value="receipts">
                    <ReceiptList />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default FinancialPage;
