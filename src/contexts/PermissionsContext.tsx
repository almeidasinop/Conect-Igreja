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
      // 1. Obtém o papel (role) do utilizador a partir do seu perfil
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (profileError) {
        // Se o perfil não for encontrado, trata como um membro padrão sem permissões
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

      // 2. O papel 'admin' tem acesso a tudo por defeito
      if (userRole === 'admin') {
        setIsAdmin(true);
        setPermissions(new Set()); // O admin não precisa da lista, ele passa em todas as verificações
      } else {
        setIsAdmin(false);
        // 3. Para outros papéis, busca as permissões específicas do banco de dados
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
      // Se o utilizador deslogar, limpa as permissões e o estado
      setPermissions(new Set());
      setIsAdmin(false);
      setProfileRole(null);
      setLoading(false);
    }
  }, [user, authLoading, fetchPermissions]);

  // Função que outros componentes irão usar para verificar uma permissão específica
  const hasPermission = (permission: string): boolean => {
    if (isAdmin) return true; // Admins sempre têm permissão
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

// Hook personalizado para facilitar o uso do contexto
export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error('usePermissions deve ser usado dentro de um PermissionsProvider');
  }
  return context;
};
