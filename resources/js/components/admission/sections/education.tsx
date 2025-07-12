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
import { Button } from "@/components/ui/button";
import { CentroEducativo } from "@/types/admission/education";

interface EducacionProps {
  centros_educativos: CentroEducativo[];
}

export default function Educacion({ centros_educativos }: EducacionProps) {
  const form = useFormContext();

  const [codigoBusqueda, setCodigoBusqueda] = useState("");
  const [resultados, setResultados] = useState<CentroEducativo[]>([]);

  const codigoSeleccionado = form.watch("codigo");

  // Actualiza resultados al cambiar el código
  useEffect(() => {
    if (codigoSeleccionado) {
      const filtrados = centros_educativos.filter((c) =>
        c.codigo.toLowerCase().includes(codigoSeleccionado.toLowerCase().trim())
      );
      setResultados(filtrados);
    } else {
      setResultados([]);
    }
  }, [codigoSeleccionado, centros_educativos]);

  const handleSeleccionCentro = (centro: CentroEducativo) => {
    form.setValue("centro_educativo", centro.nombre);
    form.setValue("departamento", centro.departamento);
    form.setValue("distrito", centro.distrito);
    form.setValue("sector", centro.sector);
    form.setValue("zona", centro.zona);
    form.setValue("internacional", centro.internacional);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Educación</CardTitle>
        <CardDescription>Información sobre tu formación académica actual</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Código */}
        <FormField
          control={form.control}
          name="codigo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Código del centro educativo</FormLabel>
              <FormControl>
                <Input placeholder="Ej. 20657" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Resultados */}
        <div className="mt-6">
          {resultados.length > 0 ? (
            <ul className="space-y-1">
              {resultados.map((centro) => (
                <li
                  key={centro.codigo}
                  className="cursor-pointer hover:underline"
                  onClick={() => handleSeleccionCentro(centro)}
                >
                  {centro.nombre} - {centro.departamento}, {centro.distrito} ({centro.sector}, {centro.zona}, {centro.internacional})
                </li>
              ))}
            </ul>
          ) : (
            <p>No se encontraron resultados</p>
          )}
        </div>

        {/* Nombre */}
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del centro educativo</FormLabel>
              <FormControl>
                <Input placeholder="Ej. Instituto Nacional José Simeón Cañas" {...field} />
              </FormControl>
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
              <FormControl>
                <Input placeholder="Ej. San Salvador" {...field} />
              </FormControl>
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
              <FormControl>
                <Input placeholder="Ej. Mejicanos" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Sector */}
        <FormField
          control={form.control}
          name="sector"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sector</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sector" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="PÚBLICO">PÚBLICO</SelectItem>
                  <SelectItem value="PRIVADO">PRIVADO</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Zona */}
        <FormField
          control={form.control}
          name="zona"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Zona</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Zona" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Rural">Rural</SelectItem>
                  <SelectItem value="Urbana">Urbana</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Internacional */}
        <FormField
          control={form.control}
          name="internacional"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Internacional</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Internacional" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="SI">SI</SelectItem>
                  <SelectItem value="NO">NO</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Centro educativo actual */}
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

        {/* Nivel de estudios */}
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
                  <SelectItem value="cuarto_grado">Cuarto grado</SelectItem>
                  <SelectItem value="quinto_grado">Quinto grado</SelectItem>
                  <SelectItem value="sexto_grado">Sexto grado</SelectItem>
                  <SelectItem value="septimo_grado">Séptimo grado</SelectItem>
                  <SelectItem value="octavo_grado">Octavo grado</SelectItem>
                  <SelectItem value="noveno_grado">Noveno grado</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

      </CardContent>
    </Card>
  );
}