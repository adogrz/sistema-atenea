"use client";

import { useForm, FormProvider, Controller } from "react-hook-form";
import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { useState } from "react";
import axios from "axios";
import { Loader2 } from "lucide-react";

type ImportResponse = {
  mensaje?: string;
  importados?: number;
  errores?: string[];
};

export default function ImportarCentrosPage() {
  const form = useForm();
  const [estado, setEstado] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [mensajes, setMensajes] = useState<string[]>([]);
  const [cantidad, setCantidad] = useState<number | null>(null);

  const onSubmit = async (data: any) => {
    const archivo = data.archivo_excel?.[0];
    if (!archivo) {
      setMensajes(["Debes seleccionar un archivo"]);
      setEstado("error");
      return;
    }

    setEstado("loading");

    const formData = new FormData();
    formData.append("archivo_excel", archivo);

    try {
      const response = await axios.post<ImportResponse>("/centros", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      
      console.log(response.data);

      setEstado("success");
      setMensajes([response.data.mensaje || "¡Importación exitosa!"]);
      setCantidad(response.data.importados || null);
    } catch (error: any) {
      setEstado("error");

      const erroresBackend = error?.response?.data?.errores;

      if (Array.isArray(erroresBackend)) {
        setMensajes(erroresBackend);
      }
      else {
        setMensajes(["Hubo un error al importar"]);
      }
    }
  };

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-xl mx-auto mt-10 space-y-8"
      >
        <Card>
          <CardHeader>
            <CardTitle>Importar Centros Educativos</CardTitle>
            <CardDescription>
              Sube un archivo Excel con los datos estructurados
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <Controller
              control={form.control}
              name="archivo_excel"
              defaultValue={[]}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Archivo Excel</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept=".xls,.xlsx"
                      onChange={(e) => field.onChange(e.target.files)}
                    />
                  </FormControl>
                  <FormDescription>
                    Columnas esperadas: <code>codigo</code>, <code>nombre</code>,{" "}
                    <code>departamento</code>, etc.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={estado === "loading"}>
              {estado === "loading" ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin h-4 w-4" />
                  Importando...
                </span>
              ) : (
                "Importar"
              )}
            </Button>

            {estado !== "idle" && (
              <div
                className={`text-sm mt-2 space-y-2 ${
                  estado === "success"
                    ? "text-green-600"
                    : estado === "error"
                    ? "text-red-600"
                    : "text-muted-foreground"
                }`}
              >
                {mensajes.map((msg, i) => (
                  <div key={i}>{msg}</div>
                ))}

                {estado === "success" && cantidad !== null && (
                  <div>Registros importados: {cantidad}</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </form>
    </FormProvider>
  );
}