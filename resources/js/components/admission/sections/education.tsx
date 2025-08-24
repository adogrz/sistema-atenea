'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CentroEducativo, NivelEducativo } from '@/types/admission/education';
import { useFormContext } from 'react-hook-form';
import EducationCenterFinder from '../education-center-finder';

interface EducacionProps {
    centros_educativos: CentroEducativo[];
    niveles_educativos: NivelEducativo[];
}

export default function Educacion({ centros_educativos, niveles_educativos }: EducacionProps) {
    const form = useFormContext();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Educación</CardTitle>
                <p className="text-sm text-muted-foreground">Información sobre tu centro educativo y nivel académico</p>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-6">
                    {/* Buscador de Centro Educativo */}
                    <EducationCenterFinder centros_educativos={centros_educativos} />

                    {/* Nivel educativo */}
                    <FormField
                        control={form.control}
                        name="nivel_educativo"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nivel de estudios</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || ''}>
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
            </CardContent>
        </Card>
    );
}
