'use client';

import { Stepper, StepperDescription, StepperIndicator, StepperItem, StepperSeparator, StepperTitle, StepperTrigger } from '@/components/ui/stepper';

interface StepperAdmisionProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    erroresPorSeccion?: Record<string, number>;
    isLoading?: boolean;
    disabled?: boolean;
}

const steps = [
    {
        step: 1,
        id: 'datos-personales',
        title: 'Datos Personales',
        description: 'Información del aspirante.',
    },
    {
        step: 2,
        id: 'datos-responsables',
        title: 'Responsables',
        description: 'Padres o tutores legales.',
    },
    {
        step: 3,
        id: 'direccion',
        title: 'Dirección',
        description: 'Lugar de residencia.',
    },
    {
        step: 4,
        id: 'educacion',
        title: 'Educación',
        description: 'Información académica.',
    },
    {
        step: 5,
        id: 'resumen',
        title: 'Resumen',
        description: 'Revisa y envía.',
    },
];

export default function StepperAdmision({
    activeTab,
    onTabChange,
    erroresPorSeccion = {},
    isLoading = false,
    disabled = false,
}: StepperAdmisionProps) {
    const currentStep = steps.find((step) => step.id === activeTab)?.step || 1;

    const handleStepChange = (stepNumber: number) => {
        // No permitir cambio de paso si está cargando o deshabilitado
        if (isLoading || disabled) return;

        const step = steps.find((s) => s.step === stepNumber);
        if (step) {
            onTabChange(step.id);
        }
    };

    return (
        <div className={`w-full max-w-[256px] min-w-[256px] space-y-2 ${disabled ? 'opacity-75' : ''}`}>
            {/* Fija ancho al del sidebar (16rem) para evitar encogimiento visual */}
            <Stepper value={currentStep} onValueChange={handleStepChange} orientation="vertical" className="w-full">
                {/* Ancho completo del Stepper */}
                {steps.map(({ step, id, title, description }) => (
                    <StepperItem
                        key={id}
                        step={step}
                        className="relative w-full items-start not-last:flex-1"
                        loading={isLoading && step === currentStep}
                    >
                        {/* Ancho completo por ítem */}
                        <StepperTrigger
                            className="min-h-[56px] w-full items-start rounded pb-8 last:pb-0 disabled:opacity-100"
                            disabled={isLoading || disabled}
                        >
                            {/* Altura mínima y opacidad estable cuando está disabled */}
                            <div className="relative">
                                <StepperIndicator />
                                {/* Indicador de errores - mejorado para visibilidad en ambos modos */}
                                {erroresPorSeccion[id] > 0 && !isLoading && !disabled && (
                                    <div className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full border border-red-600 bg-red-500 text-xs font-bold text-white shadow-md ring-2 ring-background dark:border-red-500 dark:bg-red-600">
                                        {erroresPorSeccion[id] > 9 ? '9+' : erroresPorSeccion[id]}
                                    </div>
                                )}
                            </div>
                            <div className="mt-0.5 w-full space-y-0.5 px-2 text-left">
                                <StepperTitle className={`text-sm font-medium ${isLoading && step === currentStep ? 'text-muted-foreground' : ''}`}>
                                    {title}
                                </StepperTitle>
                                <StepperDescription className="text-xs text-muted-foreground">
                                    {isLoading && step === currentStep
                                        ? 'Validando...'
                                        : disabled && step === currentStep
                                          ? 'Completado'
                                          : description}
                                </StepperDescription>
                            </div>
                        </StepperTrigger>
                        {step < steps.length && (
                            <StepperSeparator className="absolute inset-y-0 top-[calc(1.5rem+0.125rem)] left-3 -order-1 m-0 -translate-x-1/2 group-data-[orientation=horizontal]/stepper:w-[calc(100%-1.5rem-0.25rem)] group-data-[orientation=horizontal]/stepper:flex-none group-data-[orientation=vertical]/stepper:h-[calc(100%-1.5rem-0.25rem)]" />
                        )}
                    </StepperItem>
                ))}
            </Stepper>
        </div>
    );
}
