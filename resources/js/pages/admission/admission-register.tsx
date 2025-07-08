import FormularioAdmision from "@/components/admission//admission-form"

export default function NuevaSolicitudPage() {
  return (
    <div className="container py-8 md:py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Solicitud de Admisión</h1>
          <p className="mt-2 text-muted-foreground">
            Completa este formulario para iniciar tu postulación al Programa Jóvenes Talento
          </p>
        </div>
        <FormularioAdmision />
      </div>
    </div>
  )
}