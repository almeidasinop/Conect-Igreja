import { useEffect, useState } from "react";
import { Edit, Trash2, Phone, Mail, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface MembersListProps {
  searchTerm: string;
}

export const MembersList = ({ searchTerm }: MembersListProps) => {
  const { toast } = useToast();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from("members")
        .select(`
          *,
          profiles (*)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setMembers(data || []);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao carregar membros: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const filteredMembers = members.filter(member =>
    member.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.member_number?.includes(searchTerm)
  );

  const deleteMember = async (memberId: string) => {
    if (!confirm("Tem certeza que deseja excluir este membro?")) return;

    try {
      const { error } = await supabase
        .from("members")
        .delete()
        .eq("id", memberId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Membro excluído com sucesso!",
      });

      fetchMembers();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao excluir membro: " + error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: "default" | "secondary" | "destructive" } = {
      active: "default",
      inactive: "secondary",
      transferred: "destructive"
    };
    
    const labels: { [key: string]: string } = {
      active: "Ativo",
      inactive: "Inativo",
      transferred: "Transferido"
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {labels[status] || status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-muted rounded-full"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                  <div className="h-3 bg-muted rounded w-1/3"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (filteredMembers.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">
            {searchTerm ? "Nenhum membro encontrado para sua busca." : "Nenhum membro cadastrado ainda."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {filteredMembers.map((member) => (
        <Card key={member.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={member.profiles?.avatar_url} />
                  <AvatarFallback>
                    {member.profiles?.full_name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {member.profiles?.full_name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      #{member.member_number || "Sem número"}
                    </p>
                    {getStatusBadge(member.status)}
                  </div>

                  <div className="space-y-1">
                    {member.profiles?.email && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Mail size={14} className="mr-2" />
                        {member.profiles.email}
                      </div>
                    )}
                    {member.profiles?.phone && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Phone size={14} className="mr-2" />
                        {member.profiles.phone}
                      </div>
                    )}
                    {member.profiles?.city && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin size={14} className="mr-2" />
                        {member.profiles.city}, {member.profiles.state}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    {member.conversion_date && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar size={14} className="mr-2" />
                        Conversão: {new Date(member.conversion_date).toLocaleDateString()}
                      </div>
                    )}
                    {member.baptism_date && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar size={14} className="mr-2" />
                        Batismo: {new Date(member.baptism_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Edit size={16} />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => deleteMember(member.id)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};