import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "./ui/input";
import { Search } from "lucide-react";

interface GroupMembersManagerProps {
  group: any;
  onClose: () => void;
  onSave: () => void;
}

export const GroupMembersManager = ({ group, onClose, onSave }: GroupMembersManagerProps) => {
  const { toast } = useToast();
  const [allMembers, setAllMembers] = useState<any[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetches all members and the current members of the selected group
  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all members with their profiles
      const { data: membersData, error: membersError } = await supabase
        .from("members")
        .select("id, profiles(id, full_name)");
      if (membersError) throw membersError;
      setAllMembers(membersData.filter(m => m.profiles) || []); // Filter out members with no profile

      // Fetch current member IDs for the group
      const { data: groupMembersData, error: groupMembersError } = await supabase
        .from("member_groups")
        .select("member_id")
        .eq("group_id", group.id);
      if (groupMembersError) throw groupMembersError;

      const currentMemberIds = new Set(groupMembersData.map(gm => gm.member_id));
      setSelectedMemberIds(currentMemberIds);

    } catch (error: any) {
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [group.id, toast]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Toggles the selection of a member
  const handleToggleMember = (memberId: string) => {
    setSelectedMemberIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(memberId)) {
        newSet.delete(memberId);
      } else {
        newSet.add(memberId);
      }
      return newSet;
    });
  };

  // Saves the changes to the database
  const handleSave = async () => {
    setLoading(true);
    try {
      // First, delete all existing associations for this group
      const { error: deleteError } = await supabase
        .from("member_groups")
        .delete()
        .eq("group_id", group.id);

      if (deleteError) throw deleteError;

      // Then, insert the new associations
      const newMemberGroups = Array.from(selectedMemberIds).map(member_id => ({
        group_id: group.id,
        member_id,
      }));

      if (newMemberGroups.length > 0) {
        const { error: insertError } = await supabase
          .from("member_groups")
          .insert(newMemberGroups);
        
        if (insertError) throw insertError;
      }

      toast({
        title: "Sucesso!",
        description: "Membros do grupo atualizados com sucesso.",
      });
      onSave(); // This will close the dialog and refresh the groups list

    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = allMembers.filter(member =>
    member.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Gerenciar Membros - {group.name}</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              placeholder="Buscar membro..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          ) : (
            <ScrollArea className="h-72 border rounded-md">
              <div className="p-4 space-y-2">
                {filteredMembers.map(member => (
                  <div key={member.id} className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted">
                    <Checkbox
                      id={`member-${member.id}`}
                      checked={selectedMemberIds.has(member.id)}
                      onCheckedChange={() => handleToggleMember(member.id)}
                    />
                    <Label htmlFor={`member-${member.id}`} className="flex-1 cursor-pointer font-normal">
                      {member.profiles?.full_name || 'Nome não disponível'}
                    </Label>
                  </div>
                ))}
                 {filteredMembers.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">Nenhum membro encontrado.</p>
                )}
              </div>
            </ScrollArea>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
