"use client"

import { useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import axios from "axios";
import { Loader2, Save, Send, AlertCircle, CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"

import DatosPersonales from "./sections/personal-data"
import DatosResponsable from "./sections/responsible"
import Direccion from "./sections/address"
import Educacion from "./sections/education"
import ResumenSolicitud from "./sections/summary"
import BarraProgreso from "./progress-bar"
import Captcha from "./captcha"
import { usePage } from "@inertiajs/react"
import { Departamento, Municipio, Distrito } from "@/types/admission/address"
import { CentroEducativo } from "@/types/admission/education"
import { on } from "node:stream"

// Esquema de validación completo para todo el formulario
export const formSchema = z.object({
  // Datos del estudiante
  codigo: z.string().min(1).regex(/^\d{5,10}$/, {
    message: "Código debe ser numérico entre 5 y 10 dígitos",
  }),
  primer_nombre: z.string().min(1).max(50).regex(/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s'-]+$/, {
    message: "Nombre no válido",
  }),
  segundo_nombre: z.string().max(50).regex(/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s'-]*$/, {
    message: "Segundo nombre no válido",
  }).optional(),
  primer_apellido: z.string().min(1).max(50).regex(/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s'-]+$/, {
    message: "Apellido no válido",
  }),
  segundo_apellido: z.string().max(50).regex(/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s'-]*$/, {
    message: "Segundo apellido no válido",
  }).optional(),
  sexo: z.enum(["H", "M"]),
  fecha_nacimiento: z.string().refine((val) => {
    const parsed = Date.parse(val);
    return !isNaN(parsed) && new Date(parsed) < new Date();
  }, { message: "Fecha inválida o en el futuro" }),
  nie: z.string().regex(/^\d{7,10}$/, {
    message: "NIE debe ser numérico entre 7 y 10 dígitos",
  }),
  telefono_estudiante: z.string().regex(/^[267]\d{7}$/, {
    message: "Teléfono estudiante inválido (debe comenzar con 2, 6 o 7)",
  }),
  telefono_casa: z.string().regex(/^[267]\d{7}$/).nullable().optional(),
  email: z.string().email(),
  direccion: z.string().min(5).max(255),
  distrito: z.string().regex(/^\d+$/, {
    message: "ID de distrito debe ser numérico",
  }),

  // Dirección
  departamento: z.string().min(1, {
    message: "Debes seleccionar un departamento",
  }),

  municipio: z.string().min(1, {
    message: "Debes seleccionar un municipio",
  }),

  // Datos del responsable
  dui: z.string().regex(/^\d{8}-\d$/, {
    message: "DUI debe tener formato ########-#",
  }),
  nombres_responsable: z.string().min(1).max(100).regex(/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s'-]+$/, {
    message: "Nombre del responsable no válido",
  }),
  apellidos_responsable: z.string().min(1).max(100).regex(/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s'-]+$/, {
    message: "Apellido del responsable no válido",
  }),
  email_responsable: z.string().email().nullable().optional(),
  telefono_responsable: z.string().regex(/^[267]\d{7}$/, {
    message: "Teléfono del responsable inválido",
  }),
  telefono_opcional: z.string().regex(/^[267]\d{7}$/, {
    message: "Teléfono opcional inválido",
  }),
  tipo_parentesco: z.enum(["Madre", "Padre", "Abuelo", "Tio", "Tutor legal"]),

  // Nombre del centro educativo (valida texto con acentos y símbolos comunes)
  centro_educativo: z.string()
    .min(5, { message: "El nombre debe tener al menos 5 caracteres" })
    .max(100)
    .regex(/^[A-Za-zÁÉÍÓÚÑáéíóúñ0-9"'\s\-\.]+$/, {
      message: "Formato de nombre inválido",
    }),

  // Sector educativo (PÚBLICO o PRIVADO)
  sector: z.enum(["PÚBLICO", "PRIVADO"], {
    required_error: "Selecciona el sector",
  }),

  // Zona geográfica (Rural o Urbana)
  zona: z.enum(["Rural", "Urbana"], {
    required_error: "Selecciona la zona",
  }),

  // Internacional (SI o NO)
  internacional: z.enum(["SI", "NO"], {
    required_error: "Selecciona si el centro es internacional",
  }),

  // Nivel de estudios (valores de primaria)
  nivel_educativo: z.enum([
    "cuarto_grado",
    "quinto_grado",
    "sexto_grado",
    "septimo_grado",
    "octavo_grado",
    "noveno_grado",
  ], {
    required_error: "Selecciona tu nivel de estudios",
  }),

  /*
  // Consentimientos
  aceptoTerminos: z.literal(true, {
    errorMap: () => ({ message: "Debes aceptar los términos y condiciones" }),
  }),
  autorizoMoodle: z.literal(true, {
    errorMap: () => ({ message: "Debes autorizar el uso de datos para Moodle" }),
  }),
  */
});


