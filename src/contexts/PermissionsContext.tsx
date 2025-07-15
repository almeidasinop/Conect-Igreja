import { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface PermissionsContextType {
  hasPermission: (permission: string) => boolean;
  loading: boolean;
  isAdmin: boolean;
  profileRole: string | null;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export const PermissionsProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const [permissions, setPermissions] = useState<Set<string>>(new Set());
  const [isAdmin, setIsAdmin] = useState(false);
  const [profileRole, setProfileRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPermissions = useCallback(async (userId: string) => {
    setLoading(true);
    try {
      // CORREÇÃO: A busca agora usa a coluna 'id' para encontrar o perfil
      // e seleciona 'id, role' para evitar o erro 406.
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', userId) 
        .single();

      if (profileError) {
        if (profileError.code === 'PGRST116') {
            setProfileRole('member');
            setIsAdmin(false);
            setPermissions(new Set());
            return;
        }
        throw profileError;
      }

      const userRole = profile?.role || 'member';
      setProfileRole(userRole);

      if (userRole === 'admin') {
        setIsAdmin(true);
        setPermissions(new Set());
      } else {
        setIsAdmin(false);
        const { data: rolePermissions, error: permissionsError } = await supabase
          .from('role_permissions')
          .select('permission')
          .eq('role', userRole)
          .eq('is_allowed', true);
        
        if (permissionsError) throw permissionsError;
        
        setPermissions(new Set(rolePermissions.map(p => p.permission)));
      }
    } catch (error) {
      console.error("Erro ao buscar permissões:", error);
      setPermissions(new Set());
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      fetchPermissions(user.id);
    } else if (!authLoading && !user) {
      setPermissions(new Set());
      setIsAdmin(false);
      setProfileRole(null);
      setLoading(false);
    }
  }, [user, authLoading, fetchPermissions]);

  const hasPermission = (permission: string): boolean => {
    if (isAdmin) return true;
    return permissions.has(permission);
  };

  const value = {
    hasPermission,
    loading: authLoading || loading,
    isAdmin,
    profileRole,
  };

  return <PermissionsContext.Provider value={value}>{children}</PermissionsContext.Provider>;
};

export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error('usePermissions deve ser usado dentro de um PermissionsProvider');
  }
  return context;
};
