'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useConfetti } from '@/hooks/useConfetti';
import { CheckCircle, Home, Lightbulb, Lock, Mail, Phone } from 'lucide-react';
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

    // Disparar confetti al abrir
    useEffect(() => {
        if (isOpen && !hasTriggeredConfetti.current) {
            const timer = setTimeout(() => {
                fireSuccessConfetti();
                hasTriggeredConfetti.current = true;
            }, 150);
            return () => clearTimeout(timer);
        }
        if (!isOpen) hasTriggeredConfetti.current = false;
    }, [isOpen, fireSuccessConfetti]);

    // Focus en botón principal
    useEffect(() => {
        if (isOpen && primaryButtonRef.current) {
            const timer = setTimeout(() => {
                primaryButtonRef.current?.focus();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const formatDate = (date: Date) =>
        new Intl.DateTimeFormat('es-SV', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        }).format(date);

    const handleFinish = () => {
        window.location.href = '/';
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="text-center sm:max-w-lg" aria-describedby="success-description" aria-labelledby="success-title">
                <DialogHeader className="flex flex-col items-center text-center">
                    <div className="flex size-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                        <CheckCircle className="size-10 text-green-600 dark:text-green-400" />
                    </div>
                    <DialogTitle id="success-title" className="text-center text-2xl font-bold text-green-900 dark:text-green-100">
                        ¡Solicitud enviada con éxito!
                    </DialogTitle>
                    <DialogDescription id="success-description" className="text-center text-base text-gray-700 dark:text-gray-300">
                        Tu postulación ha sido registrada correctamente.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-3">
                    {/* Bloque de detalles más compacto */}
                    {studentData && (
                        <section
                            role="region"
                            aria-labelledby="details-title"
                            className="rounded-lg border border-green-200 bg-green-50 p-5 text-sm shadow-sm dark:border-green-800 dark:bg-green-900/20"
                        >
                            <h4 id="details-title" className="mb-3 text-center text-base font-semibold text-green-900 dark:text-green-100">
                                Detalles de tu solicitud
                            </h4>
                            <dl className="grid grid-cols-1 gap-2">
                                <div className="flex flex-col sm:flex-row sm:justify-between">
                                    <dt className="font-medium text-gray-800 dark:text-gray-200">Estudiante</dt>
                                    <dd className="font-semibold text-green-800 dark:text-green-200">{studentData.nombre}</dd>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:justify-between">
                                    <dt className="font-medium text-gray-800 dark:text-gray-200">Código temporal</dt>
                                    <dd className="font-mono font-semibold text-blue-800 dark:text-blue-200">{studentData.codigo}</dd>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:justify-between">
                                    <dt className="font-medium text-gray-800 dark:text-gray-200">Email</dt>
                                    <dd className="break-all text-gray-800 dark:text-gray-200">{studentData.email}</dd>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:justify-between">
                                    <dt className="font-medium text-gray-800 dark:text-gray-200">Fecha de envío</dt>
                                    <dd className="text-gray-800 dark:text-gray-200">{formatDate(submissionDate)}</dd>
                                </div>
                            </dl>
                        </section>
                    )}

                    {/* Bloque "qué sigue" más ligero visualmente */}
                    <section className="rounded-lg border border-blue-200 bg-blue-50 p-5 text-sm shadow-sm dark:border-blue-800 dark:bg-blue-900/40">
                        <h4 className="mb-3 flex items-center justify-center text-base font-semibold text-blue-900 dark:text-blue-100">
                            <Lightbulb className="mr-2 h-5 w-5 text-blue-500" />
                            ¿Qué sigue ahora?
                        </h4>
                        <ul className="space-y-3 text-left text-blue-800 dark:text-blue-200">
                            <li className="flex items-start space-x-3">
                                <Mail className="mt-0.5 h-5 w-5 text-blue-500" />
                                <span>
                                    <strong>Revisa tu correo:</strong> recibirás un email con tus credenciales de acceso.
                                </span>
                            </li>
                            <li className="flex items-start space-x-3">
                                <Lock className="mt-0.5 h-5 w-5 text-blue-500" />
                                <span>
                                    <strong>Accede a la plataforma:</strong> usa tus credenciales para ingresar y seguir el proceso.
                                </span>
                            </li>
                            <li className="flex items-start space-x-3">
                                <Phone className="mt-0.5 h-5 w-5 text-blue-500" />
                                <span>
                                    <strong>Mantente atento:</strong> te contactaremos si necesitamos información adicional.
                                </span>
                            </li>
                        </ul>
                    </section>
                </div>

                <DialogFooter className="flex-col gap-3 border-t pt-6 sm:flex-row sm:justify-end">
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
