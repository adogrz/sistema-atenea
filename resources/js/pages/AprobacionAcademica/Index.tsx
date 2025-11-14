import React, { useState, useMemo } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { PageProps, OlimpiadaAprobacionFinal, Area, Grupo, BreadcrumbItem } from '@/types';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { copyToClipboard } from '@/lib/utils';
import { Download, Mail, Award, CheckCircle2, XCircle } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';

interface AprobacionAcademicaIndexProps extends PageProps {
    aprobaciones: OlimpiadaAprobacionFinal[];
    areas: Area[];
    grupos: Grupo[];
}

const StudentInfoPopover: React.FC<{ aprobacion: OlimpiadaAprobacionFinal }> = ({ aprobacion }) => (
    <Popover>
        <PopoverTrigger asChild>
            <Button variant="link" className="h-auto p-0 font-mono">
                {aprobacion.estudiante.codigo}
            </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
            <div className="grid gap-4">
                <div className="space-y-2">
                    <h4 className="font-medium leading-none">{aprobacion.estudiante.nombre_completo}</h4>
                    <p className="text-sm text-muted-foreground">{aprobacion.estudiante.user.email}</p>
                </div>
                <div className="text-sm">
                    <p><span className="font-semibold">Código:</span> {aprobacion.estudiante.codigo}</p>
                    <p><span className="font-semibold">Olimpiada:</span> {aprobacion.olimpiada.nombre}</p>
                    <p><span className="font-semibold">Fase:</span> {aprobacion.fase.nombre}</p>
                    <p><span className="font-semibold">Grupo Asignado:</span> {aprobacion.grupo?.nombre || 'N/A'}</p>
                </div>
            </div>
        </PopoverContent>
    </Popover>
);

