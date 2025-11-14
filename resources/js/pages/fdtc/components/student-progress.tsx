import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Calendar, Mail, MapPin, Phone, School } from 'lucide-react';
import { useMemo } from 'react';
import type { PageProps as InertiaPageProps } from '@inertiajs/core';

interface Participante {
    id: number;
    codigo: string;
    nombre: string;
    email: string;
    telefono: string;
    centro_educativo: string;
    nivel_educativo: string;
    sede_name: string;
    sede_description?: string;
    estado: 'activo' | 'completado' | 'retirado' | 'suspendido';
    fecha_ingreso: string;
    dias_en_internado: number;
}
interface PageProps extends InertiaPageProps {
    participante: Participante;
    materias_stats: MateriaStat[];
}
interface MateriaStat {
    materia_id: number;
    materia: string;
    codigo: string;
    evaluaciones_count: number;
    peso_total: number; // suma de pesos de las evaluaciones de esa materia
    promedio: number;   // promedio de notas del estudiante en esa materia
    detalle: Array<{
        evaluacion_id: number;
        nombre: string;
        fecha?: string | null;
        peso_porcentual: number;
        nota_maxima: number;
        nota: number | null;
    }>;
}

interface PageProps {
    participante: Participante;
    materias_stats: MateriaStat[];
}

const getEstadoBadge = (estado: string) => {
    const variants: Record<
        string,
        { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string; className?: string }
    > = {
        activo: { variant: 'default', label: 'Activo', className: 'bg-green-600 hover:bg-green-700' },
        completado: { variant: 'secondary', label: 'Completado', className: 'bg-blue-600 hover:bg-blue-700' },
        retirado: { variant: 'destructive', label: 'Retirado' },
        suspendido: { variant: 'outline', label: 'Suspendido' },
    };

    const config = variants[estado] || variants.activo;
    return (
        <Badge variant={config.variant} className={config.className}>
            {config.label}
        </Badge>
    );
};

export default function ParticipantProgress() {
    const { participante, materias_stats } = usePage<PageProps>().props;

    const BREADCRUMBS: BreadcrumbItem[] = [
        { title: 'Inicio', href: '/dashboard' },
        { title: 'Internado FDTC', href: '/dashboard/internado-fdtc/seleccion' },
        { title: 'Participantes', href: '/dashboard/internado-fdtc/participantes' },
        { title: participante.nombre, href: '#' },
    ];

    const resumen = useMemo(() => {
        const materias = materias_stats?.length || 0;
        const evaluaciones = materias_stats?.reduce((s, m) => s + (m.evaluaciones_count || 0), 0) || 0;
        const promedioGeneral = materias_stats && materias_stats.length > 0
            ? materias_stats.reduce((s, m) => s + (Number(m.promedio) || 0), 0) / materias_stats.length
            : 0;
        return { materias, evaluaciones, promedioGeneral };
    }, [materias_stats]);

    return (
        <AppLayout breadcrumbs={BREADCRUMBS}>
            <Head title={`Progreso - ${participante.nombre}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="admin-panel">
                    {/* Header */}
                    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <div className="mb-2 flex items-center gap-2">
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href="/dashboard/internado-fdtc/participantes">
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Volver
                                    </Link>
                                </Button>
                            </div>
                            <h1 className="text-3xl font-bold">{participante.nombre}</h1>
                            <div className="mt-2 flex items-center gap-2">
                                <span className="font-mono text-sm text-muted-foreground">{participante.codigo}</span>
                                {getEstadoBadge(participante.estado)}
                            </div>
                        </div>
                    </div>

                    {/* Información del Participante */}
                    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Información de Contacto</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span>{participante.email}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span>{participante.telefono}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span>{participante.sede_description || participante.sede_name}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Información Académica</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <School className="h-4 w-4 text-muted-foreground" />
                                    <span>{participante.centro_educativo}</span>
                                </div>
                                <div className="text-sm">
                                    <span className="font-medium">Nivel: </span>
                                    <span>{participante.nivel_educativo}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Estado del Internado</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span>Ingreso: {participante.fecha_ingreso}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Resumen */}
                    <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm">Materias</CardTitle>
                                <CardDescription>Con evaluaciones registradas</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{resumen.materias}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm">Evaluaciones</CardTitle>
                                <CardDescription>Totales calificadas/asignadas</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{resumen.evaluaciones}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm">Promedio General</CardTitle>
                                <CardDescription>Promedio por materia</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{Number(resumen.promedioGeneral || 0).toFixed(1)}</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Progreso por Materia */}
                    {(!materias_stats || materias_stats.length === 0) ? (
                        <Card>
                            <CardContent className="flex h-48 items-center justify-center">
                                <p className="text-muted-foreground">Aún no hay calificaciones para mostrar.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                            {materias_stats.map((m) => (
                                <Card key={m.materia_id}>
                                    <CardHeader>
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <CardTitle className="text-lg">
                                                    {m.materia} <span className="text-muted-foreground">({m.codigo})</span>
                                                </CardTitle>
                                                <CardDescription>
                                                    Promedio: <span className="font-medium text-foreground">{Number(m.promedio || 0).toFixed(1)}</span> | 
                                                    Evaluaciones: {m.evaluaciones_count} | 
                                                    Peso acumulado: {Number(m.peso_total || 0).toFixed(1)}%
                                                </CardDescription>
                                            </div>
                                            <Badge variant={Number(m.peso_total) === 100 ? 'secondary' : 'outline'}>
                                                {Number(m.peso_total || 0).toFixed(1)}%
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {/* Barra de peso total */}
                                        <div className="mb-4">
                                            <div className="h-2 w-full rounded bg-muted">
                                                <div
                                                    className={`h-2 rounded ${Number(m.peso_total) === 100 ? 'bg-green-600' : 'bg-yellow-600'}`}
                                                    style={{ width: `${Math.min(Number(m.peso_total || 0), 100)}%` }}
                                                />
                                            </div>
                                            {Number(m.peso_total) !== 100 && Number(m.peso_total) > 0 && (
                                                <p className="mt-1 text-xs text-yellow-700 dark:text-yellow-400">Advertencia: el peso no suma 100%</p>
                                            )}
                                        </div>

                                        {/* Detalle de evaluaciones */}
                                        <div className="overflow-x-auto">
                                            <table className="w-full table-fixed border-collapse text-sm">
                                                <thead>
                                                    <tr className="text-left">
                                                        <th className="w-[48%] border-b p-2">Evaluación</th>
                                                        <th className="w-[18%] border-b p-2">Fecha</th>
                                                        <th className="w-[16%] border-b p-2">Peso</th>
                                                        <th className="w-[18%] border-b p-2">Nota</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {m.detalle.map((d) => (
                                                        <tr key={d.evaluacion_id} className="hover:bg-muted/50">
                                                            <td className="border-b p-2">
                                                                <span className="font-medium">{d.nombre}</span>
                                                            </td>
                                                            <td className="border-b p-2">{d.fecha || '-'}</td>
                                                            <td className="border-b p-2">{Number(d.peso_porcentual).toFixed(1)}%</td>
                                                            <td className="border-b p-2">
                                                                {d.nota === null || d.nota === undefined
                                                                    ? <span className="text-muted-foreground">Sin nota</span>
                                                                    : `${Number(d.nota).toFixed(1)} / ${Number(d.nota_maxima).toFixed(1)}`}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}