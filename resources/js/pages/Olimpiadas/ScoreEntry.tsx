
import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { BreadcrumbItem } from '@/type';
import { title } from 'process';

const ScoreEntry = ({ evaluacion, itemsEvaluados, assignedItemIds }) => {
    const { data, setData, put, processing, errors } = useForm({
        scores: itemsEvaluados.map(item => ({
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
        put(route('dashboard.calificaciones.olimpiadas.update', { evaluacion: evaluacion.id }), {
            onSuccess: () => {
                toast.success('Calificaciones guardadas exitosamente.');
            },
            onError: (err) => {
                toast.error('Error al guardar las calificaciones.');
                console.error(err);
            }
        });
    };

    const totalScore = useMemo(() => {
        return data.scores.reduce((acc, score) => acc + (parseFloat(score.puntaje) || 0), 0);
    }, [data.scores]);

    const assignedItems = itemsEvaluados.filter(item => assignedItemIds.includes(item.item_definido_id));
    const otherItems = itemsEvaluados.filter(item => !assignedItemIds.includes(item.item_definido_id));

    // Define breadcrumbs for navigation
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Olimpiadas', href: route('dashboard.calificaciones.olimpiadas.index') },
        { title: `Calificar a ${evaluacion.inscripcion.estudiante.nombre_completo}` }
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
                                    <h3 className="text-lg font-medium text-primary mb-2">Ítems Asignados para Calificar</h3>
                                    <div className="space-y-4">
                                        {assignedItems.map((item, index) => {
                                            const formIndex = data.scores.findIndex(s => s.item_evaluado_id === item.id);
                                            return (
                                                <div key={item.id} className="p-4 border rounded-lg">
                                                    <div className="flex items-center">
                                                        <Label htmlFor={`score-${item.id}`} className="font-semibold">{item.item_definido.nombre}</Label>
                                                        {data.scores[formIndex]?.puntaje && <Check className="h-5 w-5 text-green-500 ml-2" />}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">Puntaje Máximo: {item.item_definido.puntaje_maximo}</p>
                                                    <Input
                                                        id={`score-${item.id}`}
                                                        type="number"
                                                        value={data.scores[formIndex]?.puntaje || ''}
                                                        onChange={(e) => handleScoreChange(formIndex, e.target.value)}
                                                        className="mt-2 max-w-xs"
                                                        max={item.item_definido.puntaje_maximo}
                                                        min="0"
                                                    />
                                                    {errors[`scores.${formIndex}.puntaje`] && <p className="text-sm text-red-500 mt-1">{errors[`scores.${formIndex}.puntaje`]}</p>}
                                                </div>
                                            );
                                        })}
                                        {assignedItems.length === 0 && <p className="text-muted-foreground">No tienes ítems asignados en esta evaluación.</p>}
                                    </div>
                                </div>

                                {otherItems.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-medium text-muted-foreground mb-2">Otros Ítems (Solo Lectura)</h3>
                                        <div className="space-y-4">
                                            {otherItems.map(item => (
                                                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                                                    <div>
                                                        <p className="font-semibold">{item.item_definido.nombre}</p>
                                                        <p className="text-sm text-muted-foreground">Puntaje Máximo: {item.item_definido.puntaje_maximo}</p>
                                                    </div>
                                                    <p className="text-lg font-bold">{item.puntaje || '-'}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end space-x-4 mt-8">
                                <Link href={route('dashboard.calificaciones.olimpiadas.index')} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2">Volver al Listado</Link>
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
