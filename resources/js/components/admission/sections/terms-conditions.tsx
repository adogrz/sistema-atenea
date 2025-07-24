"use client"

import type { UseFormReturn } from "react-hook-form"
import { ExternalLink } from "lucide-react"

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface ConsentimientosProps {
  form: UseFormReturn<any>
}

export default function Consentimientos({ form }: ConsentimientosProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Consentimientos y Términos</CardTitle>
        <CardDescription>Revisa y acepta los términos y condiciones del programa</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={form.control}
          name="aceptoTerminos"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <div className="flex items-center space-x-1">
                  <FormLabel className="text-sm font-medium">
                    Acepto los términos y condiciones del Programa Jóvenes Talento
                  </FormLabel>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-5 w-5">
                        <ExternalLink className="h-4 w-4" />
                        <span className="sr-only">Ver términos</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Términos y Condiciones</DialogTitle>
                        <DialogDescription>
                          Programa Jóvenes Talento - Términos y Condiciones de Participación
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4 text-sm">
                        <h3 className="text-lg font-medium">1. Introducción</h3>
                        <p>
                          El Programa Jóvenes Talento es una iniciativa educativa que busca identificar y desarrollar el
                          potencial académico de estudiantes destacados en áreas científicas y matemáticas.
                        </p>

                        <h3 className="text-lg font-medium">2. Requisitos de participación</h3>
                        <p>Para participar en el programa, los aspirantes deben:</p>
                        <ul className="list-disc pl-6">
                          <li>Tener entre 10 y 25 años de edad</li>
                          <li>Estar matriculados en una institución educativa reconocida</li>
                          <li>Mantener un promedio académico satisfactorio</li>
                          <li>Comprometerse a asistir a todas las actividades programadas</li>
                        </ul>

                        <h3 className="text-lg font-medium">3. Proceso de selección</h3>
                        <p>El proceso de selección incluye:</p>
                        <ul className="list-disc pl-6">
                          <li>Evaluación de la solicitud y documentación</li>
                          <li>Pruebas de aptitud según las olimpiadas seleccionadas</li>
                          <li>Entrevista personal (en casos específicos)</li>
                        </ul>

                        <h3 className="text-lg font-medium">4. Compromisos del participante</h3>
                        <p>Al ser aceptado en el programa, el participante se compromete a:</p>
                        <ul className="list-disc pl-6">
                          <li>Asistir puntualmente a todas las sesiones programadas</li>
                          <li>Cumplir con las tareas y actividades asignadas</li>
                          <li>Mantener una conducta respetuosa y colaborativa</li>
                          <li>Representar dignamente al programa en competencias nacionales e internacionales</li>
                        </ul>

                        <h3 className="text-lg font-medium">5. Uso de datos personales</h3>
                        <p>
                          Los datos proporcionados serán utilizados exclusivamente para fines relacionados con el
                          programa y no serán compartidos con terceros sin consentimiento previo.
                        </p>

                        <h3 className="text-lg font-medium">6. Modificaciones</h3>
                        <p>
                          La organización se reserva el derecho de modificar estos términos y condiciones, notificando
                          oportunamente a los participantes sobre cualquier cambio.
                        </p>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <FormDescription className="text-xs">
                  Al marcar esta casilla, confirmas que has leído y aceptas los términos y condiciones del programa.
                </FormDescription>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="autorizoMoodle"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-sm font-medium">
                  Autorizo el uso de mis datos para la plataforma Moodle
                </FormLabel>
                <FormDescription className="text-xs">
                  Esta autorización nos permite crear automáticamente tu cuenta en la plataforma de aprendizaje Moodle y
                  matricularte en los cursos correspondientes a las olimpiadas seleccionadas.
                </FormDescription>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  )
}