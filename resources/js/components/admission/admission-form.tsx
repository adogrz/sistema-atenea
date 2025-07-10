"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, Save, Send, AlertCircle, CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"

import DatosPersonales from "./sections/personal-data"
import Direccion from "./sections/address"
import Educacion from "./sections/education"
import SeleccionOlimpiadas from "../olympics"
import Documentacion from "./sections/documentation"
import Consentimientos from "./sections/terms-conditions"
import ResumenSolicitud from "./sections/summary"
import BarraProgreso from "./progress-bar"
import Captcha from "./captcha"

// Esquema de validación completo para todo el formulario
const formSchema = z.object({
  // Datos Personales
  nombreCompleto: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/, "Solo se permiten letras y espacios"),
  fechaNacimiento: z
    .date()
    .refine(
      (date) => {
        const hoy = new Date()
        const edad = hoy.getFullYear() - date.getFullYear()
        const m = hoy.getMonth() - date.getMonth()
        const ajusteEdad = m < 0 || (m === 0 && hoy.getDate() < date.getDate()) ? -1 : 0
        const edadFinal = edad + ajusteEdad
        return edadFinal >= 10
      },
      { message: "Debes tener al menos 10 años" },
    )
    .refine(
      (date) => {
        const hoy = new Date()
        const edad = hoy.getFullYear() - date.getFullYear()
        const m = hoy.getMonth() - date.getMonth()
        const ajusteEdad = m < 0 || (m === 0 && hoy.getDate() < date.getDate()) ? -1 : 0
        const edadFinal = edad + ajusteEdad
        return edadFinal <= 25
      },
      { message: "Debes tener máximo 25 años" },
    ),
  genero: z.enum(["M", "F", "O"], {
    required_error: "Debes seleccionar un género",
  }),
  correoElectronico: z.string().email("Correo electrónico inválido"),
  telefonoContacto: z
    .string()
    .min(8, "El teléfono debe tener al menos 8 dígitos")
    .regex(/^\d+$/, "Solo se permiten números"),

  // Dirección
  pais: z.string().min(1, "Debes seleccionar un país"),
  departamento: z.string().min(1, "Debes seleccionar un departamento"),
  municipio: z.string().min(1, "Debes seleccionar un municipio"),
  direccionDetallada: z.string().min(5, "La dirección debe tener al menos 5 caracteres"),

  // Educación
  centroEducativo: z.string().min(3, "El nombre del centro educativo debe tener al menos 3 caracteres"),
  nivelEstudios: z.enum(["Básica", "Media", "Técnico", "Otro"], {
    required_error: "Debes seleccionar un nivel de estudios",
  }),
  promedioAcademico: z
    .number()
    .min(0, "El promedio debe ser mayor o igual a 0")
    .max(10, "El promedio debe ser menor o igual a 10")
    .multipleOf(0.01, "El promedio debe tener máximo 2 decimales"),

  // Selección de Olimpiadas
  olimpiadas: z.array(z.string()).min(1, "Debes seleccionar al menos una olimpiada"),

  // Documentación
  cedulaPasaporte: z
    .instanceof(File)
    .refine((file) => file.size <= 2 * 1024 * 1024, "El archivo debe ser menor a 2MB")
    .refine(
      (file) => ["application/pdf", "image/jpeg", "image/jpg"].includes(file.type),
      "Solo se permiten archivos PDF o JPG",
    ),
  fotoReciente: z
    .instanceof(File)
    .refine((file) => file.size <= 1 * 1024 * 1024, "El archivo debe ser menor a 1MB")
    .refine(
      (file) => ["image/jpeg", "image/jpg", "image/png"].includes(file.type),
      "Solo se permiten archivos JPG o PNG",
    ),

  // Consentimientos
  aceptoTerminos: z.literal(true, {
    errorMap: () => ({ message: "Debes aceptar los términos y condiciones" }),
  }),
  autorizoMoodle: z.literal(true, {
    errorMap: () => ({ message: "Debes autorizar el uso de datos para Moodle" }),
  }),
})

