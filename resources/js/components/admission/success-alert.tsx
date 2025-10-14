'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CheckCircle, X } from 'lucide-react';

interface SuccessAlertProps {
    isVisible: boolean;
    onDismiss: () => void;
    submissionDate: Date;
    studentName?: string;
}

export default function SuccessAlert({ isVisible, onDismiss, submissionDate, studentName }: SuccessAlertProps) {
    if (!isVisible) return null;

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

    return (
        <Alert className="relative border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-200">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="pr-8">
                <span className="font-medium">✅ Tu solicitud fue enviada con éxito</span>
                {studentName && <span className="ml-1">para {studentName}</span>}
                <span className="ml-1">el {formatDate(submissionDate)}</span>
            </AlertDescription>
            <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 h-6 w-6 p-0 text-green-600 hover:bg-green-100 hover:text-green-700 dark:text-green-400 dark:hover:bg-green-800 dark:hover:text-green-300"
                onClick={onDismiss}
                aria-label="Cerrar notificación"
            >
                <X className="h-3 w-3" />
            </Button>
        </Alert>
    );
}
