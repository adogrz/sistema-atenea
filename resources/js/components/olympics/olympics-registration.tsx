import { useForm } from "react-hook-form"
import { router, usePage } from "@inertiajs/react"
import { toast } from "sonner"

import {
  Card, CardHeader, CardContent,
  CardTitle, CardDescription
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { FaseOlimpiada, Inscripcion } from "@/types/olympics/registration"

import { format } from 'date-fns'
import { es } from 'date-fns/locale'

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

export default function InscripcionOlimpiada({
  fasesAgrupadas,
  estudiante,
  inscripciones,
  puedeInscribirse
}: InscripcionOlimpiadaProps) {

  const form = useForm({
    defaultValues: {
      fase_id: "",
      codigo_estudiante: estudiante.codigo
    }
  })

  const { props } = usePage()
  const errors = props.errors as Record<string, string>
  const flash = props.flash as { success?: string }

  // Mostrar toast si hay mensaje de éxito
  if (flash?.success) {
    toast.success(flash.success)
  }

  // Mostrar toast si hay errores del backend
  if (errors?.msg) {
    toast.error(errors.msg)
  }

  const inscribirEnFase = (faseId: number) => {
    form.setValue("fase_id", String(faseId))

    router.post("/dashboard/inscripciones", form.getValues(), {
      preserveScroll: true,
    })
  }

  const obtenerInscripcion = (olimpiadaId: number, faseId: number) =>
    inscripciones[olimpiadaId]?.find(i => i.fase_id === faseId)

  const formatearFecha = (fecha: string) => {
    return format(new Date(fecha), "dd 'de' MMMM 'de' yyyy", { locale: es })
  }

  const renderTarjetaOlimpiada = (olimpiadaId: string, fases: FaseOlimpiada[]) => {
    const primeraFase = fases[0]
    const inscrito = obtenerInscripcion(Number(olimpiadaId), primeraFase.id)
    const puede = puedeInscribirse[Number(olimpiadaId)]

    return (
      <Card key={olimpiadaId}>
        <CardHeader>
          <CardTitle>{primeraFase.olimpiada.nombre}</CardTitle>
          <CardDescription>
            {primeraFase.nombre} • {formatearFecha(primeraFase.fecha_inicio.toString())} → {formatearFecha(primeraFase.fecha_fin.toString())}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="text-sm">Área: {primeraFase.olimpiada.area_academica}</p>
            {inscrito && (
              <Badge variant="secondary" className="m-1">Estado: Inscrito</Badge>
            )}
          </div>
          {!inscrito && puede && (
            <Button onClick={() => inscribirEnFase(primeraFase.id)}>Inscribirse</Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Panel de Inscripción</CardTitle>
          <CardDescription>
            <p>Información del estudiante</p>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p><strong>Código:</strong> {estudiante.codigo}</p>
          <p><strong>Nombre: </strong>{estudiante.nombre_completo}</p>
          <p><strong>Grado:</strong> {estudiante.nivel_educativo ?? "No asignado"}</p>
          <p><strong>Centro:</strong> {estudiante?.centro_educativo ?? "No asignado"}</p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {Object.entries(fasesAgrupadas).map(([olimpiadaId, fases]) =>
          renderTarjetaOlimpiada(olimpiadaId, fases)
        )}
      </div>
    </div>
  )
}