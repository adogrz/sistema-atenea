"use client"

import type { UseFormReturn } from "react-hook-form"
import { HelpCircle } from "lucide-react"

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"

interface EducacionProps {
  form: UseFormReturn<any>
}

export default function Educacion({ form }: EducacionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Educación</CardTitle>
        <CardDescription>Información sobre tu formación académica actual</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={form.control}
          name="centroEducativo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Centro educativo actual</FormLabel>
              <FormControl>
                <Input placeholder="Ej. Instituto Nacional José Simeón Cañas" {...field} />
              </FormControl>
              <FormDescription>Nombre completo de la institución donde estudias actualmente</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nivelEstudios"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nivel de estudios</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tu nivel de estudios" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Básica">Educación Básica</SelectItem>
                  <SelectItem value="Media">Educación Media</SelectItem>
                  <SelectItem value="Técnico">Educación Técnica</SelectItem>
                  <SelectItem value="Otro">Otro</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="promedioAcademico"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Promedio académico</FormLabel>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-5 w-5">
                        <HelpCircle className="h-4 w-4" />
                        <span className="sr-only">Ayuda</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Ingresa tu promedio en escala de 0 a 10, con hasta dos decimales</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Ej. 8.75"
                  step="0.01"
                  min="0"
                  max="10"
                  {...field}
                  onChange={(e) => {
                    const value = Number.parseFloat(e.target.value)
                    field.onChange(isNaN(value) ? 0 : value)
                  }}
                />
              </FormControl>
              <FormDescription>Promedio general del último año académico (escala 0-10)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  )
}