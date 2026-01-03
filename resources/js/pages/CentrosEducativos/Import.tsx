import React, { useState, useEffect, useRef } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Loader2, Upload, CheckCircle, XCircle, Timer, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { BreadcrumbItem } from '@/types';
import Dropzone from '@/components/ui/Dropzone';
import axios from 'axios';

interface ImportProps extends PageProps {
    preview?: Record<string, string>[] | null;
    headers?: string[] | null;
    errors: string[];
    totalRows?: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Inicio', href: route('dashboard') },
    { title: 'Centros Educativos', href: route('centros-educativos.index') },
    { title: 'Importar' },
];

export default function Import({ preview, headers, errors: initialErrors, totalRows = 0 }: ImportProps) {
    const isInitialMount = useRef(true);
    const { data, setData, post, processing, errors: formErrors, reset } = useForm({
        archivo_excel: null as File | null,
    });

    const [processingTime, setProcessingTime] = useState<number | null>(null);
    const [isPreviewing, setIsPreviewing] = useState(false);
    const [previewElapsedTime, setPreviewElapsedTime] = useState(0);
    const [isImporting, setIsImporting] = useState(false);
    const [importTime, setImportTime] = useState(0);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isImporting) {
            interval = setInterval(() => {
                setImportTime(prevTime => prevTime + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isImporting]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPreviewing) {
            interval = setInterval(() => {
                setPreviewElapsedTime(prevTime => prevTime + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPreviewing]);

    useEffect(() => {
        if (initialErrors && initialErrors.length > 0) {
            initialErrors.forEach(error => toast.error(error, { duration: 5000 }));
        }
    }, [initialErrors]);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            if (data.archivo_excel && !preview) {
                toast.info('Restaurando previsualización del archivo seleccionado...');
                handlePreview();
            }
        }
    }, [data.archivo_excel, preview]);

    const handleFileChange = (file: File | null) => {
        setData('archivo_excel', file);
        if (file) {
            setProcessingTime(null);
            setPreviewElapsedTime(0);
            setIsPreviewing(false);
        }
    };

    const handlePreview = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!data.archivo_excel) {
            toast.error('Por favor, selecciona un archivo para previsualizar.');
            return;
        }

        const startTime = Date.now();
        setProcessingTime(null);
        setPreviewElapsedTime(0);
        setIsPreviewing(true);

        post(route('centros-educativos.importar'), {
            forceFormData: true,
            preserveState: true,
            onSuccess: (page) => {
                const endTime = Date.now();
                setProcessingTime(endTime - startTime);
                setIsPreviewing(false);
                const serverProps = page.props as ImportProps;
                if (serverProps.errors && serverProps.errors.length > 0) {
                    toast.info('El archivo tiene problemas, revisa los errores de previsualización.');
                } else {
                    toast.success('Previsualización generada con éxito.');
                }
            },
            onError: (errs) => {
                const endTime = Date.now();
                setProcessingTime(endTime - startTime);
                setIsPreviewing(false);
                Object.values(errs).forEach(error => toast.error(error));
                toast.error('Hubo un error inesperado al previsualizar el archivo.');
            },
        });
    };

    const handleImport = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.archivo_excel) {
            toast.error('Por favor, selecciona un archivo para importar.');
            return;
        }

        setIsImporting(true);
        setImportTime(0);

        const formData = new FormData();
        formData.append('archivo_excel', data.archivo_excel);

        axios.post(route('centros-educativos.importar-store'), formData)
            .then(response => {
                const result = response.data;
                if (result.errores && result.errores.length > 0) {
                    toast.error('La importación finalizó con errores.', {
                        description: `Se importaron ${result.importados} registros. Errores: ${result.errores.slice(0, 5).join(', ')}...`,
                        duration: 10000
                    });
                } else {
                    toast.success('¡Importación completada!', {
                        description: `Se importaron exitosamente ${result.importados} registros.`,
                    });
                }
                reset();
                setData('archivo_excel', null);
            })
            .catch(error => {
                if (error.response?.data?.errors) {
                    Object.values(error.response.data.errors).flat().forEach((err: any) => toast.error(err));
                } else {
                    toast.error('Ocurrió un error inesperado durante la importación.');
                }
            })
            .finally(() => {
                setIsImporting(false);
            });
    };

    const formatBytes = (bytes: number, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Importar Centros Educativos" />

            <Dialog open={isImporting}>
                <DialogContent showCloseButton={false} onPointerDownOutside={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle className="text-center">Procesando Importación</DialogTitle>
                        <DialogDescription className="text-center">
                            Por favor espera, estamos guardando los registros.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-center justify-center py-8">
                        <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
                        <div className="flex items-center text-lg">
                            <Timer className="mr-2 h-5 w-5" />
                            <span>Tiempo transcurrido: {importTime} segundos</span>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <div className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Importar Centros Educativos</h1>
                        <p className="text-muted-foreground">
                            Carga un archivo Excel para importar múltiples centros educativos a la vez.
                        </p>
                    </div>
                     <Button asChild variant="outline">
                        <Link href={route('centros-educativos.index')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver al Listado
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Cargar Archivo</CardTitle>
                        <CardDescription>
                            Arrastra y suelta un archivo Excel (.xls, .xlsx) o haz clic para seleccionarlo.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handlePreview} className="space-y-4">
                            <Dropzone onFileChange={handleFileChange} className="w-full" />
                            {formErrors.archivo_excel && (
                                <p className="text-sm font-medium text-destructive">{formErrors.archivo_excel}</p>
                            )}
                            <Button type="submit" disabled={processing || !data.archivo_excel}>
                                {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                                Previsualizar
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {data.archivo_excel && (
                    <Card className="mt-4">
                        <CardHeader>
                            <CardTitle>Información del Archivo</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm space-y-2">
                            <p><strong>Nombre:</strong> {data.archivo_excel.name}</p>
                            <p><strong>Tamaño:</strong> {formatBytes(data.archivo_excel.size)}</p>
                            {totalRows > 0 && (
                                <p><strong>Filas detectadas:</strong> {totalRows} (sin contar encabezado)</p>
                            )}
                            {isPreviewing ? (
                                <div className="flex items-center">
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    <strong>Procesando previsualización:</strong>
                                    <span className="ml-1">{previewElapsedTime} segundos</span>
                                </div>
                            ) : processingTime !== null && (
                                <div className="flex items-center">
                                    <Timer className="mr-2 h-4 w-4 text-muted-foreground" />
                                    <strong>Tiempo de previsualización:</strong>
                                    <span className="ml-1">{(processingTime / 1000).toFixed(2)} segundos</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {initialErrors && initialErrors.length > 0 && (
                    <Alert variant="destructive" className="mt-4">
                        <XCircle className="h-4 w-4" />
                        <AlertTitle>Errores de Previsualización</AlertTitle>
                        <AlertDescription>
                            <ul className="list-disc pl-5">
                                {initialErrors.map((error, index) => <li key={index}>{error}</li>)}
                            </ul>
                        </AlertDescription>
                    </Alert>
                )}

                {preview && headers && preview.length > 0 && (
                    <Card className="mt-4">
                        <CardHeader>
                            <CardTitle>Previsualización de Datos</CardTitle>
                            <CardDescription>Las primeras 10 filas de tu archivo Excel.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>{headers.map((header, index) => <TableHead key={index}>{header}</TableHead>)}</TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {preview.map((row, rowIndex) => (
                                            <TableRow key={rowIndex}>
                                                {Object.values(row).map((cell, cellIndex) => (
                                                    <TableCell key={cellIndex}>{String(cell)}</TableCell>
                                                ))}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end">
                            <Button onClick={handleImport} disabled={processing}>
                                {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                                Confirmar Importación
                            </Button>
                        </CardFooter>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
