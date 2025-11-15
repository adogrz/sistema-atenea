import React, { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Upload, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { BreadcrumbItem } from '@/types';

interface ImportProps extends PageProps {
    preview?: Record<string, string>[] | null;
    headers?: string[] | null;
    errors?: string[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Inicio', href: route('dashboard') },
    { title: 'Administración', href: route('users.index') }, // Assuming users.index is the admin dashboard
    { title: 'Importar Centros Educativos' },
];

export default function Import({ preview, headers, errors: initialErrors }: ImportProps) {
    const { flash } = usePage().props as any;
    const { data, setData, post, processing, errors: formErrors, reset } = useForm({
        archivo_excel: null as File | null,
    });

    const [importSuccess, setImportSuccess] = useState<string | null>(null);
    const [importError, setImportError] = useState<string | null>(null);
    const [importCount, setImportCount] = useState<number | null>(null);

    useEffect(() => {
        if (flash.success) {
            toast.success(flash.success);
            setImportSuccess(flash.success);
            setImportError(null);
            setImportCount(flash.importados ?? null);
            reset(); // Clear form after successful import
        }
        if (flash.error) {
            toast.error(flash.error);
            setImportError(flash.error);
            setImportSuccess(null);
            setImportCount(null);
        }
    }, [flash]);

    useEffect(() => {
      // Prioritize initialErrors from controller props
      if (initialErrors && initialErrors.length > 0) {
          initialErrors.forEach(error => toast.error(error));
          setImportError('Errores durante la previsualización.');
      } else if (formErrors) {
          // If no initial errors, check for Inertia form errors
          Object.values(formErrors).forEach(error => toast.error(error));
          setImportError('Errores durante la previsualización del archivo.');
      }
    }, [initialErrors, formErrors]);


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData('archivo_excel', e.target.files ? e.target.files[0] : null);
    };

    const handlePreview = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.archivo_excel) {
            toast.error('Por favor, selecciona un archivo para previsualizar.');
            return;
        }
        // Submit to the create route to get the preview
        post(route('centros.create'), {
            forceFormData: true, // Important for file uploads with Inertia
            onSuccess: (page: any) => {
                // The controller already returns the preview data as props
                // No need to do anything here, props will update
                setImportSuccess(null);
                setImportError(null);
                setImportCount(null);
            },
            onError: (errs) => {
                Object.values(errs).forEach(error => toast.error(error));
                setImportError("Hubo un error al previsualizar el archivo.");
                setImportSuccess(null);
            }
        });
    };

    const handleImport = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.archivo_excel) {
            toast.error('Por favor, selecciona un archivo para importar.');
            return;
        }
        // Submit to the store route for final import
        post(route('centros.store'), {
            forceFormData: true,
            onSuccess: (page: any) => {
                // The controller for store returns JSON response, so we check page.props.flash
                const flashResponse = page.props?.flash?.response;
                if (flashResponse) {
                    if (flashResponse.errores && flashResponse.errores.length > 0) {
                        flashResponse.errores.forEach((error: string) => toast.error(error));
                        setImportError('Errores durante la importación.');
                        setImportSuccess(null);
                    } else {
                        toast.success(flashResponse.mensaje || '¡Importación exitosa!');
                        setImportSuccess(flashResponse.mensaje || '¡Importación exitosa!');
                        setImportCount(flashResponse.importados ?? null);
                        setImportError(null);
                        reset(); // Clear form after successful import
                    }
                } else {
                    toast.success('¡Importación solicitada!'); // Generic success if no specific flash response
                    setImportSuccess('¡Importación solicitada!');
                    setImportCount(null);
                    setImportError(null);
                    reset();
                }
            },
            onError: (errs) => {
                Object.values(errs).forEach(error => toast.error(error));
                setImportError('Hubo un error al importar el archivo.');
                setImportSuccess(null);
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Importar Centros Educativos" />
            <div className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Importar Centros Educativos</h1>
                        <p className="text-muted-foreground">
                            Sube un archivo Excel para importar nuevos centros educativos al sistema.
                        </p>
                    </div>
                </div>

                <Card className="mt-4">
                    <CardHeader>
                        <CardTitle>Cargar Archivo</CardTitle>
                        <CardDescription>
                            Selecciona un archivo Excel (.xls, .xlsx) para previsualizar e importar.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handlePreview} className="space-y-4">
                            <div className="grid w-full max-w-sm items-center gap-1.5">
                                <Label htmlFor="archivo_excel">Archivo Excel</Label>
                                <Input
                                    id="archivo_excel"
                                    type="file"
                                    accept=".xls,.xlsx"
                                    onChange={handleFileChange}
                                    className={formErrors.archivo_excel ? 'border-destructive' : ''}
                                />
                                {formErrors.archivo_excel && (
                                    <p className="text-sm font-medium text-destructive">{formErrors.archivo_excel}</p>
                                )}
                            </div>
                            <Button type="submit" disabled={processing || !data.archivo_excel}>
                                {processing ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Upload className="mr-2 h-4 w-4" />
                                )}
                                Previsualizar
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {initialErrors && initialErrors.length > 0 && (
                    <Alert variant="destructive" className="mt-4">
                        <XCircle className="h-4 w-4" />
                        <AlertTitle>Errores de Previsualización</AlertTitle>
                        <AlertDescription>
                            <ul>
                                {initialErrors.map((error, index) => (
                                    <li key={index}>{error}</li>
                                ))}
                            </ul>
                        </AlertDescription>
                    </Alert>
                )}
                {formErrors.archivo_excel && ( // Display Inertia file errors if any
                    <Alert variant="destructive" className="mt-4">
                        <XCircle className="h-4 w-4" />
                        <AlertTitle>Error de Archivo</AlertTitle>
                        <AlertDescription>{formErrors.archivo_excel}</AlertDescription>
                    </Alert>
                )}


                {preview && headers && preview.length > 0 && (
                    <Card className="mt-4">
                        <CardHeader>
                            <CardTitle>Previsualización de Datos</CardTitle>
                            <CardDescription>
                                Las primeras 10 filas de tu archivo Excel.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            {headers.map((header, index) => (
                                                <TableHead key={index}>{header}</TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {preview.map((row, rowIndex) => (
                                            <TableRow key={rowIndex}>
                                                {headers.map((header, colIndex) => (
                                                    <TableCell key={colIndex}>{row[header]}</TableCell>
                                                ))}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end">
                            <Button onClick={handleImport} disabled={processing}>
                                {processing ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                )}
                                Confirmar Importación
                            </Button>
                        </CardFooter>
                    </Card>
                )}

                {importSuccess && (
                  <Alert variant="success" className="mt-4">
                      <CheckCircle className="h-4 w-4" />
                      <AlertTitle>Importación Exitosa</AlertTitle>
                      <AlertDescription>
                          {importSuccess}
                          {importCount !== null && ` Se importaron ${importCount} registros.`}
                      </AlertDescription>
                  </Alert>
                )}

                {importError && (
                  <Alert variant="destructive" className="mt-4">
                      <XCircle className="h-4 w-4" />
                      <AlertTitle>Error de Importación</AlertTitle>
                      <AlertDescription>{importError}</AlertDescription>
                  </Alert>
                )}
            </div>
        </AppLayout>
    );
}