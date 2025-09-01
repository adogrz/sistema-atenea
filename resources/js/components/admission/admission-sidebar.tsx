'use client';

import StepperAdmision from '@/components/admission/stepper-admission';
import { SidebarContent, SidebarFooter, SidebarHeader } from '@/components/ui/sidebar';
import AppLogoIcon from '../app-logo-icon';

interface AdmissionSidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    erroresPorSeccion?: Record<string, number>;
    isLoading?: boolean;
    disabled?: boolean;
    onValidateStep?: (stepId: string) => Promise<boolean>;
    completedSteps?: Set<string>;
}

export default function AdmissionSidebar({
    activeTab,
    onTabChange,
    erroresPorSeccion = {},
    isLoading = false,
    disabled = false,
    onValidateStep,
    completedSteps = new Set(),
}: AdmissionSidebarProps) {
    return (
        <>
            {/* Header del Sidebar */}
            <SidebarHeader className="border-b p-6">
                <div className="flex items-center justify-center gap-3">
                    <AppLogoIcon className="size-12 fill-current text-sidebar-primary" />
                    <div className="flex flex-col">
                        <span className="text-lg font-bold tracking-tight">Sistema Atenea</span>
                        <span className="text-xs text-muted-foreground">Admisiones</span>
                    </div>
                </div>
            </SidebarHeader>

            {/* Contenido principal con el stepper */}
            <SidebarContent className="flex flex-1 items-start justify-start overflow-hidden px-6 py-6">
                <StepperAdmision
                    activeTab={activeTab}
                    onTabChange={onTabChange}
                    erroresPorSeccion={erroresPorSeccion}
                    isLoading={isLoading}
                    disabled={disabled}
                    onValidateStep={onValidateStep}
                    completedSteps={completedSteps}
                />
            </SidebarContent>

            {/* Footer con indicador de progreso */}
            <SidebarFooter className="border-t bg-muted/30 p-4">
                <div className="text-center text-sm text-muted-foreground">
                    {disabled ? '✅ Solicitud enviada' : activeTab === 'resumen' ? '✓ Listo para enviar' : 'Completa todos los pasos'}
                </div>
            </SidebarFooter>
        </>
    );
}
