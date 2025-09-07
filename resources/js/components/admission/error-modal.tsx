'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertCircle, Home, RefreshCw } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface ErrorModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message?: string;
    onRetry?: () => void;
    showRetry?: boolean;
}

export default function ErrorModal({
    isOpen,
    onClose,
    title = 'Error en el formulario',
    message = 'Ha ocurrido un error al procesar tu solicitud. Por favor, revisa los datos e intenta nuevamente.',
    onRetry,
    showRetry = true,
}: ErrorModalProps) {
    const primaryButtonRef = useRef<HTMLButtonElement>(null);

    // Enfocar el botón principal cuando se abre el modal
    useEffect(() => {
        if (isOpen && primaryButtonRef.current) {
            const timer = setTimeout(() => {
                primaryButtonRef.current?.focus();
            }, 100);

            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleRetry = () => {
        onClose();
        if (onRetry) {
            onRetry();
        }
    };

    const formatMessage = (text: string) => {
        return text.split('\n').map((line, index) => (
            <span key={index}>
                {line}
                {index < text.split('\n').length - 1 && <br />}
            </span>
        ));
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                        <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                    </div>
                    <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</DialogTitle>
                    <DialogDescription className="mt-3 text-gray-600 dark:text-gray-400">{formatMessage(message)}</DialogDescription>
                </DialogHeader>

                <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                    {showRetry && onRetry && (
                        <Button ref={primaryButtonRef} onClick={handleRetry} className="bg-primary hover:bg-primary/90">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Intentar nuevamente
                        </Button>
                    )}
                    <Button variant="outline" onClick={onClose} ref={!showRetry ? primaryButtonRef : undefined}>
                        <Home className="mr-2 h-4 w-4" />
                        Cerrar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
