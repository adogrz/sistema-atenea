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

        <Input placeholder="Código del centro educativo" {...register("codigo")} onChange={handleCodigoChange} />
        <Input placeholder="Nombre del centro educativo" {...register("nombre")} />
        <Input placeholder="Departamento" {...register("departamento")} />
        <Input placeholder="Distrito" {...register("distrito")} />
        <Select {...register("sector")}>
          <SelectTrigger>
            <SelectValue placeholder="Sector" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PÚBLICO">PÚBLICO</SelectItem>
            <SelectItem value="PRIVADO">PRIVADO</SelectItem>
          </SelectContent>
        </Select>
        <Select {...register("zona")}>
          <SelectTrigger>
            <SelectValue placeholder="Zona" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Rural">Rural</SelectItem>
            <SelectItem value="Urbana">Urbana</SelectItem>
          </SelectContent>
        </Select>
        <Select {...register("internacional")}>
          <SelectTrigger>
            <SelectValue placeholder="Internacional" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SI">SI</SelectItem>
            <SelectItem value="NO">NO</SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit">Buscar</Button>
      <div className="mt-6">
        {resultados.length > 0 ? (
          <ul>
            {resultados.map((centro) => (
              <li key={centro.codigo}>
                {centro.nombre} - {centro.departamento}, {centro.distrito} ({centro.sector}, {centro.zona}, {centro.internacional})
              </li>
            ))}
          </ul>
        ) : (
          <p>No se encontraron resultados</p>
        )}
      </div>

      <FormField
        control={form.control}
        name="centro_educativo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Centro educativo actual</FormLabel>
            <FormControl>
              <Input placeholder="Ej. Instituto Nacional José Simeón Cañas" {...field} />
            </FormControl>
            <FormDescription>Nombre de la institución donde estudias actualmente</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="nivel_estudio"
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
                <SelectItem value="cuarto_grado">Otro</SelectItem>
                <SelectItem value="quinto_grado">Otro</SelectItem>
                <SelectItem value="sexto_grado">Otro</SelectItem>
                <SelectItem value="septimo_grado">Otro</SelectItem>
                <SelectItem value="octavo_grado">Otro</SelectItem>
                <SelectItem value="noveno_grado">Otro</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </CardContent>
    </Card >
  )
}