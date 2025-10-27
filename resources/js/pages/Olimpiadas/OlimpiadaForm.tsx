
import React from 'react';
import { useForm, Link } from '@inertiajs/react';
import { Olimpiada, Area, NivelEducativo } from '@/types';
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

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

interface OlimpiadaFormProps {
    olimpiada?: Olimpiada;
    areas: Area[];
    nivelesEducativos: NivelEducativo[];
}

const OlimpiadaForm: React.FC<OlimpiadaFormProps> = ({ olimpiada, areas, nivelesEducativos }) => {
    const { data, setData, post, put, processing, errors } = useForm({
        nombre: olimpiada?.nombre || '',
        descripcion: olimpiada?.descripcion || '',
        area_id: olimpiada?.area_id || '',
        activa: olimpiada?.activa || true,
        nivel_educativo_id: olimpiada?.nivel_educativo_id || '',
        fases: olimpiada?.fases || [],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (olimpiada) {
            put(route('olimpiadas.update', olimpiada.id));
        } else {
            post(route('olimpiadas.store'));
        }
    };

    const breadcrumbs = [
        { label: 'Inicio', href: route('dashboard') },
        { label: 'Olimpiadas', href: route('olimpiadas.index') },
        { label: olimpiada ? 'Editar Olimpiada' : 'Crear Olimpiada' },
    ];

    return (
        <AppLayout>
            <Head title={olimpiada ? 'Editar Olimpiada' : 'Crear Olimpiada'} />
            <div className="p-4 md:p-6">
                <Breadcrumb>
                    <BreadcrumbList>
                        {breadcrumbs.map((crumb, index) => (
                            <React.Fragment key={index}>
                                <BreadcrumbItem>
                                    {crumb.href ? (
                                        <BreadcrumbLink asChild>
                                            <Link href={crumb.href}>{crumb.label}</Link>
                                        </BreadcrumbLink>
                                    ) : (
                                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                                    )}
                                </BreadcrumbItem>
                                {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                            </React.Fragment>
                        ))}
                    </BreadcrumbList>
                </Breadcrumb>

                <h2 className="text-2xl font-bold tracking-tight mt-4 flex items-center space-x-2">
                    <span>{olimpiada ? 'Editar' : 'Crear'} Olimpiada</span>
                    {olimpiada?.created_at && (
                        <Badge variant="secondary">
                            Año: {new Date(olimpiada.created_at).getFullYear()}
                        </Badge>
                    )}
                </h2>
                <form onSubmit={handleSubmit} className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField label="Nombre" error={errors.nombre}>
                            <Input
                                value={data.nombre}
                                onChange={(e) => setData('nombre', e.target.value)}
                            />
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
                        <FormField label="Nivel Educativo" error={errors.nivel_educativo_id}>
                            <NivelEducativoComboBox
                                nivelesEducativos={nivelesEducativos}
                                value={String(data.nivel_educativo_id)}
                                onChange={(value) => setData('nivel_educativo_id', value)}
                            />
                        </FormField>
                        <div className="flex items-center space-x-2">
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
                    </div>
                    <div className="mt-8">
                        <h3 className="text-xl font-bold tracking-tight my-5">Fases</h3>
                        <FasesPanel fases={data.fases} setFases={(newFases) => setData('fases', newFases)} />
                    </div>
                    <div className="flex justify-end mt-6">
                        <Button type="submit" disabled={processing}>{olimpiada ? 'Actualizar' : 'Crear'} Olimpiada</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
};

export default OlimpiadaForm;
