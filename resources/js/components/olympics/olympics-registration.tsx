import { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { router, usePage } from "@inertiajs/react"
import { toast } from "sonner"
import {
  Card, CardHeader, CardContent,
  CardTitle, CardDescription
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  CheckCircle,
  Clock,
  XCircle,
  Check,
} from "lucide-react"

import { format } from 'date-fns'
import { es } from 'date-fns/locale'

import type { FaseOlimpiada, Inscripcion } from "@/types/olympics/registration"

interface InscripcionOlimpiadaProps {
  fasesAgrupadas: Record<number, FaseOlimpiada[]>
  estudiante: {
    codigo: string
    nombre_completo: string
    nivel_educativo: string | null
    centro_educativo: string | null
  }
  /**
   * Inscripciones del estudiante agrupadas por id de olimpiada.
   * Cada inscripción debe indicar al menos: id, fase_id, estado { slug, nombre }
   */
  inscripciones: Record<number, Inscripcion[]>
  /**
   * Permiso para inscribirse por olimpiada (calculado por el backend).
   */
  puedeInscribirse: Record<number, boolean>
}

const estadoTag = (slug?: string, nombre?: string) => {
  switch (slug) {
    case "inscrito":
      return <Badge className="bg-green-100 text-green-800"><Check className="w-3 h-3" /> {nombre}</Badge>
    case "pendiente":
      return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3" /> {nombre}</Badge>
    case "anulado":
      return <Badge className="bg-gray-200 text-gray-600"><XCircle className="w-3 h-3" /> {nombre}</Badge>
    case "preinscrito":
      return <Badge className="bg-blue-100 text-blue-800"><CheckCircle className="w-3 h-3" /> {nombre}</Badge>
    default:
      return nombre ? <Badge className="bg-muted text-muted-foreground">{nombre}</Badge> : null
  }
}

/**
 * Normaliza y muestra mensajes provenientes del backend (Laravel + Inertia):
 * - flash.success | flash.error | flash.warning | flash.info (string o string[])
 * - status (string)
 * - errors (MessageBag de validación)
 */
function useBackendMessages() {
  const { props } = usePage()
  const { flash, status, errors } = props as unknown as {
    flash?: Record<string, string | string[]>
    status?: string
    errors?: Record<string, string | string[]>
  }

  useEffect(() => {
    if (!flash) return

    const push = (type: keyof typeof flash) => {
      const val = flash[type]
      if (!val) return
      const list = Array.isArray(val) ? val : [val]
      list.forEach((msg) => {
        if (!msg) return
        if (type === 'success') toast.success(msg)
        else if (type === 'error') toast.error(msg)
        else if (type === 'warning') toast.warning?.(msg) ?? toast(msg)
        else if (type === 'info') toast.info?.(msg) ?? toast(msg)
        else toast(msg)
      })
    }

    push('success')
    push('error')
    push('warning')
    push('info')
    // Soporta variantes usadas previamente
    if ((flash as any).msg) toast.error((flash as any).msg)
  }, [flash])

  useEffect(() => {
    if (status) toast(status)
  }, [status])

  useEffect(() => {
    if (!errors) return
    const firstKey = Object.keys(errors)[0]
    if (!firstKey) return
    const first = errors[firstKey]
    const msg = Array.isArray(first) ? first[0] : first
    if (msg) toast.error(msg)
  }, [errors])
}

export default function InscripcionOlimpiada({
  fasesAgrupadas,
  estudiante,
  inscripciones,
  puedeInscribirse
}: InscripcionOlimpiadaProps) {

  useBackendMessages()

  const form = useForm<{ fase_id: string; codigo_estudiante: string }>({
    defaultValues: {
      fase_id: "",
      codigo_estudiante: estudiante.codigo,
    },
    mode: 'onChange',
  })

  const { formState } = form

  const hayFasesDisponibles = useMemo(
    () => Object.values(fasesAgrupadas).some((fases) => fases.length > 0),
    [fasesAgrupadas]
  )

  const formatearFecha = (fecha?: string | Date | null) => {
    if (!fecha) return '—'
    const d = typeof fecha === 'string' || fecha instanceof String ? new Date(String(fecha)) : (fecha as Date)
    if (Number.isNaN(d.getTime())) return '—'
    return format(d, "dd 'de' MMMM 'de' yyyy", { locale: es })
  }

  const inscribirEnFase = (faseId: number) => {
    form.setValue('fase_id', String(faseId))

    router.post('/dashboard/inscripciones', form.getValues(), {
      preserveScroll: true,
      preserveState: true,
      onStart: () => {
        // Limpia toasts duplicados si el usuario hace clic varias veces
        toast.dismiss()
      },
      onSuccess: (page) => {
        // Si el backend redirige con flash.success, useBackendMessages lo mostrará
        // Aquí reforzamos UX inmediata
        const success = (page?.props as any)?.flash?.success
        if (success) {
          const msg = Array.isArray(success) ? success[0] : success
          if (msg) toast.success(msg)
        } else {
          toast.success('Inscripción registrada correctamente.')
        }
      },
      onError: (errs) => {
        // Mapea errores de validación a react-hook-form y toasts
        Object.entries(errs).forEach(([k, v]) => {
          const message = Array.isArray(v) ? v[0] : (v as string)
          form.setError(k as any, { type: 'server', message })
        })
        const first = Object.values(errs)[0]
        const msg = Array.isArray(first) ? first[0] : (first as string)
        if (msg) toast.error(msg)
      },
      onFinish: () => {},
    })
  }

  return (
    <section className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Panel de Inscripción</CardTitle>
          <CardDescription>
            <p>Información del estudiante</p>
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><strong>Código:</strong> {estudiante.codigo}</div>
          <div><strong>Nombre:</strong> {estudiante.nombre_completo}</div>
          <div><strong>Grado:</strong> {estudiante.nivel_educativo ?? "No asignado"}</div>
          <div><strong>Centro:</strong> {estudiante?.centro_educativo ?? "No asignado"}</div>
        </CardContent>
      </Card>

      {hayFasesDisponibles ? (
        <Accordion type="multiple" className="w-full">
          {Object.entries(fasesAgrupadas).map(([olimpiadaIdStr, fases]) => {
            const olimpiadaId = Number(olimpiadaIdStr)
            const inscripcionesOlimpiada = inscripciones[olimpiadaId] || []
            const puede = !!puedeInscribirse[olimpiadaId]

            return (
              <AccordionItem key={olimpiadaId} value={olimpiadaIdStr}>
                <AccordionTrigger className="text-lg font-semibold">
                  {fases[0]?.olimpiada.nombre}
                </AccordionTrigger>
                <AccordionContent className="space-y-4">
                  {fases.map((fase) => {
                    // Busca si YA existe una inscripción PARA ESTA FASE
                    const inscripcion = inscripcionesOlimpiada.find(i => i.fase_id === fase.id)
                    const estado = inscripcion?.estado?.slug
                    const estadoNombre = inscripcion?.estado?.nombre

                    const puedeInscribirseEnFase = !inscripcion && puede

                    return (
                      <Card key={fase.id} className="shadow-md">
                        <CardHeader>
                          <CardTitle className="text-base">{fase.nombre}</CardTitle>
                          <CardDescription className="text-sm text-muted-foreground">
                            {formatearFecha(fase.fecha_inicio as any)} - {formatearFecha(fase.fecha_fin as any)}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="text-sm space-y-1">
                            <p>Área: <span className="font-medium">{fase.olimpiada.area_academica}</span></p>
                            {inscripcion && estadoTag(estado, estadoNombre)}
                          </div>
                          {puedeInscribirseEnFase ? (
                            <Button
                              onClick={() => inscribirEnFase(fase.id)}
                              disabled={formState.isSubmitting}
                            >
                              {formState.isSubmitting ? 'Enviando…' : 'Inscribirse'}
                            </Button>
                          ) : (
                            !inscripcion && (
                              <Button disabled variant="outline" title="Debe completar la fase anterior para continuar">
                                No disponible
                              </Button>
                            )
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Sin fases disponibles</CardTitle>
            <CardDescription>
              Por el momento no hay convocatorias activas para inscripciones.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Vuelve a revisar más adelante o contacta con tu coordinador académico.
            </p>
          </CardContent>
        </Card>
      )}
    </section>
  )
}
