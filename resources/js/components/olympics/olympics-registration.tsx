import { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { router, usePage, Link } from "@inertiajs/react"
import { toast } from "sonner"
import {
  Card, CardHeader, CardContent,
  CardTitle, CardDescription
} from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle,
  Clock,
  XCircle,
  Check,
  Circle,
  Lock,
  AlertTriangle,
  ArrowRight
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
  inscripciones: Record<number, Inscripcion[]>
  puedeInscribirse: Record<number, boolean>
}

const estadoTag = (slug?: string, nombre?: string) => {
  switch (slug) {
    case "inscrito":
      return <Badge className="bg-green-100 text-green-800 border-green-300"><Check className="w-3 h-3 mr-1" /> {nombre}</Badge>
    case "pendiente":
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300"><Clock className="w-3 h-3 mr-1" /> {nombre}</Badge>
    case "anulado":
      return <Badge className="bg-gray-200 text-gray-600 border-gray-300"><XCircle className="w-3 h-3 mr-1" /> {nombre}</Badge>
    case "preinscrito":
      return <Badge className="bg-blue-100 text-blue-800 border-blue-300"><CheckCircle className="w-3 h-3 mr-1" /> {nombre}</Badge>
    default:
      return nombre ? <Badge variant="secondary">{nombre}</Badge> : null
  }
}

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

  const isProfileIncomplete = !estudiante.nivel_educativo || !estudiante.centro_educativo

  const formatearFecha = (fecha?: string | Date | null): string => {
    if (!fecha) return 'Fecha no definida'
    try {
      const d = new Date(fecha)
      if (isNaN(d.getTime())) return 'Fecha inválida'
      return format(d, "dd 'de' MMMM 'de' yyyy", { locale: es })
    } catch {
      return 'Fecha inválida'
    }
  }

  const inscribirEnFase = (faseId: number) => {
    form.setValue('fase_id', String(faseId))

    router.post('/dashboard/inscripciones', form.getValues(), {
      preserveScroll: true,
      preserveState: true,
      onStart: () => toast.dismiss(),
      onSuccess: (page) => {
        const success = (page?.props as any)?.flash?.success
        const msg = Array.isArray(success) ? success[0] : success
        toast.success(msg || 'Inscripción registrada correctamente.')
      },
      onError: (errs) => {
        Object.entries(errs).forEach(([k, v]) => {
          form.setError(k as any, { type: 'server', message: Array.isArray(v) ? v[0] : v })
        })
        const firstError = Object.values(errs)[0]
        toast.error(Array.isArray(firstError) ? firstError[0] : firstError)
      },
    })
  }

  const getPhaseStatusIcon = (inscripcion?: Inscripcion, isLocked: boolean = false) => {
    if (inscripcion) {
      return <CheckCircle className="w-6 h-6 text-green-500" />
    }
    if (isLocked) {
      return <Lock className="w-6 h-6 text-gray-400" />
    }
    return <Circle className="w-6 h-6 text-blue-500" />
  }

  return (
    <section className="max-w-5xl mx-auto px-4 py-6 space-y-8">
      {isProfileIncomplete && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>¡Acción Requerida!</AlertTitle>
          <AlertDescription>
            Tu perfil está incompleto. Por favor, actualiza tu <strong>grado</strong> y <strong>centro educativo</strong> para poder inscribirte en las olimpiadas.
            <Button asChild variant="link" className="p-0 h-auto ml-2">
              <Link href="/settings/profile">Actualizar perfil <ArrowRight className="w-4 h-4 ml-1" /></Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Card className="overflow-hidden shadow-sm">
        <CardHeader className="bg-gray-50 dark:bg-gray-800">
          <CardTitle>Panel de Inscripción</CardTitle>
          <CardDescription>
            Bienvenido, aquí puedes ver y gestionar tus inscripciones a las olimpiadas.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><strong>Código:</strong> {estudiante.codigo}</div>
          <div><strong>Nombre:</strong> {estudiante.nombre_completo}</div>
          <div><strong>Grado:</strong> {estudiante.nivel_educativo ?? <span className="text-destructive font-semibold">No asignado</span>}</div>
          <div><strong>Centro:</strong> {estudiante?.centro_educativo ?? <span className="text-destructive font-semibold">No asignado</span>}</div>
        </CardContent>
      </Card>

      {hayFasesDisponibles ? (
        <div className="space-y-8">
          {Object.entries(fasesAgrupadas).map(([olimpiadaIdStr, fases]) => {
            const olimpiadaId = Number(olimpiadaIdStr)
            const inscripcionesOlimpiada = inscripciones[olimpiadaId] || []
            const puede = !!puedeInscribirse[olimpiadaId]

            return (
              <Card key={olimpiadaId} className="shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-xl">{fases[0]?.olimpiada.nombre}</CardTitle>
                  <CardDescription>Área: {fases[0]?.olimpiada.area.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="relative pl-8">
                    {/* Vertical line for the timeline */}
                    <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-200 dark:bg-gray-700" />

                    {fases.map((fase) => {
                      const inscripcion = inscripcionesOlimpiada.find(i => i.fase_olimpiada_id === fase.id)
                      const puedeInscribirseEnFase = !inscripcion && puede && !isProfileIncomplete
                      const isLocked = !inscripcion && (!puede || isProfileIncomplete)

                      return (
                        <div key={fase.id} className="relative flex items-start gap-6 mb-6">
                          <div className="absolute left-4 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-background">
                            {getPhaseStatusIcon(inscripcion, isLocked)}
                          </div>
                          <div className="flex-1">
                            <div className="p-4 rounded-lg border bg-card text-card-foreground">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-md">{fase.nombre}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {formatearFecha(fase.fecha_inicio)} - {formatearFecha(fase.fecha_fin)}
                                  </p>
                                </div>
                                <div className="flex items-center gap-4">
                                  {inscripcion && estadoTag(inscripcion.estado?.slug, inscripcion.estado?.nombre)}
                                  {puedeInscribirseEnFase && (
                                    <Button
                                      onClick={() => inscribirEnFase(fase.id)}
                                      disabled={formState.isSubmitting}
                                      className="bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                      {formState.isSubmitting ? 'Enviando…' : 'Inscribirse ahora'}
                                    </Button>
                                  )}
                                  {isLocked && (
                                    <div className="text-right">
                                      <Button disabled variant="outline">
                                        No disponible
                                      </Button>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {isProfileIncomplete ? "Completa tu perfil para inscribirte." : "Requiere completar fase anterior."}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardHeader>
            <CardTitle>Sin Olimpiadas Disponibles</CardTitle>
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
