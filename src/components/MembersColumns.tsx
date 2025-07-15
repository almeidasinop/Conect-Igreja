import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Interface para o tipo de dado combinado
export interface MemberWithProfile {
  id: string;
  status: string;
  member_number: number;
  full_name: string; // Adicionado para dados "achatados"
  email: string;     // Adicionado para dados "achatados"
  phone: string;     // Adicionado para dados "achatados"
  profiles: {      // Mantemos o original para a função de edição
    full_name: string;
    email: string;
    phone: string;
  }
}

interface ColumnsProps {
  onEdit: (member: MemberWithProfile) => void;
}

export const columns = ({ onEdit }: ColumnsProps): ColumnDef<MemberWithProfile>[] => [
  {
    // CORREÇÃO: Usar um 'accessorKey' simples agora que os dados estão "achatados".
    accessorKey: "full_name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Nome
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue("full_name") || 'N/A'}</div>,
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phone",
    header: "Telefone",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return <Badge variant={status === 'active' ? 'default' : 'secondary'}>{status}</Badge>;
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center">Ações</div>,
    cell: ({ row }) => {
      const member = row.original;
      return (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="icon" onClick={() => onEdit(member)}>
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Editar</span>
          </Button>
          <Button variant="destructive" size="icon" onClick={() => alert(`Apagar membro: ${member.full_name}`)}>
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Apagar</span>
          </Button>
        </div>
      );
    },
  },
];
