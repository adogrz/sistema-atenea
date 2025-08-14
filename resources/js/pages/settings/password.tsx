import InputError from '@/components/input-error';
import PasswordStrengthInput from '@/components/ui/password-strength-input';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect, useRef, useState } from 'react';

import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { usePasswordGenerator } from '@/hooks/use-password-generator';
import { Copy, Eye, EyeOff, RefreshCw, TriangleAlert, Wand2 } from 'lucide-react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Configuración de contraseña',
        href: '/settings/password',
    },
];

export default function Password() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const { data, setData, errors, put, reset, processing } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const { generateSecurePassword, isGenerating } = usePasswordGenerator();
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [isGeneratorModalOpen, setIsGeneratorModalOpen] = useState(false);
    const [generatedPassword, setGeneratedPassword] = useState('');
    const [showGeneratedPassword, setShowGeneratedPassword] = useState(false);

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
            data.current_password &&
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
    };

    const handleCopyAndUse = async () => {
        // Copiar al portapapeles
        try {
            await navigator.clipboard.writeText(generatedPassword);
            toast.success('Contraseña copiada al portapapeles');
        } catch (err) {
            // Fallback para navegadores que no soportan clipboard API
            const textArea = document.createElement('textarea');
            textArea.value = generatedPassword;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            toast.success('Contraseña copiada al portapapeles');
        }

        // Usar la contraseña en el formulario
        setData('password', generatedPassword);
        setData('password_confirmation', generatedPassword);
        setIsGeneratorModalOpen(false);

        toast.success('Contraseña aplicada al formulario', {
            description: 'Ya puedes proceder a guardar los cambios.',
        });
    };

    const handleGenerateAnother = () => {
        const password = generateSecurePassword(12);
        setGeneratedPassword(password);
        setShowGeneratedPassword(false);
    };

    const updatePassword: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Contraseña actualizada correctamente');
                reset();
            },
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Configuración de contraseña" />

            <SettingsLayout>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <HeadingSmall
                            title="Actualizar contraseña"
                            description="Asegúrate de que tu cuenta utilice una contraseña larga y aleatoria para mantenerla segura"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleGeneratePassword}
                            disabled={processing || isGenerating}
                            className="text-xs"
                        >
                            <Wand2 className="mr-1 h-3 w-3" />
                            {isGenerating ? 'Generando...' : 'Generar contraseña'}
                        </Button>
                    </div>

                    <form onSubmit={updatePassword} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="current_password">Contraseña actual</Label>

                            <PasswordInput
                                id="current_password"
                                ref={currentPasswordInput}
                                autoComplete="current-password"
                                required
                                autoFocus
                                value={data.current_password}
                                onChange={(e) => setData('current_password', e.target.value)}
                                placeholder="••••••••"
                            />

                            <InputError id="current-password-error" message={errors.current_password} />
                        </div>

                        <div className="space-y-2">
                            <PasswordStrengthInput
                                field={{
                                    value: data.password,
                                    onChange: (e) => setData('password', e.target.value),
                                    onBlur: () => {},
                                    name: 'password',
                                    ref: passwordInput,
                                }}
                            />
                            <InputError id="password-error" message={errors.password} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password_confirmation">Confirmar nueva contraseña</Label>

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
                            />
                        </div>

                        <div className="flex flex-col gap-4 pt-4">
                            {!isFormValid() && data.password && (
                                <div className="rounded border border-orange-200 bg-orange-50 p-3 dark:border-orange-800 dark:bg-orange-950/30">
                                    <div className="flex gap-3 text-orange-700 dark:text-orange-300">
                                        <TriangleAlert className="mt-0.5 shrink-0" size={16} aria-hidden="true" />
                                        <p className="text-sm">
                                            {!isPasswordStrong(data.password)
                                                ? 'La contraseña debe cumplir con todos los requisitos de seguridad'
                                                : 'Verifica que todos los campos estén completos y las contraseñas coincidan'}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <Button disabled={processing || !isFormValid()} className="w-full sm:w-auto">
                                {processing ? 'Actualizando...' : 'Guardar contraseña'}
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
                                                onClick={async () => {
                                                    try {
                                                        await navigator.clipboard.writeText(generatedPassword);
                                                        toast.success('Contraseña copiada');
                                                    } catch (err) {
                                                        const textArea = document.createElement('textarea');
                                                        textArea.value = generatedPassword;
                                                        document.body.appendChild(textArea);
                                                        textArea.select();
                                                        document.execCommand('copy');
                                                        document.body.removeChild(textArea);
                                                        toast.success('Contraseña copiada');
                                                    }
                                                }}
                                            >
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>

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
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleGenerateAnother}
                                    disabled={isGenerating}
                                    className="w-full sm:w-auto"
                                >
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
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
