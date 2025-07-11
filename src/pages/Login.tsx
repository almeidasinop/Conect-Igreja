import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Church } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext'; // Importar o hook de autenticação

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { session, loading: authLoading } = useAuth(); // Usar o estado de autenticação

  // Redireciona se o usuário já estiver logado
  useEffect(() => {
    if (!authLoading && session) {
      navigate('/');
    }
  }, [session, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      toast({
        title: "Login realizado com sucesso!",
        description: "Redirecionando para o painel...",
      });
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: error.message || "Verifique seu e-mail e senha.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Se ainda estiver verificando a sessão ou se já houver uma sessão, não mostra o formulário
  if (authLoading || session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <Church className="mx-auto h-10 w-10 mb-4 text-primary" />
          <CardTitle className="text-2xl">Gestor de Igrejas</CardTitle>
          <CardDescription>
            Insira suas credenciais para acessar o painel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
