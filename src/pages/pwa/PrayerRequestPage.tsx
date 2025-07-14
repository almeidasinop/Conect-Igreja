import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { HeartHandshake, Send } from 'lucide-react';

// Componente de Cabeçalho Padrão
const PageHeader = ({ title }: { title: string }) => (
  <header className="sticky top-0 bg-black z-10 p-4 text-center border-b border-neutral-800">
    <h1 className="text-xl font-bold">{title}</h1>
  </header>
);

// Componente Principal da Página
const PrayerRequestPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Estado para os campos do formulário
  const [visitorName, setVisitorName] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [requestText, setRequestText] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestText.trim()) {
      alert('Por favor, escreva seu pedido de oração.');
      return;
    }
    setLoading(true);

    try {
      let prayerRequest: any = {
        request_text: requestText,
      };

      if (user) {
        // Se o usuário estiver logado, associa o pedido ao seu ID
        prayerRequest.user_id = user.id;
      } else {
        // Se for um visitante, salva o nome e telefone
        prayerRequest.visitor_name = visitorName;
        prayerRequest.visitor_phone = visitorPhone;
      }

      const { error } = await supabase.from('prayer_requests').insert([prayerRequest]);

      if (error) {
        throw error;
      }

      alert('Seu pedido de oração foi enviado com sucesso! Estaremos orando por você.');
      // Limpa o formulário
      setRequestText('');
      setVisitorName('');
      setVisitorPhone('');

    } catch (error: any) {
      alert('Erro ao enviar o pedido: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black text-white">
      <PageHeader title="Pedido de Oração" />
      
      <main className="flex-1 overflow-y-auto p-4">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <HeartHandshake className="mx-auto h-16 w-16 text-emerald-400 mb-4" />
            <h2 className="text-2xl font-bold">Deixe seu Pedido</h2>
            <p className="text-neutral-400 mt-2">
              Compartilhe seu pedido conosco. Nossa equipe de intercessão estará orando por você.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!user && (
              <>
                <div>
                  <Label htmlFor="visitorName">Seu Nome</Label>
                  <Input 
                    id="visitorName" 
                    name="visitorName"
                    value={visitorName}
                    onChange={(e) => setVisitorName(e.target.value)}
                    placeholder="Digite seu nome (opcional)"
                  />
                </div>
                <div>
                  <Label htmlFor="visitorPhone">Seu Telefone</Label>
                  <Input 
                    id="visitorPhone" 
                    name="visitorPhone"
                    type="tel"
                    value={visitorPhone}
                    onChange={(e) => setVisitorPhone(e.target.value)}
                    placeholder="Seu telefone (opcional)"
                  />
                </div>
              </>
            )}

            <div>
              <Label htmlFor="requestText">Pedido de Oração *</Label>
              <Textarea 
                id="requestText"
                name="requestText"
                value={requestText}
                onChange={(e) => setRequestText(e.target.value)}
                placeholder="Escreva aqui o seu pedido..."
                rows={6}
                required
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full p-3 bg-emerald-600 rounded-lg font-bold text-lg disabled:bg-gray-500">
              {loading ? 'Enviando...' : (
                <span className="flex items-center justify-center gap-2">
                  <Send size={18} /> Enviar Pedido
                </span>
              )}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default PrayerRequestPage;
