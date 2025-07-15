import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, ScanFace, Percent, TrendingUp, PieChart, Star } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Pie, Cell } from 'recharts';
import { format, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Interfaces para os dados dos relatórios
interface ReportData {
  totalMembers: number;
  facialRecognitionMembers: number;
  statusDistribution: { status: string; count: number }[];
  monthlyGrowth: { month: string; count: number }[];
  topGroups: { name: string; member_count: number }[];
}

// Componente de Card para exibir uma estatística
const StatCard = ({ title, value, icon: Icon, description }: { title: string, value: string, icon: React.ElementType, description: string }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

const MembershipReports: React.FC = () => {
  const { data, isLoading, isError } = useQuery<ReportData>({
    queryKey: ['membershipDashboardReport'],
    queryFn: async () => {
      // Chamadas paralelas para buscar todos os dados
      const [
        { count: totalMembers, error: totalError },
        { count: facialRecognitionMembers, error: facialError },
        { data: statusData, error: statusError },
        { data: growthData, error: growthError },
        { data: groupsData, error: groupsError }
      ] = await Promise.all([
        supabase.from('members').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).not('face_descriptor', 'is', null),
        supabase.rpc('get_member_status_distribution'),
        supabase.rpc('get_monthly_member_growth', { num_months: 6 }),
        supabase.rpc('get_top_groups_by_members', { limit_count: 5 })
      ]);

      if (totalError || facialError || statusError || growthError || groupsError) {
        console.error({ totalError, facialError, statusError, growthError, groupsError });
        throw new Error('Falha ao buscar um ou mais dados para os relatórios.');
      }

      return {
        totalMembers: totalMembers || 0,
        facialRecognitionMembers: facialRecognitionMembers || 0,
        statusDistribution: statusData || [],
        monthlyGrowth: growthData || [],
        topGroups: groupsData || []
      };
    },
    staleTime: 1000 * 60 * 15, // Atualiza a cada 15 minutos
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
        <Skeleton className="h-80 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Erro</AlertTitle>
        <AlertDescription>Não foi possível carregar os dados para os relatórios.</AlertDescription>
      </Alert>
    );
  }
  
  const facialAdoptionPercentage = data.totalMembers > 0 
    ? Math.round((data.facialRecognitionMembers / data.totalMembers) * 100) 
    : 0;
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <StatCard 
                title="Total de Membros"
                value={data.totalMembers.toString()}
                icon={Users}
                description="Número total de membros cadastrados."
            />
            <StatCard 
                title="Cadastros Faciais"
                value={data.facialRecognitionMembers.toString()}
                icon={ScanFace}
                description="Membros com reconhecimento facial ativo."
            />
            <StatCard 
                title="Adesão ao Cadastro Facial"
                value={`${facialAdoptionPercentage}%`}
                icon={Percent}
                description="Percentual de membros com biometria."
            />
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><TrendingUp /> Crescimento de Novos Membros</CardTitle>
                    <CardDescription>Novos membros nos últimos 6 meses</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={data.monthlyGrowth}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))' }} fontSize={12} />
                            <YAxis allowDecimals={false} tick={{ fill: 'hsl(var(--muted-foreground))' }} fontSize={12} />
                            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                            <Legend />
                            <Line type="monotone" dataKey="count" name="Novos Membros" stroke="hsl(var(--primary))" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><PieChart /> Distribuição por Status</CardTitle>
                    <CardDescription>Status atual dos membros</CardDescription>
                </CardHeader>
                <CardContent>
                     <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={data.statusDistribution} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={100} label>
                                {data.statusDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Star /> Top 5 Grupos e Ministérios</CardTitle>
                <CardDescription>Grupos com o maior número de membros</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {data.topGroups.map((group, index) => (
                        <div key={index} className="flex items-center">
                            <div className="flex-1">
                                <p className="font-medium">{group.name}</p>
                            </div>
                            <div className="font-bold">{group.member_count} {group.member_count > 1 ? 'membros' : 'membro'}</div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    </div>
  );
};

export default MembershipReports;
