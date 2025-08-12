import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { FaseOlimpiada, Inscripcion } from "@/types/olympics/registration"

import InscripcionOlimpiada from "@/components/olympics/olympics-registration"

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Inicio', href: '/dashboard' },
    { title: 'Incripción', href: '/dashboard/inscripciones' },
];

interface InscripcionOlimpiadaProps {
    fasesAgrupadas: Record<number, FaseOlimpiada[]>
    estudiante: {
        codigo: string
        nombre_completo: string
        nivel_educativo: string
        centro_educativo: string
    }
    inscripciones: Record<number, Inscripcion[]>
    puedeInscribirse: Record<number, boolean>
}

export default function DashboardStudents({
    fasesAgrupadas,
    estudiante,
    inscripciones,
    puedeInscribirse
}: InscripcionOlimpiadaProps) {

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="space-y-4">
                <InscripcionOlimpiada
                    fasesAgrupadas={fasesAgrupadas}
                    estudiante={estudiante}
                    inscripciones={inscripciones}
                    puedeInscribirse={puedeInscribirse}
                />
            </div>
        </AppLayout>
    )
}