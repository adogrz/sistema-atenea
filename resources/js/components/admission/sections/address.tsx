'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Combobox } from '@/components/ui/combobox';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { Departamento, Distrito, Municipio } from '@/types/admission/address';
import { HelpCircle, MapPin } from 'lucide-react';
import { useFormContext } from 'react-hook-form';

// Props del componente
interface DireccionProps {
    departamentos: Departamento[];
    municipios: Municipio[];
    distritos: Distrito[];
}

// Hook personalizado para manejar la lógica de ubicación
const useLocation = (departamentos: Departamento[], municipios: Municipio[], distritos: Distrito[]) => {
    const form = useFormContext();
    const departamentoId = form.watch('departamento');
    const municipioId = form.watch('municipio');

    const municipiosFiltrados = departamentoId ? municipios.filter((m) => m.id_departamento === departamentoId) : [];
    const distritosFiltrados = municipioId ? distritos.filter((d) => d.id_municipio === municipioId) : [];

    const handleLocationChange =
        (field: { onChange: (value: string) => void }, level: 'departamento' | 'municipio' | 'distrito') => (value: string) => {
            field.onChange(value);
            if (level === 'departamento') {
                form.setValue('municipio', '', { shouldValidate: false });
                form.setValue('distrito', '', { shouldValidate: false });
            } else if (level === 'municipio') {
                form.setValue('distrito', '', { shouldValidate: false });
            }
            form.trigger(level);
        };

    const nombreDepartamento = departamentos.find((d) => d.id === departamentoId)?.nombre_departamento;
    const nombreMunicipio = municipios.find((m) => m.id === municipioId)?.nombre_municipio;
    const nombreDistrito = distritos.find((d) => d.id === form.watch('distrito'))?.nombre_distrito;

    return {
        departamentoId,
        municipioId,
        municipiosFiltrados,
        distritosFiltrados,
        handleLocationChange,
        nombreDepartamento,
        nombreMunicipio,
        nombreDistrito,
    };
};

