import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Plus, Trash2 } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from "@/components/ui/badge";

type Event = {
  id: number;
  title: string;
};

type Role = {
  id: number;
  role_name: string;
  required_count: number;
  event_volunteers: Volunteer[];
};

type Volunteer = {
  id: number;
  members: {
    id: string;
    profiles: {
      full_name: string;
      avatar_url: string | null;
    } | null;
  } | null;
};

type Member = {
  id: string;
  profiles: { full_name: string } | null;
};

interface EventVolunteerManagerProps {
  event: Event;
  onClose: () => void;
}

export const EventVolunteerManager = ({ event, onClose }: EventVolunteerManagerProps) => {
  const { toast } = useToast();
  const [roles, setRoles] = useState<Role[]>([]);
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleCount, setNewRoleCount] = useState(1);

  const fetchVolunteersData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: rolesData, error: rolesError } = await supabase
        .from('event_roles')
        .select(`
          id,
          role_name,
          required_count,
          event_volunteers (
            id,
            members (
              id,
              profiles ( full_name, avatar_url )
            )
          )
        `)
        .eq('event_id', event.id);

      if (rolesError) throw rolesError;
      setRoles(rolesData || []);

      const { data: membersData, error: membersError } = await supabase
        .from('members')
        .select('id, profiles(full_name)');
      
      if (membersError) throw membersError;
      setAllMembers(membersData.filter(m => m.profiles) || []);

    } catch (error: any) {
      toast({ title: "Erro", description: "Falha ao carregar dados de voluntários.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [event.id, toast]);

  useEffect(() => {
    fetchVolunteersData();
  }, [fetchVolunteersData]);

  const handleAddRole = async () => {
    if (!newRoleName) {
        toast({ title: 'Erro', description: 'O nome da função é obrigatório.', variant: 'destructive' });
        return;
    }
    try {
        await supabase.from('event_roles').insert({
            event_id: event.id,
            role_name: newRoleName,
            required_count: newRoleCount,
        });
        setNewRoleName('');
        setNewRoleCount(1);
        fetchVolunteersData();
        toast({ title: 'Sucesso', description: 'Função adicionada ao evento.' });
    } catch (error: any) {
        toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    }
  };

  const handleDeleteRole = async (roleId: number) => {
    if (!confirm('Tem a certeza de que quer apagar esta função e todos os voluntários associados?')) return;
    try {
        await supabase.from('event_roles').delete().eq('id', roleId);
        fetchVolunteersData();
        toast({ title: 'Sucesso', description: 'Função apagada.' });
    } catch (error: any) {
        toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    }
  }
  
  const handleAssignVolunteer = async (roleId: number, memberId: string) => {
    if (!memberId || memberId === 'null') return;
    try {
        await supabase.from('event_volunteers').insert({
            event_role_id: roleId,
            member_id: memberId,
        });
        fetchVolunteersData();
        toast({ title: 'Sucesso', description: 'Voluntário escalado.' });
    } catch(error: any) {
        toast({ title: 'Erro', description: 'Este membro já foi escalado para esta função.', variant: 'destructive' });
    }
  }

  const handleRemoveVolunteer = async (volunteerId: number) => {
    try {
        await supabase.from('event_volunteers').delete().eq('id', volunteerId);
        fetchVolunteersData();
        toast({ title: 'Sucesso', description: 'Voluntário removido da escala.' });
    } catch(error: any) {
        toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    }
  }


  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Gerir Voluntários: {event.title}</DialogTitle>
          <DialogDescription>
            Adicione funções necessárias para este evento e escale os voluntários.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-6">
            <div className="space-y-4">
                <Label className="text-lg font-semibold">Funções do Evento</Label>
                {loading ? <Skeleton className="h-24 w-full"/> : (
                    <Accordion type="single" collapsible className="w-full">
                        {roles.map(role => (
                            <AccordionItem value={`item-${role.id}`} key={role.id}>
                                {/* CORREÇÃO: O botão de apagar foi movido para fora do AccordionTrigger */}
                                <div className="flex items-center w-full">
                                    <AccordionTrigger className="flex-1 text-left">
                                        <div className="flex items-center gap-2">
                                            <span>{role.role_name}</span>
                                            <Badge variant="secondary">{role.event_volunteers.length} / {role.required_count}</Badge>
                                        </div>
                                    </AccordionTrigger>
                                    <Button size="icon" variant="ghost" className="h-9 w-9" onClick={() => handleDeleteRole(role.id)}>
                                        <Trash2 size={14} className="text-destructive"/>
                                    </Button>
                                </div>
                                <AccordionContent>
                                   <div className="space-y-3">
                                        {role.event_volunteers.map(v => (
                                           v.members && v.members.profiles &&
                                           <div key={v.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                                               <div className="flex items-center gap-2">
                                                    <Avatar className="h-6 w-6">
                                                        <AvatarImage src={v.members.profiles.avatar_url || ''} />
                                                        <AvatarFallback>{v.members.profiles.full_name?.substring(0,1)}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-sm">{v.members.profiles.full_name}</span>
                                               </div>
                                                <Button size="sm" variant="ghost" className="text-destructive h-7" onClick={() => handleRemoveVolunteer(v.id)}>Remover</Button>
                                           </div>
                                        ))}
                                        {role.event_volunteers.length < role.required_count && (
                                            <div className="flex items-center gap-2 pt-2 border-t">
                                                <Select onValueChange={(memberId) => handleAssignVolunteer(role.id, memberId)}>
                                                    <SelectTrigger><SelectValue placeholder="Escalar membro..."/></SelectTrigger>
                                                    <SelectContent>
                                                        {allMembers.map(m => m.profiles && <SelectItem key={m.id} value={m.id}>{m.profiles.full_name}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                   </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                )}
                 {roles.length === 0 && !loading && <p className="text-sm text-center text-muted-foreground py-4">Nenhuma função adicionada a este evento.</p>}
            </div>
            <div className="p-4 border rounded-lg space-y-4">
                 <Label className="font-semibold">Adicionar Nova Função</Label>
                 <div className="flex gap-4">
                    <Input placeholder="Nome da função (ex: Recepção)" value={newRoleName} onChange={e => setNewRoleName(e.target.value)} className="flex-1"/>
                    <Input type="number" placeholder="Qtd." value={newRoleCount} onChange={e => setNewRoleCount(parseInt(e.target.value) || 1)} className="w-20"/>
                    <Button onClick={handleAddRole}><Plus size={16} className="mr-2"/> Adicionar</Button>
                 </div>
            </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