type FormValues = z.infer<typeof formSchema>

export default function FormularioAdmision() {
  const [activeTab, setActiveTab] = useState("datos-personales")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formStatus, setFormStatus] = useState<"idle" | "success" | "error">("idle")
  const [captchaVerified, setCaptchaVerified] = useState(false)
  const { toast } = useToast()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombreCompleto: "",
      genero: undefined,
      correoElectronico: "",
      telefonoContacto: "",
      pais: "",
      departamento: "",
      municipio: "",
      direccionDetallada: "",
      centroEducativo: "",
      nivelEstudios: undefined,
      promedioAcademico: 0,
      olimpiadas: [],
      aceptoTerminos: undefined,
      autorizoMoodle: undefined,
    },
    mode: "onBlur",
  })

  const { formState } = form
  const { errors } = formState

  // Calcular el número de errores por sección
  const erroresPorSeccion = {
    "datos-personales": Object.keys(errors).filter((key) =>
      ["nombreCompleto", "fechaNacimiento", "genero", "correoElectronico", "telefonoContacto"].includes(key),
    ).length,
    direccion: Object.keys(errors).filter((key) =>
      ["pais", "departamento", "municipio", "direccionDetallada"].includes(key),
    ).length,
    educacion: Object.keys(errors).filter((key) =>
      ["centroEducativo", "nivelEstudios", "promedioAcademico"].includes(key),
    ).length,
    olimpiadas: Object.keys(errors).filter((key) => ["olimpiadas"].includes(key)).length,
    documentacion: Object.keys(errors).filter((key) => ["cedulaPasaporte", "fotoReciente"].includes(key)).length,
    consentimientos: Object.keys(errors).filter((key) => ["aceptoTerminos", "autorizoMoodle"].includes(key)).length,
  }

  const totalErrores = Object.values(erroresPorSeccion).reduce((a, b) => a + b, 0)

  const tabs = [
    { id: "datos-personales", label: "Datos Personales" },
    { id: "direccion", label: "Dirección" },
    { id: "educacion", label: "Educación" },
    { id: "olimpiadas", label: "Olimpiadas" },
    { id: "documentacion", label: "Documentación" },
    { id: "consentimientos", label: "Consentimientos" },
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
    setIsSubmitting(true)

    try {
      // Simulación de envío al servidor
      console.log("Datos del formulario:", data)

      // Simular una petición al servidor
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setFormStatus("success")
      toast({
        title: "Solicitud enviada",
        description: "Tu solicitud ha sido recibida correctamente. Te hemos enviado un correo de confirmación.",
      })
    } catch (error) {
      console.error("Error al enviar el formulario:", error)
      setFormStatus("error")
      toast({
        variant: "destructive",
        title: "Error al enviar",
        description: "Ocurrió un problema al enviar tu solicitud. Por favor inténtalo de nuevo más tarde.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

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
    <Form {...form}>
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
            <DatosPersonales form={form} />
          </TabsContent>

          <TabsContent value="direccion">
            <Direccion form={form} />
          </TabsContent>

          <TabsContent value="educacion">
            <Educacion form={form} />
          </TabsContent>

          <TabsContent value="olimpiadas">
            <SeleccionOlimpiadas form={form} />
          </TabsContent>

          <TabsContent value="documentacion">
            <Documentacion form={form} />
          </TabsContent>

          <TabsContent value="consentimientos">
            <Consentimientos form={form} />
          </TabsContent>

          <TabsContent value="resumen">
            <ResumenSolicitud form={form} />
            <Captcha onVerify={() => setCaptchaVerified(true)} />
          </TabsContent>
        </Tabs>

        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" onClick={handlePrevious} disabled={activeTab === "datos-personales"}>
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
              <Button type="submit" disabled={isSubmitting || !captchaVerified || totalErrores > 0}>
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
          </div>
        </div>
      </form>
    </Form>
  )
}