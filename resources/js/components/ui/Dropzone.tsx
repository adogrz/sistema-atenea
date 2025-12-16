import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, File as FileIcon, X } from 'lucide-react';

interface DropzoneProps {
    onFileChange: (file: File | null) => void;
    className?: string;
}

const Dropzone: React.FC<DropzoneProps> = ({ onFileChange, className }) => {
    const [file, setFile] = useState<File | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const selectedFile = acceptedFiles[0];
        setFile(selectedFile);
        onFileChange(selectedFile);
    }, [onFileChange]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/vnd.ms-excel': ['.xls'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
        },
        multiple: false,
    });

    const removeFile = () => {
        setFile(null);
        onFileChange(null);
    };

    return (
        <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary'}
                ${className}`}
        >
            <input {...getInputProps()} />
            {file ? (
                <div className="flex flex-col items-center justify-center">
                    <div className="flex items-center space-x-2">
                        <FileIcon className="h-8 w-8 text-gray-500" />
                        <span className="font-medium">{file.name}</span>
                        <button onClick={removeFile} className="text-red-500 hover:text-red-700">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center">
                    <UploadCloud className="h-12 w-12 text-gray-400" />
                    <p className="mt-4 text-gray-500">
                        {isDragActive
                            ? 'Suelta el archivo aquí...'
                            : "Arrastra y suelta un archivo aquí, o haz clic para seleccionar un archivo"}
                    </p>
                    <p className="text-sm text-gray-400">Archivos Excel (.xls, .xlsx)</p>
                </div>
            )}
        </div>
    );
};

export default Dropzone;
