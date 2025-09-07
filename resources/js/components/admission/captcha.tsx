'use client';

import type React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RefreshCw } from 'lucide-react';
import { memo, useEffect, useState } from 'react';

interface CaptchaProps {
    onVerify: (verified: boolean) => void;
}

export default memo(function Captcha({ onVerify }: CaptchaProps) {
    const [captchaText, setCaptchaText] = useState('');
    const [userInput, setUserInput] = useState('');
    const [isVerified, setIsVerified] = useState(false);
    const [error, setError] = useState('');

    // Generar un CAPTCHA simple con operación matemática
    const generateCaptcha = () => {
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        const operation = Math.random() > 0.5 ? '+' : '-';

        let result: number;
        let question: string;

        if (operation === '+') {
            result = num1 + num2;
            question = `${num1} + ${num2}`;
        } else {
            // Asegurar que el resultado no sea negativo
            const larger = Math.max(num1, num2);
            const smaller = Math.min(num1, num2);
            result = larger - smaller;
            question = `${larger} - ${smaller}`;
        }

        setCaptchaText(question);
        return result.toString();
    };

    const [correctAnswer, setCorrectAnswer] = useState('');

    useEffect(() => {
        const answer = generateCaptcha();
        setCorrectAnswer(answer);
    }, []);

    // Efecto para notificar el reseteo cuando el componente se monta
    useEffect(() => {
        onVerify(false);
    }, [onVerify]);

    const handleRefresh = () => {
        const answer = generateCaptcha();
        setCorrectAnswer(answer);
        setUserInput('');
        setError('');
        setIsVerified(false);
        onVerify(false);
    };

    const handleVerify = () => {
        if (userInput.trim() === correctAnswer) {
            setIsVerified(true);
            setError('');
            onVerify(true);
        } else {
            setError('Respuesta incorrecta. Inténtalo de nuevo.');
            setIsVerified(false);
            onVerify(false);
            // Generar nuevo CAPTCHA después de error
            setTimeout(() => {
                handleRefresh();
            }, 1500);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserInput(e.target.value);
        setError('');
    };

    return (
        <Card className="mt-6">
            <CardHeader>
                <CardTitle className="text-lg">Verificación de Seguridad</CardTitle>
                <CardDescription>Completa esta verificación para confirmar que no eres un robot</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                        <div className="flex-1">
                            <Label htmlFor="captcha-input">¿Cuánto es {captchaText}?</Label>
                            <div className="mt-2 flex space-x-2">
                                <Input
                                    id="captcha-input"
                                    type="number"
                                    value={userInput}
                                    onChange={handleInputChange}
                                    placeholder="Ingresa tu respuesta"
                                    disabled={isVerified}
                                    className={isVerified ? 'border-green-500' : ''}
                                />
                                <Button type="button" variant="outline" size="icon" onClick={handleRefresh} disabled={isVerified}>
                                    <RefreshCw className="h-4 w-4" />
                                    <span className="sr-only">Generar nuevo CAPTCHA</span>
                                </Button>
                            </div>
                        </div>
                    </div>

                    {!isVerified && (
                        <Button type="button" onClick={handleVerify} disabled={!userInput.trim()} className="w-full">
                            Verificar
                        </Button>
                    )}

                    {error && <p className="text-sm font-medium text-red-700 dark:text-red-400">{error}</p>}

                    {isVerified && (
                        <div className="flex items-center space-x-2 text-green-600">
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100">
                                <span className="text-xs">✓</span>
                            </div>
                            <span className="text-sm font-medium">Verificación completada</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
});
