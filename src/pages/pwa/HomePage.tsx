import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Calendar, MapPin, BookOpen, Plus, Heart, CalendarDays, ArrowRight, Youtube, Image as ImageIcon } from 'lucide-react';
import { type Event, type Announcement } from '@/integrations/supabase/types';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';


// --- COMPONENTES REUTILIZÁVEIS ---

// Título de Seção Padrão
const SectionHeader = ({ title, linkTo = "#" }: { title: string; linkTo?: string }) => (
    <div className="flex justify-between items-center px-4">
        <h2 className="text-xl font-bold">{title}</h2>
        <Link to={linkTo} className="text-sm font-semibold text-emerald-400 flex items-center gap-1">
            Ver todos <ArrowRight className="h-4 w-4" />
        </Link>
    </div>
);

// Container para Rolagem Horizontal
const HorizontalScrollContainer = ({ children }: { children: React.ReactNode }) => (
    <div className="overflow-x-auto scrollbar-hide">
        <div className="flex space-x-4 px-4 pb-4">
            {children}
        </div>
    </div>
);

// Card de Conteúdo Padrão (para Notícias, Vídeos, Estudos)
const ContentCard = ({ imageUrl, title, description, to, isExternal = false }: { imageUrl: string; title: string; description?: string; to: string; isExternal?: boolean }) => {
    const content = (
        <Card className="relative overflow-hidden text-white bg-cover bg-center shadow-lg border-0 rounded-xl h-52 group">
            <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                style={{ backgroundImage: `url(${imageUrl})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="p-4 flex flex-col justify-end h-full relative z-10">
                <CardTitle className="text-lg font-bold drop-shadow-md">{title}</CardTitle>
                {description && <CardDescription className="text-gray-200 text-sm mt-1 line-clamp-2 drop-shadow-md">{description}</CardDescription>}
            </div>
        </Card>
    );

    if (isExternal) {
        return <a href={to} target="_blank" rel="noopener noreferrer" className="block w-[85vw] md:w-96 flex-shrink-0">{content}</a>;
    }
    
    return <Link to={to} className="block w-[85vw] md:w-96 flex-shrink-0">{content}</Link>;
};


// --- LÓGICA DO DEVOCIONAL ---
interface Devotional {
  id: number; data: string; titulo: string; versiculo: string;
}

const fetchTodaysDevotional = async (): Promise<Devotional | null> => {
  try {
    const response = await fetch('/data/devocional.json');
    if (!response.ok) throw new Error(`Falha ao carregar devocionais.`);
    const devotionals: Devotional[] = await response.json();
    if (!devotionals || devotionals.length === 0) return null;
    const todayString = new Date().toISOString().split('T')[0];
    let devotionalToShow = devotionals.find(d => d.data === todayString);
    if (!devotionalToShow) {
      const sortedDevotionals = [...devotionals].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
      devotionalToShow = sortedDevotionals[0];
    }
    return devotionalToShow || null;
  } catch (error) {
    console.error("Erro ao buscar o devocional:", error);
    return null;
  }
};

// --- COMPONENTE PRINCIPAL ---
const QuickActionButton = ({ icon: Icon, label, to }: { icon: React.ElementType, label: string, to: string }) => (
    <Link to={to} className="flex flex-col items-center gap-2 text-center">
        <div className="bg-neutral-800/80 backdrop-blur-sm rounded-full h-16 w-16 flex items-center justify-center">
            <Icon className="h-7 w-7 text-white" />
        </div>
        <span className="text-sm font-medium">{label}</span>
    </Link>
);

type YouTubeVideo = {
  id: { videoId: string; };
  snippet: { title: string; description: string; thumbnails: { high: { url: string; }; }; };
};

const HomePage = () => {
    const { user } = useAuth();
    const YOUTUBE_API_KEY = 'AIzaSyAI6ElLWG73MlKLlQey48z6Di7xnm7IoII';
    const YOUTUBE_CHANNEL_ID = 'UC2_epYhGE1zrwFY2dw69H6Q';

    // --- QUERIES (BUSCA DE DADOS) ---
    
    // CORREÇÃO: Busca eventos futuros diretamente da tabela
    const { data: events, isLoading: isLoadingEvents } = useQuery<Event[]>({
        queryKey: ['future_events_home', user?.id],
        queryFn: async () => {
          const { data, error } = await supabase
            .from('events')
            .select('*')
            .gte('start_time', new Date().toISOString()) // Garante que só eventos futuros são buscados
            .order('start_time', { ascending: true })
            .limit(3);
          
          if (error) {
            console.error("Error fetching future events:", error);
            throw new Error(error.message);
          }
          return data || [];
        },
    });

    const { data: announcements, isLoading: isLoadingAnnouncements } = useQuery<Announcement[]>({
        queryKey: ['announcements'],
        queryFn: async () => {
          const { data, error } = await supabase.from('announcements').select('*').order('created_at', { ascending: false }).limit(5);
          if (error) throw new Error(error.message);
          return data || [];
        },
    });

    const { data: videos, isLoading: isLoadingVideos, error: videosError } = useQuery<YouTubeVideo[]>({
        queryKey: ['youtube_videos'],
        queryFn: async () => {
            if (YOUTUBE_API_KEY === 'COLE_SUA_CHAVE_DE_API_AQUI') {
                return [];
            }
            const response = await fetch(`https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${YOUTUBE_CHANNEL_ID}&part=snippet,id&order=date&maxResults=5&type=video`);
            if (!response.ok) {
                throw new Error('Falha ao buscar vídeos do YouTube.');
            }
            const data = await response.json();
            return data.items || [];
        },
        staleTime: 1000 * 60 * 60,
    });

    const { data: devotional, isLoading: isLoadingDevotional } = useQuery<Devotional | null>({
        queryKey: ['todaysDevotionalSummary'],
        queryFn: fetchTodaysDevotional,
        staleTime: 1000 * 60 * 60,
    });

    const formatEventDateTime = (dateTimeString: string) => {
        return new Date(dateTimeString).toLocaleString('pt-BR', {
          weekday: 'long', day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit',
        });
    };

    return (
        <div className="pb-8 pt-6 space-y-10 bg-black text-white">
            {/* --- CABEÇALHO E BOTÕES RÁPIDOS --- */}
            <header className="h-48 mx-4 bg-neutral-800 rounded-2xl p-4 flex flex-col justify-end shadow-2xl relative overflow-hidden">
                <img src="https://i.imgur.com/oI0GTcD.png" alt="Banner principal" className="absolute top-0 left-0 w-full h-full object-cover opacity-30" />
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold">Ministério da Fé</h1>
                    <p className="text-sm text-neutral-300">Sinop</p>
                </div>
            </header>
            <div className="grid grid-cols-4 gap-4 px-4 -mt-16 relative z-20">
                <QuickActionButton icon={BookOpen} label="Bíblia" to="/app/biblia" />
                <QuickActionButton icon={Plus} label="Oração" to="/app/prayer-request" />
                <QuickActionButton icon={Heart} label="Envolva-se" to="/app/giving" />
                <QuickActionButton icon={CalendarDays} label="Horários" to="/app/schedule" />
            </div>

            {/* --- SEÇÕES DE CONTEÚDO --- */}
            <div className="space-y-8">
                {/* Notícias */}
                <section>
                    <SectionHeader title="Notícias" linkTo="/app/announcements" />
                    <div className="mt-2">
                        {isLoadingAnnouncements ? (
                            <HorizontalScrollContainer><Skeleton className="h-52 w-[85vw] rounded-xl flex-shrink-0" /></HorizontalScrollContainer>
                        ) : announcements && announcements.length > 0 ? (
                            <HorizontalScrollContainer>
                                {announcements.map((announcement) => (
                                    <ContentCard
                                        key={announcement.id}
                                        to={`/app/announcement/${announcement.id}`}
                                        imageUrl={announcement.image_url || 'https://placehold.co/600x400/334155/ffffff?text=Notícia'}
                                        title={announcement.title}
                                        description={announcement.content}
                                    />
                                ))}
                            </HorizontalScrollContainer>
                        ) : <p className="text-sm text-muted-foreground px-4">Nenhuma notícia recente.</p>}
                    </div>
                </section>

                {/* Agenda */}
                <section>
                    <SectionHeader title="Agenda" linkTo="/app/schedule" />
                    <div className="mt-2">
                        {isLoadingEvents ? (
                            <HorizontalScrollContainer><Skeleton className="h-52 w-[85vw] rounded-xl flex-shrink-0" /></HorizontalScrollContainer>
                        ) : events && events.length > 0 ? (
                            <HorizontalScrollContainer>
                                {events.map((event) => (
                                    <ContentCard
                                        key={event.id}
                                        to={`/app/event/${event.id}`}
                                        imageUrl={event.image_url || 'https://placehold.co/600x400/334155/ffffff?text=Evento'}
                                        title={event.title}
                                        description={formatEventDateTime(event.start_time)}
                                    />
                                ))}
                            </HorizontalScrollContainer>
                        ) : <p className="text-sm text-muted-foreground px-4">Nenhum evento futuro agendado.</p>}
                    </div>
                </section>

                {/* Vídeos */}
                <section>
                    <SectionHeader title="Vídeos" linkTo={`https://www.youtube.com/channel/${YOUTUBE_CHANNEL_ID}`} />
                    <div className="mt-2">
                        {isLoadingVideos ? (
                            <HorizontalScrollContainer><Skeleton className="h-52 w-[85vw] rounded-xl flex-shrink-0" /></HorizontalScrollContainer>
                        ) : videosError ? (
                            <Alert variant="destructive" className="mx-4"><AlertTitle>Erro</AlertTitle><AlertDescription>Não foi possível carregar os vídeos.</AlertDescription></Alert>
                        ) : videos && videos.length > 0 ? (
                            <HorizontalScrollContainer>
                                {videos.map((video) => (
                                    <ContentCard
                                        key={video.id.videoId}
                                        to={`https://www.youtube.com/watch?v=${video.id.videoId}`}
                                        imageUrl={video.snippet.thumbnails.high.url}
                                        title={video.snippet.title}
                                        isExternal
                                    />
                                ))}
                            </HorizontalScrollContainer>
                        ) : <p className="text-sm text-muted-foreground px-4">Nenhum vídeo recente.</p>}
                    </div>
                </section>

                {/* Estudos */}
                <section>
                    <SectionHeader title="Estudos" linkTo="#" />
                    <div className="mt-2">
                         {isLoadingDevotional ? (
                            <HorizontalScrollContainer><Skeleton className="h-52 w-[85vw] rounded-xl flex-shrink-0" /></HorizontalScrollContainer>
                        ) : devotional ? (
                            <HorizontalScrollContainer>
                                <ContentCard
                                    to={`/app/devotional/${devotional.data}`}
                                    imageUrl="/icons/devocional.png"
                                    title={devotional.titulo}
                                    description={`Devocional • ${new Date(devotional.data + 'T00:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}`}
                                />
                            </HorizontalScrollContainer>
                        ) : <p className="text-sm text-muted-foreground px-4">Nenhum estudo disponível.</p>}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default HomePage;
