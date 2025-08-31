'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useConfetti } from '@/hooks/useConfetti';
import { CheckCircle, Download, Home } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface SuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    studentData?: {
        nombre: string;
        codigo: string;
        email: string;
    };
    submissionDate?: Date;
}

export default function SuccessModal({ isOpen, onClose, studentData, submissionDate = new Date() }: SuccessModalProps) {
    const { fireSuccessConfetti } = useConfetti();
    const hasTriggeredConfetti = useRef(false);
    const primaryButtonRef = useRef<HTMLButtonElement>(null);

    // Disparar confetti al abrir el modal
    useEffect(() => {
        if (isOpen && !hasTriggeredConfetti.current) {
            // Pequeño delay para asegurar que el modal esté completamente renderizado
            const timer = setTimeout(() => {
                fireSuccessConfetti();
                hasTriggeredConfetti.current = true;
            }, 150);

            return () => clearTimeout(timer);
        }

        // Reset cuando se cierra el modal
        if (!isOpen) {
            hasTriggeredConfetti.current = false;
        }
    }, [isOpen, fireSuccessConfetti]);

    // Enfocar el botón principal cuando se abre el modal
    useEffect(() => {
        if (isOpen && primaryButtonRef.current) {
            const timer = setTimeout(() => {
                primaryButtonRef.current?.focus();
            }, 100);

            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('es-SV', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        }).format(date);
    };

    const handleDownloadPDF = () => {
        // TODO: Implementar descarga de PDF
        console.log('Descargando PDF de la solicitud...');
        // Por ahora, mostrar un mensaje
        alert('La función de descarga de PDF estará disponible próximamente.');
    };

    const handleFinish = () => {
        // Redirigir al inicio o cerrar modal
        window.location.href = '/';
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md" aria-describedby="success-description">
                <DialogHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                        <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <DialogTitle className="text-xl font-semibold text-green-900 dark:text-green-100">¡Solicitud enviada con éxito!</DialogTitle>
                    <DialogDescription id="success-description" className="text-center text-muted-foreground">
                        Tu postulación ha sido registrada correctamente y será procesada por nuestro equipo.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {studentData && (
                        <div className="space-y-2 rounded-lg border bg-muted/50 p-4">
                            <h4 className="text-sm font-medium text-foreground">Detalles de tu solicitud:</h4>
                            <div className="space-y-1 text-sm text-muted-foreground">
                                <p>
                                    <span className="font-medium">Estudiante:</span> {studentData.nombre}
                                </p>
                                <p>
                                    <span className="font-medium">Código temporal:</span> {studentData.codigo}
                                </p>
                                <p>
                                    <span className="font-medium">Email:</span> {studentData.email}
                                </p>
                                <p>
                                    <span className="font-medium">Enviado:</span> {formatDate(submissionDate)}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-800">
                                    <span className="text-xs font-bold text-blue-600 dark:text-blue-300">i</span>
                                </div>
                            </div>
                            <div className="flex-1 text-sm">
                                <p className="font-medium text-blue-900 dark:text-blue-100">¿Qué sigue?</p>
                                <p className="mt-1 text-blue-700 dark:text-blue-200">
                                    Recibirás un correo electrónico con las credenciales de acceso y los próximos pasos del proceso de admisión.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                    <Button type="button" variant="outline" onClick={handleDownloadPDF} className="w-full sm:w-auto">
                        <Download className="mr-2 h-4 w-4" />
                        Descargar PDF
                    </Button>
                    <Button ref={primaryButtonRef} type="button" onClick={handleFinish} className="w-full sm:w-auto">
                        <Home className="mr-2 h-4 w-4" />
                        Finalizar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
