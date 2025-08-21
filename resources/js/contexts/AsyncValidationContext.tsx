import { createContext, ReactNode, useContext } from 'react';

interface AsyncValidationContextValue {
    emailValidation: {
        isChecking: boolean;
        isDuplicate: boolean;
        error?: string;
    };
    nieValidation: {
        isChecking: boolean;
        isDuplicate: boolean;
        error?: string;
    };
    duplicateData: {
        field: 'email' | 'nie';
        value: string;
    } | null;
    hasDuplicates: boolean;
}

const AsyncValidationContext = createContext<AsyncValidationContextValue | undefined>(undefined);

export function useAsyncValidationContext() {
    const context = useContext(AsyncValidationContext);
    if (!context) {
        throw new Error('useAsyncValidationContext must be used within an AsyncValidationProvider');
    }
    return context;
}

interface AsyncValidationProviderProps {
    children: ReactNode;
    value: AsyncValidationContextValue;
}

export function AsyncValidationProvider({ children, value }: AsyncValidationProviderProps) {
    return <AsyncValidationContext.Provider value={value}>{children}</AsyncValidationContext.Provider>;
}
