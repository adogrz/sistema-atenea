
import React from 'react';

interface FormFieldProps {
    label: string;
    error?: string;
    children: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({ label, error, children }) => {
    return (
        <div className="grid w-full items-center gap-1.5">
            <label htmlFor={label} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{label}</label>
            {children}
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
        </div>
    );
};

export default FormField;
