import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { type Announcement } from '@/integrations/supabase/types';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const AnnouncementsListPage = () => {
  const { data: announcements, isLoading } = useQuery<Announcement[]>({
    queryKey: ['all_announcements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return data || [];
    },
  });

  return (
    <div className="p-4 space-y-4">
       <div className="flex items-center gap-4">
        <Link to="/app" className="p-2 rounded-full text-white hover:bg-gray-700 transition-colors">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-2xl font-bold">Todas as Notícias</h1>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-28 w-full rounded-lg" />
          <Skeleton className="h-28 w-full rounded-lg" />
          <Skeleton className="h-28 w-full rounded-lg" />
        </div>
      ) : announcements && announcements.length > 0 ? (
        <div className="space-y-4">
          {announcements.map((announcement) => (
             <Link key={announcement.id} to={`/app/announcement/${announcement.id}`}>
                <Card 
                  className="relative overflow-hidden text-white bg-cover bg-center shadow-lg border-0 rounded-xl" 
                  style={{ 
                    backgroundImage: `linear-gradient(to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.2)), url(${announcement.image_url || 'https://placehold.co/600x400/334155/ffffff?text=Notícia'})`, 
                    minHeight: '160px' 
                  }}
                >
                  <div className="p-4 flex flex-col justify-end h-full">
                    <CardTitle className="text-lg font-bold drop-shadow-md">{announcement.title}</CardTitle>
                    <CardDescription className="text-gray-200 text-sm mt-1 line-clamp-2 drop-shadow-md">{announcement.content}</CardDescription>
                  </div>
                </Card>
             </Link>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground mt-8">Nenhuma notícia encontrada.</p>
      )}
    </div>
  );
};

export default AnnouncementsListPage;
