'use client';

import { QuickActions } from '@/components/dashboard/quick-actions';
import { RecentRecordsTable } from '@/components/dashboard/recent-records-table';
import { StatsCard } from '@/components/dashboard/stats-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Activity, FileHeart, Users } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

interface MedicalManagerDashboardProps {
    data: {
        total_records: number;
        consultations_this_month: number;
        professionals_count: number;
        recent_records: Array<{
            id: number;
            student_name: string;
            student_nie: string;
            doctor_name: string;
            created_at: string;
            consultations_count: number;
        }>;
        monthly_consultations: Array<{
            month: string;
            count: number;
        }>;
    };
}

const chartConfig = {
    count: {
        label: 'Consultas',
        color: 'var(--chart-1)',
    },
};

export function MedicalManagerDashboard({ data }: MedicalManagerDashboardProps) {
    const quickActions = [
        {
            title: 'Ver Todos los Expedientes',
            description: 'Accede al listado completo de expedientes médicos',
            icon: 'medical' as const,
            route: 'clinical-records.medical-records.index',
        },
        {
            title: 'Gestionar Asignaciones',
            description: 'Administra la asignación de doctores a estudiantes',
            icon: 'assignments' as const,
            route: 'clinical-records.assignments.index',
            variant: 'secondary' as const,
        },
    ];

    return (
        <div className="space-y-6">
            {/* Encabezado */}
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Dashboard Médico</h2>
                <p className="text-muted-foreground">Resumen general del módulo de expedientes médicos</p>
            </div>

            {/* Métricas principales */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <StatsCard title="Total de Expedientes" value={data.total_records} icon={FileHeart} description="Expedientes médicos activos" />
                <StatsCard
                    title="Consultas Este Mes"
                    value={data.consultations_this_month}
                    icon={Activity}
                    description="Consultas realizadas en el mes actual"
                />
                <StatsCard title="Doctores" value={data.professionals_count} icon={Users} description="Profesionales médicos activos" />
            </div>

            {/* Grid de 2 columnas */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Columna izquierda: Expedientes recientes */}
                <RecentRecordsTable
                    title="Expedientes Recientes"
                    description="Últimos expedientes médicos creados"
                    records={data.recent_records}
                    type="medical"
                    emptyMessage="No hay expedientes médicos registrados"
                />

                {/* Columna derecha: Gráfica de consultas */}
                <Card>
                    <CardHeader>
                        <CardTitle>Consultas Mensuales</CardTitle>
                        <CardDescription>Consultas médicas de los últimos 6 meses</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="h-[300px] w-full">
                            <BarChart data={data.monthly_consultations} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis dataKey="month" tickLine={false} axisLine={false} className="text-xs" />
                                <YAxis tickLine={false} axisLine={false} className="text-xs" />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Bar dataKey="count" fill="var(--chart-1)" radius={[8, 8, 0, 0]} />
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
