'use client';

import { QuickActions } from '@/components/dashboard/quick-actions';
import { StatsCard } from '@/components/dashboard/stats-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { router } from '@inertiajs/react';
import { Activity, Eye, Plus, Users } from 'lucide-react';

interface Assignment {
    id: number;
    student_nie: string;
    student_name: string;
    has_record: boolean;
    record_id: number | null;
    assigned_at: string;
    last_session: string | null;
}

interface PsychologistDashboardProps {
    data: {
        assigned_students: number;
        sessions_this_month: number;
        my_assignments: Assignment[];
    };
}

export function PsychologistDashboard({ data }: PsychologistDashboardProps) {
    const quickActions = [
        {
            title: 'Ver Mis Asignaciones',
            description: 'Lista completa de estudiantes asignados',
            icon: 'assignments' as const,
            route: 'clinical-records.assignments.index',
        },
    ];

    const handleViewRecord = (recordId: number) => {
        router.get(route('clinical-records.psychological-records.show', recordId));
    };

    const handleCreateRecord = (studentNie: string) => {
        router.get(route('clinical-records.psychological-records.create'), {
            student_nie: studentNie,
        });
    };

    return (
        <div className="space-y-6">
            {/* Encabezado */}
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Mi Dashboard Psicológico</h2>
                <p className="text-muted-foreground">Resumen de tus estudiantes asignados y sesiones</p>
            </div>

            {/* Métricas principales */}
            <div className="grid gap-4 md:grid-cols-2">
                <StatsCard
                    title="Estudiantes Asignados"
                    value={data.assigned_students}
                    icon={Users}
                    description="Estudiantes bajo tu responsabilidad"
                />
                <StatsCard
                    title="Sesiones Este Mes"
                    value={data.sessions_this_month}
                    icon={Activity}
                    description="Sesiones realizadas en el mes actual"
                />
            </div>

            {/* Lista de asignaciones */}
            <Card>
                <CardHeader>
                    <CardTitle>Mis Estudiantes Asignados</CardTitle>
                    <CardDescription>Últimos 10 estudiantes asignados (acceso rápido)</CardDescription>
                </CardHeader>
                <CardContent>
                    {data.my_assignments.length === 0 ? (
                        <div className="py-8 text-center text-muted-foreground">No tienes estudiantes asignados actualmente</div>
                    ) : (
                        <div className="space-y-3">
                            {data.my_assignments.map((assignment) => (
                                <div
                                    key={assignment.id}
                                    className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-medium">{assignment.student_name}</p>
                                            <span className="text-xs text-muted-foreground">NIE: {assignment.student_nie}</span>
                                            {!assignment.has_record && (
                                                <span className="rounded bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                                    Sin expediente
                                                </span>
                                            )}
                                        </div>
                                        <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                                            <span>Asignado: {assignment.assigned_at}</span>
                                            {assignment.last_session && (
                                                <>
                                                    <span>•</span>
                                                    <span>Última sesión: {assignment.last_session}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {assignment.has_record && assignment.record_id ? (
                                            <Button variant="ghost" size="sm" onClick={() => handleViewRecord(assignment.record_id!)}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                Ver Expediente
                                            </Button>
                                        ) : (
                                            <Button variant="outline" size="sm" onClick={() => handleCreateRecord(assignment.student_nie)}>
                                                <Plus className="mr-2 h-4 w-4" />
                                                Crear Expediente
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Acciones rápidas */}
            <QuickActions actions={quickActions} />
        </div>
    );
}
