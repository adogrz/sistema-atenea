"use client";

import { useFormContext } from "react-hook-form";
import { useEffect, useState } from "react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { Departamento, Municipio, Distrito } from "@/types/address";

interface DireccionProps {
  departamentos: Departamento[];
  municipiosPorDepartamento: Record<string, Municipio[]>;
  distritosPorMunicipio: Record<string, Distrito[]>;
}

export default function Direccion({
  departamentos,
  municipiosPorDepartamento,
  distritosPorMunicipio,
}: DireccionProps) {

  const form = useFormContext();
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [distritos, setDistritos] = useState<Distrito[]>([]);

  const departamentoSeleccionado = form.watch("departamento");
  const municipioSeleccionado = form.watch("municipio");

  useEffect(() => {
    if (departamentoSeleccionado) {
      const listaMunicipios = municipiosPorDepartamento[departamentoSeleccionado] || [];
      setMunicipios(listaMunicipios);
      form.setValue("municipio", "");
      form.setValue("distrito", "");
      setDistritos([]);
    }
  }, [departamentoSeleccionado]);

  useEffect(() => {
    if (municipioSeleccionado) {
      const listaDistritos = distritosPorMunicipio[municipioSeleccionado] || [];
      setDistritos(listaDistritos);
      form.setValue("distrito", "");
    }
  }, [municipioSeleccionado]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dirección</CardTitle>
        <CardDescription>
          Ingresa los datos de tu lugar de residencia actual
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Teléfono casa */}
        <FormField
          control={form.control}
          name="telefono_casa"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teléfono de casa - Opcional</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="Ej. 12345678" {...field} />
              </FormControl>
              <FormDescription>
                Ingresa un número de teléfono de casa donde podamos contactarte
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Departamento */}
        <FormField
          control={form.control}
          name="departamento"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Departamento</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un departamento" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {departamentos.map((departamento) => (
                    <SelectItem key={departamento.id} value={departamento.id}>
                      {departamento.nombre_departamento}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Municipio */}
        <FormField
          control={form.control}
          name="municipio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Municipio</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={!departamentoSeleccionado}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un municipio" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {municipios.map((municipio) => (
                    <SelectItem key={municipio.id} value={municipio.id}>
                      {municipio.nombre_municipio}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Distrito */}
        <FormField
          control={form.control}
          name="distrito"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Distrito</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={!municipioSeleccionado}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un distrito" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {distritos.map((distrito) => (
                    <SelectItem key={distrito.id} value={distrito.id}>
                      {distrito.nombre_distrito}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Dirección detallada */}
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
              <FormDescription>
                Incluye referencias que faciliten la ubicación de tu domicilio
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}