'use client';

import { Stepper, StepperDescription, StepperIndicator, StepperItem, StepperSeparator, StepperTitle, StepperTrigger } from '@/components/ui/stepper';

interface StepperAdmisionProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    erroresPorSeccion?: Record<string, number>;
    isLoading?: boolean;
    disabled?: boolean;
    onValidateStep?: (stepId: string) => Promise<boolean>;
    completedSteps?: Set<string>;
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
    onValidateStep,
    completedSteps = new Set(),
}: StepperAdmisionProps) {
    const currentStep = steps.find((step) => step.id === activeTab)?.step || 1;

    const handleStepChange = async (stepNumber: number) => {
        // No permitir cambio de paso si está cargando o deshabilitado
        if (isLoading || disabled) return;

        const targetStep = steps.find((s) => s.step === stepNumber);
        if (!targetStep) return;

        const currentStepIndex = steps.findIndex((s) => s.id === activeTab);
        const targetStepIndex = stepNumber - 1;

        // Siempre permitir navegar hacia atrás
        if (targetStepIndex < currentStepIndex) {
            onTabChange(targetStep.id);
            return;
        }

        // Si es el mismo paso, no hacer nada
        if (targetStepIndex === currentStepIndex) {
            return;
        }

        // Para navegar hacia adelante, validar el paso actual
        if (targetStepIndex > currentStepIndex && onValidateStep) {
            const isValid = await onValidateStep(activeTab);
            if (isValid) {
                onTabChange(targetStep.id);
            }
            // Si no es válido, el hook de validación ya mostrará el error
        } else if (!onValidateStep) {
            // Si no hay función de validación, permitir el cambio
            onTabChange(targetStep.id);
        }
    };

    const getStepStatus = (stepId: string) => {
        if (stepId === activeTab) {
            return 'current';
        } else if (erroresPorSeccion[stepId] > 0) {
            return 'error';
        } else if (completedSteps.has(stepId)) {
            return 'completed';
        } else {
            return 'pending';
        }
    };

    const canNavigateToStep = (stepId: string, stepNumber: number) => {
        const currentStepIndex = steps.findIndex((s) => s.id === activeTab);
        const targetStepIndex = stepNumber - 1;

        // Siempre puede navegar hacia atrás o al paso actual
        if (targetStepIndex <= currentStepIndex) {
            return true;
        }

        // Puede navegar a cualquier paso completado
        if (completedSteps.has(stepId)) {
            return true;
        }

        // Lógica especial para el resumen (último paso)
        if (stepId === 'resumen') {
            // Puede ir al resumen si todos los pasos anteriores están completados y sin errores
            const allPreviousStepsCompleted = steps
                .slice(0, -1) // Excluir el resumen
                .every((step) => completedSteps.has(step.id) && erroresPorSeccion[step.id] === 0);
            return allPreviousStepsCompleted;
        }

        // Para navegar hacia adelante a un paso no completado, el paso anterior debe estar completado
        if (targetStepIndex === currentStepIndex + 1) {
            return completedSteps.has(activeTab) && erroresPorSeccion[activeTab] === 0;
        }

        // No puede saltar múltiples pasos hacia adelante si no están completados
        return false;
    };

    return (
        <div className={`w-full max-w-[256px] min-w-[256px] space-y-2 ${disabled ? 'opacity-75' : ''}`}>
            {/* Fija ancho al del sidebar (16rem) para evitar encogimiento visual */}
            <Stepper value={currentStep} onValueChange={handleStepChange} orientation="vertical" className="w-full">
                {/* Ancho completo del Stepper */}
                {steps.map(({ step, id, title, description }) => {
                    const stepStatus = getStepStatus(id);
                    const canNavigate = canNavigateToStep(id, step);

                    return (
                        <StepperItem
                            key={id}
                            step={step}
                            completed={stepStatus === 'completed'}
                            className="relative w-full items-start not-last:flex-1"
                            loading={isLoading && step === currentStep}
                        >
                            {/* Ancho completo por ítem */}
                            <StepperTrigger
                                className={`min-h-[56px] w-full items-start rounded pb-8 last:pb-0 ${
                                    canNavigate && !isLoading && !disabled ? 'cursor-pointer' : 'cursor-default'
                                } ${!canNavigate && stepStatus === 'pending' ? 'opacity-60' : 'opacity-100'}`}
                                disabled={!canNavigate || isLoading || disabled}
                            >
                                {/* Altura mínima y opacidad estable cuando está disabled */}
                                <div className="relative">
                                    <StepperIndicator
                                        className={
                                            completedSteps.has(id) && erroresPorSeccion[id] === 0
                                                ? 'border-green-500 bg-green-500 text-white data-[state=active]:border-green-500 data-[state=active]:bg-green-500 data-[state=active]:text-white data-[state=completed]:border-green-500 data-[state=completed]:bg-green-500 data-[state=completed]:text-white'
                                                : ''
                                        }
                                    />

                                    {/* Indicador de errores */}
                                    {erroresPorSeccion[id] > 0 && !isLoading && !(completedSteps.has(id) && erroresPorSeccion[id] === 0) && (
                                        <div className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full border border-red-600 bg-red-500 text-xs font-bold text-white shadow-md ring-2 ring-background dark:border-red-500 dark:bg-red-600">
                                            {erroresPorSeccion[id] > 9 ? '9+' : erroresPorSeccion[id]}
                                        </div>
                                    )}

                                    {/* Indicador de paso bloqueado */}
                                    {!canNavigate && stepStatus === 'pending' && !isLoading && (
                                        <div className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-gray-400 text-xs">
                                            <svg className="h-2 w-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-0.5 w-full space-y-0.5 px-2 text-left">
                                    <StepperTitle
                                        className={`text-sm font-medium ${
                                            isLoading && step === currentStep
                                                ? 'text-muted-foreground'
                                                : stepStatus === 'error'
                                                  ? 'text-red-700 dark:text-red-400'
                                                  : completedSteps.has(id) && erroresPorSeccion[id] === 0
                                                    ? 'text-green-700 dark:text-green-400'
                                                    : stepStatus === 'current'
                                                      ? 'text-primary'
                                                      : !canNavigate
                                                        ? 'text-muted-foreground'
                                                        : ''
                                        }`}
                                    >
                                        {title}
                                    </StepperTitle>
                                    <StepperDescription
                                        className={`text-xs ${
                                            stepStatus === 'error'
                                                ? 'text-red-600 dark:text-red-500'
                                                : completedSteps.has(id) && erroresPorSeccion[id] === 0
                                                  ? 'text-green-600 dark:text-green-500'
                                                  : 'text-muted-foreground'
                                        }`}
                                    >
                                        {isLoading && step === currentStep
                                            ? 'Validando...'
                                            : disabled && step === currentStep
                                              ? 'Completado'
                                              : stepStatus === 'error'
                                                ? `${erroresPorSeccion[id]} error${erroresPorSeccion[id] > 1 ? 'es' : ''}`
                                                : completedSteps.has(id) && erroresPorSeccion[id] === 0
                                                  ? 'Completado'
                                                  : !canNavigate && stepStatus === 'pending'
                                                    ? 'Bloqueado'
                                                    : description}
                                    </StepperDescription>
                                </div>
                            </StepperTrigger>
                            {step < steps.length && (
                                <StepperSeparator
                                    className={`absolute inset-y-0 top-[calc(1.5rem+0.125rem)] left-3 -order-1 m-0 -translate-x-1/2 group-data-[orientation=horizontal]/stepper:w-[calc(100%-1.5rem-0.25rem)] group-data-[orientation=horizontal]/stepper:flex-none group-data-[orientation=vertical]/stepper:h-[calc(100%-1.5rem-0.25rem)] ${
                                        completedSteps.has(id) && erroresPorSeccion[id] === 0 ? '!bg-green-500' : ''
                                    }`}
                                />
                            )}
                        </StepperItem>
                    );
                })}
            </Stepper>
        </div>
    );
}
