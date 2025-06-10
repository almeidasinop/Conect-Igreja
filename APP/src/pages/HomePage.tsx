import React from 'react';
import { BookOpen, Plus, Heart, Calendar } from 'lucide-react';

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
     <div className="flex-shrink-0 w-60 bg-[#1f1f1f] border border-neutral-800 rounded-xl p-4 shadow-lg">
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


export const HomePage = () => {
    return (
        <div className="pt-6 space-y-10">
            {/* Header com Carrossel */}
            <header className="h-48 mx-4 bg-neutral-800 rounded-2xl p-4 flex flex-col justify-end shadow-2xl">
                {/* Aqui ficaria o carrossel de imagens */}
                <h1 className="text-3xl font-bold">Igreja RIO</h1>
                <p className="text-sm text-neutral-300">Juazeiro</p>
            </header>

            {/* Ações Rápidas */}
            <section className="flex justify-around px-4">
                <QuickAction icon={BookOpen} label="Bíblia" />
                <QuickAction icon={Plus} label="Pedido" secondaryLabel="de oração" />
                <QuickAction icon={Heart} label="Envolva-se" />
                <QuickAction icon={Calendar} label="Horários" />
            </section>

            {/* Notícias */}
            <section>
                <SectionHeader title="Notícias" />
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide pl-4" style={{ WebkitOverflowScrolling: 'touch' }}>
                    <NewsCard imageUrl="https://placehold.co/160x96/1f1f1f/FFF?text=RIO" title="Empreendedores da RIO" subtitle="RIO EMPREENDE" />
                    <NewsCard imageUrl="https://placehold.co/160x96/1f1f1f/FFF?text=Templo" title="Inauguração do Novo Templo" subtitle="" />
                    <NewsCard imageUrl="https://placehold.co/160x96/1f1f1f/FFF?text=Ação" title="1º Ação Social da RIO" subtitle="Dia das Crianças" />
                    <div className="w-4 flex-shrink-0"></div> {/* Espaçamento final */}
                </div>
            </section>
            
            {/* Agenda */}
            <section>
                <SectionHeader title="Agenda" />
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide pl-4" style={{ WebkitOverflowScrolling: 'touch' }}>
                    <EventCard title="JANTAR DOS NAMORADOS" date="12/06/2025" />
                    <EventCard title="JUVENTUDE" date="14/06/2025" />
                    <EventCard title="CULTO DA FAMÍLIA" date="15/06/2025" />
                     <div className="w-4 flex-shrink-0"></div> {/* Espaçamento final */}
                </div>
            </section>

            {/* Vídeos */}
            <section>
                <SectionHeader title="Vídeos" />
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide pl-4" style={{ WebkitOverflowScrolling: 'touch' }}>
                    <ContentCard imageUrl="https://placehold.co/256x128/1f1f1f/FFF?text=BATISMO" date="07/12/2024" title="1º BATISMO DA RIO" />
                    <ContentCard imageUrl="https://placehold.co/256x128/1f1f1f/FFF?text=AÇÃO" date="03/11/2024" title="AÇÃO SOCIAL CRIANÇAS" />
                    <ContentCard imageUrl="https://placehold.co/256x128/1f1f1f/FFF?text=LIVE" date="20/10/2024" title="LIVE ESPECIAL" />
                    <div className="w-4 flex-shrink-0"></div> {/* Espaçamento final */}
                </div>
            </section>

            {/* Estudos */}
             <section>
                <SectionHeader title="Estudos" />
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide pl-4" style={{ WebkitOverflowScrolling: 'touch' }}>
                    <ContentCard imageUrl="https://placehold.co/256x128/1f1f1f/FFF?text=MILAGRE" date="10/05/2025" title="O PRIMEIRO MILAGRE DE JESUS" />
                    <ContentCard imageUrl="https://placehold.co/256x128/1f1f1f/FFF?text=T" date="22/03/2025" title="Epístola de Tito" />
                    <ContentCard imageUrl="https://placehold.co/256x128/1f1f1f/FFF?text=FÉ" date="15/02/2025" title="O QUE É A FÉ?" />
                    <div className="w-4 flex-shrink-0"></div> {/* Espaçamento final */}
                </div>
            </section>
        </div>
    );
};
