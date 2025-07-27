import { useCallback, useState } from 'react';

interface PasswordOptions {
    length?: number;
    includeUppercase?: boolean;
    includeLowercase?: boolean;
    includeNumbers?: boolean;
    includeSymbols?: boolean;
    excludeSimilar?: boolean; // Excluir caracteres similares como 0, O, l, I
}

export const usePasswordGenerator = () => {
    const [isGenerating, setIsGenerating] = useState(false);

    // Conjuntos de caracteres organizados
    const charSets = {
        lowercase: 'abcdefghijklmnopqrstuvwxyz',
        uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        numbers: '0123456789',
        symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
        // Caracteres sin ambigüedades (sin 0, O, l, I, 1)
        lowercaseSafe: 'abcdefghjkmnpqrstuvwxyz',
        uppercaseSafe: 'ABCDEFGHJKLMNPQRSTUVWXYZ',
        numbersSafe: '23456789',
        symbolsSafe: '!@#$%^&*()_+-=[]{}|;:,.<>?'
    };

    // Función para mezclar array (Fisher-Yates shuffle)
    const shuffleArray = useCallback((array: string[]): string[] => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }, []);

    // Función para generar un número random criptográficamente seguro
    const getSecureRandom = useCallback((max: number): number => {
        if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
            const array = new Uint32Array(1);
            window.crypto.getRandomValues(array);
            return array[0] % max;
        }
        // Fallback para entornos que no soportan crypto
        return Math.floor(Math.random() * max);
    }, []);

    // Validar que la contraseña cumple con los requisitos de fortaleza
    const validatePasswordStrength = useCallback((password: string): boolean => {
        const hasLowercase = /[a-z]/.test(password);
        const hasUppercase = /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSymbol = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password);
        const hasMinLength = password.length >= 8;

        return hasLowercase && hasUppercase && hasNumber && hasSymbol && hasMinLength;
    }, []);

    const generatePassword = useCallback((options: PasswordOptions = {}): string => {
        setIsGenerating(true);

        const {
            length = 12,
            includeUppercase = true,
            includeLowercase = true,
            includeNumbers = true,
            includeSymbols = true,
            excludeSimilar = true
        } = options;

        // Construir el conjunto de caracteres disponibles
        let availableChars = '';
        const requiredChars: string[] = [];

        if (includeLowercase) {
            const chars = excludeSimilar ? charSets.lowercaseSafe : charSets.lowercase;
            availableChars += chars;
            // Asegurar al menos un carácter de este tipo
            requiredChars.push(chars[getSecureRandom(chars.length)]);
        }

        if (includeUppercase) {
            const chars = excludeSimilar ? charSets.uppercaseSafe : charSets.uppercase;
            availableChars += chars;
            requiredChars.push(chars[getSecureRandom(chars.length)]);
        }

        if (includeNumbers) {
            const chars = excludeSimilar ? charSets.numbersSafe : charSets.numbers;
            availableChars += chars;
            requiredChars.push(chars[getSecureRandom(chars.length)]);
        }

        if (includeSymbols) {
            const chars = excludeSimilar ? charSets.symbolsSafe : charSets.symbols;
            availableChars += chars;
            requiredChars.push(chars[getSecureRandom(chars.length)]);
        }

        if (availableChars.length === 0) {
            throw new Error('Debe incluir al menos un tipo de carácter');
        }

        // Generar el resto de la contraseña
        const remainingLength = Math.max(0, length - requiredChars.length);
        const randomChars: string[] = [];

        for (let i = 0; i < remainingLength; i++) {
            randomChars.push(availableChars[getSecureRandom(availableChars.length)]);
        }

        // Combinar caracteres requeridos y aleatorios, luego mezclar
        const allChars = [...requiredChars, ...randomChars];
        const shuffledPassword = shuffleArray(allChars).join('');

        setIsGenerating(false);
        return shuffledPassword;
    }, [getSecureRandom, shuffleArray]);

    // Generar contraseña segura con configuración predeterminada
    const generateSecurePassword = useCallback((length: number = 12): string => {
        let attempts = 0;
        const maxAttempts = 10;

        while (attempts < maxAttempts) {
            const password = generatePassword({
                length,
                includeUppercase: true,
                includeLowercase: true,
                includeNumbers: true,
                includeSymbols: true,
                excludeSimilar: true
            });

            // Verificar que cumple con los requisitos de fortaleza
            if (validatePasswordStrength(password)) {
                return password;
            }

            attempts++;
        }

        // Si después de varios intentos no se genera una contraseña válida,
        // forzar una que cumpla con los requisitos
        return generatePassword({
            length: Math.max(length, 12), // Asegurar longitud mínima
            includeUppercase: true,
            includeLowercase: true,
            includeNumbers: true,
            includeSymbols: true,
            excludeSimilar: true
        });
    }, [generatePassword, validatePasswordStrength]);

    // Generar contraseña memorable (usando palabras comunes + números/símbolos)
    const generateMemorablePassword = useCallback((): string => {
        const words = [
            'casa', 'perro', 'gato', 'sol', 'luna', 'mar', 'rio', 'flor',
            'verde', 'azul', 'rojo', 'paz', 'luz', 'vida', 'amor', 'tiempo'
        ];

        const word1 = words[getSecureRandom(words.length)];
        const word2 = words[getSecureRandom(words.length)];
        const number = getSecureRandom(99) + 10; // Número de 2-3 dígitos
        const symbol = charSets.symbolsSafe[getSecureRandom(charSets.symbolsSafe.length)];

        // Capitalizar primera letra de cada palabra
        const capitalized1 = word1.charAt(0).toUpperCase() + word1.slice(1);
        const capitalized2 = word2.charAt(0).toUpperCase() + word2.slice(1);

        return `${capitalized1}${capitalized2}${number}${symbol}`;
    }, [getSecureRandom]);

    // Estimar la fortaleza de una contraseña
    const estimatePasswordStrength = useCallback((password: string): {
        score: number;
        feedback: string[];
        entropy: number;
    } => {
        const feedback: string[] = [];
        let score = 0;
        let charsetSize = 0;

        // Verificar tipos de caracteres
        if (/[a-z]/.test(password)) {
            score++;
            charsetSize += 26;
        } else {
            feedback.push('Agregar letras minúsculas');
        }

        if (/[A-Z]/.test(password)) {
            score++;
            charsetSize += 26;
        } else {
            feedback.push('Agregar letras mayúsculas');
        }

        if (/[0-9]/.test(password)) {
            score++;
            charsetSize += 10;
        } else {
            feedback.push('Agregar números');
        }

        if (/[^a-zA-Z0-9]/.test(password)) {
            score++;
            charsetSize += 32; // Aproximado para símbolos
        } else {
            feedback.push('Agregar símbolos');
        }

        // Verificar longitud
        if (password.length >= 8) {
            score++;
        } else {
            feedback.push('Usar al menos 8 caracteres');
        }

        // Calcular entropía aproximada
        const entropy = password.length * Math.log2(charsetSize || 1);

        return { score, feedback, entropy };
    }, []);

    return {
        generatePassword,
        generateSecurePassword,
        generateMemorablePassword,
        estimatePasswordStrength,
        validatePasswordStrength,
        isGenerating,
    };
};
