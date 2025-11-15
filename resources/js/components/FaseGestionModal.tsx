import React, { useState, useEffect } from 'react';
import { FaseOlimpiada } from '@/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useForm } from '@inertiajs/react';
import { CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import FormField from '@/components/ui/form-field';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface FaseGestionModalProps {
    isOpen: boolean;
    onClose: () => void;
    fase: FaseOlimpiada | null;
    onUpdate: (updatedFase: FaseOlimpiada) => void;
}

export const FaseGestionModal: React.FC<FaseGestionModalProps> = ({ isOpen, onClose, fase, onUpdate }) => {
    const { data, setData, put, processing, errors, reset } = useForm({
        cupos: 0,
        nota_minima_aprobacion: 6.0,
        fecha_inicio: '',
        fecha_fin: '',
    });

    useEffect(() => {
        if (fase) {
            setData({
                cupos: fase.cupos || 0,
                nota_minima_aprobacion: fase.nota_minima_aprobacion || 6.0,
                fecha_inicio: fase.fecha_inicio ? format(new Date(fase.fecha_inicio), 'yyyy-MM-dd') : '',
                fecha_fin: fase.fecha_fin ? format(new Date(fase.fecha_fin), 'yyyy-MM-dd') : '',
            });
        } else {
            reset();
        }
    }, [fase, isOpen]);

    const handleUpdateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!fase) return;

        put(route('fases.gestion.update', { fase: fase.id }), {
            onSuccess: () => {
                toast.success('Fase actualizada exitosamente.');
                onClose();
                // Optionally, call onUpdate with the new data if needed for parent state
                // onUpdate({ ...fase, ...data });
            },
            onError: () => {
                toast.error('Error al actualizar la fase.');
            },
            preserveScroll: true,
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Gestionar Fase: {fase?.nombre}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleUpdateSubmit} className="mt-4 space-y-4">
                    <FormField label="Cupos" error={errors.cupos}>
                        <Input
                            type="number"
                            value={data.cupos}
                            onChange={(e) => setData('cupos', parseInt(e.target.value))}
                            min={0}
                        />
                    </FormField>
                    <FormField label="Nota Mínima de Aprobación" error={errors.nota_minima_aprobacion}>
                        <Input
                            type="number"
                            step="0.1"
                            value={data.nota_minima_aprobacion}
                            onChange={(e) => setData('nota_minima_aprobacion', parseFloat(e.target.value))}
                            min={0}
                        />
                    </FormField>
                    <FormField label="Fecha de Inicio" error={errors.fecha_inicio}>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !data.fecha_inicio && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {data.fecha_inicio ? format(new Date(data.fecha_inicio), "PPP") : <span className="text-muted-foreground">Seleccionar fecha</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={data.fecha_inicio ? new Date(data.fecha_inicio) : undefined}
                                    onSelect={(date) => setData('fecha_inicio', date ? format(date, 'yyyy-MM-dd') : '')}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </FormField>
                    <FormField label="Fecha de Fin" error={errors.fecha_fin}>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !data.fecha_fin && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {data.fecha_fin ? format(new Date(data.fecha_fin), "PPP") : <span className="text-muted-foreground">Seleccionar fecha</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={data.fecha_fin ? new Date(data.fecha_fin) : undefined}
                                    onSelect={(date) => setData('fecha_fin', date ? format(date, 'yyyy-MM-dd') : '')}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </FormField>
                    <DialogFooter className="mt-4">
                        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" disabled={processing}>Actualizar Fase</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};