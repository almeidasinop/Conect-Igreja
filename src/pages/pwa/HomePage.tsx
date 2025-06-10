import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, Plus, Heart, Calendar } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';



// --- Subcomponentes Visuais (sem alterações) ---
const QuickAction = ({ icon: Icon, label, secondaryLabel }: { icon: React.ElementType, label: string, secondaryLabel?: string }) => (
    <div className="flex flex-col items-center gap-2 text-white text-center">
        <div className="w-16 h-16 bg-[#27272a] rounded-full flex items-center justify-center transition-transform hover:scale-105">
            <Icon size={28} />
        </div>
        <div className="text-xs font-medium leading-tight">
            <span>{label}</span>
            {secondaryLabel && <br/>}
            {secondaryLabel && <span>{secondaryLabel}</span>}
        </div>
    </div>
);
const SectionHeader = ({ title, actionText = "Ver todos" }: { title: string, actionText?: string }) => (
    <div className="flex justify-between items-baseline mb-3 px-4">
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <span className="text-sm font-medium text-neutral-400">{actionText}</span>
    </div>
);
const NewsCard = ({ imageUrl, title, subtitle }: { imageUrl: string, title: string, subtitle: string }) => (
    <div className="flex-shrink-0 w-40 space-y-2">
        <div className="h-24 bg-neutral-800 rounded-xl overflow-hidden shadow-lg">
             <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
        </div>
        <div>
            <h3 className="font-bold text-sm text-white truncate">{title}</h3>
            <p className="text-xs text-neutral-400">{subtitle}</p>
        </div>
    </div>
);
const EventCard = ({ title, date }: { title: string, date: string }) => (
     <div className="flex-shrink-0 w-60 bg-[#1f1f1f] border border-neutral-800 rounded-xl p-4 shadow-lg h-full">
        <div className="flex flex-col justify-between h-full">
            <div>
                 <h3 className="text-base font-bold text-white uppercase">{title}</h3>
            </div>
            <div className="flex items-center gap-2 text-sm text-neutral-400 mt-8">
                <Calendar size={16}/>
                <span>{date}</span>
            </div>
        </div>
    </div>
);
const ContentCard = ({ imageUrl, date, title }: { imageUrl: string, date: string, title: string }) => (
    <div className="flex-shrink-0 w-56 space-y-2">
        <div className="h-32 bg-neutral-800 rounded-xl mb-1 overflow-hidden shadow-lg">
            <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
        </div>
        <div>
            <p className="text-xs text-neutral-400">{date}</p>
            <h3 className="font-semibold text-sm text-white truncate">{title}</h3>
        </div>
    </div>
);
// --- Fim dos Subcomponentes Visuais ---


