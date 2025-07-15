import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DataTable } from '@/components/DataTable'; 
import { columns, type MemberWithProfile } from '@/components/MembersColumns';
import { Skeleton } from '@/components/ui/skeleton';

interface MembersListProps {
  onEdit: (member: MemberWithProfile) => void;
}

export const MembersList: React.FC<MembersListProps> = ({ onEdit }) => {
  const { data: members, isLoading, isError } = useQuery<MemberWithProfile[]>({
    queryKey: ['membersWithProfiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('members')
        .select('*, profiles(*)');
      
      if (error) {
        console.error("Erro ao buscar membros:", error);
        throw new Error(error.message);
      }

      // CORREÇÃO: "Achata" os dados para facilitar o uso na tabela.
      // Copia os dados do perfil para o nível principal de cada membro.
      const flattenedData = (data || []).map(member => ({
          ...member,
          full_name: member.profiles?.full_name,
          email: member.profiles?.email,
          phone: member.profiles?.phone,
      }));

      return flattenedData;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (isError) {
    return <p className="text-red-500">Erro ao carregar a lista de membros.</p>;
  }

  return (
    <DataTable
      columns={columns({ onEdit })}
      data={members || []}
      filterColumnId="full_name"
      filterPlaceholder="Buscar por nome..."
    />
  );
};
