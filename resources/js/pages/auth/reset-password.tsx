import { Head, useForm } from '@inertiajs/react';
import { CheckCircle, Copy, Eye, EyeOff, LoaderCircle, RefreshCw, Wand2 } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import PasswordStrengthInput from '@/components/ui/password-strength-input';
import { usePasswordGenerator } from '@/hooks/use-password-generator';
import AuthLayout from '@/layouts/auth-layout';

interface ResetPasswordProps {
    token: string;
    email: string;
}

type ResetPasswordForm = {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
};

export default function ResetPassword({ token, email }: ResetPasswordProps) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<ResetPasswordForm>>({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const { generateSecurePassword, isGenerating } = usePasswordGenerator();
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [isGeneratorModalOpen, setIsGeneratorModalOpen] = useState(false);
    const [generatedPassword, setGeneratedPassword] = useState('');
    const [showGeneratedPassword, setShowGeneratedPassword] = useState(false);
    const [copyFeedback, setCopyFeedback] = useState<string>('');

    // Función para validar fortaleza de contraseña
    const checkPasswordStrength = (pass: string) => {
        const requirements = [
            { regex: /.{8,}/, text: 'Al menos 8 caracteres' },
            { regex: /[0-9]/, text: 'Al menos 1 número' },
            { regex: /[a-z]/, text: 'Al menos 1 letra minúscula' },
            { regex: /[A-Z]/, text: 'Al menos 1 letra mayúscula' },
        ];

        return requirements.filter((req) => req.regex.test(pass)).length;
    };

    const isPasswordStrong = (password: string) => {
        return checkPasswordStrength(password) >= 4;
    };

    useEffect(() => {
        const newErrors: Record<string, string> = {};
        const password = data.password as string;
        const passwordConfirmation = data.password_confirmation as string;

        // Solo validamos que las contraseñas coincidan, ya que PasswordStrengthInput maneja la validación de fortaleza
        if (passwordConfirmation && password !== passwordConfirmation) {
            newErrors.password_confirmation = 'Las contraseñas no coinciden';
        }

        setValidationErrors(newErrors);
    }, [data.password, data.password_confirmation]);

    const isFormValid = () => {
        return (
            data.email &&
            data.password &&
            isPasswordStrong(data.password) && // Verificamos que la contraseña sea fuerte
            data.password_confirmation &&
            Object.keys(validationErrors).length === 0
        );
    };

    const handleGeneratePassword = () => {
        const password = generateSecurePassword(12);
        setGeneratedPassword(password);
        setIsGeneratorModalOpen(true);
        setShowGeneratedPassword(false);
        setCopyFeedback('');
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopyFeedback('Contraseña copiada al portapapeles');
        } catch (err) {
            // Fallback para navegadores que no soportan clipboard API
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopyFeedback('Contraseña copiada al portapapeles');
        }

        // Limpiar el feedback después de 3 segundos
        setTimeout(() => setCopyFeedback(''), 3000);
    };

    const handleCopyAndUse = async () => {
        await copyToClipboard(generatedPassword);

        // Usar la contraseña en el formulario
        setData('password', generatedPassword);
        setData('password_confirmation', generatedPassword);
        setIsGeneratorModalOpen(false);
    };

    const handleGenerateAnother = () => {
        const password = generateSecurePassword(12);
        setGeneratedPassword(password);
        setShowGeneratedPassword(false);
        setCopyFeedback('');
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout title="Restablecer contraseña" description="Por favor, introduce tu nueva contraseña a continuación">
            <Head title="Restablecer contraseña" />

            <form onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            autoComplete="email"
                            value={data.email}
                            className="mt-1 block w-full"
                            readOnly
                            onChange={(e) => setData('email', e.target.value)}
                        />
                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">Nueva contraseña</Label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleGeneratePassword}
                                disabled={processing || isGenerating}
                                className="h-8 text-xs"
                            >
                                <Wand2 className="mr-1 h-3 w-3" />
                                {isGenerating ? 'Generando...' : 'Generar'}
                            </Button>
                        </div>

                        <PasswordStrengthInput
                            field={{
                                value: data.password,
                                onChange: (e) => setData('password', e.target.value),
                                onBlur: () => {},
                                name: 'password',
                                ref: () => {},
                            }}
                        />
                        <InputError id="password-error" message={errors.password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">Confirmar contraseña</Label>
                        <PasswordInput
                            id="password_confirmation"
                            autoComplete="new-password"
                            required
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            placeholder="••••••••"
                            aria-invalid={!!(errors.password_confirmation || validationErrors.password_confirmation)}
                            aria-describedby={
                                errors.password_confirmation || validationErrors.password_confirmation ? 'password-confirm-error' : undefined
                            }
                        />
                        <InputError
                            id="password-confirm-error"
                            message={errors.password_confirmation || validationErrors.password_confirmation}
                            className="mt-2"
                        />
                    </div>

                    {/* Feedback visual para formularios no válidos */}
                    {!isFormValid() && data.password && (
                        <div className="rounded border border-orange-200 bg-orange-50 p-3 dark:border-orange-800 dark:bg-orange-950/30">
                            <p className="text-sm text-orange-700 dark:text-orange-300">
                                {!isPasswordStrong(data.password)
                                    ? 'La contraseña debe cumplir con todos los requisitos de seguridad'
                                    : 'Verifica que las contraseñas coincidan'}
                            </p>
                        </div>
                    )}

                    <Button type="submit" className="mt-4 w-full" disabled={processing || !isFormValid()}>
                        {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                        Restablecer contraseña
                    </Button>
                </div>
            </form>

            {/* Modal de generador de contraseñas */}
            <Dialog open={isGeneratorModalOpen} onOpenChange={setIsGeneratorModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Wand2 className="h-5 w-5 text-primary" />
                            Contraseña generada
                        </DialogTitle>
                        <DialogDescription>
                            Se ha generado una contraseña segura. Puedes copiarla y usarla, o generar una nueva si prefieres.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Campo de contraseña generada */}
                        <div className="space-y-2">
                            <Label>Contraseña generada</Label>
                            <div className="relative">
                                <input
                                    type={showGeneratedPassword ? 'text' : 'password'}
                                    value={generatedPassword}
                                    readOnly
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 pr-20 font-mono text-sm"
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-1">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        onClick={() => setShowGeneratedPassword(!showGeneratedPassword)}
                                    >
                                        {showGeneratedPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        onClick={() => copyToClipboard(generatedPassword)}
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Feedback de copiado */}
                        {copyFeedback && (
                            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                                <CheckCircle className="h-4 w-4" />
                                {copyFeedback}
                            </div>
                        )}

                        {/* Indicadores de fortaleza */}
                        <div className="rounded-md bg-muted p-3">
                            <p className="mb-2 text-sm font-medium text-foreground">Esta contraseña incluye:</p>
                            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                                    {generatedPassword.length} caracteres
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                                    Letras mayúsculas
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                                    Letras minúsculas
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                                    Números y símbolos
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="flex-col gap-2 sm:flex-row">
                        <Button type="button" variant="outline" onClick={handleGenerateAnother} disabled={isGenerating} className="w-full sm:w-auto">
                            <RefreshCw className={`mr-2 h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                            {isGenerating ? 'Generando...' : 'Generar otra'}
                        </Button>
                        <Button onClick={handleCopyAndUse} className="w-full sm:w-auto">
                            <Copy className="mr-2 h-4 w-4" />
                            Copiar y usar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AuthLayout>
    );
}
