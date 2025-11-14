import { useCallback, useRef, useState } from 'react';

export interface UploadedFile {
    id: string;
    name: string;
    size: number;
    type: string;
    url?: string;
    file: File;
}

export interface UseFileUploadOptions {
    maxSize?: number;
    accept?: string;
    multiple?: boolean;
    initialFiles?: Partial<UploadedFile>[];
    onFilesChange?: (files: UploadedFile[]) => void;
}

export interface UseFileUploadReturn {
    files: UploadedFile[];
    isDragging: boolean;
    errors: string[];
}

export interface UseFileUploadActions {
    handleDragEnter: (e: React.DragEvent) => void;
    handleDragLeave: (e: React.DragEvent) => void;
    handleDragOver: (e: React.DragEvent) => void;
    handleDrop: (e: React.DragEvent) => void;
    openFileDialog: () => void;
    removeFile: (id: string) => void;
    getInputProps: () => {
        type: 'file';
        accept?: string;
        multiple?: boolean;
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    };
}

export function formatBytes(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function useFileUpload(
    options: UseFileUploadOptions = {}
): [UseFileUploadReturn, UseFileUploadActions] {
    const { maxSize = 10 * 1024 * 1024, accept, multiple = false, initialFiles = [], onFilesChange } = options;

    const [files, setFiles] = useState<UploadedFile[]>(() => {
        return initialFiles.map((file) => ({
            id: file.id || `${file.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: file.name || '',
            size: file.size || 0,
            type: file.type || '',
            url: file.url,
            file: file.file || new File([], file.name || ''),
        }));
    });

    const [isDragging, setIsDragging] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const validateFile = useCallback(
        (file: File): string | null => {
            if (maxSize && file.size > maxSize) {
                return `El archivo ${file.name} excede el tamaño máximo de ${formatBytes(maxSize)}`;
            }

            if (accept) {
                const acceptedTypes = accept.split(',').map((type) => type.trim());
                const fileExtension = `.${file.name.split('.').pop()}`;
                const isAccepted = acceptedTypes.some(
                    (type) =>
                        type === fileExtension.toLowerCase() ||
                        file.type.match(new RegExp(type.replace('*', '.*')))
                );

                if (!isAccepted) {
                    return `El archivo ${file.name} no tiene un formato válido`;
                }
            }

            return null;
        },
        [maxSize, accept]
    );

    const processFiles = useCallback(
        (fileList: FileList | File[]) => {
            const newErrors: string[] = [];
            const validFiles: UploadedFile[] = [];

            Array.from(fileList).forEach((file) => {
                const error = validateFile(file);
                if (error) {
                    newErrors.push(error);
                } else {
                    const uploadedFile: UploadedFile = {
                        id: `${file.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        name: file.name,
                        size: file.size,
                        type: file.type,
                        url: URL.createObjectURL(file),
                        file,
                    };
                    validFiles.push(uploadedFile);
                }
            });

            setErrors(newErrors);

            if (validFiles.length > 0) {
                const updatedFiles = multiple ? [...files, ...validFiles] : validFiles;
                setFiles(updatedFiles);
                onFilesChange?.(updatedFiles);
            }
        },
        [files, multiple, validateFile, onFilesChange]
    );

    const handleDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);

            const droppedFiles = e.dataTransfer.files;
            if (droppedFiles.length > 0) {
                processFiles(droppedFiles);
            }
        },
        [processFiles]
    );

    const openFileDialog = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const removeFile = useCallback(
        (id: string) => {
            const updatedFiles = files.filter((file) => file.id !== id);
            setFiles(updatedFiles);
            onFilesChange?.(updatedFiles);
            setErrors([]);
        },
        [files, onFilesChange]
    );

    const handleFileInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const selectedFiles = e.target.files;
            if (selectedFiles && selectedFiles.length > 0) {
                processFiles(selectedFiles);
            }
        },
        [processFiles]
    );

    const getInputProps = useCallback(() => {
        return {
            type: 'file' as const,
            accept,
            multiple,
            onChange: handleFileInputChange,
            ref: fileInputRef,
        };
    }, [accept, multiple, handleFileInputChange]);

    return [
        { files, isDragging, errors },
        {
            handleDragEnter,
            handleDragLeave,
            handleDragOver,
            handleDrop,
            openFileDialog,
            removeFile,
            getInputProps,
        },
    ];
}
