import { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface PermissionsContextType {
  hasPermission: (permission: string) => boolean;
  loading: boolean;
  isAdmin: boolean;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export const PermissionsProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const [permissions, setPermissions] = useState<Set<string>>(new Set());
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchPermissions = useCallback(async (userId: string) => {
    setLoading(true);
    try {
      // 1. Obtém o papel do utilizador a partir do seu perfil
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (profileError) throw profileError;

      const userRole = profile?.role || 'member';

      if (userRole === 'admin') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
        // 2. Obtém todas as permissões ativas para aquele papel
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
      setPermissions(new Set()); // Limpa as permissões em caso de erro
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      fetchPermissions(user.id);
    } else if (!authLoading && !user) {
      // Se o utilizador deslogar, limpa as permissões
      setPermissions(new Set());
      setIsAdmin(false);
      setLoading(false);
    }
  }, [user, authLoading, fetchPermissions]);

  // Função que verifica se o utilizador tem uma permissão específica
  const hasPermission = (permission: string): boolean => {
    if (isAdmin) return true; // Admins podem fazer tudo
    return permissions.has(permission);
  };

  const value = {
    hasPermission,
    loading: authLoading || loading,
    isAdmin,
  };

  return <PermissionsContext.Provider value={value}>{children}</PermissionsContext.Provider>;
};

// Hook personalizado para usar o contexto facilmente
export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error('usePermissions deve ser usado dentro de um PermissionsProvider');
  }
  return context;
};
