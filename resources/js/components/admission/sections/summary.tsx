"use client";

import { useFormContext } from "react-hook-form";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function ResumenSolicitud() {
  const form = useFormContext();
  const values = form.watch();

  const sexoMap: Record<string, string> = {
    H: "Hombre",
    M: "Mujer",
    O: "Otro",
  };

  const nivelesEducativos = [
    { value: "cuarto_grado", label: "Cuarto grado", tooltip: "Generalmente cursado a los 9 años, fortalece lectura y cálculo básico" },
    { value: "quinto_grado", label: "Quinto grado", tooltip: "Se refuerzan habilidades de escritura y pensamiento lógico" },
    { value: "sexto_grado", label: "Sexto grado", tooltip: "Grado final antes de secundaria, con enfoque en ciencias y matemáticas" },
    { value: "septimo_grado", label: "Séptimo grado", tooltip: "Inicio de secundaria, se introducen nuevas asignaturas académicas" },
    { value: "octavo_grado", label: "Octavo grado", tooltip: "Fortalecimiento en historia, biología y escritura formal" },
    { value: "noveno_grado", label: "Noveno grado", tooltip: "Último año de secundaria básica, importante para transición al bachillerato" },
  ];

  const nivel = nivelesEducativos.find(n => n.value === values.nivel_educativo);

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle>Resumen de tu Solicitud</CardTitle>
          <CardDescription>Revisa los datos ingresados cuidadosamente antes de enviarlos</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 text-sm">

          {/* Datos personales */}
          <section>
            <Tooltip>
              <TooltipTrigger asChild>
                <h3 className="font-semibold text-base mb-3">Datos personales</h3>
              </TooltipTrigger>
              <TooltipContent>Información básica del estudiante como nombre, contacto y NIE</TooltipContent>
            </Tooltip>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><strong>Nombre completo:</strong> {`${values.primer_nombre} ${values.segundo_nombre} ${values.primer_apellido} ${values.segundo_apellido}`.trim() || "No especificado"}</div>
              <div><strong>Sexo:</strong> {sexoMap[values.sexo] || "No especificado"}</div>
              <div><strong>Fecha de nacimiento:</strong> {values.fecha_nacimiento || "No especificada"}</div>
              <div><strong>NIE:</strong> {values.nie || "No especificado"}</div>
              <div><strong>Teléfono:</strong> {values.telefono_estudiante || "No especificado"}</div>
              <div><strong>Email:</strong> {values.email || "No especificado"}</div>
            </div>
          </section>

          <Separator />

          {/* Dirección */}
          <section>
            <Tooltip>
              <TooltipTrigger asChild>
                <h3 className="font-semibold text-base mb-3">Dirección</h3>
              </TooltipTrigger>
              <TooltipContent>Ubicación de tu residencia actual y contacto secundario</TooltipContent>
            </Tooltip>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><strong>Departamento:</strong> {values.departamento || "No especificado"}</div>
              <div><strong>Municipio:</strong> {values.municipio || "No especificado"}</div>
              <div><strong>Distrito:</strong> {values.distrito || "No especificado"}</div>
              <div><strong>Teléfono de casa:</strong> {values.telefono_casa ?? "No especificado"}</div>
              <div className="md:col-span-2"><strong>Dirección detallada:</strong> {values.direccion || "No especificada"}</div>
            </div>
          </section>

          <Separator />

          {/* Educación */}
          <section>
            <Tooltip>
              <TooltipTrigger asChild>
                <h3 className="font-semibold text-base mb-3">Educación</h3>
              </TooltipTrigger>
              <TooltipContent>Datos sobre tu centro de estudio y nivel académico actual</TooltipContent>
            </Tooltip>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><strong>Código del centro:</strong> {values.codigo || "No especificado"}</div>
              <div><strong>Centro educativo:</strong> {values.centro_educativo || "No especificado"}</div>
              <div><strong>Sector:</strong> {values.sector || "No especificado"}</div>
              <div><strong>Zona:</strong> {values.zona || "No especificada"}</div>
              <div><strong>¿Internacional?:</strong> {values.internacional || "No especificado"}</div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div><strong>Nivel educativo:</strong> {nivel?.label || values.nivel_educativo || "No especificado"}</div>
                </TooltipTrigger>
                <TooltipContent>{nivel?.tooltip || "Nivel académico actual"}</TooltipContent>
              </Tooltip>
            </div>
          </section>

          <Separator />

          {/* Responsable */}
          <section>
            <Tooltip>
              <TooltipTrigger asChild>
                <h3 className="font-semibold text-base mb-3">Responsable</h3>
              </TooltipTrigger>
              <TooltipContent>Persona encargada legalmente del estudiante</TooltipContent>
            </Tooltip>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><strong>DUI:</strong> {values.dui || "No especificado"}</div>
              <div><strong>Nombres:</strong> {values.nombres_responsable || "No especificado"}</div>
              <div><strong>Apellidos:</strong> {values.apellidos_responsable || "No especificado"}</div>
              <div><strong>Email:</strong> {values.email_responsable ?? "No especificado"}</div>
              <div><strong>Teléfono principal:</strong> {values.telefono_responsable || "No especificado"}</div>
              <div><strong>Teléfono opcional:</strong> {values.telefono_opcional || "No especificado"}</div>
              <div><strong>Parentesco:</strong> {values.tipo_parentesco || "No especificado"}</div>
            </div>
          </section>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}