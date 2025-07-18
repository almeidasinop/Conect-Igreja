import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// Interface para os dados da tabela
export interface TransactionWithDetails {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category_name?: string;
  member_name?: string;
}

interface ColumnsProps {
  onEdit: (transaction: TransactionWithDetails) => void;
}

export const columns = ({ onEdit }: ColumnsProps): ColumnDef<TransactionWithDetails>[] => [
  {
    accessorKey: "date",
    header: "Data",
    cell: ({ row }) => new Date(row.getValue("date") + 'T00:00:00').toLocaleDateString('pt-BR'),
  },
  {
    accessorKey: "description",
    header: "Descrição",
  },
  {
    accessorKey: "category_name",
    header: "Categoria",
  },
  {
    accessorKey: "member_name",
    header: "Membro",
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Valor</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const type = row.original.type;
      const formatted = amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
      return <div className={`text-right font-medium ${type === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>{formatted}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(row.original)}>Editar</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
