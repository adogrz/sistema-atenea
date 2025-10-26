'use client';

import { formatBytes, useFileUpload } from '@/hooks/use-file-upload';
import { AlertCircleIcon, PaperclipIcon, UploadIcon, XIcon } from 'lucide-react';
import { useEffect } from 'react';
import { Button } from './button';

interface FileUploadProps {
    value?: File | null;
    onChange: (file: File | null) => void;
    accept?: string;
    maxSize?: number;
    disabled?: boolean;
    className?: string;
    error?: string;
    placeholder?: string;
}

export function FileUpload({
    value,
    onChange,
    accept = '.pdf,.jpg,.jpeg,.png',
    maxSize = 10 * 1024 * 1024,
    disabled = false,
    className,
    error: externalError,
    placeholder,
}: FileUploadProps) {
    const [{ files, isDragging, errors }, { handleDragEnter, handleDragLeave, handleDragOver, handleDrop, openFileDialog, removeFile, getInputProps }] = useFileUpload({
        maxSize,
        accept,
        multiple: false,
        onFilesChange: (newFiles) => {
            if (newFiles.length > 0) {
                onChange(newFiles[0].file);
            } else {
                onChange(null);
            }
        },
    });

    // Sincronizar value externo con files internos
    useEffect(() => {
        if (value && files.length === 0) {
            // Si hay un value pero no hay files, no hacemos nada
            // porque el hook manejará la adición del archivo
        } else if (!value && files.length > 0) {
            // Si no hay value pero sí files, limpiamos
            if (files[0]) {
                removeFile(files[0].id);
            }
        }
    }, [value, files, removeFile]);

    const file = files[0];
    const error = externalError || errors[0];

    return (
        <div className={className}>
            {/* Drop area */}
            <div
                role="button"
                onClick={disabled ? undefined : openFileDialog}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                data-dragging={isDragging || undefined}
                data-error={error ? true : undefined}
                className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-input p-4 transition-colors hover:bg-accent/50 has-disabled:pointer-events-none has-disabled:opacity-50 has-[input:focus]:border-ring has-[input:focus]:ring-[3px] has-[input:focus]:ring-ring/50 data-[dragging=true]:bg-accent/50 data-[error=true]:border-destructive"
            >
                <input {...getInputProps()} className="sr-only" aria-label="Upload file" disabled={disabled || Boolean(file)} />

                <div className="flex flex-col items-center justify-center text-center">
                    <div className="mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border bg-background" aria-hidden="true">
                        <UploadIcon className="size-4 opacity-60" />
                    </div>
                    <p className="mb-1.5 text-sm font-medium">{placeholder || 'Subir archivo'}</p>
                    <p className="text-xs text-muted-foreground">Arrastra y suelta o haz clic para seleccionar (máx. {formatBytes(maxSize)})</p>
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-1 text-xs text-destructive mt-2" role="alert">
                    <AlertCircleIcon className="size-3 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* File preview */}
            {file && (
                <div className="space-y-2 mt-2">
                    <div className="flex items-center justify-between gap-2 rounded-xl border px-4 py-2">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <PaperclipIcon className="size-4 shrink-0 opacity-60" aria-hidden="true" />
                            <div className="min-w-0">
                                <p className="truncate text-[13px] font-medium">{file.file.name}</p>
                                <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                            </div>
                        </div>

                        <Button
                            size="icon"
                            variant="ghost"
                            type="button"
                            className="-me-2 size-8 text-muted-foreground/80 hover:bg-transparent hover:text-foreground"
                            onClick={() => {
                                removeFile(file.id);
                                onChange(null);
                            }}
                            disabled={disabled}
                            aria-label="Remove file"
                        >
                            <XIcon className="size-4" aria-hidden="true" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
