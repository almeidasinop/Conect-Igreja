import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Skeleton } from './ui/skeleton';
import { Shield, User, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';

type Profile = {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  role: string;
};

type Role = {
    id: number;
    role_name: string;
}

export const UserManagement = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<Profile[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  
  const [newUserData, setNewUserData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'member', // Papel padrão
  });

  const fetchUsersAndRoles = useCallback(async () => {
    setLoading(true);
    try {
      const usersPromise = supabase
        .from('profiles')
        .select('*')
        .order('full_name', { ascending: true });

      const rolesPromise = supabase.from('user_roles').select('*');

      const [usersRes, rolesRes] = await Promise.all([usersPromise, rolesPromise]);

      if (usersRes.error) throw usersRes.error;
      setUsers(usersRes.data || []);

      if (rolesRes.error) throw rolesRes.error;
      setRoles(rolesRes.data || []);

    } catch (error: any) {
      toast({ title: "Erro", description: "Falha ao carregar utilizadores e papéis.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUsersAndRoles();
  }, [fetchUsersAndRoles]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);
      
      if (error) throw error;

      toast({ title: 'Sucesso', description: 'O papel do utilizador foi atualizado.' });
      fetchUsersAndRoles();
    } catch (error: any) {
      toast({ title: 'Erro', description: 'Não foi possível atualizar o papel do utilizador.', variant: 'destructive' });
    }
  };

  const handleAddNewUser = async () => {
    if (!newUserData.email || !newUserData.password || !newUserData.fullName) {
        toast({ title: 'Erro', description: 'Por favor, preencha todos os campos.', variant: 'destructive'});
        return;
    }

    try {
        // Passo 1: Criar o utilizador no sistema de autenticação do Supabase
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: newUserData.email,
            password: newUserData.password,
        });

        if (authError) throw authError;

        if (authData.user) {
            // Passo 2: Criar o perfil correspondente na nossa tabela 'profiles'
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ 
                    full_name: newUserData.fullName,
                    role: newUserData.role,
                 })
                .eq('id', authData.user.id);

            if(profileError) {
                // Se a atualização falhar (o trigger pode não ter criado o perfil a tempo), tenta inserir.
                 await supabase
                    .from('profiles')
                    .insert({ 
                        id: authData.user.id,
                        user_id: authData.user.id,
                        full_name: newUserData.fullName,
                        email: newUserData.email,
                        role: newUserData.role,
                    });
            }
        }
        
        toast({ title: 'Sucesso', description: `Utilizador ${newUserData.fullName} criado. Por favor, confirme o email.` });
        setShowNewUserForm(false);
        setNewUserData({ fullName: '', email: '', password: '', role: 'member' });
        fetchUsersAndRoles();

    } catch(error: any) {
        toast({ title: 'Erro ao criar utilizador', description: error.message, variant: 'destructive' });
    }
  }
  
  const getRoleBadge = (role: string) => {
      switch(role) {
          case 'admin':
            return <Badge variant="default" className="capitalize bg-primary hover:bg-primary/90"><Shield className="mr-1 h-3 w-3"/>{role}</Badge>;
          default:
            return <Badge variant="secondary" className="capitalize"><User className="mr-1 h-3 w-3"/>{role}</Badge>;
      }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Gestão de Utilizadores</CardTitle>
            <CardDescription>Visualize e gira os papéis dos utilizadores do sistema.</CardDescription>
        </div>
        <Button onClick={() => setShowNewUserForm(true)}><Plus className="mr-2 h-4 w-4"/>Novo Utilizador</Button>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Utilizador</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Papel Atual</TableHead>
                <TableHead className="w-[180px]">Alterar Papel</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {loading ? (
                [...Array(3)].map((_, i) => (
                    <TableRow key={i}>
                    <TableCell><Skeleton className="h-10 w-full"/></TableCell>
                    <TableCell><Skeleton className="h-10 w-full"/></TableCell>
                    <TableCell><Skeleton className="h-10 w-full"/></TableCell>
                    <TableCell><Skeleton className="h-10 w-full"/></TableCell>
                    </TableRow>
                ))
                ) : users.map(user => (
                <TableRow key={user.id}>
                    <TableCell>
                    <div className="flex items-center gap-3">
                        <Avatar>
                        <AvatarImage src={user.avatar_url || ''} />
                        <AvatarFallback>{user.full_name.substring(0, 1)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.full_name}</span>
                    </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>
                    <Select
                        defaultValue={user.role}
                        onValueChange={(newRole) => handleRoleChange(user.id, newRole)}
                        disabled={user.role === 'admin'}
                    >
                        <SelectTrigger>
                        <SelectValue placeholder="Definir papel..." />
                        </SelectTrigger>
                        <SelectContent>
                            {roles.map(role => (
                                <SelectItem key={role.id} value={role.role_name}>{role.role_name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </div>
      </CardContent>

      <Dialog open={showNewUserForm} onOpenChange={setShowNewUserForm}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Criar Novo Utilizador</DialogTitle>
                <DialogDescription>
                    Este processo irá criar um novo login e um perfil de utilizador no sistema.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="fullName">Nome Completo</Label>
                    <Input id="fullName" value={newUserData.fullName} onChange={e => setNewUserData(p => ({...p, fullName: e.target.value}))}/>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={newUserData.email} onChange={e => setNewUserData(p => ({...p, email: e.target.value}))}/>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input id="password" type="password" value={newUserData.password} onChange={e => setNewUserData(p => ({...p, password: e.target.value}))}/>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="role">Papel</Label>
                    <Select value={newUserData.role} onValueChange={v => setNewUserData(p => ({...p, role: v}))}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent>
                           {roles.map(role => (
                                <SelectItem key={role.id} value={role.role_name}>{role.role_name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setShowNewUserForm(false)}>Cancelar</Button>
                <Button onClick={handleAddNewUser}>Criar Utilizador</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
