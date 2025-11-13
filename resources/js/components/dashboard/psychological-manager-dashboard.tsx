'use client';

import { QuickActions } from '@/components/dashboard/quick-actions';
import { RecentRecordsTable } from '@/components/dashboard/recent-records-table';
import { StatsCard } from '@/components/dashboard/stats-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Activity, Brain, Users } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

interface PsychologicalManagerDashboardProps {
    data: {
        total_records: number;
        sessions_this_month: number;
        professionals_count: number;
        recent_records: Array<{
            id: number;
            student_name: string;
            student_nie: string;
            psychologist_name: string;
            created_at: string;
            sessions_count: number;
        }>;
        monthly_sessions: Array<{
            month: string;
            count: number;
        }>;
    };
}

const chartConfig = {
    count: {
        label: 'Sesiones',
        color: 'hsl(var(--chart-2))',
    },
};

export function PsychologicalManagerDashboard({ data }: PsychologicalManagerDashboardProps) {
    const quickActions = [
        {
            title: 'Ver Todos los Expedientes',
            description: 'Accede al listado completo de expedientes psicológicos',
            icon: 'psychological' as const,
            route: 'clinical-records.psychological-records.index',
        },
        {
            title: 'Gestionar Asignaciones',
            description: 'Administra la asignación de psicólogos a estudiantes',
            icon: 'assignments' as const,
            route: 'clinical-records.assignments.index',
            variant: 'secondary' as const,
        },
    ];

    return (
        <div className="space-y-6">
            {/* Encabezado */}
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Dashboard Psicológico</h2>
                <p className="text-muted-foreground">Resumen general del módulo de expedientes psicológicos</p>
            </div>

            {/* Métricas principales */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <StatsCard title="Total de Expedientes" value={data.total_records} icon={Brain} description="Expedientes psicológicos activos" />
                <StatsCard
                    title="Sesiones Este Mes"
                    value={data.sessions_this_month}
                    icon={Activity}
                    description="Sesiones realizadas en el mes actual"
                />
                <StatsCard title="Psicólogos" value={data.professionals_count} icon={Users} description="Profesionales psicológicos activos" />
            </div>

            {/* Grid de 2 columnas */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Columna izquierda: Expedientes recientes */}
                <RecentRecordsTable
                    title="Expedientes Recientes"
                    description="Últimos expedientes psicológicos creados"
                    records={data.recent_records}
                    type="psychological"
                    emptyMessage="No hay expedientes psicológicos registrados"
                />

                {/* Columna derecha: Gráfica de sesiones */}
                <Card>
                    <CardHeader>
                        <CardTitle>Sesiones Mensuales</CardTitle>
                        <CardDescription>Sesiones psicológicas de los últimos 6 meses</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="h-[300px] w-full">
                            <BarChart data={data.monthly_sessions} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis dataKey="month" tickLine={false} axisLine={false} className="text-xs" />
                                <YAxis tickLine={false} axisLine={false} className="text-xs" />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Bar dataKey="count" fill="var(--chart-4)" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Acciones rápidas */}
            <QuickActions actions={quickActions} />
        </div>
    );
}
