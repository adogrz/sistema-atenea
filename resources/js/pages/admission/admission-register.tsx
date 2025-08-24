import FormularioAdmision from '@/components/admission/admission-form';
import { Departamento, Distrito, Municipio } from '@/types/admission/address';
import { CentroEducativo, NivelEducativo } from '@/types/admission/education';
import { Head } from '@inertiajs/react';

interface AdmissionRegisterProps {
    departamentos: Departamento[];
    municipios: Municipio[];
    distritos: Distrito[];
    centros_educativos: CentroEducativo[];
    niveles_educativos: NivelEducativo[];
}

export default function AdmissionRegister(props: AdmissionRegisterProps) {
    return (
        <>
            <Head title="Formulario de Admisión" />
            <FormularioAdmision {...props} />
        </>
    );
}