const Index: React.FC<AprobacionAcademicaIndexProps> = ({ aprobaciones: initialAprobaciones, areas, grupos }) => {
    const [selectedAreaId, setSelectedAreaId] = useState<string>('all');
    const [selectedPsicologica, setSelectedPsicologica] = useState<string>('all');
    const [selectedAprobaciones, setSelectedAprobaciones] = useState<OlimpiadaAprobacionFinal[]>([]);

    const filteredAprobaciones = useMemo(() => {
        let filtered = initialAprobaciones;

        if (selectedAreaId !== 'all') {
            filtered = filtered.filter(aprobacion => aprobacion.olimpiada.area_id === Number(selectedAreaId));
        }

        if (selectedPsicologica !== 'all') {
            const approved = selectedPsicologica === 'aprobado';
            filtered = filtered.filter(aprobacion => aprobacion.estudiante.prueba_psicologica_aprobada === approved);
        }

        return filtered;
    }, [initialAprobaciones, selectedAreaId, selectedPsicologica]);

    const handleAssignGroup = (aprobacionId: number, grupoId: string) => {
        router.put(route('aprobacion-academica.update', aprobacionId), { grupo_id: grupoId }, {
            onSuccess: () => toast.success('Grupo asignado exitosamente.'),
            onError: () => toast.error('Error al asignar grupo.'),
        });
    };

    const handleGenerateCodes = () => {
        if (selectedAprobaciones.length === 0) {
            toast.error('Selecciona al menos un estudiante para generar códigos.');
            return;
        }
        router.post(route('aprobacion-academica.generateCodes'), { aprobacion_ids: selectedAprobaciones.map(a => a.id) }, {
            onSuccess: () => toast.success('Códigos generados exitosamente.'),
            onError: () => toast.error('Error al generar códigos.'),
        });
    };

    const handleGetEmails = () => {
        if (selectedAprobaciones.length === 0) {
            toast.error('Selecciona al menos un estudiante para obtener correos.');
            return;
        }
        router.get(route('aprobacion-academica.getEmails'), { aprobacion_ids: selectedAprobaciones.map(a => a.id) }, {
            preserveState: true,
            onSuccess: (page: any) => {
                const emails = page.props.jetstream.flash?.emails || page.props.emails;
                if (emails && emails.length > 0) {
                    copyToClipboard(emails.join(', '));
                    toast.success(`Se copiaron ${emails.length} correos al portapapeles.`)
                } else {
                    toast.info('No se encontraron correos para los estudiantes seleccionados.');
                }
            },
            onError: () => toast.error('Error al obtener los correos.'),
        });
    };

    const columns: ColumnDef<OlimpiadaAprobacionFinal>[] = useMemo(() => [
        {
            id: "select",
            header: ({ table }) => (
                <input
                    type="checkbox"
                    checked={table.getIsAllPageRowsSelected()}
                    onChange={(event) => {
                        table.toggleAllPageRowsSelected(event.target.checked);
                        setSelectedAprobaciones(event.target.checked ? filteredAprobaciones : []);
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 shadow-sm focus:ring-primary-500"
                />
            ),
            cell: ({ row }) => (
                <input
                    type="checkbox"
                    checked={row.getIsSelected()}
                    onChange={(event) => {
                        row.toggleSelected(event.target.checked);
                        setSelectedAprobaciones(prev => 
                            event.target.checked 
                                ? [...prev, row.original] 
                                : prev.filter(a => a.id !== row.original.id)
                        );
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 shadow-sm focus:ring-primary-500"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "estudiante.codigo",
            header: "Código Estudiante",
            cell: ({ row }) => <StudentInfoPopover aprobacion={row.original} />,
        },
        {
            accessorKey: "estudiante.nombre_completo",
            header: "Estudiante",
            cell: ({ row }) => row.original.estudiante.nombre_completo,
        },
        {
            accessorKey: "olimpiada.nombre",
            header: "Olimpiada",
            cell: ({ row }) => row.original.olimpiada.nombre,
        },
        {
            accessorKey: "fase.nombre",
            header: "Fase",
            cell: ({ row }) => row.original.fase.nombre,
        },
        {
            accessorKey: "estudiante.prueba_psicologica_aprobada",
            header: "Prueba Psicológica",
            cell: ({ row }) => (
                <div className="flex items-center">
                    {row.original.estudiante.prueba_psicologica_aprobada ? <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" /> : <XCircle className="h-4 w-4 text-red-500 mr-1" />}
                    {row.original.estudiante.prueba_psicologica_aprobada ? "Aprobada" : "Reprobada"}
                </div>
            ),
        },
        {
            accessorKey: "grupo.nombre",
            header: "Grupo Asignado",
            cell: ({ row }) => {
                if (row.original.olimpiada.tipo !== 'olimpico') {
                    return <span className="text-muted-foreground">No aplica</span>;
                }

                const currentGrupoId = String(row.original.grupo_id || '');
                const studentAreaId = row.original.olimpiada.area_id;
                const availableGroups = grupos.filter(g => g.area_id === studentAreaId);

                return (
                    <Select 
                        value={currentGrupoId}
                        onValueChange={(value) => handleAssignGroup(row.original.id, value)}
                        disabled={row.original.estado_aceptacion !== 'pendiente'}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Asignar Grupo" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableGroups.map(grupo => (
                                <SelectItem key={grupo.id} value={String(grupo.id)}>{grupo.nombre} ({grupo.horario})</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );
            },
        },
        {
            accessorKey: "estado_aceptacion",
            header: "Estado Aceptación",
            cell: ({ row }) => (
                <Badge variant={row.original.estado_aceptacion === 'aceptado' ? 'success' : row.original.estado_aceptacion === 'rechazado' ? 'destructive' : 'secondary'}>
                    {row.original.estado_aceptacion}
                </Badge>
            ),
        },
    ], [filteredAprobaciones, grupos]); // Depend on filteredAprobaciones to update selection state correctly

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Inicio', href: route('dashboard') },
        { title: 'Aprobación Académica' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestión de Aprobación Académica" />
            <div className="p-4 md:p-6 space-y-6">
                <h1 className="text-2xl font-bold tracking-tight">Gestión de Aprobación Académica</h1>

                <div className="flex items-center space-x-4 mb-4">
                    <Select value={selectedAreaId} onValueChange={setSelectedAreaId}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filtrar por Área" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas las Áreas</SelectItem>
                            {areas.map(area => (
                                <SelectItem key={area.id} value={String(area.id)}>{area.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={selectedPsicologica} onValueChange={setSelectedPsicologica}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Filtrar por Prueba Psicológica" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="aprobado">Aprobada</SelectItem>
                            <SelectItem value="reprobado">Reprobada</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button onClick={handleGenerateCodes} disabled={selectedAprobaciones.length === 0}>
                        <Download className="mr-2 h-4 w-4" />
                        Generar Códigos
                    </Button>
                    <Button onClick={handleGetEmails} disabled={selectedAprobaciones.length === 0}>
                        <Mail className="mr-2 h-4 w-4" />
                        Obtener Correos
                    </Button>
                </div>

                <DataTable
                    columns={columns}
                    data={filteredAprobaciones}
                    // You might want to add pagination, sorting, etc. here
                />
            </div>
        </AppLayout>
    );
};

export default Index;
