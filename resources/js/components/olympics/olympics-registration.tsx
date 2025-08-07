import { useForm } from "react-hook-form"
import { router } from "@inertiajs/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

interface Fase {
  id: number
  nombre: string
  modalidad: string
  nota_minima: string
  olimpiada: {
    nombre: string
    area_academica: string
  }
}

interface InscribirseProps {
  fases: Fase[]
  estudiante: {
    codigo: string
    primer_nombre: string
    primer_apellido: string
    centro_educativo: string
    nivel: string
    nivel_educativo: string
  }
}

export default function Inscribirse({ fases, estudiante }: InscribirseProps) {
  const form = useForm({
    defaultValues: {
      fase_id: "",
      participante_id: estudiante?.codigo || "",
    },
  })

  const onSubmit = (values: any) => {
    router.post("/inscripciones", values)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Formulario de Inscripción</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="text-sm">
              <p><strong>Estudiante:</strong> {estudiante?.primer_nombre} {estudiante?.primer_apellido}</p>
              <p><strong>Centro Educativo:</strong> {estudiante?.centro_educativo}</p>
              <p><strong>Nivel:</strong> {estudiante?.nivel_educativo} ({estudiante?.nivel})</p>
            </div>

            <FormField
              control={form.control}
              name="fase_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Selecciona Fase</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una fase disponible" />
                    </SelectTrigger>
                    <SelectContent>
                      {fases.map(f => (
                        <SelectItem key={f.id} value={String(f.id)}>
                          {f.olimpiada.nombre} — {f.nombre} ({f.modalidad})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <input type="hidden" {...form.register("participante_id")} />

            <Button type="submit">Inscribirse</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}