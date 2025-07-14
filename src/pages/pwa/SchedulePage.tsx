import React, { useState, useMemo, useEffect, useRef, useLayoutEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { type Event } from '@/integrations/supabase/types';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { ptBR } from 'date-fns/locale';
import { format, isSameDay, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

// Componente para cada item da lista de eventos
const EventListItem = ({ event }: { event: Event }) => (
    <Link to={`/app/event/${event.id}`} className="block w-full">
        <Card className="bg-neutral-900 border-neutral-800 p-4 flex items-center gap-4 hover:bg-neutral-800 transition-colors">
            <div className="w-1 h-16 bg-emerald-500 rounded-full" />
            {event.image_url && (
                <img src={event.image_url} alt={event.title} className="w-20 h-16 object-cover rounded-md" />
            )}
            <div className="flex-1">
                <p className="font-bold text-white">{event.title}</p>
                {event.location && <p className="text-sm text-neutral-400">{event.location}</p>}
            </div>
            <ChevronRight className="text-neutral-500" />
        </Card>
    </Link>
);

// Componente para o seletor de semana fixo no topo
const WeekSelector = ({
  activeDate,
  onDateSelect,
  onPrevWeek,
  onNextWeek,
  eventDates
}: {
  activeDate: Date;
  onDateSelect: (date: Date) => void;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  eventDates: Set<string>;
}) => {
    const week = useMemo(() => {
        const start = startOfWeek(activeDate, { weekStartsOn: 0 });
        const end = endOfWeek(activeDate, { weekStartsOn: 0 });
        return eachDayOfInterval({ start, end });
    }, [activeDate]);

    return (
        <div className="sticky top-0 bg-black z-10 p-4 border-b border-neutral-800">
            <div className="flex justify-between items-center mb-4">
                <button onClick={onPrevWeek}><ChevronLeft /></button>
                <h3 className="font-bold text-lg capitalize">{format(activeDate, "MMMM yyyy", { locale: ptBR })}</h3>
                <button onClick={onNextWeek}><ChevronRight /></button>
            </div>
            <div className="flex justify-around">
                {week.map(day => (
                    <div key={day.toString()} onClick={() => onDateSelect(day)} className="flex flex-col items-center gap-2 cursor-pointer">
                        <span className="text-sm font-semibold text-neutral-400">{format(day, "eeeee", { locale: ptBR })}</span>
                        <span className={cn(
                            "flex items-center justify-center w-8 h-8 rounded-full",
                            isSameDay(day, activeDate) && "bg-emerald-500 text-white font-bold",
                            !eventDates.has(format(day, 'yyyy-MM-dd')) && "text-neutral-600"
                        )}>
                            {format(day, "d")}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};


// Componente Principal da Página de Horários
const SchedulePage: React.FC = () => {
  const [activeDate, setActiveDate] = useState(new Date());
  const listRef = useRef<HTMLDivElement>(null);
  const dateRefs = useRef<Map<string, HTMLElement>>(new Map());
  const isScrollingToDate = useRef(false);
  const initialScrollDone = useRef(false); // Flag para controlar a rolagem inicial

  // Busca TODOS os eventos, passados e futuros
  const { data: allEvents, isLoading, isError } = useQuery<Event[]>({
    queryKey: ['all_events_sorted'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('start_time', { ascending: true });
      
      if (error) throw new Error(error.message);
      return data || [];
    },
  });

  // Agrupa os eventos por data
  const { groupedEvents, eventDates } = useMemo(() => {
    if (!allEvents) return { groupedEvents: {}, eventDates: new Set<string>() };

    const grouped = allEvents.reduce((acc, event) => {
      const dateKey = format(parseISO(event.start_time), 'yyyy-MM-dd');
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(event);
      return acc;
    }, {} as Record<string, Event[]>);
    
    const dates = new Set(Object.keys(grouped));
    return { groupedEvents: grouped, eventDates: dates };
  }, [allEvents]);

  // Efeito para observar os grupos de datas durante a rolagem
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (isScrollingToDate.current) return;

        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const date = entry.target.getAttribute('data-date');
            if (date) {
              setActiveDate(parseISO(date));
            }
          }
        });
      },
      { root: null, rootMargin: "-40% 0px -60% 0px", threshold: 0 }
    );

    const refs = dateRefs.current;
    refs.forEach(el => observer.observe(el));

    return () => {
      refs.forEach(el => observer.unobserve(el));
    };
  }, [groupedEvents]);
  
  // CORREÇÃO: Usa useLayoutEffect para garantir que a rolagem ocorra após o DOM ser atualizado.
  useLayoutEffect(() => {
    if (isLoading || initialScrollDone.current || Object.keys(groupedEvents).length === 0) {
      return;
    }

    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const firstUpcomingDateKey = Object.keys(groupedEvents).find(date => date >= todayStr);

    if (firstUpcomingDateKey) {
      const firstUpcomingDate = parseISO(firstUpcomingDateKey);
      setActiveDate(firstUpcomingDate);
      
      const element = dateRefs.current.get(firstUpcomingDateKey);
      const listContainer = listRef.current;

      if (element && listContainer) {
        // Define o topo da rolagem para a posição exata do próximo evento.
        listContainer.scrollTop = element.offsetTop;
        initialScrollDone.current = true;
      }
    } else {
      initialScrollDone.current = true;
    }
  }, [isLoading, groupedEvents]);

  // Função para rolar até uma data específica ao clicar no calendário
  const handleDateSelect = (date: Date) => {
    setActiveDate(date);

    const dateKey = format(date, 'yyyy-MM-dd');
    const element = dateRefs.current.get(dateKey);
    
    if (element) {
      isScrollingToDate.current = true;
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => { isScrollingToDate.current = false; }, 1000);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black text-white">
      <WeekSelector 
        activeDate={activeDate}
        onDateSelect={handleDateSelect}
        onPrevWeek={() => handleDateSelect(subWeeks(activeDate, 1))}
        onNextWeek={() => handleDateSelect(addWeeks(activeDate, 1))}
        eventDates={eventDates}
      />
      
      <main ref={listRef} className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="p-4 space-y-4">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        )}
        {isError && <Alert variant="destructive" className="m-4"><AlertTitle>Erro</AlertTitle><AlertDescription>Não foi possível carregar a agenda.</AlertDescription></Alert>}
        
        {!isLoading && !isError && Object.keys(groupedEvents).length > 0 ? (
          Object.entries(groupedEvents).map(([date, eventsOnDate]) => (
            <div 
              key={date} 
              ref={el => el && dateRefs.current.set(date, el)}
              data-date={date}
              className="p-4 space-y-4"
            >
              <h2 className="font-bold text-lg capitalize">
                {format(parseISO(date), "EEEE, dd 'de' MMMM", { locale: ptBR })}
              </h2>
              {eventsOnDate.map(event => <EventListItem key={event.id} event={event} />)}
            </div>
          ))
        ) : (
          !isLoading && <p className="text-neutral-500 text-center py-16">Nenhum evento agendado.</p>
        )}
      </main>
    </div>
  );
};

export default SchedulePage;
