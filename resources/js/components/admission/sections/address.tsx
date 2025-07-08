"use client"

import { useEffect, useState } from "react"
import type { UseFormReturn } from "react-hook-form"

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

interface DireccionProps {
  form: UseFormReturn<any>
}

// Datos simulados para los selects en cascada
const paises = [
  { id: "sv", nombre: "El Salvador" },
  { id: "gt", nombre: "Guatemala" },
  { id: "hn", nombre: "Honduras" },
]

const departamentosPorPais: Record<string, Array<{ id: string; nombre: string }>> = {
  sv: [
    { id: "ss", nombre: "San Salvador" },
    { id: "sa", nombre: "Santa Ana" },
    { id: "sm", nombre: "San Miguel" },
  ],
  gt: [
    { id: "gt", nombre: "Guatemala" },
    { id: "qz", nombre: "Quetzaltenango" },
  ],
  hn: [
    { id: "tg", nombre: "Tegucigalpa" },
    { id: "sp", nombre: "San Pedro Sula" },
  ],
}

const municipiosPorDepartamento: Record<string, Array<{ id: string; nombre: string }>> = {
  ss: [
    { id: "ss", nombre: "San Salvador" },
    { id: "mj", nombre: "Mejicanos" },
    { id: "ap", nombre: "Apopa" },
  ],
  sa: [
    { id: "sa", nombre: "Santa Ana" },
    { id: "ch", nombre: "Chalchuapa" },
  ],
  sm: [
    { id: "sm", nombre: "San Miguel" },
    { id: "ci", nombre: "Ciudad Barrios" },
  ],
  gt: [
    { id: "gc", nombre: "Guatemala City" },
    { id: "mx", nombre: "Mixco" },
  ],
  qz: [
    { id: "qz", nombre: "Quetzaltenango" },
    { id: "sl", nombre: "Salcajá" },
  ],
  tg: [
    { id: "tg", nombre: "Tegucigalpa" },
    { id: "cm", nombre: "Comayagüela" },
  ],
  sp: [
    { id: "sp", nombre: "San Pedro Sula" },
    { id: "ch", nombre: "Choloma" },
  ],
}

export default function Direccion({ form }: DireccionProps) {
  const [departamentos, setDepartamentos] = useState<Array<{ id: string; nombre: string }>>([])
  const [municipios, setMunicipios] = useState<Array<{ id: string; nombre: string }>>([])

  const paisSeleccionado = form.watch("pais")
  const departamentoSeleccionado = form.watch("departamento")

  // Actualizar departamentos cuando cambia el país
  useEffect(() => {
    if (paisSeleccionado) {
      setDepartamentos(departamentosPorPais[paisSeleccionado] || [])
      form.setValue("departamento", "")
      form.setValue("municipio", "")
    }
  }, [paisSeleccionado, form])

  // Actualizar municipios cuando cambia el departamento
  useEffect(() => {
    if (departamentoSeleccionado) {
      setMunicipios(municipiosPorDepartamento[departamentoSeleccionado] || [])
      form.setValue("municipio", "")
    }
  }, [departamentoSeleccionado, form])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dirección</CardTitle>
        <CardDescription>Ingresa los datos de tu lugar de residencia actual</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={form.control}
          name="pais"
          render={({ field }) => (
            <FormItem>
              <FormLabel>País</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un país" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {paises.map((pais) => (
                    <SelectItem key={pais.id} value={pais.id}>
                      {pais.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="departamento"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Departamento</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={!paisSeleccionado}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un departamento" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {departamentos.map((departamento) => (
                    <SelectItem key={departamento.id} value={departamento.id}>
                      {departamento.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="municipio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Municipio</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={!departamentoSeleccionado}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un municipio" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {municipios.map((municipio) => (
                    <SelectItem key={municipio.id} value={municipio.id}>
                      {municipio.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="direccionDetallada"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dirección detallada</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Ej. Colonia Las Flores, Calle Principal, Casa #123, Avenida Los Pinos"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>Incluye referencias que faciliten la ubicación de tu domicilio</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  )
}