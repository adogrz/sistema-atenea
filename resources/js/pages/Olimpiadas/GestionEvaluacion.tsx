
import React, { useState, useMemo } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { BreadcrumbItem } from '@/types';

const GestionEvaluacion = ({ olimpiadas, calificadores }) => {
    const [selectedOlimpiadaId, setSelectedOlimpiadaId] = useState<string | undefined>();
    const [selectedFaseId, setSelectedFaseId] = useState<string | undefined>();
    const [isAssignModalOpen, setAssignModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<any>(null);

    const selectedOlimpiada = useMemo(() => olimpiadas.find(o => o.id === Number(selectedOlimpiadaId)), [olimpiadas, selectedOlimpiadaId]);
    const selectedFase = useMemo(() => selectedOlimpiada?.fases.find(f => f.id === Number(selectedFaseId)), [selectedOlimpiada, selectedFaseId]);

    const { data, setData, post, processing, errors } = useForm({
        fase_olimpiada_id: '',
        item_definido_id: '',
        calificador_ids: [],
    });

    const openAssignModal = (item) => {
        setCurrentItem(item);
        setData({
            fase_olimpiada_id: String(selectedFase.id),
            item_definido_id: String(item.id),
            calificador_ids: item.calificadores.map(c => c.id),
        });
        setAssignModalOpen(true);
    };

    const handleAssignmentSubmit = (e) => {
        e.preventDefault();
        post(route('dashboard.asignaciones.syncForItem'), {
            onSuccess: () => {
                toast.success('Asignación guardada exitosamente.');
                setAssignModalOpen(false);
            },
            onError: (err) => {
                toast.error('Error al guardar la asignación.');
                console.error(err);
            },
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Olimpiadas', href: '/dashboard/olimpiadas' },
        { title: 'Gestión de Evaluación', href: '/dashboard/olimpiadas/gestion-evaluacion' }
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestión de Evaluación" />
            <div className="p-4 md:p-8">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold tracking-tight">Centro de Asignación de Evaluadores</h2>
                    <p className="text-muted-foreground">
                        Selecciona una olimpiada y una fase para asignar ítems a los calificadores.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <Select onValueChange={setSelectedOlimpiadaId} value={selectedOlimpiadaId}>
                        <SelectTrigger>
                            <SelectValue placeholder="1. Selecciona una Olimpiada" />
                        </SelectTrigger>
                        <SelectContent>
                            {olimpiadas.map(o => <SelectItem key={o.id} value={String(o.id)}>{o.nombre}</SelectItem>)}
                        </SelectContent>
                    </Select>

                    <Select onValueChange={setSelectedFaseId} value={selectedFaseId} disabled={!selectedOlimpiada}>
                        <SelectTrigger>
                            <SelectValue placeholder="2. Selecciona una Fase" />
                        </SelectTrigger>
                        <SelectContent>
                            {selectedOlimpiada?.fases.map(f => <SelectItem key={f.id} value={String(f.id)}>{f.nombre}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                {selectedFase ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>Ítems de la Fase: {selectedFase.nombre}</CardTitle>
                            <CardDescription>Asigna uno o más calificadores a cada ítem de la evaluación.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {selectedFase.items_definidos.map(item => (
                                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div>
                                            <p className="font-semibold">{item.nombre}</p>
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {item.calificadores.length > 0 ? (
                                                    item.calificadores.map(c => <Badge key={c.id} variant="secondary">{c.name}</Badge>)
                                                ) : (
                                                    <Badge variant="outline">Sin asignar</Badge>
                                                )}
                                            </div>
                                        </div>
                                        <Button variant="outline" onClick={() => openAssignModal(item)}>Asignar</Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="text-center py-12 text-muted-foreground">
                        <p>Por favor, selecciona una olimpiada y una fase para ver los ítems.</p>
                    </div>
                )}
            </div>

            <Dialog open={isAssignModalOpen} onOpenChange={setAssignModalOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Asignar Calificadores a: {currentItem?.nombre}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAssignmentSubmit}>
                        <div className="p-4">
                            <Command>
                                <CommandInput placeholder="Buscar calificador..." />
                                <CommandList>
                                    <CommandEmpty>No se encontraron calificadores.</CommandEmpty>
                                    <CommandGroup>
                                        {calificadores.map(calificador => (
                                            <CommandItem
                                                key={calificador.id}
                                                value={calificador.name}
                                                onSelect={() => {
                                                    const ids = data.calificador_ids;
                                                    const newIds = ids.includes(calificador.id)
                                                        ? ids.filter(id => id !== calificador.id)
                                                        : [...ids, calificador.id];
                                                    setData('calificador_ids', newIds);
                                                }}
                                            >
                                                <div className={`mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary ${data.calificador_ids.includes(calificador.id) ? 'bg-primary text-primary-foreground' : 'opacity-50 [&_svg]:invisible'}`}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                                                </div>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setAssignModalOpen(false)}>Cancelar</Button>
                            <Button type="submit" disabled={processing}>Guardar Asignación</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
};

export default GestionEvaluacion;
;