import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Calendar, Clock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface PeriodClosedProps {
    eventType?: string;
    error?: string;
    message?: string;
    periodo?: {
        inicio: string;
        fin: string;
        actual: string;
    };
    horario?: {
        inicio: string;
        fin: string;
        actual: string;
    };
}

export default function PeriodClosed({ 
    eventType = '', 
    error = 'Período no disponible', 
    message = 'El período solicitado no está disponible en este momento.',
    periodo,
    horario 
}: PeriodClosedProps) {
    
    const formatDateTime = (dateTimeStr: string) => {
        if (!dateTimeStr) return '';
        try {
            const date = new Date(dateTimeStr);
            return new Intl.DateTimeFormat('es-SV', {
                dateStyle: 'long',
                timeStyle: 'short',
            }).format(date);
        } catch {
            return dateTimeStr;
        }
    };

    const formatDate = (dateTimeStr: string) => {
        if (!dateTimeStr) return '';
        try {
            const date = new Date(dateTimeStr);
            return new Intl.DateTimeFormat('es-SV', {
                dateStyle: 'long',
            }).format(date);
        } catch {
            return dateTimeStr;
        }
    };

    return (
        <>
            <Head title="Período No Disponible" />
            
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-2xl shadow-xl">
                    <CardHeader className="text-center space-y-4">
                        <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                            <AlertCircle className="w-8 h-8 text-amber-600" />
                        </div>
                        <CardTitle className="text-3xl font-bold text-gray-900">
                            {error}
                        </CardTitle>
                        <CardDescription className="text-lg text-gray-600">
                            {message}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {periodo && (
                            <Alert>
                                <Calendar className="h-4 w-4" />
                                <AlertTitle>Período del Evento</AlertTitle>
                                <AlertDescription className="mt-2 space-y-2">
                                    <div className="grid grid-cols-1 gap-2 text-sm">
                                        <div>
                                            <span className="font-semibold">Inicio:</span>{' '}
                                            <span className="text-green-600">{formatDateTime(periodo.inicio)}</span>
                                        </div>
                                        <div>
                                            <span className="font-semibold">Fin:</span>{' '}
                                            <span className="text-red-600">{formatDateTime(periodo.fin)}</span>
                                        </div>
                                        <div className="pt-2 border-t">
                                            <span className="font-semibold">Fecha actual:</span>{' '}
                                            <span>{formatDate(periodo.actual)}</span>
                                        </div>
                                    </div>
                                </AlertDescription>
                            </Alert>
                        )}

                        {horario && (
                            <Alert>
                                <Clock className="h-4 w-4" />
                                <AlertTitle>Horario del Evento</AlertTitle>
                                <AlertDescription className="mt-2 space-y-2">
                                    <div className="grid grid-cols-1 gap-2 text-sm">
                                        <div>
                                            <span className="font-semibold">Hora de inicio:</span>{' '}
                                            <span className="text-green-600">{horario.inicio}</span>
                                        </div>
                                        <div>
                                            <span className="font-semibold">Hora de fin:</span>{' '}
                                            <span className="text-red-600">{horario.fin}</span>
                                        </div>
                                        <div className="pt-2 border-t">
                                            <span className="font-semibold">Hora actual:</span>{' '}
                                            <span>{horario.actual}</span>
                                        </div>
                                    </div>
                                </AlertDescription>
                            </Alert>
                        )}

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-blue-900">
                                <strong>Nota:</strong> Este formulario solo está disponible durante el período activo del evento. 
                                Por favor, regresa durante las fechas y horarios indicados.
                            </p>
                        </div>

                        <div className="flex justify-center pt-4">
                            <Button 
                                variant="outline" 
                                onClick={() => window.history.back()}
                                className="min-w-[200px]"
                            >
                                Volver
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
