'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Departamento, Distrito, Municipio } from '@/types/admission/address';
import { CentroEducativo, NivelEducativo } from '@/types/admission/education';
import { useFormContext } from 'react-hook-form';

interface ResumenProps {
    centros_educativos: CentroEducativo[];
    niveles_educativos: NivelEducativo[];
    departamentos: Departamento[];
    municipios: Municipio[];
    distritos: Distrito[];
}

export default function ResumenSolicitud(props: ResumenProps) {
    const form = useFormContext();
    const values = form.getValues();

    const sexoMap: Record<string, string> = {
        H: 'Hombre',
        M: 'Mujer',
    };

    const departamentoSeleccionado = form.watch('departamento');
    const municipioSeleccionado = form.watch('municipio');
    const distritoSeleccionado = form.watch('distrito');

    // Extraer los nombres para mostrar el resumen
    const nombreDepartamento = props.departamentos?.find((d) => d.id === departamentoSeleccionado)?.nombre_departamento;
    const nombreMunicipio = props.municipios?.find?.((m) => m.id === municipioSeleccionado)?.nombre_municipio;
    const nombreDistrito = props.distritos?.find?.((d) => d.id === distritoSeleccionado)?.nombre_distrito;

    // Utilidades para mostrar valores por id
    const getCentroEducativo = (id?: string) => {
        if (!props.centros_educativos || !Array.isArray(props.centros_educativos)) {
            return values.centro_educativo || 'No especificado';
        }
        return props.centros_educativos.find((c) => c.codigo === id)?.nombre || values.centro_educativo || 'No especificado';
    };

    const getNivelEducativo = (id?: string) => {
        if (!props.niveles_educativos || !Array.isArray(props.niveles_educativos)) {
            return 'No especificado';
        }
        const nivel = props.niveles_educativos.find((n) => n.codigo === Number(id));
        return nivel?.descripcion || 'No especificado';
    };

    // Helper para mostrar "No especificado"
    const showValue = (val: unknown): string =>
        val === null || val === undefined || (typeof val === 'string' && val.trim() === '') ? 'No especificado' : String(val);

    return (
        <TooltipProvider>
            <Card>
                <CardHeader>
                    <CardTitle>Resumen</CardTitle>
                    <CardDescription>Revisa los datos ingresados cuidadosamente antes de enviarlos</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6 text-sm">
                    {/* Datos personales */}
                    <section>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <h3 className="mb-3 text-base font-semibold">Datos personales</h3>
                            </TooltipTrigger>
                            <TooltipContent>Información básica del estudiante como nombre, contacto y NIE</TooltipContent>
                        </Tooltip>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <strong>Nombre completo:</strong>{' '}
                                {`${showValue(values.primer_nombre)} ${showValue(values.segundo_nombre)} ${showValue(values.primer_apellido)} ${showValue(values.segundo_apellido)}`
                                    .replace(/\s+/g, ' ')
                                    .trim() === 'No especificado No especificado No especificado No especificado'
                                    ? 'No especificado'
                                    : `${showValue(values.primer_nombre)} ${showValue(values.segundo_nombre)} ${showValue(values.primer_apellido)} ${showValue(values.segundo_apellido)}`
                                          .replace(/\s+/g, ' ')
                                          .trim()}
                            </div>
                            <div>
                                <strong>Sexo:</strong> {sexoMap[values.sexo] || 'No especificado'}
                            </div>
                            <div>
                                <strong>Fecha de nacimiento:</strong> {showValue(values.fecha_nacimiento)}
                            </div>
                            <div>
                                <strong>NIE:</strong> {showValue(values.nie)}
                            </div>
                            <div>
                                <strong>Teléfono:</strong> {showValue(values.telefono_estudiante)}
                            </div>
                            <div>
                                <strong>Email:</strong> {showValue(values.email)}
                            </div>
                        </div>
                    </section>

                    <Separator />

                    {/* Dirección */}
                    <section>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <h3 className="mb-3 text-base font-semibold">Dirección</h3>
                            </TooltipTrigger>
                            <TooltipContent>Ubicación de tu residencia actual y contacto secundario</TooltipContent>
                        </Tooltip>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <strong>Departamento:</strong> {showValue(nombreDepartamento)}
                            </div>
                            <div>
                                <strong>Municipio:</strong> {showValue(nombreMunicipio)}
                            </div>
                            <div>
                                <strong>Distrito:</strong> {showValue(nombreDistrito)}
                            </div>
                            <div>
                                <strong>Teléfono de casa:</strong> {showValue(values.telefono_casa)}
                            </div>
                            <div className="md:col-span-2">
                                <strong>Dirección detallada:</strong> {showValue(values.direccion)}
                            </div>
                        </div>
                    </section>

                    <Separator />

                    {/* Educación */}
                    <section>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <h3 className="mb-3 text-base font-semibold">Educación</h3>
                            </TooltipTrigger>
                            <TooltipContent>Datos sobre tu centro de estudio y nivel académico actual</TooltipContent>
                        </Tooltip>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <strong>Código del centro:</strong> {showValue(values.codigo)}
                            </div>
                            <div>
                                <strong>Centro educativo:</strong> {getCentroEducativo(values.codigo)}
                            </div>
                            <div>
                                <strong>Sector:</strong> {showValue(values.sector)}
                            </div>
                            <div>
                                <strong>Zona:</strong> {showValue(values.zona)}
                            </div>
                            <div>
                                <strong>¿Internacional?:</strong> {showValue(values.internacional)}
                            </div>
                            <div>
                                <strong>Nivel educativo:</strong> {getNivelEducativo(values.nivel_educativo)}
                            </div>
                        </div>
                    </section>

                    <Separator />

                    {/* Responsable 1 */}
                    <section>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <h3 className="mb-3 text-base font-semibold">Responsable 1</h3>
                            </TooltipTrigger>
                            <TooltipContent>Primer responsable legal del estudiante</TooltipContent>
                        </Tooltip>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <strong>DUI:</strong> {showValue(values.dui_responsable_1)}
                            </div>
                            <div>
                                <strong>Nombres:</strong> {showValue(values.nombres_responsable_1)}
                            </div>
                            <div>
                                <strong>Apellidos:</strong> {showValue(values.apellidos_responsable_1)}
                            </div>
                            <div>
                                <strong>Email:</strong> {showValue(values.email_responsable_1)}
                            </div>
                            <div>
                                <strong>Teléfono principal:</strong> {showValue(values.telefono_responsable_1)}
                            </div>
                            <div>
                                <strong>Parentesco:</strong> {showValue(values.tipo_parentesco_1)}
                            </div>
                        </div>
                    </section>

                    <Separator />

                    {/* Responsable 2 */}
                    <section>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <h3 className="mb-3 text-base font-semibold">Responsable 2</h3>
                            </TooltipTrigger>
                            <TooltipContent>Segundo responsable legal del estudiante (opcional)</TooltipContent>
                        </Tooltip>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <strong>DUI:</strong> {showValue(values.dui_responsable_2)}
                            </div>
                            <div>
                                <strong>Nombres:</strong> {showValue(values.nombres_responsable_2)}
                            </div>
                            <div>
                                <strong>Apellidos:</strong> {showValue(values.apellidos_responsable_2)}
                            </div>
                            <div>
                                <strong>Email:</strong> {showValue(values.email_responsable_2)}
                            </div>
                            <div>
                                <strong>Teléfono principal:</strong> {showValue(values.telefono_responsable_2)}
                            </div>
                            <div>
                                <strong>Parentesco:</strong> {showValue(values.tipo_parentesco_2)}
                            </div>
                        </div>
                    </section>
                </CardContent>
            </Card>
        </TooltipProvider>
    );
}
