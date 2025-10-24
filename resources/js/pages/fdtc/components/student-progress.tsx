import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Calendar, Mail, MapPin, Phone, School } from 'lucide-react';

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
    const { participante } = usePage<{ participante: Participante }>().props;

    const BREADCRUMBS: BreadcrumbItem[] = [
        { title: 'Inicio', href: '/dashboard' },
        { title: 'Internado FDTC', href: '/dashboard/internado-fdtc/seleccion' },
        { title: 'Participantes', href: '/dashboard/internado-fdtc/participantes' },
        { title: participante.nombre, href: '#' },
    ];

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

                    {/* Sección de Progreso - Por implementar */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Progreso del Participante</CardTitle>
                            <CardDescription>Métricas y evaluaciones del internado</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed">
                                <p className="text-muted-foreground">
                                    Sección de progreso en desarrollo...
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}