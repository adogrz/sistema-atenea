import React from 'react';
import { useForm, Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

interface StudentScore {
    id: number;
    nombre_completo: string;
    evaluacion_id: number;
    score: number | null;
}

interface Assignment {
    item_definido_id: number;
    item_nombre: string;
    fase_nombre: string;
    olimpiada_nombre: string;
    puntos_maximos: number;
    students: StudentScore[];
}

interface CalificacionesIndexProps {
    assignments: Assignment[];
}

const Index: React.FC<CalificacionesIndexProps> = ({ assignments }) => {
    const { data, setData, post, processing, errors } = useForm({
        scores: assignments.flatMap(assignment => 
            assignment.students.map(student => ({
                evaluacion_id: student.evaluacion_id,
                item_definido_id: assignment.item_definido_id,
                score: student.score ?? '',
            }))
        )
    });

    const handleScoreChange = (assignmentIndex: number, studentIndex: number, score: string) => {
        const overallIndex = assignments.slice(0, assignmentIndex).reduce((acc, asgn) => acc + asgn.students.length, 0) + studentIndex;
        const newScores = [...data.scores];
        newScores[overallIndex].score = score;
        setData('scores', newScores);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('calificaciones.store'), {
            onSuccess: () => {
                toast.success('Calificaciones guardadas exitosamente.');
            },
            onError: () => {
                toast.error('Error al guardar las calificaciones.');
            }
        });
    };

    return (
        <AppLayout>
            <Head title="Ingresar Calificaciones" />
            <div className="p-4 md:p-8">
                <h1 className="text-2xl font-bold tracking-tight mb-6">Ingresar Calificaciones</h1>
                
                {assignments.length > 0 ? (
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {assignments.map((assignment, assignmentIndex) => (
                            <Card key={assignment.item_definido_id}>
                                <CardHeader>
                                    <CardTitle>{assignment.olimpiada_nombre} - {assignment.fase_nombre}</CardTitle>
                                    <p className="text-muted-foreground">Calificando: {assignment.item_nombre} (Máx: {assignment.puntos_maximos} pts)</p>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Estudiante</TableHead>
                                                <TableHead className="w-40">Puntaje</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {assignment.students.map((student, studentIndex) => {
                                                const overallIndex = assignments.slice(0, assignmentIndex).reduce((acc, asgn) => acc + asgn.students.length, 0) + studentIndex;
                                                return (
                                                    <TableRow key={student.id}>
                                                        <TableCell>{student.nombre_completo}</TableCell>
                                                        <TableCell>
                                                            <Input
                                                                type="number"
                                                                value={data.scores[overallIndex].score}
                                                                onChange={(e) => handleScoreChange(assignmentIndex, studentIndex, e.target.value)}
                                                                max={assignment.puntos_maximos}
                                                                min={0}
                                                                className="max-w-xs"
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            })}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        ))}
                        <div className="flex justify-end">
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Guardando...' : 'Guardar Todas las Calificaciones'}
                            </Button>
                        </div>
                    </form>
                ) : (
                    <p>No tienes items asignados para calificar.</p>
                )}
            </div>
        </AppLayout>
    );
};

export default Index;
