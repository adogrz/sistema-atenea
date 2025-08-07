"use client"

import type { UseFormReturn } from "react-hook-form"
import { HelpCircle } from "lucide-react"

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"

interface SeleccionOlimpiadasProps {
  form: UseFormReturn<any>
}

const olimpiadas = [
  {
    id: "onm",
    name: "Olimpiada Nacional de Matemáticas (ONM)",
    description: "Competencia de resolución de problemas matemáticos",
  },
  {
    id: "osf",
    name: "Olimpiada Salvadoreña de Física (OSF)",
    description: "Competencia de resolución de problemas de física",
  },
  {
    id: "obi",
    name: "Olimpiada de Biología (OBI)",
    description: "Competencia de conocimientos en biología",
  },
  {
    id: "oiq",
    name: "Olimpiada de Química (OIQ)",
    description: "Competencia de conocimientos en química",
  },
  {
    id: "oci",
    name: "Olimpiada de Ciencias de la Computación (OCI)",
    description: "Competencia de programación y algoritmos",
  },
]

export default function SeleccionOlimpiadas({ form }: SeleccionOlimpiadasProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Selección de Olimpiadas</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon">
                  <HelpCircle className="h-4 w-4" />
                  <span className="sr-only">Ayuda</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">Puedes seleccionar más de una olimpiada según tus intereses</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardDescription>Selecciona las olimpiadas en las que deseas participar</CardDescription>
      </CardHeader>
      <CardContent>
        <FormField
          control={form.control}
          name="olimpiadas"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">Olimpiadas disponibles</FormLabel>
                <FormDescription>Selecciona al menos una olimpiada en la que deseas participar</FormDescription>
              </div>
              <div className="space-y-4">
                {olimpiadas.map((olimpiada) => (
                  <FormField
                    key={olimpiada.id}
                    control={form.control}
                    name="olimpiadas"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={olimpiada.id}
                          className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(olimpiada.id)}
                              onCheckedChange={(checked) => {
                                const currentValue = field.value || []
                                return checked
                                  ? field.onChange([...currentValue, olimpiada.id])
                                  : field.onChange(currentValue.filter((value: string) => value !== olimpiada.id))
                              }}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-medium">{olimpiada.name}</FormLabel>
                            <FormDescription className="text-xs">{olimpiada.description}</FormDescription>
                          </div>
                        </FormItem>
                      )
                    }}
                  />
                ))}
              </div>
              <FormMessage className="mt-2" />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  )
}