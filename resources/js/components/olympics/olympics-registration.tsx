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
    nivel_educativo: string
    centro_educativo: string
  }
  inscripciones: Record<number, Inscripcion[]>
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
    case "finalizado":
      return <Badge className="bg-blue-100 text-blue-800"><CheckCircle className="w-3 h-3" /> {nombre}</Badge>
    default:
      return <Badge className="bg-muted text-muted-foreground">{nombre}</Badge>
  }
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

  console.log(inscripciones);
  const { props } = usePage()
  const errors = props.errors as Record<string, string>
  const flash = props.flash as { success?: string }

  if (flash?.success) toast.success(flash.success)
  if (errors?.msg) toast.error(errors.msg)

  const inscribirEnFase = (faseId: number) => {
    form.setValue("fase_id", String(faseId))
    router.post("/dashboard/inscripciones", form.getValues(), { preserveScroll: true })
  }

  const formatearFecha = (fecha: string) =>
    format(new Date(fecha), "dd 'de' MMMM 'de' yyyy", { locale: es })

  const hayFasesDisponibles = Object.values(fasesAgrupadas).some(fases => fases.length > 0)

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
          {Object.entries(fasesAgrupadas).map(([olimpiadaId, fases]) => {
            const inscripcionesOlimpiada = inscripciones[parseInt(olimpiadaId)] || []
            const puede = puedeInscribirse[parseInt(olimpiadaId)]

            return (
              <AccordionItem key={olimpiadaId} value={olimpiadaId}>
                <AccordionTrigger className="text-lg font-semibold">
                  {fases[0]?.olimpiada.nombre}
                </AccordionTrigger>
                <AccordionContent className="space-y-4">
                  {fases.map((fase) => {
                    const inscripcion = inscripcionesOlimpiada[0]
                    const estado = inscripcion?.estado?.slug
                    const estadoNombre = inscripcion?.estado?.nombre

                    const puedeInscribirseEnFase = !inscripcion && puede

                    return (
                      <Card key={fase.id} className="shadow-md">
                        <CardHeader>
                          <CardTitle className="text-base">{fase.nombre}</CardTitle>
                          <CardDescription className="text-sm text-muted-foreground">
                            {formatearFecha(fase.fecha_inicio.toString())} - {formatearFecha(fase.fecha_fin.toString())}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="text-sm">
                            <p>Área: <span className="font-medium">{fase.olimpiada.area_academica}</span></p>
                            {inscripcion && estadoTag(estado, estadoNombre)}
                          </div>
                          {puedeInscribirseEnFase ? (
                            <Button onClick={() => inscribirEnFase(fase.id)}>
                              Inscribirse
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
