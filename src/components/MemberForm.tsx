import { useState } from "react";
import { X, Upload, Calendar, MapPin, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface MemberFormProps {
  onClose: () => void;
  onSave: () => void;
  member?: any;
}

export const MemberForm = ({ onClose, onSave, member }: MemberFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: member?.profiles?.full_name || "",
    email: member?.profiles?.email || "",
    phone: member?.profiles?.phone || "",
    birth_date: member?.profiles?.birth_date || "",
    address: member?.profiles?.address || "",
    city: member?.profiles?.city || "",
    state: member?.profiles?.state || "",
    zip_code: member?.profiles?.zip_code || "",
  });

  const [memberData, setMemberData] = useState({
    member_number: member?.member_number || "",
    conversion_date: member?.conversion_date || "",
    baptism_date: member?.baptism_date || "",
    origin_church: member?.origin_church || "",
    marital_status: member?.marital_status || "",
    profession: member?.profession || "",
    emergency_contact_name: member?.emergency_contact_name || "",
    emergency_contact_phone: member?.emergency_contact_phone || "",
    notes: member?.notes || "",
  });

  const handleSave = async () => {
    if (!profileData.full_name || !profileData.email) {
      toast({
        title: "Erro",
        description: "Nome completo e email são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Create profile first
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .insert({
          ...profileData,
          user_id: "00000000-0000-0000-0000-000000000000" // Temporary until auth is implemented
        })
        .select()
        .single();

      if (profileError) throw profileError;

      // Create member record
      const { error: memberError } = await supabase
        .from("members")
        .insert({
          ...memberData,
          profile_id: profile.id,
        });

      if (memberError) throw memberError;

      toast({
        title: "Sucesso",
        description: "Membro cadastrado com sucesso!",
      });

      onSave();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar membro",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User size={24} />
            {member ? "Editar Membro" : "Novo Membro"}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal">Dados Pessoais</TabsTrigger>
            <TabsTrigger value="ecclesiastical">Informações Eclesiásticas</TabsTrigger>
            <TabsTrigger value="contact">Contato & Endereço</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Nome Completo *</Label>
                    <Input
                      id="full_name"
                      value={profileData.full_name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                      placeholder="Nome completo do membro"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birth_date">Data de Nascimento</Label>
                    <Input
                      id="birth_date"
                      type="date"
                      value={profileData.birth_date}
                      onChange={(e) => setProfileData(prev => ({ ...prev, birth_date: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="marital_status">Estado Civil</Label>
                    <Select value={memberData.marital_status} onValueChange={(value) => setMemberData(prev => ({ ...prev, marital_status: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
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
                    <Input
                      id="profession"
                      value={memberData.profession}
                      onChange={(e) => setMemberData(prev => ({ ...prev, profession: e.target.value }))}
                      placeholder="Profissão do membro"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ecclesiastical" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informações Eclesiásticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="member_number">Número do Membro</Label>
                    <Input
                      id="member_number"
                      value={memberData.member_number}
                      onChange={(e) => setMemberData(prev => ({ ...prev, member_number: e.target.value }))}
                      placeholder="Ex: 001234"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="conversion_date">Data de Conversão</Label>
                    <Input
                      id="conversion_date"
                      type="date"
                      value={memberData.conversion_date}
                      onChange={(e) => setMemberData(prev => ({ ...prev, conversion_date: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="baptism_date">Data do Batismo</Label>
                    <Input
                      id="baptism_date"
                      type="date"
                      value={memberData.baptism_date}
                      onChange={(e) => setMemberData(prev => ({ ...prev, baptism_date: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="origin_church">Igreja de Origem</Label>
                    <Input
                      id="origin_church"
                      value={memberData.origin_church}
                      onChange={(e) => setMemberData(prev => ({ ...prev, origin_church: e.target.value }))}
                      placeholder="Nome da igreja anterior"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    value={memberData.notes}
                    onChange={(e) => setMemberData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Observações adicionais sobre o membro"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Endereço & Contato de Emergência</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    value={profileData.address}
                    onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Rua, número, bairro"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Cidade</Label>
                    <Input
                      id="city"
                      value={profileData.city}
                      onChange={(e) => setProfileData(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="Cidade"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">Estado</Label>
                    <Input
                      id="state"
                      value={profileData.state}
                      onChange={(e) => setProfileData(prev => ({ ...prev, state: e.target.value }))}
                      placeholder="Estado"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip_code">CEP</Label>
                    <Input
                      id="zip_code"
                      value={profileData.zip_code}
                      onChange={(e) => setProfileData(prev => ({ ...prev, zip_code: e.target.value }))}
                      placeholder="00000-000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergency_contact_name">Contato de Emergência</Label>
                    <Input
                      id="emergency_contact_name"
                      value={memberData.emergency_contact_name}
                      onChange={(e) => setMemberData(prev => ({ ...prev, emergency_contact_name: e.target.value }))}
                      placeholder="Nome do contato"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergency_contact_phone">Telefone de Emergência</Label>
                    <Input
                      id="emergency_contact_phone"
                      value={memberData.emergency_contact_phone}
                      onChange={(e) => setMemberData(prev => ({ ...prev, emergency_contact_phone: e.target.value }))}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Salvando..." : "Salvar Membro"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};