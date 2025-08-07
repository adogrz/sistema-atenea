import { useForm } from "react-hook-form"
import { router } from "@inertiajs/react"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { CentroEducativo, FaseOlimpiada, Inscripcion } from "@/types/olympics/registration"

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Inicio', href: '/dashboard' },
    { title: 'Incripción', href: '/dashboard/inscripciones' },
];

interface EstudianteDashboardProps {
    fases: FaseOlimpiada[]
    estudiante: {
        codigo: string
        nombre_completo: string
        nivel_educativo: string
        centro_educativo: string
    }
    inscripciones: Inscripcion[]
    centro_educativo: CentroEducativo
}

export default function EstudianteDashboard({ fases, estudiante, inscripciones, centro_educativo }: EstudianteDashboardProps) {
    const form = useForm({
        defaultValues: {
            fase_id: "",
            participante_id: estudiante.codigo
        }
    })

    const handleInscripcion = (faseId: number) => {
        form.setValue("fase_id", String(faseId))
        router.post("/inscripciones", form.getValues())
    }

    const faseInscrita = (id: number) => {
        return inscripciones.find(i => i.fase_id === id)
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Panel del Participante</CardTitle>
                        <CardDescription>{estudiante.nombre_completo}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p><strong>Nivel:</strong> {estudiante.nivel_educativo}</p>
                        <p><strong>Código:</strong> {estudiante.codigo}</p>
                        <p><strong>Centro:</strong> {centro_educativo.nombre}</p>
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    {fases.map(f => {
                        const inscrito = faseInscrita(f.id)
                        return (
                            <Card key={f.id}>
                                <CardHeader>
                                    <CardTitle>{f.olimpiada.nombre}</CardTitle>
                                    <CardDescription>{f.nombre} • {f.modalidad} • {f.fecha_inicio} → {f.fecha_fin}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted">Área: {f.olimpiada.area_academica}</p>
                                        {inscrito && (
                                            <Badge variant="secondary">Estado: {inscrito.estado}</Badge>
                                        )}
                                    </div>
                                    {!inscrito && (
                                        <Button onClick={() => handleInscripcion(f.id)}>Inscribirse</Button>
                                    )}
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            </div>
        </AppLayout>
    )
}