import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from './ui/skeleton';
import { ShieldCheck, Plus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';

// Definição de todas as permissões disponíveis no sistema
const ALL_PERMISSIONS = [
  { id: 'dashboard.view', label: 'Ver Dashboard', description: 'Permite aceder à página inicial do painel.' },
  { id: 'members.view', label: 'Visualizar Membros', description: 'Permite ver a lista de todos os membros e os seus perfis.' },
  { id: 'members.edit', label: 'Criar e Editar Membros', description: 'Permite adicionar novos membros e modificar dados existentes.' },
  { id: 'financial.view', label: 'Visualizar Finanças', description: 'Permite ver o painel financeiro, transações e relatórios.' },
  { id: 'financial.edit', label: 'Lançar Transações', description: 'Permite registar novas receitas e despesas.' },
  { id: 'communication.view', label: 'Ver Comunicações', description: 'Permite ver o mural de avisos e a agenda de eventos.'},
  { id: 'communication.edit', label: 'Publicar Avisos e Eventos', description: 'Permite criar e gerir a comunicação e a agenda.' },
  { id: 'content.view', label: 'Ver Conteúdo', description: 'Permite visualizar a biblioteca de conteúdos.'},
  { id: 'content.edit', label: 'Gerir Conteúdo', description: 'Permite adicionar e apagar devocionais, vídeos e estudos.' },
  { id: 'admin.users.manage', label: 'Gerir Utilizadores e Papéis', description: 'Permite alterar o papel de outros utilizadores.' },
];

type PermissionsState = { [permission: string]: boolean };
type Role = { id: number; role_name: string; description: string | null };

export const PermissionsManagement = () => {
  const { toast } = useToast();
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [permissions, setPermissions] = useState<PermissionsState>({});
  const [loading, setLoading] = useState(true);
  const [showNewRoleDialog, setShowNewRoleDialog] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
        const { data: rolesRes, error: rolesError } = await supabase.from('user_roles').select('*');
        if (rolesError) throw rolesError;

        // CORREÇÃO: Filtra para não mostrar 'admin' e 'member' na lista de seleção
        const editableRoles = rolesRes.filter(r => r.role_name !== 'admin' && r.role_name !== 'member');
        setRoles(editableRoles);

        if (editableRoles.length > 0 && !selectedRole) {
            setSelectedRole(editableRoles[0].role_name);
        }
    } catch (error: any) {
      toast({ title: "Erro", description: "Falha ao carregar papéis.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast, selectedRole]);

  useEffect(() => {
    fetchRoles();
  }, []); // Executa apenas uma vez na montagem inicial

  useEffect(() => {
    // Atualiza as permissões exibidas quando um novo papel é selecionado
    const loadPermissionsForRole = async () => {
        if(!selectedRole) return;
        setLoading(true);
        const { data, error } = await supabase.from('role_permissions').select('*').eq('role', selectedRole);
        if(error) {
            toast({ title: 'Erro', description: 'Falha ao carregar permissões para o papel selecionado.'});
            setLoading(false);
            return;
        }
        const currentPermissions: PermissionsState = {};
        ALL_PERMISSIONS.forEach(p => {
            const dbPermission = data.find(db => db.permission === p.id);
            currentPermissions[p.id] = dbPermission ? dbPermission.is_allowed : false;
        });
        setPermissions(currentPermissions);
        setLoading(false);
    }
    if (selectedRole) {
        loadPermissionsForRole();
    } else {
        setPermissions({}); // Limpa as permissões se nenhum papel estiver selecionado
    }
  }, [selectedRole, toast]);


  const handlePermissionChange = async (permissionId: string, isAllowed: boolean) => {
    try {
        const { error } = await supabase
            .from('role_permissions')
            .upsert({ role: selectedRole, permission: permissionId, is_allowed: isAllowed }, { onConflict: 'role,permission' });

        if (error) throw error;

        // Atualiza o estado localmente para uma resposta mais rápida da UI
        setPermissions(prev => ({ ...prev, [permissionId]: isAllowed }));
        toast({ title: 'Sucesso', description: 'Permissão atualizada.' });
    } catch (error: any) {
        toast({ title: 'Erro', description: 'Não foi possível atualizar a permissão.', variant: 'destructive' });
    }
  };

  const handleAddNewRole = async () => {
    if(!newRoleName) {
        toast({ title: "Erro", description: "O nome do papel não pode estar vazio.", variant: "destructive" });
        return;
    }
    try {
        const { data, error } = await supabase.from('user_roles').insert({ role_name: newRoleName }).select().single();
        if(error) throw error;
        
        toast({ title: "Sucesso", description: `O papel "${newRoleName}" foi criado.`});
        setShowNewRoleDialog(false);
        setNewRoleName('');
        await fetchRoles(); // Recarrega os papéis
        setSelectedRole(data.role_name); // Seleciona o novo papel
    } catch (error: any) {
        toast({ title: "Erro", description: "Este papel já existe ou ocorreu um erro.", variant: "destructive"});
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestão de Permissões por Papel</CardTitle>
        <CardDescription>Selecione um papel para ver e editar as suas permissões no sistema.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
            <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-[280px]">
                    <SelectValue placeholder="Selecione um papel..."/>
                </SelectTrigger>
                <SelectContent>
                    {roles.map(role => (
                        <SelectItem key={role.id} value={role.role_name}>{role.role_name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => setShowNewRoleDialog(true)}><Plus className="mr-2 h-4 w-4"/> Novo Papel</Button>
        </div>
        
        {loading ? <Skeleton className="h-64 w-full" /> : selectedRole ? (
            <Card className="bg-muted/40">
                <CardHeader>
                    <CardTitle className="capitalize flex items-center gap-2"><ShieldCheck/> Permissões para: {selectedRole}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {ALL_PERMISSIONS.map(permission => (
                    <div key={permission.id} className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label className="text-base" htmlFor={`${selectedRole}-${permission.id}`}>{permission.label}</Label>
                            <p className="text-sm text-muted-foreground">{permission.description}</p>
                        </div>
                        <Switch
                            id={`${selectedRole}-${permission.id}`}
                            checked={permissions[permission.id] || false}
                            onCheckedChange={(checked) => handlePermissionChange(permission.id, checked)}
                        />
                    </div>
                    ))}
                </CardContent>
            </Card>
        ) : (
            <div className="text-center text-muted-foreground py-16">
                <p>Crie ou selecione um papel para começar a gerir as permissões.</p>
            </div>
        )}

      </CardContent>

      <Dialog open={showNewRoleDialog} onOpenChange={setShowNewRoleDialog}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Criar Novo Papel</DialogTitle>
                <DialogDescription>
                    Crie um novo papel para atribuir permissões específicas. Ex: Tesoureiro, Líder de Louvor.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-2">
                <Label htmlFor="new-role-name">Nome do Papel</Label>
                <Input id="new-role-name" value={newRoleName} onChange={e => setNewRoleName(e.target.value)} placeholder="Ex: Tesoureiro"/>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setShowNewRoleDialog(false)}>Cancelar</Button>
                <Button onClick={handleAddNewRole}>Criar Papel</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
