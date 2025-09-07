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
            <DialogContent className="text-center sm:max-w-lg" aria-describedby="success-description">
                <DialogHeader className="space-y-4 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                        <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="space-y-2 text-center">
                        <DialogTitle className="mx-auto text-center text-2xl font-bold text-green-900 dark:text-green-100">
                            ¡Solicitud enviada con éxito!
                        </DialogTitle>
                        <DialogDescription id="success-description" className="mx-auto text-center text-base text-muted-foreground">
                            Tu postulación ha sido registrada correctamente y será procesada por nuestro equipo.
                        </DialogDescription>
                    </div>
                </DialogHeader>

                <div className="space-y-6 py-6">
                    {studentData && (
                        <div className="space-y-3 rounded-lg border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-6 dark:border-green-800 dark:from-green-900/20 dark:to-emerald-900/20">
                            <h4 className="text-center text-base font-semibold text-green-900 dark:text-green-100">📋 Detalles de tu solicitud</h4>
                            <div className="grid grid-cols-1 gap-3 text-sm">
                                <div className="flex items-center justify-between rounded bg-white/80 px-3 py-2 dark:bg-gray-800/80">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Estudiante:</span>
                                    <span className="font-semibold text-green-700 dark:text-green-300">{studentData.nombre}</span>
                                </div>
                                <div className="flex items-center justify-between rounded bg-white/80 px-3 py-2 dark:bg-gray-800/80">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Código temporal:</span>
                                    <span className="font-mono font-semibold text-blue-700 dark:text-blue-300">{studentData.codigo}</span>
                                </div>
                                <div className="flex items-center justify-between rounded bg-white/80 px-3 py-2 dark:bg-gray-800/80">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Email:</span>
                                    <span className="break-all text-gray-700 dark:text-gray-300">{studentData.email}</span>
                                </div>
                                <div className="flex items-center justify-between rounded bg-white/80 px-3 py-2 dark:bg-gray-800/80">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Fecha de envío:</span>
                                    <span className="text-gray-700 dark:text-gray-300">{formatDate(submissionDate)}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 dark:border-blue-800 dark:from-blue-900/20 dark:to-indigo-900/20">
                        <div className="space-y-4 text-center">
                            <div className="flex items-center justify-center space-x-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-800">
                                    <span className="text-sm font-bold text-blue-600 dark:text-blue-300">💡</span>
                                </div>
                                <p className="font-semibold text-blue-900 dark:text-blue-100">¿Qué sigue ahora?</p>
                            </div>
                            <div className="space-y-3 text-sm text-blue-800 dark:text-blue-200">
                                <div className="flex items-start space-x-3 text-left">
                                    <span className="text-lg">📧</span>
                                    <div>
                                        <strong>Revisa tu correo:</strong> En los próximos minutos recibirás un email con las credenciales de acceso.
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3 text-left">
                                    <span className="text-lg">🔐</span>
                                    <div>
                                        <strong>Accede a la plataforma:</strong> Usa las credenciales para ingresar y seguir el proceso.
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3 text-left">
                                    <span className="text-lg">📞</span>
                                    <div>
                                        <strong>Mantente atento:</strong> Te contactaremos si necesitamos información adicional.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-center">
                    <Button type="button" variant="outline" onClick={handleDownloadPDF} className="w-full min-w-[140px] sm:w-auto">
                        <Download className="mr-2 h-4 w-4" />
                        Descargar PDF
                    </Button>
                    <Button
                        ref={primaryButtonRef}
                        type="button"
                        onClick={handleFinish}
                        className="w-full min-w-[140px] bg-green-600 text-white hover:bg-green-700 sm:w-auto"
                    >
                        <Home className="mr-2 h-4 w-4" />
                        Finalizar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
