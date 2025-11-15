import React, { useEffect, useMemo } from 'react';
import { useForm, Link } from '@inertiajs/react';
import { Olimpiada, Area, NivelEducativo, BreadcrumbItem as Breadcrumb } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NivelEducativoComboBox } from '@/components/ui/nivel-educativo-combobox';
import FormField from '@/components/ui/form-field';
import FasesPanel from './FasesPanel';
import { Badge } from '@/components/ui/badge';
import { Info, ListChecks } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';

interface OlimpiadaFormProps {
    olimpiada?: Olimpiada;
    areas: Area[];
    nivelesEducativos: NivelEducativo[];
}

const OlimpiadaForm: React.FC<OlimpiadaFormProps> = ({ olimpiada, areas, nivelesEducativos }) => {
    const { data, setData, post, put, processing, errors } = useForm({
        nombre: olimpiada?.nombre || '',
        descripcion: olimpiada?.descripcion || '',
        area_id: olimpiada?.area_id || (areas.length > 0 ? areas[0].id : ''),
        activa: olimpiada?.activa ?? true,
        nivel_educativo_id: olimpiada?.nivel_educativo_id || (nivelesEducativos.length > 0 ? nivelesEducativos[0].codigo : ''),
        tipo: olimpiada?.tipo || 'nivel',
        anio: olimpiada?.anio || new Date().getFullYear(),
        fases: olimpiada?.fases || [],
    });

    const yearOptions = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let i = currentYear - 5; i <= currentYear + 5; i++) {
            years.push(i);
        }
        return years;
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const options = {
            onSuccess: () => toast.success(olimpiada ? 'Olimpiada actualizada con éxito.' : 'Olimpiada creada con éxito.'),
            onError: (e: any) => {
                console.error(e);
                toast.error('Error al guardar la olimpiada. Revisa los campos.');
            },
        };

        if (olimpiada) {
            put(route('olimpiadas.update', olimpiada.id), options);
        } else {
            post(route('olimpiadas.store'), options);
        }
    };

    const breadcrumbs: Breadcrumb[] = [
        { title: 'Inicio', href: route('dashboard') },
        { title: 'Olimpiadas', href: route('olimpiadas.index') },
        { title: olimpiada ? 'Editar Olimpiada' : 'Crear Olimpiada' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={olimpiada ? 'Editar Olimpiada' : 'Crear Olimpiada'} />
            <div className="p-4 md:p-6 rounded-lg">
                <h2 className="text-2xl font-bold tracking-tight flex items-center space-x-2 mb-6">
                    <span>{olimpiada ? 'Editar' : 'Crear'} Olimpiada</span>
                    {olimpiada?.anio && (
                        <Badge variant="secondary">
                            Año: {olimpiada.anio}
                        </Badge>
                    )}
                </h2>
                <div className="space-y-8">
                    <Card className="transition-all hover:shadow-md">
                        <CardHeader>
                            <CardTitle className="flex items-center"><Info className="mr-2 h-5 w-5" />Información General</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField label="Nombre" error={errors.nombre}>
                                <Input
                                    value={data.nombre}
                                    onChange={(e) => setData('nombre', e.target.value)}
                                />
                            </FormField>
                            <FormField label="Año" error={errors.anio}>
                                <Select
                                    value={String(data.anio)}
                                    onValueChange={(value) => setData('anio', parseInt(value))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona un año" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {yearOptions.map((year) => (
                                            <SelectItem key={year} value={String(year)}>
                                                {year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormField>
                            <FormField label="Área" error={errors.area_id}>
                                <Select
                                    value={String(data.area_id)}
                                    onValueChange={(value) => setData('area_id', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona un área" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {areas.map((area) => (
                                            <SelectItem key={area.id} value={String(area.id)}>
                                                {area.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormField>
                            <FormField label="Tipo de Olimpiada" error={errors.tipo}>
                                <Select
                                    value={data.tipo}
                                    onValueChange={(value) => setData('tipo', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona un tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="nivel">Por Nivel</SelectItem>
                                        <SelectItem value="olimpico">Olímpico</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormField>
                            <FormField label="Nivel Educativo" error={errors.nivel_educativo_id}>
                                <NivelEducativoComboBox
                                    nivelesEducativos={nivelesEducativos}
                                    value={String(data.nivel_educativo_id)}
                                    onChange={(value) => setData('nivel_educativo_id', value)}
                                />
                            </FormField>
                            <div className="flex items-center space-x-2 md:col-span-2">
                                <Switch
                                    checked={data.activa}
                                    onCheckedChange={(checked) => setData('activa', checked)}
                                    id="activa-olimpiada"
                                />
                                <label htmlFor="activa-olimpiada">Activa</label>
                            </div>
                            <div className="md:col-span-2">
                                <FormField label="Descripción" error={errors.descripcion}>
                                    <Textarea
                                        value={data.descripcion}
                                        onChange={(e) => setData('descripcion', e.target.value)}
                                    />
                                </FormField>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end">
                            <Button type="button" onClick={handleSubmit} disabled={processing}>{olimpiada ? 'Actualizar' : 'Crear'} Olimpiada</Button>
                        </CardFooter>
                    </Card>

                    <Card className="transition-all hover:shadow-md">
                        <CardHeader>
                            <CardTitle className="flex items-center"><ListChecks className="mr-2 h-5 w-5" />Fases de la Olimpiada</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <FasesPanel fases={data.fases} setFases={(newFases) => setData('fases', newFases)} processing={processing} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
};

export default OlimpiadaForm;