type FormValues = z.infer<typeof formSchema>

export default function FormularioAdmision() {
  const [activeTab, setActiveTab] = useState("datos-personales")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formStatus, setFormStatus] = useState<"idle" | "success" | "error">("idle")
  const [captchaVerified, setCaptchaVerified] = useState(false)
  const { toast } = useToast()

  const {
    departamentos,
    municipiosPorDepartamento,
    distritosPorMunicipio,
    centrosEducativos,
  } = usePage<{
    departamentos: Departamento[];
    municipiosPorDepartamento: Record<string, Municipio[]>;
    distritosPorMunicipio: Record<string, Distrito[]>;
    centrosEducativos: CentroEducativo[];
  }>().props;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      // Datos personales
      primer_nombre: "",
      segundo_nombre: "",
      primer_apellido: "",
      segundo_apellido: "",
      sexo: undefined,
      fecha_nacimiento: "",
      nie: "",
      telefono_estudiante: "",
      email: "",

      // Dirección
      telefono_casa: "",
      direccion: "",
      distrito: "",
      departamento: "",
      municipio: "",

      // Educación
      codigo: "",
      centro_educativo: "",
      sector: 'PÚBLICO',
      zona: 'Rural',
      internacional: 'NO',
      nivel_educativo: undefined,      // Se define vacío para forzar selección

      // Responsable
      dui: "",
      nombres_responsable: "",
      apellidos_responsable: "",
      email_responsable: "",
      telefono_responsable: "",
      telefono_opcional: "",
      tipo_parentesco: undefined,
    },
    mode: 'onBlur',
  });

  const { formState } = form
  const { errors } = formState

  // Calcular el número de errores por sección
  const erroresPorSeccion = {
    datosPersonales: Object.keys(errors).filter((key) =>
      [
        "primer_nombre",
        "segundo_nombre",
        "primer_apellido",
        "segundo_apellido",
        "sexo",
        "fecha_nacimiento",
        "nie",
        "telefono_estudiante",
        "email",
      ].includes(key)
    ).length,

    direccion: Object.keys(errors).filter((key) =>
      ["telefono_casa", "direccion", "distrito", "departamento", "municipio"].includes(key)
    ).length,

    educacion: Object.keys(errors).filter((key) =>
      ["codigo", "centro_educativo", "sector", "zona", "internacional", "nivel_educativo"].includes(key)
    ).length,

    responsable: Object.keys(errors).filter((key) =>
      [
        "dui",
        "nombres_responsable",
        "apellidos_responsable",
        "email_responsable",
        "telefono_responsable",
        "telefono_opcional",
        "tipo_parentesco",
      ].includes(key)
    ).length,
  };

  const totalErrores = Object.values(erroresPorSeccion).reduce((a, b) => a + b, 0)

  const tabs = [
    { id: "datos-personales", label: "Datos Personales" },
    { id: "datos-responsables", label: "Datos de los Responsables" },
    { id: "direccion", label: "Dirección" },
    { id: "educacion", label: "Educación" },
    { id: "resumen", label: "Resumen" },
  ]

  const currentTabIndex = tabs.findIndex((tab) => tab.id === activeTab)
  const progress = ((currentTabIndex + 1) / tabs.length) * 100

  const handleNext = () => {
    const currentIndex = tabs.findIndex((tab) => tab.id === activeTab)
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1].id)
      window.scrollTo(0, 0)
    }
  }

  const handlePrevious = () => {
    const currentIndex = tabs.findIndex((tab) => tab.id === activeTab)
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1].id)
      window.scrollTo(0, 0)
    }
  }


  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post("/admision", {
        ...data,
      }, {
        headers: {
          Accept: "application/json",
        },
      });

      toast({
        title: "Solicitud enviada",
        description: "Tu postulación ha sido registrada correctamente.",
      });

      setFormStatus("success");
    } catch (error) {
      console.error("Error al enviar:", error);
      toast({
        variant: "destructive",
        title: "Error al enviar",
        description: "No se pudo procesar tu solicitud. Intenta nuevamente.",
      });

      setFormStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleSaveDraft = async () => {
    setIsSaving(true)

    try {
      // Simulación de guardado de borrador
      const formData = form.getValues()
      console.log("Guardando borrador:", formData)

      // Simular una petición al servidor
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Borrador guardado",
        description: "Podrás continuar con tu solicitud más tarde.",
      })
    } catch (error) {
      console.error("Error al guardar el borrador:", error)
      toast({
        variant: "destructive",
        title: "Error al guardar",
        description: "No se pudo guardar el borrador. Por favor inténtalo de nuevo.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (formStatus === "success") {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="rounded-full bg-green-100 p-3">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold">¡Solicitud enviada con éxito!</h2>
          <p className="max-w-md text-muted-foreground">
            Tu solicitud ha sido recibida correctamente. Te hemos enviado un correo de confirmación con los detalles de
            tu postulación.
          </p>
          <p className="text-sm text-muted-foreground">
            Número de referencia: {Math.random().toString(36).substring(2, 10).toUpperCase()}
          </p>
          <Button className="mt-4" onClick={() => (window.location.href = "/")}>
            Volver al inicio
          </Button>
        </div>
      </Card>
    )
  }

  if (formStatus === "error") {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="rounded-full bg-red-100 p-3">
            <AlertCircle className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold">Error al enviar la solicitud</h2>
          <p className="max-w-md text-muted-foreground">
            Ocurrió un problema al enviar tu solicitud. Por favor inténtalo de nuevo más tarde.
          </p>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => setFormStatus("idle")}>
              Volver al formulario
            </Button>
            <Button onClick={() => window.location.reload()}>Reintentar</Button>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {totalErrores > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error en el formulario</AlertTitle>
            <AlertDescription>
              Hay {totalErrores} {totalErrores === 1 ? "error" : "errores"} en el formulario. Por favor revisa los
              campos marcados.
            </AlertDescription>
          </Alert>
        )}

        <BarraProgreso progress={progress} />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-7">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="relative">
                {tab.label}
                {erroresPorSeccion[tab.id as keyof typeof erroresPorSeccion] > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                    {erroresPorSeccion[tab.id as keyof typeof erroresPorSeccion]}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="datos-personales">
            <DatosPersonales />
          </TabsContent>

          <TabsContent value="datos-responsables">
            <DatosResponsable />
          </TabsContent>

          <TabsContent value="direccion">
            <Direccion
              departamentos={departamentos}
              municipiosPorDepartamento={municipiosPorDepartamento}
              distritosPorMunicipio={distritosPorMunicipio}
            />
          </TabsContent>

          <TabsContent value="educacion">
            <Educacion centros_educativos={centrosEducativos} />
          </TabsContent>

          <TabsContent value="resumen">
            <ResumenSolicitud />
            <Captcha onVerify={() => setCaptchaVerified(true)} />
          </TabsContent>
        </Tabs>

        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            disabled={activeTab === "datos-personales"}
          >
            Anterior
          </Button>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleSaveDraft} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar borrador
                </>
              )}
            </Button>

            {activeTab === "resumen" ? (
              <Button
                type="submit"
                disabled={isSubmitting || !captchaVerified || totalErrores > 0}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Enviar solicitud
                  </>
                )}
              </Button>
            ) : (
              <Button type="button" onClick={handleNext}>
                Siguiente
              </Button>
            )}

            <Button
              type="button"
              onClick={() => {
                form.handleSubmit(onSubmit, (errors) => {
                  console.log("🔍 Errores detectados:", errors);
                  toast({
                    variant: "destructive",
                    title: "Errores en formulario",
                    description: "Revisa los campos marcados antes de enviar.",
                  });
                })();
              }}
            >
              Test Submit
            </Button>


          </div>
        </div>
      </form>
    </FormProvider >
  )
}