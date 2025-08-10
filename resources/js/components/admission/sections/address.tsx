'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Departamento, Distrito, Municipio } from '@/types/admission/address';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';

interface DireccionProps {
    departamentos: Departamento[];
    municipiosPorDepartamento: Record<string, Municipio[]>;
    distritosPorMunicipio: Record<string, Distrito[]>;
}

export default function Direccion({ departamentos, municipiosPorDepartamento, distritosPorMunicipio }: DireccionProps) {
    const form = useFormContext();

    const [municipios, setMunicipios] = useState<Municipio[]>([]);
    const [distritos, setDistritos] = useState<Distrito[]>([]);

    const departamentoSeleccionado = form.watch('departamento');
    const municipioSeleccionado = form.watch('municipio');
    const distritoSeleccionado = form.watch('distrito');

    // Actualizar municipios cuando cambia el departamento
    useEffect(() => {
        if (departamentoSeleccionado) {
            const municipiosDepartamento = municipiosPorDepartamento[departamentoSeleccionado] || [];
            setMunicipios(municipiosDepartamento);
            // Resetear municipio y distrito
            form.setValue('municipio', '');
            form.setValue('distrito', '');
            setDistritos([]);
        }
    }, [departamentoSeleccionado, municipiosPorDepartamento, form]);

    // Actualizar distritos cuando cambia el municipio
    useEffect(() => {
        if (municipioSeleccionado) {
            const distritosMunicipio = distritosPorMunicipio[municipioSeleccionado] || [];
            setDistritos(distritosMunicipio);
            // Resetear distrito
            form.setValue('distrito', '');
        }
    }, [municipioSeleccionado, distritosPorMunicipio, form]);

    // Nombres para mostrar
    const nombreDepartamento = departamentos?.find((d) => d.id === departamentoSeleccionado)?.nombre_departamento;
    const nombreMunicipio = municipios?.find((m) => m.id === municipioSeleccionado)?.nombre_municipio;
    const nombreDistrito = distritos?.find((d) => d.id === distritoSeleccionado)?.nombre_distrito;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Dirección</CardTitle>
                <p className="text-sm text-muted-foreground">Ingresa tu lugar de residencia actual</p>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-6">
                    {/* Teléfono de casa */}
                    <FormField
                        control={form.control}
                        name="telefono_casa"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Teléfono de casa - Opcional</FormLabel>
                                <FormControl>
                                    <Input type="tel" placeholder="Ej. 12345678" {...field} />
                                </FormControl>
                                <FormDescription>Número de teléfono fijo de tu hogar</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Departamento */}
                    <FormField
                        control={form.control}
                        name="departamento"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Departamento</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona un departamento" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {departamentos?.map((departamento) => (
                                            <SelectItem key={departamento.id} value={departamento.id}>
                                                {departamento.nombre_departamento}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Municipio */}
                    <FormField
                        control={form.control}
                        name="municipio"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Municipio</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value} disabled={!departamentoSeleccionado}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona un municipio" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {municipios.map((municipio) => (
                                            <SelectItem key={municipio.id} value={municipio.id}>
                                                {municipio.nombre_municipio}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Distrito */}
                    <FormField
                        control={form.control}
                        name="distrito"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Distrito</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value} disabled={!municipioSeleccionado}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona un distrito" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {distritos.map((distrito) => (
                                            <SelectItem key={distrito.id} value={distrito.id}>
                                                {distrito.nombre_distrito}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Resumen visual de selección */}
                    {(nombreDepartamento || nombreMunicipio || nombreDistrito) && (
                        <p className="text-sm text-muted-foreground">
                            <strong>Seleccionado:</strong> {nombreDepartamento ?? '—'} → {nombreMunicipio ?? '—'} → {nombreDistrito ?? '—'}
                        </p>
                    )}

                    {/* Dirección detallada */}
                    <FormField
                        control={form.control}
                        name="direccion"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Dirección detallada</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Ej. Colonia Las Flores, Calle Principal, Casa #123, Avenida Los Pinos"
                                        className="min-h-[100px]"
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription>Incluye referencias que faciliten la ubicación de tu domicilio</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
