'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertCircle, Edit3, LogIn, RefreshCcw } from 'lucide-react';

interface DuplicateModalProps {
    isOpen: boolean;
    onClose: () => void;
    field: 'email' | 'nie';
    value: string;
    onDismiss?: (field: 'email' | 'nie', value: string) => void;
}

export function DuplicateModal({ isOpen, onClose, field, value, onDismiss }: DuplicateModalProps) {
    const fieldName = field === 'email' ? 'correo electrónico' : 'NIE';

    const handleLoginRedirect = () => {
        window.location.href = '/login';
    };

    const handlePasswordResetRedirect = () => {
        window.location.href = '/forgot-password';
    };

    const handleChangeData = () => {
        if (onDismiss) {
            onDismiss(field, value);
        }
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md" aria-describedby="duplicate-description">
                <DialogHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
                        <AlertCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <DialogTitle className="text-lg font-semibold">Este {fieldName} ya está registrado</DialogTitle>
                    <DialogDescription id="duplicate-description" className="space-y-2 text-sm text-muted-foreground">
                        <p>
                            Encontramos una cuenta con&nbsp;
                            <span className="rounded bg-muted px-2 py-0.5 text-sm font-medium">{value}</span>.
                        </p>
                        <p>
                            Si ya tienes una cuenta, inicia sesión o recupera tu contraseña. También puedes cambiar tu {fieldName} si lo ingresaste
                            por error.
                        </p>
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="flex flex-col gap-3 sm:flex-col">
                    <Button onClick={handleLoginRedirect} className="w-full" size="sm" autoFocus>
                        <LogIn className="mr-2 h-4 w-4" />
                        Iniciar sesión
                    </Button>
                    <Button onClick={handlePasswordResetRedirect} variant="outline" className="w-full" size="sm">
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        Recuperar contraseña
                    </Button>
                    <Button onClick={handleChangeData} variant="ghost" className="w-full" size="sm">
                        <Edit3 className="mr-2 h-4 w-4" />
                        Cambiar {fieldName}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
