import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Edit, Trash2, Calendar, Clock, MapPin, Repeat, Users } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { EventVolunteerManager } from "./EventVolunteerManager";

type Event = {
  id: number;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string | null;
  location: string | null;
  is_all_day: boolean;
  recurrence_rule: string | null;
};

const weekDays = [
    { id: 'SU', label: 'D' }, { id: 'MO', label: 'S' }, { id: 'TU', label: 'T' },
    { id: 'WE', label: 'Q' }, { id: 'TH', label: 'Q' }, { id: 'FR', label: 'S' },
    { id: 'SA', label: 'S' }
];

const parseRecurrence = (rule: string | null) => {
    if (!rule) return { recurrenceType: 'none', weeklyDays: new Set<string>() };
    
    if (rule === 'monthly') return { recurrenceType: 'monthly', weeklyDays: new Set<string>() };

    if (rule.startsWith('FREQ=WEEKLY;BYDAY=')) {
        const days = rule.split('=')[2].split(',');
        return { recurrenceType: 'weekly', weeklyDays: new Set(days) };
    }
    
    return { recurrenceType: 'none', weeklyDays: new Set<string>() };
}

export const EventsManagement = () => {
    const { toast } = useToast();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [managingVolunteersEvent, setManagingVolunteersEvent] = useState<Event | null>(null);


    const [formData, setFormData] = useState({
        title: "",
        description: "",
        startDate: "",
        startTime: "",
        location: "",
        is_all_day: false,
        recurrenceType: "none",
        weeklyDays: new Set<string>(),
    });

    const fetchEvents = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .order('start_time', { ascending: true });
            if (error) throw error;
            setEvents(data || []);
        } catch (error: any) {
            toast({ title: "Erro", description: "Falha ao carregar eventos.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => { fetchEvents() }, [fetchEvents]);

    const resetForm = () => {
        setEditingEvent(null);
        setFormData({
            title: "", description: "", startDate: "", startTime: "", location: "",
            is_all_day: false, recurrenceType: "none", weeklyDays: new Set(),
        });
    };

    const handleEdit = (event: Event) => {
        setEditingEvent(event);
        const { recurrenceType, weeklyDays } = parseRecurrence(event.recurrence_rule);
        setFormData({
            title: event.title,
            description: event.description || "",
            startDate: format(parseISO(event.start_time), 'yyyy-MM-dd'),
            startTime: event.is_all_day ? "" : format(parseISO(event.start_time), 'HH:mm'),
            location: event.location || "",
            is_all_day: event.is_all_day,
            recurrenceType,
            weeklyDays,
        });
        setShowForm(true);
    };

    const handleSave = async () => {
        if (!formData.title || !formData.startDate) {
            toast({ title: "Erro de Validação", description: "Título e data de início são obrigatórios.", variant: "destructive" });
            return;
        }

        let recurrence_rule: string | null = null;
        if (formData.recurrenceType === 'weekly' && formData.weeklyDays.size > 0) {
            recurrence_rule = `FREQ=WEEKLY;BYDAY=${Array.from(formData.weeklyDays).join(',')}`;
        } else if (formData.recurrenceType === 'monthly') {
            recurrence_rule = 'monthly'; // Simples para exemplo
        }

        const start_time = `${formData.startDate}T${formData.startTime || '00:00:00'}`;

        const dataToSave = {
            title: formData.title,
            description: formData.description,
            start_time,
            location: formData.location,
            is_all_day: formData.is_all_day,
            recurrence_rule,
        };

        try {
            const { error } = editingEvent
                ? await supabase.from("events").update(dataToSave).eq("id", editingEvent.id)
                : await supabase.from("events").insert(dataToSave);

            if (error) throw error;
            
            toast({ title: "Sucesso!", description: `Evento ${editingEvent ? 'atualizado' : 'criado'} com sucesso.` });
            setShowForm(false);
            resetForm();
            fetchEvents();
        } catch (error: any) {
            toast({ title: "Erro ao Salvar", description: error.message, variant: "destructive" });
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Tem a certeza que deseja apagar este evento?")) return;
        try {
            await supabase.from("events").delete().eq("id", id);
            toast({ title: "Sucesso", description: "Evento apagado." });
            fetchEvents();
        } catch (error: any) {
            toast({ title: "Erro ao Apagar", description: error.message, variant: "destructive" });
        }
    };
    
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Agenda de Eventos</CardTitle>
                    <CardDescription>Crie e gira os eventos da igreja.</CardDescription>
                </div>
                <Button onClick={() => { resetForm(); setShowForm(true); }}>
                    <Plus className="mr-2 h-4 w-4" /> Novo Evento
                </Button>
            </CardHeader>
             <CardContent>
                {loading ? <Skeleton className="h-24 w-full" /> : events.length > 0 ? (
                    <div className="space-y-4">
                        {events.map(event => (
                            <Card key={event.id}>
                                <CardHeader>
                                    <CardTitle>{event.title}</CardTitle>
                                    <div className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 pt-1">
                                        {/* CORREÇÃO APLICADA AQUI */}
                                        <div className="flex items-center gap-1.5"><Calendar size={14} /> {format(parseISO(event.start_time), "dd 'de' LLLL 'de' yyyy", { locale: ptBR })}</div>
                                        {!event.is_all_day && <div className="flex items-center gap-1.5"><Clock size={14}/> {format(parseISO(event.start_time), "HH:mm")}</div>}
                                        {event.location && <div className="flex items-center gap-1.5"><MapPin size={14}/> {event.location}</div>}
                                        {event.recurrence_rule && <div className="flex items-center gap-1.5"><Repeat size={14}/> Recorrente</div>}
                                    </div>
                                </CardHeader>
                                {event.description && <CardContent><p className="text-sm">{event.description}</p></CardContent>}
                                <CardFooter className="flex justify-end gap-2">
                                    <Button variant="outline" size="sm" onClick={() => setManagingVolunteersEvent(event)}><Users size={16} className="mr-2"/> Voluntários</Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(event)}><Edit size={16}/></Button>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(event.id)}><Trash2 size={16}/></Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : <p className="text-sm text-center text-muted-foreground py-8">Nenhum evento agendado.</p>}
            </CardContent>

            <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{editingEvent ? "Editar" : "Novo"} Evento</DialogTitle>
                        <DialogDescription>Preencha os detalhes do evento abaixo.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4 grid gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Título do Evento</Label>
                            <Input id="title" value={formData.title} onChange={e => setFormData(p => ({...p, title: e.target.value}))}/>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="startDate">Data de Início</Label>
                                <Input id="startDate" type="date" value={formData.startDate} onChange={e => setFormData(p => ({...p, startDate: e.target.value}))}/>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="startTime">Hora de Início</Label>
                                <Input id="startTime" type="time" value={formData.startTime} onChange={e => setFormData(p => ({...p, startTime: e.target.value}))} disabled={formData.is_all_day}/>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox id="is_all_day" checked={formData.is_all_day} onCheckedChange={checked => setFormData(p => ({...p, is_all_day: !!checked}))}/>
                            <Label htmlFor="is_all_day">O dia todo</Label>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="location">Local</Label>
                            <Input id="location" value={formData.location} onChange={e => setFormData(p => ({...p, location: e.target.value}))}/>
                        </div>
                         <div className="space-y-2">
                            <Label>Recorrência</Label>
                            <Select value={formData.recurrenceType} onValueChange={(value) => setFormData(prev => ({ ...prev, recurrenceType: value, weeklyDays: new Set() }))}>
                                <SelectTrigger><SelectValue placeholder="Selecione a recorrência" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Não se repete</SelectItem>
                                    <SelectItem value="weekly">Semanalmente</SelectItem>
                                    <SelectItem value="monthly">Mensalmente</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {formData.recurrenceType === 'weekly' && (
                            <div className="space-y-2 rounded-md border p-4">
                                <Label>Repetir nos dias</Label>
                                <div className="flex justify-between gap-1 pt-2">
                                    {weekDays.map(day => (
                                        <div key={day.id} className="flex flex-col items-center gap-2">
                                            <Label htmlFor={day.id} className="text-xs">{day.label}</Label>
                                            <Checkbox
                                                id={day.id}
                                                checked={formData.weeklyDays.has(day.id)}
                                                onCheckedChange={(checked) => {
                                                    setFormData(prev => {
                                                        const newDays = new Set(prev.weeklyDays);
                                                        if (checked) newDays.add(day.id);
                                                        else newDays.delete(day.id);
                                                        return { ...prev, weeklyDays: newDays };
                                                    });
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="description">Descrição</Label>
                            <Textarea id="description" value={formData.description} onChange={e => setFormData(p => ({...p, description: e.target.value}))}/>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
                        <Button onClick={handleSave}>{editingEvent ? "Guardar Alterações" : "Criar Evento"}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {managingVolunteersEvent && (
                <EventVolunteerManager 
                    event={managingVolunteersEvent}
                    onClose={() => setManagingVolunteersEvent(null)}
                />
            )}
        </Card>
    );
};