export const HomePage = () => {
    const [loading, setLoading] = useState(true);
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const [videos, setVideos] = useState<any[]>([]);
    const [studies, setStudies] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Busca as últimas 5 notícias
                const announcementsPromise = supabase.from('announcements').select('title, content').limit(5).order('created_at', { ascending: false });
                
                // Busca os próximos 5 eventos a partir da data atual
                const eventsPromise = supabase.from('events').select('title, start_time').limit(5).order('start_time', { ascending: true }).gte('start_time', new Date().toISOString());
                
                // Busca os últimos 5 vídeos
                const videosPromise = supabase.from('content_items').select('title, content, created_at').eq('type', 'sermon_video').limit(5).order('created_at', { ascending: false });

                // Busca os últimos 5 estudos
                const studiesPromise = supabase.from('content_items').select('title, content, created_at').eq('type', 'study_pdf').limit(5).order('created_at', { ascending: false });

                const [
                    announcementsResult,
                    eventsResult,
                    videosResult,
                    studiesResult
                ] = await Promise.all([announcementsPromise, eventsPromise, videosPromise, studiesPromise]);

                if(announcementsResult.error) throw announcementsResult.error;
                setAnnouncements(announcementsResult.data);

                if(eventsResult.error) throw eventsResult.error;
                setEvents(eventsResult.data);

                if(videosResult.error) throw videosResult.error;
                setVideos(videosResult.data);

                if(studiesResult.error) throw studiesResult.error;
                setStudies(studiesResult.data);

            } catch (error) {
                console.error("Erro ao buscar dados para a homepage:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);


    return (
        <div className="pt-6 space-y-10">
            {/* Header com Carrossel */}
            <header className="h-48 mx-4 bg-neutral-800 rounded-2xl p-4 flex flex-col justify-end shadow-2xl relative overflow-hidden">
                <img src="https://i.imgur.com/oI0GTcD.png" alt="Banner principal" className="absolute top-0 left-0 w-full h-full object-cover opacity-30" />
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold">Ministério da Fé</h1>
                    <p className="text-sm text-neutral-300">Sinop</p>
                </div>
            </header>

            {/* Ações Rápidas */}
            <section className="flex justify-around px-4">
                <QuickAction icon={BookOpen} label="Bíblia" />
                <QuickAction icon={Plus} label="Pedido" secondaryLabel="de oração" />
                <QuickAction icon={Heart} label="Envolva-se" />
                <QuickAction icon={Calendar} label="Horários" />
            </section>

            {/* Notícias Dinâmicas */}
            <section>
                <SectionHeader title="Notícias" />
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide pl-4" style={{ WebkitOverflowScrolling: 'touch' }}>
                    {loading ? (
                        [...Array(3)].map((_, i) => <Skeleton key={i} className="w-40 h-36 rounded-xl" />)
                    ) : (
                        announcements.length > 0 ? announcements.map((item, index) => (
                            <NewsCard key={index} imageUrl={`https://placehold.co/160x96/1f1f1f/FFF?text=${item.title.substring(0,3)}`} title={item.title} subtitle={item.content.substring(0,20) + '...'} />
                        )) : <p className="text-sm text-neutral-400 pl-4">Nenhuma notícia recente.</p>
                    )}
                    <div className="w-4 flex-shrink-0"></div>
                </div>
            </section>
            
            {/* Agenda Dinâmica */}
            <section>
                <SectionHeader title="Agenda" />
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide pl-4 h-36" style={{ WebkitOverflowScrolling: 'touch' }}>
                    {loading ? (
                         <Skeleton className="w-60 h-full rounded-xl" />
                    ) : (
                        events.length > 0 ? events.map((item, index) => (
                             <EventCard key={index} title={item.title} date={format(parseISO(item.start_time), "dd/MM/yyyy", { locale: ptBR })} />
                        )) : <p className="text-sm text-neutral-400 pl-4">Nenhum evento futuro.</p>
                    )}
                     <div className="w-4 flex-shrink-0"></div>
                </div>
            </section>

            {/* Vídeos Dinâmicos */}
            <section>
                <SectionHeader title="Vídeos" />
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide pl-4" style={{ WebkitOverflowScrolling: 'touch' }}>
                     {loading ? (
                         <Skeleton className="w-56 h-44 rounded-xl" />
                    ) : (
                        videos.length > 0 ? videos.map((item, index) => (
                            <ContentCard key={index} imageUrl={`https://placehold.co/256x128/1f1f1f/FFF?text=Vídeo`} date={format(parseISO(item.created_at), "dd/MM/yyyy")} title={item.title} />
                        )) : <p className="text-sm text-neutral-400 pl-4">Nenhum vídeo recente.</p>
                    )}
                    <div className="w-4 flex-shrink-0"></div>
                </div>
            </section>

            {/* Estudos Dinâmicos */}
             <section>
                <SectionHeader title="Estudos" />
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide pl-4" style={{ WebkitOverflowScrolling: 'touch' }}>
                    {loading ? (
                         <Skeleton className="w-56 h-44 rounded-xl" />
                    ) : (
                        studies.length > 0 ? studies.map((item, index) => (
                            <ContentCard key={index} imageUrl={`https://placehold.co/256x128/1f1f1f/FFF?text=PDF`} date={format(parseISO(item.created_at), "dd/MM/yyyy")} title={item.title} />
                        )) : <p className="text-sm text-neutral-400 pl-4">Nenhum estudo recente.</p>
                    )}
                    <div className="w-4 flex-shrink-0"></div>
                </div>
            </section>
        </div>
    );
};
