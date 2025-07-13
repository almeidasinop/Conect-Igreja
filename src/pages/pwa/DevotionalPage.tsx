import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { BookOpenText, Quote, Heart, ArrowLeft, Share2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

// A mesma interface que já usamos
interface Devotional {
  id: number;
  data: string;
  titulo: string;
  versiculo: string;
  texto_biblico: string;
  mensagem: string;
  oracao: string;
}

// Função para buscar um devocional específico pela data
const fetchDevotionalByDate = async (date: string): Promise<Devotional | null> => {
  const response = await fetch('/data/devocional.json');
  if (!response.ok) {
    throw new Error('Não foi possível carregar o arquivo de devocionais.');
  }
  const devotionals: Devotional[] = await response.json();
  const devotional = devotionals.find(d => d.data === date);
  return devotional || null;
};

const DevotionalPage: React.FC = () => {
  const { date } = useParams<{ date: string }>();

  const { data: devotional, isLoading, isError } = useQuery<Devotional | null>({
    queryKey: ['devotional', date],
    queryFn: () => fetchDevotionalByDate(date!),
    enabled: !!date,
  });

  // Função para compartilhar o devocional
  const handleShare = async () => {
    if (!devotional) return;

    const shareText = `*${devotional.titulo}*\n\n_"${devotional.texto_biblico}"_\n*${devotional.versiculo}*\n\n${devotional.mensagem}\n\nVeja mais no App do Ministério da Fé!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: devotional.titulo,
          text: shareText,
        });
      } catch (error) {
        console.error('Erro ao compartilhar:', error);
      }
    } else {
      // Fallback para desktop: copiar para a área de transferência
      try {
        await navigator.clipboard.writeText(shareText);
        alert('Devocional copiado para a área de transferência!');
      } catch (err) {
        alert('Não foi possível copiar o texto.');
      }
    }
  };


  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (isError || !devotional) {
    return <div className="p-4 text-center text-neutral-400">Devocional não encontrado.</div>;
  }

  return (
    <div className="bg-black min-h-screen text-white">
      <header className="sticky top-0 bg-black z-10 p-4 flex items-center justify-between border-b border-neutral-800">
        <div className="flex items-center gap-4">
            <Link to="/app" className="text-white">
              <ArrowLeft size={24} />
            </Link>
            <h1 className="text-xl font-bold truncate">{devotional.titulo}</h1>
        </div>
        {/* Botão de Compartilhar */}
        <Button variant="ghost" size="icon" onClick={handleShare}>
            <Share2 size={20} className="text-white" />
        </Button>
      </header>

      <main className="p-6 space-y-8">
        <div className="border-l-4 border-emerald-500 pl-4">
          <p className="text-xl italic text-neutral-300">"{devotional.texto_biblico}"</p>
          <p className="text-md font-semibold text-emerald-400 mt-2">{devotional.versiculo}</p>
        </div>

        <p className="text-neutral-200 leading-relaxed text-lg">
          {devotional.mensagem}
        </p>

        <div className="bg-neutral-900/80 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sky-400"><Heart size={20} /></span>
            <h3 className="font-bold text-sky-400">Vamos Orar</h3>
          </div>
          <p className="text-neutral-300 italic">
            {devotional.oracao}
          </p>
        </div>
      </main>
    </div>
  );
};

export default DevotionalPage;
