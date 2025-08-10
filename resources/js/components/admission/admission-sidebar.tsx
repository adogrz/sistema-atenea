'use client';

import StepperAdmision from '@/components/admission/stepper-admission';
import { SidebarContent, SidebarFooter, SidebarHeader } from '@/components/ui/sidebar';
import { GraduationCap } from 'lucide-react';

interface AdmissionSidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    erroresPorSeccion?: Record<string, number>;
}

export default function AdmissionSidebar({ activeTab, onTabChange, erroresPorSeccion = {} }: AdmissionSidebarProps) {
    return (
        <>
            {/* Header del Sidebar */}
            <SidebarHeader className="border-b p-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                        <GraduationCap className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-lg font-semibold">Postulación</h2>
                        <p className="text-sm text-muted-foreground">Jóvenes Talento</p>
                    </div>
                </div>
            </SidebarHeader>

            {/* Contenido principal con el stepper */}
            <SidebarContent className="flex flex-1 items-center justify-center overflow-hidden px-6 py-2">
                <StepperAdmision activeTab={activeTab} onTabChange={onTabChange} erroresPorSeccion={erroresPorSeccion} />
            </SidebarContent>

            {/* Footer con indicador de progreso */}
            <SidebarFooter className="border-t bg-muted/30 p-4">
                <div className="text-center text-sm text-muted-foreground">
                    {activeTab === 'resumen' ? '✓ Listo para enviar' : 'Completa todos los pasos'}
                </div>
            </SidebarFooter>
        </>
    );
}
