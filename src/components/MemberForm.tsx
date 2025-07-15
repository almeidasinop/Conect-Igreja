import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Users } from "lucide-react";
import { Checkbox } from "./ui/checkbox";
import { ScrollArea } from "./ui/scroll-area";
import { Skeleton } from "./ui/skeleton";

interface MemberFormProps {
  onClose: () => void;
  onSave: () => void;
  member?: any;
}

const initialProfileState = {
  full_name: "", email: "", phone: "", birth_date: "",
  address: "", city: "", state: "", zip_code: "",
};

const initialMemberState = {
  status: "active", conversion_date: "", baptism_date: "",
  marital_status: "", profession: "", emergency_contact_name: "",
  emergency_contact_phone: "", notes: "", origin_church: "",
};

export const MemberForm = ({ onClose, onSave, member }: MemberFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState(initialProfileState);
  const [memberData, setMemberData] = useState(initialMemberState);
  
  const [allGroups, setAllGroups] = useState<any[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<Set<string>>(new Set());
  const [initialGroupIds, setInitialGroupIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchAllGroups = async () => {
        const { data, error } = await supabase.from('groups').select('id, name');
        if (error) {
            toast({ title: "Erro", description: "Falha ao carregar a lista de grupos.", variant: "destructive" });
        } else {
            setAllGroups(data || []);
        }
    };
    fetchAllGroups();
  }, [toast]);

  useEffect(() => {
    if (member && member.profiles) {
      setProfileData({
        full_name: member.profiles.full_name || "",
        email: member.profiles.email || "",
        phone: member.profiles.phone || "",
        birth_date: member.profiles.birth_date || "",
        address: member.profiles.address || "",
        city: member.profiles.city || "",
        state: member.profiles.state || "",
        zip_code: member.profiles.zip_code || "",
      });
      setMemberData({
        status: member.status || "active",
        conversion_date: member.conversion_date || "",
        baptism_date: member.baptism_date || "",
        marital_status: member.marital_status || "",
        profession: member.profession || "",
        emergency_contact_name: member.emergency_contact_name || "",
        emergency_contact_phone: member.emergency_contact_phone || "",
        notes: member.notes || "",
        origin_church: member.origin_church || "",
      });

      const fetchMemberGroups = async () => {
          const { data, error } = await supabase
            .from('member_groups')
            .select('group_id')
            .eq('member_id', member.id);
        
          if (error) {
            toast({ title: "Erro", description: "Falha ao carregar os grupos do membro.", variant: "destructive" });
          } else {
            const groupIds = new Set(data.map(g => g.group_id));
            setSelectedGroupIds(groupIds);
            setInitialGroupIds(groupIds);
          }
      };
      fetchMemberGroups();

    } else {
      setProfileData(initialProfileState);
      setMemberData(initialMemberState);
      setSelectedGroupIds(new Set());
      setInitialGroupIds(new Set());
    }
  }, [member, toast]);

  const handleGroupSelectionChange = (groupId: string, checked: boolean) => {
    setSelectedGroupIds(prev => {
        const newSet = new Set(prev);
        if (checked) {
            newSet.add(groupId);
        } else {
            newSet.delete(groupId);
        }
        return newSet;
    });
  };

  const updateMemberGroups = async (memberId: string) => {
    const idsToAdd = [...selectedGroupIds].filter(id => !initialGroupIds.has(id));
    const idsToRemove = [...initialGroupIds].filter(id => !selectedGroupIds.has(id));

    if (idsToRemove.length > 0) {
        const { error } = await supabase.from('member_groups').delete().eq('member_id', memberId).in('group_id', idsToRemove);
        if (error) throw new Error("Ocorreu um erro ao remover o membro de grupos.");
    }

    if (idsToAdd.length > 0) {
        // CORREÇÃO: Adiciona o campo 'joined_at' com a data e hora atuais.
        const newAssociations = idsToAdd.map(groupId => ({ 
            member_id: memberId, 
            group_id: groupId,
            joined_at: new Date().toISOString() 
        }));
        const { error } = await supabase.from('member_groups').insert(newAssociations);
        if (error) throw new Error("Ocorreu um erro ao adicionar o membro a novos grupos.");
    }
  }

  const handleSave = async () => {
    if (!profileData.full_name || !profileData.email) {
      toast({
        title: "Erro de Validação",
        description: "Nome completo e email são campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
        let savedMemberId = member?.id;
        const cleanProfileData = Object.fromEntries(
            Object.entries(profileData).map(([key, value]) => [key, value === '' ? null : value])
        );

        const cleanMemberData = Object.fromEntries(
            Object.entries(memberData).map(([key, value]) => [key, value === '' ? null : value])
        );

        if (member) {
            await supabase.from("profiles").update(cleanProfileData).eq("id", member.profiles.id);
            await supabase.from("members").update(cleanMemberData).eq("id", member.id);
        } else {
            const { data: newProfile, error: profileError } = await supabase.from("profiles").insert([cleanProfileData]).select().single();
            if (profileError) throw profileError;

            const { data: newMember, error: memberError } = await supabase.from("members").insert([{ ...cleanMemberData, profile_id: newProfile.id }]).select().single();
            if(memberError) throw memberError;
            savedMemberId = newMember.id;
        }

        await updateMemberGroups(savedMemberId);

        toast({ title: "Sucesso!", description: `Membro ${member ? 'atualizado' : 'cadastrado'} com sucesso.`});
        onSave();
    } catch (error: any) {
        let description = "Ocorreu um erro ao salvar os dados do membro.";
        if (error.code === '23505' || (error.message && error.message.includes('duplicate key value violates unique constraint'))) {
            description = "Já existe um membro com este email ou número de membro.";
        } else {
            description = error.message; // Mostra a mensagem de erro específica
        }
        toast({ title: "Erro ao Salvar", description: description, variant: "destructive" });
    } finally {
        setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User size={24} />
            {member ? "Editar Membro" : "Novo Membro"}
          </DialogTitle>
          <DialogDescription>
            Preencha os dados abaixo para criar ou editar um membro.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="personal">Dados Pessoais</TabsTrigger>
            <TabsTrigger value="ecclesiastical">Eclesiástico</TabsTrigger>
            <TabsTrigger value="groups">Grupos & Ministérios</TabsTrigger>
            <TabsTrigger value="contact">Contato & Endereço</TabsTrigger>
          </TabsList>
          
          <div className="h-[450px] overflow-y-auto p-1 pr-4 mt-4">
            <TabsContent value="personal" className="space-y-6 pt-4 m-0">
               <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informações Básicas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Nome Completo *</Label>
                      <Input id="full_name" value={profileData.full_name || ''} onChange={(e) => setProfileData(p => ({ ...p, full_name: e.target.value }))}/>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" type="email" value={profileData.email || ''} onChange={(e) => setProfileData(p => ({ ...p, email: e.target.value }))}/>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input id="phone" value={profileData.phone || ''} onChange={(e) => setProfileData(p => ({ ...p, phone: e.target.value }))}/>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="birth_date">Data de Nascimento</Label>
                      <Input id="birth_date" type="date" value={profileData.birth_date || ''} onChange={(e) => setProfileData(p => ({ ...p, birth_date: e.target.value }))}/>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="marital_status">Estado Civil</Label>
                      <Select value={memberData.marital_status || ''} onValueChange={(v) => setMemberData(p => ({ ...p, marital_status: v }))}>
                          <SelectTrigger><SelectValue placeholder="Selecione"/></SelectTrigger>
                          <SelectContent>
                              <SelectItem value="single">Solteiro(a)</SelectItem>
                              <SelectItem value="married">Casado(a)</SelectItem>
                              <SelectItem value="divorced">Divorciado(a)</SelectItem>
                              <SelectItem value="widowed">Viúvo(a)</SelectItem>
                          </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="profession">Profissão</Label>
                      <Input id="profession" value={memberData.profession || ''} onChange={(e) => setMemberData(p => ({...p, profession: e.target.value}))}/>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ecclesiastical" className="space-y-6 pt-4 m-0">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informações Eclesiásticas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                          <Label htmlFor="status">Status</Label>
                          <Select value={memberData.status || 'active'} onValueChange={(v) => setMemberData(p => ({...p, status:v}))}>
                              <SelectTrigger><SelectValue/></SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="active">Ativo</SelectItem>
                                  <SelectItem value="inactive">Inativo</SelectItem>
                                  <SelectItem value="transferred">Transferido</SelectItem>
                              </SelectContent>
                          </Select>
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="conversion_date">Data de Conversão</Label>
                          <Input id="conversion_date" type="date" value={memberData.conversion_date || ''} onChange={(e) => setMemberData(p => ({...p, conversion_date: e.target.value}))}/>
                      </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                          <Label htmlFor="baptism_date">Data do Batismo</Label>
                          <Input id="baptism_date" type="date" value={memberData.baptism_date || ''} onChange={(e) => setMemberData(p => ({...p, baptism_date: e.target.value}))}/>
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="origin_church">Igreja de Origem</Label>
                          <Input id="origin_church" value={memberData.origin_church || ''} onChange={(e) => setMemberData(p => ({...p, origin_church: e.target.value}))}/>
                      </div>
                  </div>
                   {member && (
                      <div className="space-y-2">
                          <Label>Número do Membro</Label>
                          <Input value={member.member_number || ''} disabled />
                      </div>
                   )}
                  <div className="space-y-2">
                    <Label htmlFor="notes">Observações</Label>
                    <Textarea id="notes" value={memberData.notes || ''} onChange={(e) => setMemberData(p => ({ ...p, notes: e.target.value }))} rows={2}/>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="groups" className="space-y-6 pt-4 m-0">
              <Card>
                  <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2"><Users size={20}/>Grupos e Ministérios</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <ScrollArea className="h-40 border rounded-md p-4">
                          <div className="space-y-2">
                              {allGroups.length > 0 ? allGroups.map(group => (
                                  <div key={group.id} className="flex items-center space-x-2">
                                      <Checkbox
                                          id={`group-${group.id}`}
                                          checked={selectedGroupIds.has(group.id)}
                                          onCheckedChange={(checked) => handleGroupSelectionChange(group.id, !!checked)}
                                      />
                                      <Label htmlFor={`group-${group.id}`} className="font-normal cursor-pointer">{group.name}</Label>
                                  </div>
                              )) : <Skeleton className="h-8 w-full"/>}
                          </div>
                      </ScrollArea>
                  </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contact" className="space-y-6 pt-4 m-0">
              <Card>
                  <CardHeader><CardTitle className="text-lg">Endereço & Contato de Emergência</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                      <div className="space-y-2">
                          <Label htmlFor="address">Endereço</Label>
                          <Input id="address" value={profileData.address || ''} onChange={(e) => setProfileData(p => ({...p, address: e.target.value}))}/>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2"><Label htmlFor="city">Cidade</Label><Input id="city" value={profileData.city || ''} onChange={(e) => setProfileData(p => ({...p, city: e.target.value}))}/></div>
                          <div className="space-y-2"><Label htmlFor="state">Estado</Label><Input id="state" value={profileData.state || ''} onChange={(e) => setProfileData(p => ({...p, state: e.target.value}))}/></div>
                          <div className="space-y-2"><Label htmlFor="zip_code">CEP</Label><Input id="zip_code" value={profileData.zip_code || ''} onChange={(e) => setProfileData(p => ({...p, zip_code: e.target.value}))}/></div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2"><Label htmlFor="emergency_contact_name">Contato de Emergência</Label><Input id="emergency_contact_name" value={memberData.emergency_contact_name || ''} onChange={(e) => setMemberData(p => ({...p, emergency_contact_name: e.target.value}))}/></div>
                          <div className="space-y-2"><Label htmlFor="emergency_contact_phone">Telefone de Emergência</Label><Input id="emergency_contact_phone" value={memberData.emergency_contact_phone || ''} onChange={(e) => setMemberData(p => ({...p, emergency_contact_phone: e.target.value}))}/></div>
                      </div>
                  </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>

        <div className="flex justify-end gap-4 pt-4 border-t mt-4">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={loading}>{loading ? "Salvando..." : "Salvar Membro"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