// Componente principal
export default function Direccion({ departamentos, municipios, distritos }: DireccionProps) {
    const form = useFormContext();

    const {
        departamentoId,
        municipioId,
        municipiosFiltrados,
        distritosFiltrados,
        handleLocationChange,
        nombreDepartamento,
        nombreMunicipio,
        nombreDistrito,
    } = useLocation(departamentos, municipios, distritos);

    const formatTelefono = (value: string) => {
        const cleaned = value.replace(/\D/g, '');
        if (cleaned.length <= 4) return cleaned;
        return `${cleaned.substring(0, 4)}-${cleaned.substring(4, 8)}`;
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>, field: { onChange: (value: string) => void }) => {
        const value = e.target.value.replace(/\D/g, '');
        if (value.length <= 8) {
            field.onChange(value);
            if (value.length === 8) form.trigger('telefono_casa');
        }
    };

    const showSummary = nombreDepartamento || nombreMunicipio || nombreDistrito;

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-xl">Dirección de Residencia</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Ubicación actual de residencia del aspirante. Esta información es necesaria para el proceso de admisión y comunicaciones.
                        </p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-8">
                {/* Contacto Telefónico */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Teléfono de Contacto</h3>
                    <FormField
                        control={form.control}
                        name="telefono_casa"
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex items-center justify-between gap-1">
                                    <FormLabel>Teléfono de casa</FormLabel>
                                    <div className="flex items-center gap-1">
                                        <span className="text-sm text-muted-foreground">Opcional</span>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-4 w-4">
                                                        <HelpCircle className="h-3 w-3" />
                                                        <span className="sr-only">Ayuda</span>
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Número de teléfono fijo para contacto alternativo.</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                </div>
                                <FormControl>
                                    <Input
                                        type="tel"
                                        placeholder="2234-5678"
                                        pattern="[267]\d{7}"
                                        {...field}
                                        value={field.value ? formatTelefono(field.value) : ''}
                                        onChange={(e) => handlePhoneChange(e, field)}
                                        maxLength={9}
                                    />
                                </FormControl>
                                <FormDescription>Número de 8 dígitos que inicie con 2, 6 o 7.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Ubicación Geográfica */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Ubicación Geográfica</h3>
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="departamento"
                            render={({ field }) => {
                                const selectedDeptName = departamentos.find((d) => d.id === field.value)?.nombre_departamento || '';

                                const handleComboboxChange = (deptoName: string) => {
                                    const selectedDept = departamentos.find((d) => d.nombre_departamento === deptoName);
                                    const deptoId = selectedDept ? selectedDept.id : '';
                                    handleLocationChange(field, 'departamento')(deptoId);
                                };

                                return (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>
                                            Departamento <span className="text-red-500">*</span>
                                        </FormLabel>
                                        <Combobox
                                            items={departamentos as unknown as Record<string, unknown>[]}
                                            value={selectedDeptName}
                                            onValueChange={handleComboboxChange}
                                            valueKey="nombre_departamento"
                                            labelKey="nombre_departamento"
                                            placeholder="Selecciona un departamento"
                                            searchPlaceholder="Buscar departamento..."
                                            emptyText="No se encontraron departamentos."
                                        />
                                        <FormMessage />
                                    </FormItem>
                                );
                            }}
                        />

                        {departamentoId && (
                            <FormField
                                control={form.control}
                                name="municipio"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Municipio <span className="text-red-500">*</span>
                                        </FormLabel>
                                        <Select
                                            onValueChange={handleLocationChange(field, 'municipio')}
                                            value={field.value}
                                            disabled={municipiosFiltrados.length === 0}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue
                                                        placeholder={
                                                            municipiosFiltrados.length > 0
                                                                ? 'Selecciona un municipio'
                                                                : 'No hay municipios disponibles'
                                                        }
                                                    />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {municipiosFiltrados.map((mun) => (
                                                    <SelectItem key={mun.id} value={mun.id}>
                                                        {mun.nombre_municipio}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {municipioId && (
                            <FormField
                                control={form.control}
                                name="distrito"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Distrito <span className="text-red-500">*</span>
                                        </FormLabel>
                                        <Select
                                            onValueChange={handleLocationChange(field, 'distrito')}
                                            value={field.value}
                                            disabled={distritosFiltrados.length === 0}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue
                                                        placeholder={
                                                            distritosFiltrados.length > 0 ? 'Selecciona un distrito' : 'No hay distritos disponibles'
                                                        }
                                                    />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {distritosFiltrados.map((dist) => (
                                                    <SelectItem key={dist.id} value={dist.id}>
                                                        {dist.nombre_distrito}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                    </div>
                    <div className={`transition-opacity duration-500 ease-in-out ${showSummary ? 'opacity-100' : 'opacity-0'}`}>
                        {showSummary && (
                            <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950">
                                <div className="flex items-center gap-2 text-sm font-medium text-blue-900 dark:text-blue-100">
                                    <MapPin className="h-4 w-4" />
                                    Ubicación seleccionada:
                                </div>
                                <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                                    {nombreDepartamento ?? 'Pendiente'} → {nombreMunicipio ?? 'Pendiente'} → {nombreDistrito ?? 'Pendiente'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Dirección Específica */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Dirección Detallada</h3>
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="colonia"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Colonia/Residencial <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej. Colonia Las Flores" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="calle"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Calle/Avenida <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej. Calle Principal" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="numero_casa"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Número de casa <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej. #123, Casa 45" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="punto_referencia"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="flex items-center justify-between gap-1">
                                        <FormLabel>Punto de referencia</FormLabel>
                                        <span className="text-sm text-muted-foreground">Opcional</span>
                                    </div>
                                    <FormControl>
                                        <Input placeholder="Ej. Frente al parque" {...field} />
                                    </FormControl>
                                    <FormDescription>Lugar conocido cerca de tu domicilio</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormField
                        control={form.control}
                        name="direccion"
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex items-center justify-between gap-1">
                                    <FormLabel>Notas adicionales</FormLabel>
                                    <span className="text-sm text-muted-foreground">Opcional</span>
                                </div>
                                <FormControl>
                                    <Textarea
                                        placeholder="Ej: Portón verde, casa de dos plantas, frente a tienda Don Mincho"
                                        className="min-h-[100px]"
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription>Agrega cualquier detalle que facilite la ubicación de tu domicilio.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
