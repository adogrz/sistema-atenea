'use client';

import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CentroEducativo, NivelEducativo } from '@/types/admission/education';
import { HelpCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';

interface EducacionProps {
    centros_educativos: CentroEducativo[];
    niveles_educativos: NivelEducativo[];
}

export default function Educacion({ centros_educativos, niveles_educativos }: EducacionProps) {
    const form = useFormContext();

    const [filtros, setFiltros] = useState({
        codigo: '',
        centro_educativo: '',
        sector: '',
        zona: '',
        internacional: '',
    });

    const codigo = form.watch('codigo');
    const nombre = form.watch('centro_educativo');
    const sector = form.watch('sector');
    const zona = form.watch('zona');
    const internacional = form.watch('internacional');

    // Resultados filtrados
    const resultados = useMemo(() => {
        if (!centros_educativos || !Array.isArray(centros_educativos)) {
            return [];
        }
        return centros_educativos
            .filter((c) => {
                const matchCodigo = filtros.codigo === '' || c.codigo.includes(filtros.codigo);
                const matchNombre = filtros.centro_educativo === '' || c.nombre.toLowerCase().includes(filtros.centro_educativo.toLowerCase());
                const matchSector = filtros.sector === '' || c.sector === filtros.sector;
                const matchZona = filtros.zona === '' || c.zona === filtros.zona;
                const matchInternacional = filtros.internacional === '' || c.internacional === filtros.internacional;
                return matchCodigo && matchNombre && matchSector && matchZona && matchInternacional;
            })
            .slice(0, 5);
    }, [centros_educativos, filtros]);

    // Selección de centro
    const handleSeleccion = (centro: CentroEducativo) => {
        form.setValue('codigo', centro.codigo);
        form.setValue('centro_educativo', centro.nombre);
        form.setValue('sector', centro.sector);
        form.setValue('zona', centro.zona);
        form.setValue('internacional', centro.internacional);
    };

    // Efecto visual al cambiar selección
    useEffect(() => {
        const subscription = form.watch((values, { name }) => {
            if (['codigo', 'centro_educativo', 'sector', 'zona', 'internacional'].includes(name ?? '')) {
                console.log('Centro educativo actualizado', {
                    codigo: values.codigo,
                    nombre: values.centro_educativo,
                    sector: values.sector,
                    zona: values.zona,
                    internacional: values.internacional,
                });
            }
        });

        return () => subscription.unsubscribe();
    }, [form]);

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold">Educación</h3>
                <p className="mt-1 text-sm text-muted-foreground">Información sobre tu formación académica actual</p>
            </div>

            <div className="space-y-6">
                {/* Filtros de búsqueda */}
                <div className="space-y-4">
                    <Input placeholder="Ej. 20657" value={filtros.codigo} onChange={(e) => setFiltros({ ...filtros, codigo: e.target.value })} />
                    <Input
                        placeholder="Ej. CENTRO ESCOLAR ISIDRO MENÉNDEZ"
                        value={filtros.centro_educativo}
                        onChange={(e) => setFiltros({ ...filtros, centro_educativo: e.target.value })}
                    />

                    <Select onValueChange={(value) => setFiltros({ ...filtros, sector: value })}>
                        <SelectTrigger>
                            <SelectValue placeholder="Sector" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="PÚBLICO">PÚBLICO</SelectItem>
                            <SelectItem value="PRIVADO">PRIVADO</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select onValueChange={(value) => setFiltros({ ...filtros, zona: value })}>
                        <SelectTrigger>
                            <SelectValue placeholder="Zona" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Rural">Rural</SelectItem>
                            <SelectItem value="Urbana">Urbana</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select onValueChange={(value) => setFiltros({ ...filtros, internacional: value })}>
                        <SelectTrigger>
                            <SelectValue placeholder="¿Internacional?" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="SI">SI</SelectItem>
                            <SelectItem value="NO">NO</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Resultados */}
                    <ul className="mt-4 space-y-2">
                        {resultados.length > 0 ? (
                            resultados.map((centro) => (
                                <li key={centro.codigo} className="cursor-pointer rounded p-2 hover:bg-muted" onClick={() => handleSeleccion(centro)}>
                                    {centro.nombre} ({centro.codigo}) – {centro.sector}, {centro.zona}, {centro.internacional}
                                </li>
                            ))
                        ) : (
                            <p>No hay centros que coincidan con los filtros</p>
                        )}
                    </ul>
                </div>

                {/* Panel resumen */}
                {codigo && (
                    <div className="mt-4 rounded border bg-muted/50 p-4">
                        <h4 className="mb-2 font-semibold">Resumen - Centro seleccionado</h4>
                        <p>
                            <strong>Nombre:</strong> {nombre}
                        </p>
                        <p>
                            <strong>Código:</strong> {codigo}
                        </p>
                        <p>
                            <strong>Sector:</strong> {sector}
                        </p>
                        <p>
                            <strong>Zona:</strong> {zona}
                        </p>
                        <p>
                            <strong>Internacional:</strong> {internacional}
                        </p>
                    </div>
                )}

                <FormField
                    control={form.control}
                    name="nie"
                    render={({ field }) => (
                        <FormItem>
                            <div className="flex items-center justify-between">
                                <FormLabel>NIE: Número de identificación estudiantil</FormLabel>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-5 w-5">
                                                <HelpCircle className="h-4 w-4" />
                                                <span className="sr-only">Ayuda</span>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="max-w-xs">Ingresa el número único de identificación estudiantil</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <FormControl>
                                <Input placeholder="0010012" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Nivel educativo */}
                <FormField
                    control={form.control}
                    name="nivel_educativo"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nivel de estudios</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona tu nivel de estudios" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {niveles_educativos && Array.isArray(niveles_educativos) && niveles_educativos.length > 0 ? (
                                        niveles_educativos.map((nivel) => (
                                            <SelectItem key={nivel.codigo} value={nivel.codigo}>
                                                {nivel.descripcion}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem value="no-disponible" disabled>
                                            No hay niveles disponibles
                                        </SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </div>
    );
}
