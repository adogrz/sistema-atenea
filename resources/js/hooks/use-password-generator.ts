import { useCallback, useState } from 'react';

export const usePasswordGenerator = () => {
    const [isGenerating, setIsGenerating] = useState(false);

    const generatePassword = useCallback((length: number = 12): string => {
        setIsGenerating(true);

        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
        let password = '';

        for (let i = 0; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }

        setIsGenerating(false);
        return password;
    }, []);

    const generateSecurePassword = useCallback(() => {
        return generatePassword(12);
    }, [generatePassword]);

    return {
        generatePassword,
        generateSecurePassword,
        isGenerating,
    };
};
