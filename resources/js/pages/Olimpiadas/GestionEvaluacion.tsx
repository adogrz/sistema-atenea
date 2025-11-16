import React, { useState, useMemo, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ClipboardCheck, Users, FileCheck, Loader2 } from 'lucide-react';
import { BreadcrumbItem, CalificadorItemAsignado, ChartData, Olimpiada, DefinicionEvaluacion, User, FaseOlimpiada, ItemDefinido } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AllAssignmentsTab from './AllAssignmentsTab';
import { format, parseISO } from 'date-fns';
import { Label } from '@/components/ui/label';

interface GestionEvaluacionProps {
    olimpiadas: Olimpiada[];
    calificadores: User[];
    definicionesEvaluacion: DefinicionEvaluacion[];
    allAssignments: CalificadorItemAsignado[];
    chartsData: ChartData;
}

const GestionEvaluacion = ({ olimpiadas, calificadores, definicionesEvaluacion, allAssignments, chartsData }: GestionEvaluacionProps) => {

    const [selectedOlimpiadaId, setSelectedOlimpiadaId] = useState<string | undefined>();
    const [selectedFaseId, setSelectedFaseId] = useState<string | undefined>();
    const [isAssignModalOpen, setAssignModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<ItemDefinido | null>(null);
    const [isConfirmEvaluationChangeModalOpen, setIsConfirmEvaluationChangeModalOpen] = useState(false);

    const selectedOlimpiada = useMemo(() => olimpiadas.find(o => o.id === Number(selectedOlimpiadaId)), [olimpiadas, selectedOlimpiadaId]);
    const selectedFase = useMemo(() => selectedOlimpiada?.fases?.find(f => f.id === Number(selectedFaseId)), [selectedOlimpiada, selectedFaseId]);

    const definicionParaFase = useMemo(() => {
        // Prefer the definition object attached to the selectedFase (this one is populated
        // within the $olimpiadas structure and has item-level 'calificadores' populated),
        // otherwise fall back to the global list `definicionesEvaluacion`.
        if (!selectedFase || !selectedFase.definicion_evaluacion_id) {
            return null;
        }

        // If the phase already includes the definicion_evaluacion (eager loaded), use it
        if ((selectedFase as any).definicion_evaluacion) {
            return (selectedFase as any).definicion_evaluacion as DefinicionEvaluacion;
        }

        // Fallback: find in the provided definicionesEvaluacion array
        return definicionesEvaluacion.find(d => d.id === selectedFase.definicion_evaluacion_id) ?? null;
    }, [selectedFase, definicionesEvaluacion]);



    useEffect(() => {
        if (selectedFase) {
            setAssignEvaluationData('definicion_evaluacion_id', selectedFase.definicion_evaluacion?.id ? String(selectedFase.definicion_evaluacion.id) : undefined);
        } else {
            setAssignEvaluationData('definicion_evaluacion_id', undefined);
        }
    }, [selectedFase]);

    const { data: assignGraderData, setData: setAssignGraderData, post: postAssignGrader, processing: processingAssignGrader } = useForm({
        fase_olimpiada_id: '',
        item_definido_id: '',
        calificador_ids: [] as number[],
    });

    const { data: assignEvaluationData, setData: setAssignEvaluationData, post: postAssignEvaluation, processing: processingAssignEvaluation, errors: errorsAssignEvaluation } = useForm({
        definicion_evaluacion_id: undefined as string | undefined,
    });

    const openAssignModal = (item: ItemDefinido) => {
        setCurrentItem(item);
        setAssignGraderData({
            fase_olimpiada_id: String(selectedFase?.id),
            item_definido_id: String(item.id),
            calificador_ids: item.calificadores?.map(c => c.id) || [],
        });
        setAssignModalOpen(true);
    };

    const handleGraderAssignmentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        postAssignGrader(route('asignaciones.syncForItem'), {
            onSuccess: () => {
                toast.success('Asignación guardada exitosamente.');
                setAssignModalOpen(false);
                // Recargar la página para obtener los datos actualizados
                // Llamar a router.reload() sin 'only' para forzar la recarga completa de props
                router.reload();
            },
            onError: (err) => {
                toast.error('Error al guardar la asignación.');
                console.error(err);
            },
            preserveScroll: true,
        });
    };

    const handleAssignEvaluationSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dataToPost: any = { ...assignEvaluationData };
        // convert undefined/empty => null for backend
        if (!dataToPost.definicion_evaluacion_id) {
            dataToPost.definicion_evaluacion_id = null;
        }

        router.post(route('fases.gestion.assignEvaluation', { fase: selectedFase?.id }), {
            ...dataToPost,
        }, {
            onSuccess: () => {
                toast.success('Evaluación asignada exitosamente.');
                setIsConfirmEvaluationChangeModalOpen(false);
            },
            onError: (err) => {
                toast.error('Error al asignar la evaluación.');
                console.error(err);
            },
            preserveScroll: true,
            preserveState: true, // <-- Add this line
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Olimpiadas', href: route('olimpiadas.index') },
        { title: 'Gestión de Evaluación', href: route('gestion-evaluacion.index') }
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestión de Evaluación" />
            <div className="p-4 md:p-8">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold tracking-tight flex items-center"><ClipboardCheck className="mr-2 h-6 w-6" />Centro de Evaluaciones</h2>
                    <p className="text-muted-foreground mt-2">
                        Asigna rúbricas a las fases y calificadores a los ítems de evaluación.
                    </p>
                </div>

                <Tabs defaultValue="asignacion" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="asignacion">Asignación</TabsTrigger>
                        <TabsTrigger value="listado">Listado de Asignaciones</TabsTrigger>
                    </TabsList>

                    {/* Tab de Asignación */}
                    <TabsContent value="asignacion" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="space-y-2">
                                <Label htmlFor="olimpiada-select">Olimpiada</Label>
                                <Select onValueChange={setSelectedOlimpiadaId} value={selectedOlimpiadaId}>
                                    <SelectTrigger id="olimpiada-select">
                                        <SelectValue placeholder="Selecciona una Olimpiada" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {olimpiadas.map(o => <SelectItem key={o.id} value={String(o.id)}>{o.nombre}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="fase-select">Fase</Label>
                                <Select onValueChange={setSelectedFaseId} value={selectedFaseId} disabled={!selectedOlimpiada}>
                                    <SelectTrigger id="fase-select">
                                        <SelectValue placeholder="Selecciona una Fase" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {selectedOlimpiada?.fases && selectedOlimpiada.fases.length > 0 ? (
                                            selectedOlimpiada.fases.map(f => <SelectItem key={f.id} value={String(f.id)}>{f.nombre}</SelectItem>)
                                        ) : (
                                            <SelectItem value="no-fases" disabled>Esta olimpiada no tiene fases</SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {selectedFase ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Gestión para: {selectedFase.nombre} ({selectedOlimpiada?.tipo})</CardTitle>
                                    <CardDescription>
                                        {selectedFase.fecha_inicio && selectedFase.fecha_fin ? (
                                            `Fechas: ${format(parseISO(selectedFase.fecha_inicio), 'dd/MM/yyyy')} - ${format(parseISO(selectedFase.fecha_fin), 'dd/MM/yyyy')}. `
                                        ) : ''}
                                        Asigna una evaluación y luego los calificadores a sus ítems.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Asignar Evaluación */}
                                    <div className="p-4 border rounded-lg">
                                        <h3 className="font-medium mb-2">Asignar Rúbrica de Evaluación</h3>
                                        <div className="flex items-center space-x-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="rubrica-select">Rúbrica</Label>
                                                <Select
                                                    onValueChange={(value) => setAssignEvaluationData('definicion_evaluacion_id', value)}
                                                    value={assignEvaluationData.definicion_evaluacion_id}
                                                >
                                                    <SelectTrigger id="rubrica-select" className="w-[350px]">
                                                        <SelectValue placeholder="Selecciona una rúbrica" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="null">Quitar evaluación</SelectItem>
                                                        {definicionesEvaluacion.map(def => <SelectItem key={def.id} value={String(def.id)}>{def.nombre} (v{def.version})</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <Button
                                                onClick={() => setIsConfirmEvaluationChangeModalOpen(true)}
                                                disabled={processingAssignEvaluation}
                                            >
                                                {definicionParaFase ? 'Actualizar' : 'Asignar'}
                                            </Button>
                                        </div>
                                        {errorsAssignEvaluation.definicion_evaluacion_id && <p className='text-sm text-red-500 mt-2'>{errorsAssignEvaluation.definicion_evaluacion_id}</p>}
                                    </div>

                                    {/* Asignar Calificadores */}
                                    {definicionParaFase ? (
                                        <div className="p-4 border rounded-lg">
                                            <h3 className="font-medium">Asignar Calificadores a Ítems</h3>
                                            <div className='text-sm text-muted-foreground mb-4 space-y-1 mt-2'>
                                                <p>Rúbrica: <strong>{definicionParaFase.nombre}</strong></p>
                                                <p>Descripción: {definicionParaFase.descripcion}</p>
                                                <p>Total de Ítems: {definicionParaFase.items_definidos?.length || 0}</p>
                                            </div>
                                            <div className="space-y-3">
                                                {definicionParaFase.items_definidos?.length > 0 ? (
                                                    definicionParaFase.items_definidos.map(item => {
                                                        const assignedCount = allAssignments.filter(a => a.fase_olimpiada_id === selectedFase?.id && a.item_definido_id === item.id).length;
                                                        return (
                                                            <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg bg-secondary/20">
                                                                <div className="flex-1">
                                                                    <p className="font-semibold">{item.nombre}</p>
                                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                                        {assignedCount > 0 ? (
                                                                            <Badge variant="secondary">Asignado ({assignedCount})</Badge>
                                                                        ) : (
                                                                            <Badge variant="outline">Sin asignar</Badge>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <Button variant="outline" onClick={() => openAssignModal(item)}><Users className="mr-2 h-4 w-4" />Asignar</Button>
                                                            </div>
                                                        );
                                                    })
                                                ) : (
                                                    <p className="text-muted-foreground">Esta rúbrica no tiene ítems definidos.</p>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 text-muted-foreground">
                                            <p>Asigna una rúbrica a esta fase para poder asignar calificadores.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                <p>Por favor, selecciona una olimpiada y una fase para empezar.</p>
                            </div>
                        )}
                    </TabsContent>

                    {/* Tab de Visualización */}
                    <TabsContent value="listado">
                        <AllAssignmentsTab allAssignments={allAssignments} chartsData={chartsData} />
                    </TabsContent>
                </Tabs>
            </div>

            {/* Modal de Confirmación para Asignación/Cambio de Evaluación */}
            <Dialog open={isConfirmEvaluationChangeModalOpen} onOpenChange={setIsConfirmEvaluationChangeModalOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center"><FileCheck className="mr-2 h-5 w-5" />Confirmar Acción</DialogTitle>
                        <DialogDescription>
                            Confirma los cambios en la asignación de rúbrica de evaluación.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAssignEvaluationSubmit} className="p-4">
                        <p>¿Estás seguro de que deseas actualizar la rúbrica para la fase <strong>{selectedFase?.nombre}</strong>?</p>
                        <DialogFooter className="mt-6">
                            <Button type="button" variant="outline" onClick={() => setIsConfirmEvaluationChangeModalOpen(false)}>Cancelar</Button>
                            <Button type="submit" disabled={processingAssignEvaluation}>Confirmar</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal de Asignación de Calificadores */}
            <Dialog open={isAssignModalOpen} onOpenChange={setAssignModalOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center"><Users className="mr-2 h-5 w-5" />Asignar Calificadores a: {currentItem?.nombre}</DialogTitle>
                        <DialogDescription>
                            Selecciona los calificadores que evaluarán este ítem.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleGraderAssignmentSubmit} className="p-4">
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
                                                    const ids = assignGraderData.calificador_ids;
                                                    const newIds = ids.includes(calificador.id)
                                                        ? ids.filter(id => id !== calificador.id)
                                                        : [...ids, calificador.id];
                                                    setAssignGraderData('calificador_ids', newIds);
                                                }}
                                            >
                                                <div className={`mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary ${assignGraderData.calificador_ids.includes(calificador.id) ? 'bg-primary text-primary-foreground' : 'opacity-50 [&_svg]:invisible'}`}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                                                </div>
                                                <span>{calificador.name}</span>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setAssignModalOpen(false)}>Cancelar</Button>
                            <Button type="submit" disabled={processingAssignGrader}>Guardar Asignación</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
};

export default GestionEvaluacion;