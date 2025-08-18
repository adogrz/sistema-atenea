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
import { Toaster, toast } from "sonner"

import DatosPersonales from "./sections/personal-data"
import DatosResponsable from "./sections/responsible"
import Direccion from "./sections/address"
import Educacion from "./sections/education"
import ResumenSolicitud from "./sections/summary"
import BarraProgreso from "./progress-bar"
import Captcha from "./captcha"
import { usePage } from "@inertiajs/react"
import { Departamento, Municipio, Distrito } from "@/types/admission/address"
import { CentroEducativo, NivelEducativo } from "@/types/admission/education"

// Esquema de validación completo para todo el formulario
export const formSchema = z.object({

  // Datos del estudiante
  codigo: z.string().min(1).regex(/^\d{5,10}$/, {
    message: "Código debe ser numérico entre 5 y 10 dígitos",
  }),
  primer_nombre: z.string().min(1).max(50).regex(/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s'-]+$/, {
    message: "Nombre no válido",
  }),
  segundo_nombre: z.string().min(1).max(50).regex(/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s'-]+$/, {
    message: "Segundo nombre no válido",
  }),
  primer_apellido: z.string().min(1).max(50).regex(/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s'-]+$/, {
    message: "Apellido no válido",
  }),
  segundo_apellido: z.string().min(1).max(50).regex(/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s'-]+$/, {
    message: "Segundo apellido no válido",
  }),
  sexo: z.enum(["H", "M"]),
  fecha_nacimiento: z.string().refine((val) => {
    const parsed = Date.parse(val);
    return !isNaN(parsed) && new Date(parsed) < new Date();
  }, { message: "Fecha inválida o en el futuro" }),
  nie: z.string().regex(/^\d{7,10}$/, {
    message: "NIE debe ser numérico entre 7 y 10 dígitos",
  }),
  email: z.string().email(),

  // Dirección  
  telefono_casa: z.string().regex(/^[267]\d{7}$/).nullable().optional(),
  direccion: z.string().min(5).max(255),
  distrito: z.string().regex(/^\d+$/, {
    message: "Debes seleccionar un distrito",
  }),

  departamento: z.string().min(1, {
    message: "Debes seleccionar un departamento",
  }),

  municipio: z.string().min(1, {
    message: "Debes seleccionar un municipio",
  }),

  // Datos del responsable 1
  dui_responsable_1: z.string().regex(/^\d{9}$/, {
    message: "DUI debe tener 9 dígitos numéricos",
  }),
  nombres_responsable_1: z.string().min(1).max(100).regex(/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s'-]+$/, {
    message: "Nombre del responsable no válido",
  }),
  apellidos_responsable_1: z.string().min(1).max(100).regex(/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s'-]+$/, {
    message: "Apellido del responsable no válido",
  }),
  email_responsable_1: z.string().email().nullable().optional(),
  telefono_responsable_1: z.string().regex(/^[267]\d{7}$/, {
    message: "Teléfono del responsable inválido",
  }),
  tipo_parentesco_1: z.enum(["Madre", "Padre", "Abuelo", "Tio", "Tutor legal"]),

  // Datos del responsable 2
  dui_responsable_2: z.string().regex(/^\d{9}$/, {
    message: "DUI debe tener 9 dígitos numéricos",
  }).optional(),
  nombres_responsable_2: z.string().max(100).regex(/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s'-]+$/, {
    message: "Nombre del responsable no válido",
  }).optional(),
  apellidos_responsable_2: z.string().max(100).regex(/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s'-]+$/, {
    message: "Apellido del responsable no válido",
  }).optional(),
  email_responsable_2: z.string().email().nullable().optional(),
  telefono_responsable_2: z.string().regex(/^[267]\d{7}$/, {
    message: "Teléfono del responsable inválido",
  }).optional(),
  tipo_parentesco_2: z.enum(["Madre", "Padre", "Abuelo", "Tio", "Tutor legal"]).optional(),

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
    '0',
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
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

  const {
    departamentos,
    municipiosPorDepartamento,
    distritosPorMunicipio,
    centrosEducativos,
    nivelesEducativos,
  } = usePage<{
    departamentos: Departamento[];
    municipiosPorDepartamento: Record<string, Municipio[]>;
    distritosPorMunicipio: Record<string, Distrito[]>;
    centrosEducativos: CentroEducativo[];
    nivelesEducativos: NivelEducativo[];
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

      // Responsable 1
      dui_responsable_1: "",
      nombres_responsable_1: "",
      apellidos_responsable_1: "",
      email_responsable_1: "",
      telefono_responsable_1: "",
      tipo_parentesco_1: undefined,

      // Responsable 2
      dui_responsable_2: undefined,
      nombres_responsable_2: undefined,
      apellidos_responsable_2: undefined,
      email_responsable_2: undefined,
      telefono_responsable_2: undefined,
      tipo_parentesco_2: undefined,
    },
    mode: 'onBlur',
  });

  const { formState } = form
  const { errors } = formState

  // Calcular el número de errores por sección
  const erroresPorSeccion = {
    "datos-personales": Object.keys(errors).filter((key) =>
      [
        "primer_nombre",
        "segundo_nombre",
        "primer_apellido",
        "segundo_apellido",
        "sexo",
        "fecha_nacimiento",
        "nie",
        "email",
      ].includes(key)
    ).length,

    "direccion": Object.keys(errors).filter((key) =>
      ["telefono_casa", "direccion", "distrito", "departamento", "municipio"].includes(key)
    ).length,

    "educacion": Object.keys(errors).filter((key) =>
      ["codigo", "centro_educativo", "sector", "zona", "internacional", "nivel_educativo"].includes(key)
    ).length,

    "datos-responsables": Object.keys(errors).filter((key) =>
      [
        "dui_responsable_1",
        "nombres_responsable_1",
        "apellidos_responsable_1",
        "email_responsable_1",
        "telefono_responsable_1",
        "tipo_parentesco_1",

        "dui_responsable_2",
        "nombres_responsable_2",
        "apellidos_responsable_2",
        "email_responsable_2",
        "telefono_responsable_2",
        "tipo_parentesco_2",
      ].includes(key)
    ).length,

    "resumen": 0, // Contador en resumen.
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

      toast.success("Solicitud enviada ¡Tu postulación ha sido registrada correctamente!");

      setFormStatus("success");
    } catch (error) {
      console.error("Error al enviar:", error);
      toast.error("No se pudo procesar tu solicitud! Intenta nuevamente más tarde.");
      setFormStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    setIsSaving(true)
    try {
      const formData = form.getValues()
      console.log("Guardando borrador:", formData)
      await new Promise((resolve) => setTimeout(resolve, 1500))
      toast.success("Borrador guardado! Podrás continuar con tu solicitud más tarde.");
    } catch (error) {
      console.error("Error al guardar el borrador:", error)
      toast.error("No se pudo guardar el borrador! Por favor inténtalo de nuevo.");
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

      <Toaster position="bottom-right" richColors />

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
            <Educacion
              centros_educativos={centrosEducativos}
              niveles_educativos={nivelesEducativos}
            />
          </TabsContent>

          <TabsContent value="resumen">
            <ResumenSolicitud
              centros_educativos={centrosEducativos}
              niveles_educativos={nivelesEducativos}
              departamentos={departamentos}
              municipios={municipiosPorDepartamento}
              distritos={distritosPorMunicipio}
            />
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
                  console.log("Errores detectados:", errors);
                  toast.warning("Errores en formulario! Revisa los campos marcados antes de enviar.");
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