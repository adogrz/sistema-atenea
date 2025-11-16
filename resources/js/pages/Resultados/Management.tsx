import React, { useState, useMemo } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { PageProps, Olimpiada, FaseOlimpiada, BreadcrumbItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { copyToClipboard } from '@/lib/utils';
import { Download, Mail } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ResultadosManagementProps extends PageProps {
    olimpiadas: Olimpiada[];
}

const Management: React.FC<ResultadosManagementProps> = ({ olimpiadas }) => {
    const [selectedOlimpiadaId, setSelectedOlimpiadaId] = useState<string>('all');
    const [selectedFaseId, setSelectedFaseId] = useState<string>('all');

    const fasesForDropdown = useMemo(() => {
        if (selectedOlimpiadaId === 'all') return [];
        const selectedOlimpiada = olimpiadas.find(o => o.id === Number(selectedOlimpiadaId));
        return selectedOlimpiada?.fases || [];
    }, [selectedOlimpiadaId, olimpiadas]);

    const selectedFase = useMemo(() => {
        if (selectedFaseId === 'all' || fasesForDropdown.length === 0) return null;
        return fasesForDropdown.find(f => f.id === Number(selectedFaseId)) || null;
    }, [selectedFaseId, fasesForDropdown]);

    const handleOlimpiadaChange = (value: string) => {
        setSelectedOlimpiadaId(value);
        setSelectedFaseId('all');
    };

    const handleFaseChange = (value: string) => {
        setSelectedFaseId(value);
    };

    const generateCodes = () => {
        if (!selectedFase) {
            toast.error('Por favor, selecciona una fase.');
            return;
        }
        router.post(route('resultados.generatePermanentCodes'), { fase_id: selectedFase.id }, {
            onSuccess: () => toast.success('Petición para generar códigos enviada.'),
            onError: () => toast.error('Error al solicitar la generación de códigos.'),
        });
    };

    const getEmails = () => {
        if (!selectedFase) {
            toast.error('Por favor, selecciona una fase.');
            return;
        }
        router.get(route('resultados.emailsPassed'), { fase_id: selectedFase.id }, {
            preserveState: true,
            onSuccess: (page: any) => {
                const emails = page.props.jetstream.flash?.emails || page.props.emails;
                if (emails && emails.length > 0) {
                    copyToClipboard(emails.join(', '));
                    toast.success(`Se copiaron ${emails.length} correos al portapapeles.`)
                } else {
                    toast.info('No se encontraron correos para los estudiantes que pasan.');
                }
            },
            onError: () => toast.error('Error al obtener los correos.'),
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Inicio', href: route('dashboard') },
        { title: 'Resultados', href: route('resultados.index') },
        { title: 'Gestión de Resultados' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestión de Resultados de Olimpiadas" />
            <div className="p-4 md:p-6 space-y-6">
                <h1 className="text-2xl font-bold tracking-tight">Gestión de Resultados de Olimpiadas</h1>

                <Card>
                    <CardHeader>
                        <CardTitle>Selección de Fase</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="select-olimpiada" className="block text-sm font-medium text-gray-700">Olimpiada</label>
                                <Select value={selectedOlimpiadaId} onValueChange={handleOlimpiadaChange}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Selecciona una olimpiada" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todas las Olimpiadas</SelectItem>
                                        {olimpiadas.map(olimpiada => (
                                            <SelectItem key={olimpiada.id} value={String(olimpiada.id)}>{olimpiada.nombre}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label htmlFor="select-fase" className="block text-sm font-medium text-gray-700">Fase</label>
                                <Select value={selectedFaseId} onValueChange={handleFaseChange} disabled={selectedOlimpiadaId === 'all' || fasesForDropdown.length === 0}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Selecciona una fase" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todas las Fases</SelectItem>
                                        {fasesForDropdown.map(fase => (
                                            <SelectItem key={fase.id} value={String(fase.id)}>{fase.nombre}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {selectedFase && (
                            <div className="flex items-center space-x-4 pt-4">
                                <div className="text-sm text-muted-foreground border rounded-md px-3 py-2">
                                    Cupos de la Fase: <span className="font-bold text-primary">{selectedFase.cupos ?? 0}</span>
                                </div>
                                <Button variant="outline" onClick={generateCodes}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Generar Códigos Permanentes
                                </Button>
                                <Button variant="outline" onClick={getEmails}>
                                    <Mail className="mr-2 h-4 w-4" />
                                    Obtener Correos de Clasificados
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
};

export default Management;
