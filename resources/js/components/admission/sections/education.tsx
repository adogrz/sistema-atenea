"use client";

import { useFormContext } from "react-hook-form";
import { useEffect, useMemo, useState } from "react";
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
import { HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CentroEducativo, NivelEducativo } from "@/types/admission/education";

interface EducacionProps {
  centros_educativos: CentroEducativo[];
  niveles_educativos: NivelEducativo[];
}

export default function Educacion(
  { centros_educativos, niveles_educativos }: EducacionProps
) {
  const form = useFormContext();

  const [filtros, setFiltros] = useState({
    codigo: "",
    centro_educativo: "",
    sector: "",
    zona: "",
    internacional: "",
  });

  const codigo = form.watch("codigo");
  const nombre = form.watch("centro_educativo");
  const sector = form.watch("sector");
  const zona = form.watch("zona");
  const internacional = form.watch("internacional");
  const nivelEducativo = form.watch("nivel_educativo");

  // Resultados filtrados
  const resultados = useMemo(() => {
    return centros_educativos
      .filter((c) => {
        const matchCodigo = filtros.codigo === "" || c.codigo.includes(filtros.codigo);
        const matchNombre = filtros.centro_educativo === "" || c.nombre.toLowerCase().includes(filtros.centro_educativo.toLowerCase());
        const matchSector = filtros.sector === "" || c.sector === filtros.sector;
        const matchZona = filtros.zona === "" || c.zona === filtros.zona;
        const matchInternacional = filtros.internacional === "" || c.internacional === filtros.internacional;
        return matchCodigo && matchNombre && matchSector && matchZona && matchInternacional;
      })
      .slice(0, 5);
  }, [centros_educativos, filtros]);

  // Selección de centro
  const handleSeleccion = (centro: CentroEducativo) => {
    form.setValue("codigo", centro.codigo);
    form.setValue("centro_educativo", centro.nombre);
    form.setValue("sector", centro.sector);
    form.setValue("zona", centro.zona);
    form.setValue("internacional", centro.internacional);
  };

  // Efecto visual al cambiar selección
  useEffect(() => {
    const subscription = form.watch((values, { name }) => {
      if (["codigo", "centro_educativo", "sector", "zona", "internacional"].includes(name ?? "")) {
        console.log("Centro educativo actualizado", {
          codigo: values.codigo,
          nombre: values.centro_educativo,
          sector: values.sector,
          zona: values.zona,
          internacional: values.internacional,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Educación</CardTitle>
        <CardDescription>Información sobre tu formación académica actual</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Filtros de búsqueda */}
        <div className="space-y-4">
          <Input placeholder="Ej. 20657" value={filtros.codigo} onChange={e => setFiltros({ ...filtros, codigo: e.target.value })} />
          <Input placeholder="Ej. CENTRO ESCOLAR ISIDRO MENÉNDEZ" value={filtros.centro_educativo} onChange={e => setFiltros({ ...filtros, centro_educativo: e.target.value })} />

          <Select onValueChange={value => setFiltros({ ...filtros, sector: value })}>
            <SelectTrigger><SelectValue placeholder="Sector" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="PÚBLICO">PÚBLICO</SelectItem>
              <SelectItem value="PRIVADO">PRIVADO</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={value => setFiltros({ ...filtros, zona: value })}>
            <SelectTrigger><SelectValue placeholder="Zona" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Rural">Rural</SelectItem>
              <SelectItem value="Urbana">Urbana</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={value => setFiltros({ ...filtros, internacional: value })}>
            <SelectTrigger><SelectValue placeholder="¿Internacional?" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="SI">SI</SelectItem>
              <SelectItem value="NO">NO</SelectItem>
            </SelectContent>
          </Select>

          {/* Resultados */}
          <ul className="mt-4 space-y-2">
            {resultados.length > 0 ? (
              resultados.map((centro) => (
                <li key={centro.codigo} className="cursor-pointer hover:bg-muted p-2 rounded" onClick={() => handleSeleccion(centro)}>
                  {centro.nombre} ({centro.codigo}) – {centro.sector}, {centro.zona}, {centro.internacional}
                </li>
              ))
            ) : (
              <p>No hay centros que coincidan con los filtros</p>
            )}
          </ul>
        </div>

        {/* Panel resumen */}
        {codigo && (
          <div className="border rounded p-4 bg-muted/50 mt-4">
            <h4 className="font-semibold mb-2">Resumen - Centro seleccionado</h4>
            <p><strong>Nombre:</strong> {nombre}</p>
            <p><strong>Código:</strong> {codigo}</p>
            <p><strong>Sector:</strong> {sector}</p>
            <p><strong>Zona:</strong> {zona}</p>
            <p><strong>Internacional:</strong> {internacional}</p>
          </div>
        )}

        <FormField
          control={form.control}
          name="nie"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>NIE: Número de identificación estudiantil</FormLabel>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-5 w-5">
                        <HelpCircle className="h-4 w-4" />
                        <span className="sr-only">Ayuda</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        Ingresa el número unico de identificación estudiantil
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <FormControl>
                <Input placeholder="0010012" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Nivel educativo */}
        <FormField
          control={form.control}
          name="nivel_educativo"
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
                  {niveles_educativos.map((nivel) => (
                    <SelectItem key={nivel.codigo} value={nivel.codigo}>
                      {nivel.descripcion}
                    </SelectItem>
                  ))}
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
