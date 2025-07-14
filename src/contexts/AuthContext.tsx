import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import LoadingScreen from '@/components/pwa/LoadingScreen'; // Importe a nova tela de loading

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session);
                setUser(session?.user ?? null);
                // A primeira verificação já terá acontecido, então podemos manter o loading como false
                if (loading) setLoading(false);
            }
        );

        // Garante que o estado de loading seja falso após a verificação inicial
        const getInitialSession = async () => {
            // Não precisa chamar getSession() aqui, pois o onAuthStateChange já é
            // disparado na inicialização com o evento INITIAL_SESSION.
            // Apenas definimos o loading como falso após um pequeno delay para evitar um flash rápido.
            setTimeout(() => {
                setLoading(false);
            }, 500); // Meio segundo para uma transição suave
        }

        getInitialSession();

        return () => {
            authListener?.subscription.unsubscribe();
        };
    }, [loading]);

    const value = {
        user,
        session,
        loading,
    };

    // Lógica de Renderização Condicional
    // Enquanto o 'loading' for true, exibe a tela de carregamento.
    if (loading) {
        return <LoadingScreen />;
    }

    // Quando o 'loading' for false, exibe o resto do aplicativo.
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
