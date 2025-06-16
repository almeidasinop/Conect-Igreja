import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { type Announcement } from '@/integrations/supabase/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft } from 'lucide-react';

const AnnouncementPage = () => {
  const { id } = useParams<{ id: string }>();

  const { data: announcement, isLoading, error } = useQuery<Announcement | null>({
    queryKey: ['announcement', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        // Supabase throws an error if .single() finds no rows
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="p-4 animate-pulse">
        <Skeleton className="h-56 w-full" />
        <div className="p-6 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-full mt-2" />
            <Skeleton className="h-4 w-full mt-2" />
            <Skeleton className="h-4 w-5/6 mt-2" />
        </div>
      </div>
    );
  }

  if (error || !announcement) {
    return (
        <div className="p-4 flex flex-col items-center justify-center text-center h-screen">
             <Alert variant="destructive" className="max-w-md">
                <AlertTitle>Erro 404</AlertTitle>
                <AlertDescription>
                    A notícia que você está procurando não foi encontrada.
                </AlertDescription>
            </Alert>
            <Link to="/app" className="mt-6 inline-flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded-md">
                <ArrowLeft className="h-4 w-4" />
                Voltar para a Home
            </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="relative">
        <img 
            src={announcement.image_url || 'https://placehold.co/600x400/1f2937/ffffff?text=Notícia'} 
            alt={announcement.title}
            className="w-full h-56 object-cover"
        />
        <Link to="/app" className="absolute top-4 left-4 bg-black/50 p-2 rounded-full text-white transition-colors hover:bg-black/70">
          <ArrowLeft className="h-6 w-6" />
        </Link>
      </div>
      <div className="p-6 space-y-4">
        <h1 className="text-3xl font-bold leading-tight">{announcement.title}</h1>
        <p className="text-sm text-gray-400">
            Publicado em {new Date(announcement.created_at).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed whitespace-pre-wrap">
            {announcement.content}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementPage;
