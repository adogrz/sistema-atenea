"use client"

import { useFormContext } from "react-hook-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default function ResumenSolicitud() {
  
  const form = useFormContext();
  const values = form.getValues()

  // Mapeo de IDs a nombres para mostrar en el resumen
  const olimpiadasMap: Record<string, string> = {
    onm: "Olimpiada Nacional de Matemáticas (ONM)",
    osf: "Olimpiada Salvadoreña de Física (OSF)",
    obi: "Olimpiada de Biología (OBI)",
    oiq: "Olimpiada de Química (OIQ)",
    oci: "Olimpiada de Ciencias de la Computación (OCI)",
  }

  const paisesMap: Record<string, string> = {
    sv: "El Salvador",
    gt: "Guatemala",
    hn: "Honduras",
  }

  const departamentosMap: Record<string, string> = {
    ss: "San Salvador",
    sa: "Santa Ana",
    sm: "San Miguel",
    gt: "Guatemala",
    qz: "Quetzaltenango",
    tg: "Tegucigalpa",
    sp: "San Pedro Sula",
  }

  const municipiosMap: Record<string, string> = {
    ss: "San Salvador",
    mj: "Mejicanos",
    ap: "Apopa",
    sa: "Santa Ana",
    ch: "Chalchuapa",
    sm: "San Miguel",
    ci: "Ciudad Barrios",
    gc: "Guatemala City",
    mx: "Mixco",
    qz: "Quetzaltenango",
    sl: "Salcajá",
    tg: "Tegucigalpa",
    cm: "Comayagüela",
    sp: "San Pedro Sula",
  }

  const generoMap: Record<string, string> = {
    M: "Masculino",
    F: "Femenino",
    O: "Otro",
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumen de tu Solicitud</CardTitle>
        <CardDescription>Revisa todos los datos antes de enviar tu solicitud</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Datos Personales */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Datos Personales</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Nombre completo:</span>
              <p className="text-muted-foreground">{values.nombreCompleto || "No especificado"}</p>
            </div>
            <div>
              <span className="font-medium">Fecha de nacimiento:</span>
              <p className="text-muted-foreground">
                {values.fechaNacimiento ? values.fechaNacimiento.toLocaleDateString() : "No especificada"}
              </p>
            </div>
            <div>
              <span className="font-medium">Género:</span>
              <p className="text-muted-foreground">{generoMap[values.genero] || "No especificado"}</p>
            </div>
            <div>
              <span className="font-medium">Correo electrónico:</span>
              <p className="text-muted-foreground">{values.correoElectronico || "No especificado"}</p>
            </div>
            <div>
              <span className="font-medium">Teléfono:</span>
              <p className="text-muted-foreground">{values.telefonoContacto || "No especificado"}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Dirección */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Dirección</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">País:</span>
              <p className="text-muted-foreground">{paisesMap[values.pais] || "No especificado"}</p>
            </div>
            <div>
              <span className="font-medium">Departamento:</span>
              <p className="text-muted-foreground">{departamentosMap[values.departamento] || "No especificado"}</p>
            </div>
            <div>
              <span className="font-medium">Municipio:</span>
              <p className="text-muted-foreground">{municipiosMap[values.municipio] || "No especificado"}</p>
            </div>
            <div className="md:col-span-2">
              <span className="font-medium">Dirección detallada:</span>
              <p className="text-muted-foreground">{values.direccionDetallada || "No especificada"}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Educación */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Educación</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Centro educativo:</span>
              <p className="text-muted-foreground">{values.centroEducativo || "No especificado"}</p>
            </div>
            <div>
              <span className="font-medium">Nivel de estudios:</span>
              <p className="text-muted-foreground">{values.nivelEstudios || "No especificado"}</p>
            </div>
            <div>
              <span className="font-medium">Promedio académico:</span>
              <p className="text-muted-foreground">{values.promedioAcademico || "No especificado"}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Olimpiadas */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Olimpiadas Seleccionadas</h3>
          <div className="flex flex-wrap gap-2">
            {values.olimpiadas && values.olimpiadas.length > 0 ? (
              values.olimpiadas.map((olimpiadaId: string) => (
                <Badge key={olimpiadaId} variant="secondary">
                  {olimpiadasMap[olimpiadaId] || olimpiadaId}
                </Badge>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">No se han seleccionado olimpiadas</p>
            )}
          </div>
        </div>

        <Separator />

        {/* Documentación */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Documentación</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Cédula/Pasaporte:</span>
              <p className="text-muted-foreground">
                {values.cedulaPasaporte
                  ? `${values.cedulaPasaporte.name} (${(values.cedulaPasaporte.size / 1024 / 1024).toFixed(2)} MB)`
                  : "No subido"}
              </p>
            </div>
            <div>
              <span className="font-medium">Foto reciente:</span>
              <p className="text-muted-foreground">
                {values.fotoReciente
                  ? `${values.fotoReciente.name} (${(values.fotoReciente.size / 1024 / 1024).toFixed(2)} MB)`
                  : "No subida"}
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Consentimientos */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Consentimientos</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <div
                className={`w-4 h-4 rounded border-2 flex items-center justify-center ${values.aceptoTerminos ? "bg-primary border-primary" : "border-muted-foreground"}`}
              >
                {values.aceptoTerminos && <span className="text-white text-xs">✓</span>}
              </div>
              <span>Términos y condiciones aceptados</span>
            </div>
            <div className="flex items-center space-x-2">
              <div
                className={`w-4 h-4 rounded border-2 flex items-center justify-center ${values.autorizoMoodle ? "bg-primary border-primary" : "border-muted-foreground"}`}
              >
                {values.autorizoMoodle && <span className="text-white text-xs">✓</span>}
              </div>
              <span>Autorización para uso de datos en Moodle</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}