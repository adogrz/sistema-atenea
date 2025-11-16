
import React, { useMemo } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { BreadcrumbItem } from '@/types';
import { Check } from 'lucide-react';

const ScoreEntry = ({ evaluacion, itemsEvaluados, assignedItemIds }) => {
    // Filter only assigned items for the form
    const assignedItems = itemsEvaluados.filter(item => assignedItemIds.includes(item.item_definido_id));
    const otherItems = itemsEvaluados.filter(item => !assignedItemIds.includes(item.item_definido_id));
    
    const { data, setData, put, processing, errors } = useForm({
        scores: assignedItems.map(item => ({
            item_evaluado_id: item.id,
            puntaje: item.puntaje || '',
        }))
    });

    const handleScoreChange = (index, value) => {
        const newScores = [...data.scores];
        newScores[index].puntaje = value;
        setData('scores', newScores);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validate and convert scores before submitting
        const validatedScores = data.scores.map(score => {
            const puntaje = parseFloat(score.puntaje);
            
            // Check if it's a valid number
            if (isNaN(puntaje) || score.puntaje === '' || score.puntaje === null) {
                toast.error('Todos los campos de puntaje deben tener un valor válido.');
                throw new Error('Invalid score');
            }
            
            // Check if it's greater than 0
            if (puntaje <= 0) {
                toast.error('Los puntajes deben ser mayores a 0.');
                throw new Error('Score must be greater than 0');
            }
            
            // Check if it's not greater than 10
            if (puntaje > 10) {
                toast.error('Los puntajes no pueden ser mayores a 10.');
                throw new Error('Score exceeds maximum');
            }
            
            return {
                ...score,
                puntaje: puntaje
            };
        });
        
        try {
            setData('scores', validatedScores);
            
            put(route('calificaciones.olimpiadas.update', { evaluacion: evaluacion.id }), {
                onSuccess: () => {
                    toast.success('Calificaciones guardadas exitosamente.');
                },
                onError: (err) => {
                    toast.error('Error al guardar las calificaciones.');
                    console.error(err);
                }
            });
        } catch (error) {
            // Validation error already shown via toast
            return;
        }
    };

    const totalScore = useMemo(() => {
        return data.scores.reduce((acc, score) => acc + (parseFloat(score.puntaje) || 0), 0);
    }, [data.scores]);

    // Define breadcrumbs for navigation
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Olimpiadas', href: route('calificaciones.olimpiadas.index') },
        { title: `Calificar a ${evaluacion.inscripcion.estudiante.nombre_completo}`, href: '#' }
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Calificar a ${evaluacion.inscripcion.estudiante.nombre_completo}`} />
            <div className="p-4 md:p-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Hoja de Calificación</CardTitle>
                        <CardDescription>
                            Estudiante: {evaluacion.inscripcion.estudiante.nombre_completo} <br />
                            Fase: {evaluacion.fase_olimpiada.nombre}
                        </CardDescription>
                        <div className="text-2xl font-bold text-right">Puntaje Total: {totalScore.toFixed(2)}</div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-medium text-primary mb-2">Ítems para Calificar</h3>
                                    <div className="space-y-4">
                                        {assignedItems.map((item, index) => {
                                            const formIndex = data.scores.findIndex(s => s.item_evaluado_id === item.id);
                                            const maxScore = Math.min(item.item_definido?.puntos_maximos || 10, 10);
                                            return (
                                                <div key={item.id} className="p-4 border rounded-lg">
                                                    <div className="flex items-center">
                                                        <Label htmlFor={`score-${item.id}`} className="font-semibold">{item.item_definido.nombre}</Label>
                                                        {data.scores[formIndex]?.puntaje && <Check className="h-5 w-5 text-green-500 ml-2" />}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">Puntaje Máximo: {maxScore}</p>
                                                    <Input
                                                        id={`score-${item.id}`}
                                                        type="number"
                                                        value={data.scores[formIndex]?.puntaje}
                                                        onChange={(e) => handleScoreChange(formIndex, e.target.value)}
                                                        className="mt-2 max-w-xs"
                                                        max={maxScore}
                                                        min="0"
                                                        step="0.1"
                                                        placeholder="Ingrese puntaje"
                                                    />
                                                    {errors[`scores.${formIndex}.puntaje`] && <p className="text-sm text-red-500 mt-1">{errors[`scores.${formIndex}.puntaje`]}</p>}
                                                </div>
                                            );
                                        })}
                                        {assignedItems.length === 0 && <p className="text-muted-foreground">No tienes ítems asignados en esta evaluación.</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-4 mt-8">
                                <Link href={route('calificaciones.olimpiadas.index')} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2">Volver al Listado</Link>
                                <Button type="submit" disabled={processing || assignedItems.length === 0}>
                                    {processing ? 'Guardando...' : 'Guardar Calificaciones'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
};

export default ScoreEntry;
