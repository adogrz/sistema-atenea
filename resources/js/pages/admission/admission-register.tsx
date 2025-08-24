import FormularioAdmision from '@/components/admission/admission-form';
import { Departamento, Municipio, Distrito } from '@/types/admission/address';
import { CentroEducativo, NivelEducativo } from '@/types/admission/education';
import { Head } from '@inertiajs/react';

interface AdmissionRegisterProps {
    departamentos: Departamento[];
    municipios: Municipio[];
    distritos: Distrito[];
    centrosEducativos: CentroEducativo[];
    nivelesEducativos: NivelEducativo[];
}

export default function AdmissionRegister(props: AdmissionRegisterProps) {
    return (
        <>
            <Head title="Formulario de Admisión" />
            <FormularioAdmision {...props} />
        </>
    );
}
