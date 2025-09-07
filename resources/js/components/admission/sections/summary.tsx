'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Departamento, Distrito, Municipio } from '@/types/admission/address';
import { CentroEducativo, NivelEducativo } from '@/types/admission/education';
import { AlertCircle, CheckCircle, ChevronDown, ChevronRight, Edit, Eye, FileText, GraduationCap, MapPin, Save, User, Users } from 'lucide-react';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';

interface ResumenProps {
    centros_educativos: CentroEducativo[];
    niveles_educativos: NivelEducativo[];
    departamentos: Departamento[];
    municipios: Municipio[];
    distritos: Distrito[];
    onNavigateToSection?: (section: string) => void;
    onSaveManually?: () => void;
}

export default function ResumenSolicitud(props: ResumenProps) {
    const form = useFormContext();
    const values = form.getValues();
    const { onNavigateToSection, onSaveManually } = props;

    // Estados para controlar secciones colapsables
    const [openSections, setOpenSections] = useState({
        personal: true,
        address: true,
        education: true,
        responsible1: true,
        responsible2: false,
    });

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

    // Función para verificar completitud de sección
    const checkSectionCompleteness = (sectionId: string): { isComplete: boolean; filledFields: number; totalFields: number } => {
        let filledFields = 0;
        let totalFields = 0;

        switch (sectionId) {
            case 'personal': {
                const personalFields = [
                    'primer_nombre',
                    'segundo_nombre',
                    'primer_apellido',
                    'segundo_apellido',
                    'sexo',
                    'fecha_nacimiento',
                    'nie',
                    'email',
                ];
                totalFields = personalFields.length;
                filledFields = personalFields.filter((field) => {
                    const value = values[field];
                    return value && value.toString().trim() !== '';
                }).length;
                break;
            }

            case 'address': {
                const addressFields = ['departamento', 'municipio', 'distrito', 'colonia', 'calle', 'numero_casa'];
                totalFields = addressFields.length;
                filledFields = addressFields.filter((field) => {
                    const value = values[field];
                    return value && value.toString().trim() !== '';
                }).length;
                break;
            }

            case 'education': {
                const educationFields = ['codigo', 'nivel_educativo']; // Solo campos críticos sin valores por defecto
                totalFields = educationFields.length;
                filledFields = educationFields.filter((field) => {
                    const value = values[field];
                    return value && value.toString().trim() !== '';
                }).length;
                break;
            }

            case 'responsible1': {
                const resp1Fields = [
                    'dui_responsable_1',
                    'nombres_responsable_1',
                    'apellidos_responsable_1',
                    'telefono_responsable_1',
                    'tipo_parentesco_1',
                ];
                totalFields = resp1Fields.length;
                filledFields = resp1Fields.filter((field) => {
                    const value = values[field];
                    return value && value.toString().trim() !== '';
                }).length;
                break;
            }

            case 'responsible2': {
                const resp2Fields = [
                    'dui_responsable_2',
                    'nombres_responsable_2',
                    'apellidos_responsable_2',
                    'telefono_responsable_2',
                    'tipo_parentesco_2',
                ];
                totalFields = resp2Fields.length;
                filledFields = resp2Fields.filter((field) => {
                    const value = values[field];
                    return value && value.toString().trim() !== '';
                }).length;
                break;
            }

            default:
                totalFields = 1;
                filledFields = 0;
        }

        return {
            isComplete: filledFields === totalFields,
            filledFields,
            totalFields,
        };
    };

    // Función para cambiar estado de sección
    const toggleSection = (sectionId: keyof typeof openSections) => {
        setOpenSections((prev) => ({
            ...prev,
            [sectionId]: !prev[sectionId],
        }));
    };

    // Función para navegar a sección específica
    const handleNavigateToSection = (section: string) => {
        if (onNavigateToSection) {
            onNavigateToSection(section);
        }
    };

    // Calcular progreso general
    const calculateOverallProgress = () => {
        const sections = ['personal', 'address', 'education', 'responsible1'];
        let totalFields = 0;
        let totalFilledFields = 0;

        sections.forEach((section) => {
            const { filledFields, totalFields: sectionTotal } = checkSectionCompleteness(section);
            totalFields += sectionTotal;
            totalFilledFields += filledFields;
        });

        // Incluir responsable 2 solo si tiene algún dato
        const hasResponsible2Data = values.dui_responsable_2 || values.nombres_responsable_2 || values.apellidos_responsable_2;
        if (hasResponsible2Data) {
            const { filledFields, totalFields: sectionTotal } = checkSectionCompleteness('responsible2');
            totalFields += sectionTotal;
            totalFilledFields += filledFields;
        }

        return Math.round((totalFilledFields / totalFields) * 100);
    };

    // Componente para renderizar badge de estado
    const StatusBadge = ({ sectionId }: { sectionId: string }) => {
        const { isComplete, filledFields, totalFields } = checkSectionCompleteness(sectionId);

        if (isComplete) {
            return (
                <Badge
                    variant="default"
                    className="border-green-300 bg-green-100 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400"
                >
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Completo
                </Badge>
            );
        }

        return (
            <Badge
                variant="secondary"
                className="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-400"
            >
                <AlertCircle className="mr-1 h-3 w-3" />
                {filledFields}/{totalFields}
            </Badge>
        );
    };

    // Componente para renderizar sección colapsable
    const CollapsibleSection = ({
        id,
        title,
        icon: Icon,
        navigationTarget,
        children,
    }: {
        id: keyof typeof openSections;
        title: string;
        icon: React.ComponentType<{ className?: string }>;
        navigationTarget: string;
        children: React.ReactNode;
    }) => {
        const isOpen = openSections[id];

        return (
            <Collapsible open={isOpen} onOpenChange={() => toggleSection(id)}>
                <div className="rounded-lg border border-muted transition-colors hover:bg-muted/30">
                    <div className="flex items-center justify-between">
                        <CollapsibleTrigger asChild>
                            <button className="flex flex-1 items-center gap-3 p-3 text-left hover:bg-transparent" type="button">
                                <div className="flex items-center gap-2">
                                    <Icon className="h-5 w-5 text-primary" />
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{title}</h3>
                                </div>
                                <StatusBadge sectionId={id} />
                                <div className="ml-auto">
                                    {isOpen ? (
                                        <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200" />
                                    ) : (
                                        <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform duration-200" />
                                    )}
                                </div>
                            </button>
                        </CollapsibleTrigger>
                        <div className="p-3">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-7 px-2"
                                        onClick={() => handleNavigateToSection(navigationTarget)}
                                    >
                                        <Edit className="mr-1 h-3 w-3" />
                                        Editar
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Ir a la sección {title} para editar</TooltipContent>
                            </Tooltip>
                        </div>
                    </div>
                </div>
                <CollapsibleContent className="data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up overflow-hidden">
                    <Separator className="my-3" />
                    <div className="space-y-3 px-3 pb-3">{children}</div>
                </CollapsibleContent>
            </Collapsible>
        );
    };

    const overallProgress = calculateOverallProgress();

    return (
        <TooltipProvider>
            <div className="space-y-6">
                {/* Resumen Ejecutivo */}
                <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/10 to-transparent shadow-sm md:shadow">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-primary/10 p-2">
                                    <Eye className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl">Resumen de Solicitud</CardTitle>
                                    <CardDescription>Revisa cuidadosamente toda tu información antes de enviar</CardDescription>
                                </div>
                            </div>
                            <div className="space-y-1 text-right">
                                <div className="text-2xl font-bold text-primary tabular-nums">{overallProgress}%</div>
                                <div className="text-sm text-muted-foreground">Completado</div>
                            </div>
                        </div>

                        {/* Barra de progreso */}
                        <div className="space-y-2">
                            <Progress value={overallProgress} className="h-2" />
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Progreso del formulario</span>
                                <span>{overallProgress < 100 ? 'Completa todos los campos requeridos' : '¡Listo para enviar!'}</span>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* Acciones Principales */}
                <Card>
                    <CardContent className="flex items-center justify-center">
                        <div className="flex items-center gap-3">
                            <Button variant="outline" className="flex items-center gap-2" onClick={() => window.print()}>
                                <FileText className="size-4" />
                                Vista Previa
                            </Button>
                            <Button
                                variant="outline"
                                className="flex items-center gap-2"
                                onClick={() => {
                                    if (onSaveManually) {
                                        onSaveManually();
                                    }
                                }}
                            >
                                <Save className="size-4" />
                                Guardar Borrador
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Secciones del Formulario */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Detalles de la Solicitud
                        </CardTitle>
                        <CardDescription>
                            Información organizada por secciones. Haz clic en "Editar" para modificar datos específicos.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Datos Personales */}
                        <CollapsibleSection id="personal" title="Datos Personales del Aspirante" icon={User} navigationTarget="datos-personales">
                            <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2 xl:grid-cols-3">
                                <div className="space-y-1">
                                    <span className="font-semibold text-muted-foreground">Nombre completo</span>
                                    <p className="text-foreground">
                                        {`${showValue(values.primer_nombre)} ${showValue(values.segundo_nombre)} ${showValue(values.primer_apellido)} ${showValue(values.segundo_apellido)}`
                                            .replace(/\s+/g, ' ')
                                            .trim()}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <span className="font-semibold text-muted-foreground">Sexo</span>
                                    <p className="text-foreground">{sexoMap[values.sexo] || 'No especificado'}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="font-semibold text-muted-foreground">Fecha de nacimiento</span>
                                    <p className="text-foreground">{showValue(values.fecha_nacimiento)}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="font-semibold text-muted-foreground">NIE</span>
                                    <p className="text-foreground">{showValue(values.nie)}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="font-semibold text-muted-foreground">Email</span>
                                    <p className="text-foreground">{showValue(values.email)}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="font-semibold text-muted-foreground">Teléfono del estudiante</span>
                                    <p className="text-foreground">{showValue(values.telefono_estudiante)}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="font-semibold text-muted-foreground">Teléfono de casa</span>
                                    <p className="text-foreground">{showValue(values.telefono_casa)}</p>
                                </div>
                            </div>
                        </CollapsibleSection>

                        <Separator />

                        {/* Dirección */}
                        <CollapsibleSection id="address" title="Dirección de Residencia" icon={MapPin} navigationTarget="direccion">
                            <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2 xl:grid-cols-3">
                                <div className="space-y-1">
                                    <span className="font-semibold text-muted-foreground">Departamento</span>
                                    <p className="text-foreground">{showValue(nombreDepartamento)}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="font-semibold text-muted-foreground">Municipio</span>
                                    <p className="text-foreground">{showValue(nombreMunicipio)}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="font-semibold text-muted-foreground">Distrito</span>
                                    <p className="text-foreground">{showValue(nombreDistrito)}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="font-semibold text-muted-foreground">Colonia</span>
                                    <p className="text-foreground">{showValue(values.colonia)}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="font-semibold text-muted-foreground">Calle</span>
                                    <p className="text-foreground">{showValue(values.calle)}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="font-semibold text-muted-foreground">Número de casa</span>
                                    <p className="text-foreground">{showValue(values.numero_casa)}</p>
                                </div>
                                <div className="space-y-1 md:col-span-2 xl:col-span-3">
                                    <span className="font-semibold text-muted-foreground">Punto de referencia</span>
                                    <p className="text-foreground">{showValue(values.punto_referencia)}</p>
                                </div>
                                <div className="space-y-1 md:col-span-2 xl:col-span-3">
                                    <span className="font-semibold text-muted-foreground">Notas adicionales</span>
                                    <p className="text-foreground">{showValue(values.direccion)}</p>
                                </div>
                            </div>
                        </CollapsibleSection>

                        <Separator />

                        {/* Educación */}
                        <CollapsibleSection id="education" title="Información Educativa" icon={GraduationCap} navigationTarget="educacion">
                            <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2 xl:grid-cols-3">
                                <div className="space-y-1">
                                    <span className="font-semibold text-muted-foreground">Código del centro</span>
                                    <p className="text-foreground">{showValue(values.codigo)}</p>
                                </div>
                                <div className="space-y-1 md:col-span-2">
                                    <span className="font-semibold text-muted-foreground">Centro educativo</span>
                                    <p className="text-foreground">{getCentroEducativo(values.codigo)}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="font-semibold text-muted-foreground">Sector</span>
                                    <p className="text-foreground">{showValue(values.sector)}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="font-semibold text-muted-foreground">Zona</span>
                                    <p className="text-foreground">{showValue(values.zona)}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="font-semibold text-muted-foreground">¿Internacional?</span>
                                    <p className="text-foreground">{showValue(values.internacional)}</p>
                                </div>
                                <div className="space-y-1 md:col-span-2 xl:col-span-3">
                                    <span className="font-semibold text-muted-foreground">Nivel educativo</span>
                                    <p className="text-foreground">{getNivelEducativo(values.nivel_educativo)}</p>
                                </div>
                            </div>
                        </CollapsibleSection>

                        <Separator />

                        {/* Responsable 1 */}
                        <CollapsibleSection id="responsible1" title="Responsable Principal" icon={Users} navigationTarget="datos-responsables">
                            <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2 xl:grid-cols-3">
                                <div className="space-y-1">
                                    <span className="font-semibold text-muted-foreground">DUI</span>
                                    <p className="text-foreground">{showValue(values.dui_responsable_1)}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="font-semibold text-muted-foreground">Nombres</span>
                                    <p className="text-foreground">{showValue(values.nombres_responsable_1)}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="font-semibold text-muted-foreground">Apellidos</span>
                                    <p className="text-foreground">{showValue(values.apellidos_responsable_1)}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="font-semibold text-muted-foreground">Email</span>
                                    <p className="text-foreground">{showValue(values.email_responsable_1)}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="font-semibold text-muted-foreground">Teléfono</span>
                                    <p className="text-foreground">{showValue(values.telefono_responsable_1)}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="font-semibold text-muted-foreground">Parentesco</span>
                                    <p className="text-foreground">
                                        {showValue(values.tipo_parentesco_1)}
                                        {values.tipo_parentesco_1 === 'Otro' && values.otro_parentesco_1 && (
                                            <span className="text-muted-foreground"> ({showValue(values.otro_parentesco_1)})</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </CollapsibleSection>

                        {/* Responsable 2 - Solo mostrar si tiene datos */}
                        {(values.dui_responsable_2 || values.nombres_responsable_2 || values.apellidos_responsable_2) && (
                            <>
                                <Separator />
                                <CollapsibleSection
                                    id="responsible2"
                                    title="Responsable Secundario"
                                    icon={Users}
                                    navigationTarget="datos-responsables"
                                >
                                    <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2 xl:grid-cols-3">
                                        <div className="space-y-1">
                                            <span className="font-semibold text-muted-foreground">DUI</span>
                                            <p className="text-foreground">{showValue(values.dui_responsable_2)}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="font-semibold text-muted-foreground">Nombres</span>
                                            <p className="text-foreground">{showValue(values.nombres_responsable_2)}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="font-semibold text-muted-foreground">Apellidos</span>
                                            <p className="text-foreground">{showValue(values.apellidos_responsable_2)}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="font-semibold text-muted-foreground">Email</span>
                                            <p className="text-foreground">{showValue(values.email_responsable_2)}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="font-semibold text-muted-foreground">Teléfono</span>
                                            <p className="text-foreground">{showValue(values.telefono_responsable_2)}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="font-semibold text-muted-foreground">Parentesco</span>
                                            <p className="text-foreground">
                                                {showValue(values.tipo_parentesco_2)}
                                                {values.tipo_parentesco_2 === 'Otro' && values.otro_parentesco_2 && (
                                                    <span className="text-muted-foreground"> ({showValue(values.otro_parentesco_2)})</span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </CollapsibleSection>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </TooltipProvider>
    );
}
