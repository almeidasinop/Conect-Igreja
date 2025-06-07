import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const FinancialChart = ({ transactions }: { transactions: any[] }) => {

    const chartData = useMemo(() => {
        const monthlyData: { [key: string]: { income: number; expense: number } } = {};

        transactions.forEach(t => {
            const month = format(parseISO(t.date), 'MMM/yy', { locale: ptBR });
            if (!monthlyData[month]) {
                monthlyData[month] = { income: 0, expense: 0 };
            }
            monthlyData[month][t.type] += t.amount;
        });
        
        return Object.keys(monthlyData).map(month => ({
            month,
            Receitas: monthlyData[month].income,
            Despesas: monthlyData[month].expense,
        })).reverse();

    }, [transactions]);

    const formatCurrencyForTooltip = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Visão Geral Mensal</CardTitle>
                <CardDescription>Receitas vs. Despesas no período selecionado.</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                        <XAxis
                            dataKey="month"
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `R$${value / 1000}k`}
                        />
                        <Tooltip
                            cursor={{ fill: 'hsla(var(--muted))' }}
                            formatter={formatCurrencyForTooltip}
                        />
                        <Legend wrapperStyle={{fontSize: "12px"}}/>
                        <Bar dataKey="Receitas" fill="#22c55e" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};
