'use client';

import { Stepper, StepperDescription, StepperIndicator, StepperItem, StepperSeparator, StepperTitle, StepperTrigger } from '@/components/ui/stepper';

interface StepperAdmisionProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    erroresPorSeccion?: Record<string, number>;
}

const steps = [
    {
        step: 1,
        id: 'datos-personales',
        title: 'Datos Personales',
        description: 'Información del estudiante.',
    },
    {
        step: 2,
        id: 'datos-responsables',
        title: 'Responsables',
        description: 'Padres o tutores.',
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
        description: 'Historial académico.',
    },
    {
        step: 5,
        id: 'resumen',
        title: 'Resumen',
        description: 'Revisa y envía.',
    },
];

export default function StepperAdmision({ activeTab, onTabChange, erroresPorSeccion = {} }: StepperAdmisionProps) {
    const currentStep = steps.find((step) => step.id === activeTab)?.step || 1;

    const handleStepChange = (stepNumber: number) => {
        const step = steps.find((s) => s.step === stepNumber);
        if (step) {
            onTabChange(step.id);
        }
    };

    return (
        <div className="space-y-2">
            <Stepper value={currentStep} onValueChange={handleStepChange} orientation="vertical">
                {steps.map(({ step, id, title, description }) => (
                    <StepperItem key={id} step={step} className="relative items-start not-last:flex-1">
                        <StepperTrigger className="items-start rounded pb-8 last:pb-0">
                            <div className="relative">
                                <StepperIndicator />
                                {/* Indicador de errores */}
                                {erroresPorSeccion[id] > 0 && (
                                    <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
                                        {erroresPorSeccion[id]}
                                    </div>
                                )}
                            </div>
                            <div className="mt-0.5 space-y-0.5 px-2 text-left">
                                <StepperTitle className="text-sm font-medium">{title}</StepperTitle>
                                <StepperDescription className="text-xs text-muted-foreground">{description}</StepperDescription>
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
