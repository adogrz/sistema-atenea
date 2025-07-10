import FormularioAdmision from "@/components/admission/admission-form"
import { Head } from "@inertiajs/react"

export default function AdmissionRegister() {
  return (
    <>
      <Head title="Formulario de Admisión" />
        <div className="grid w-full y-full p-8 ">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Postulación Jóvenes Talento
            </h1>
            <p className="mt-2 text-muted-foreground">
              Completa este formulario para iniciar tu postulación al Programa Jóvenes Talento.
            </p>
          </div>
          <FormularioAdmision />
        </div>
    </>
  )
}