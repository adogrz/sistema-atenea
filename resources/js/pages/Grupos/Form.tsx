import React from 'react';
import { useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { PageProps, Grupo, Area } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import FormField from '@/components/ui/form-field';
import { Textarea } from '@/components/ui/textarea';

interface GruposFormProps extends PageProps {
    grupo?: Grupo;
    areas: Area[];
    userAreaId?: number;
}

const GrupoForm: React.FC<GruposFormProps> = ({ grupo, areas, userAreaId }) => {
    const { data, setData, post, put, processing, errors } = useForm({
        nombre: grupo?.nombre || '',
        descripcion: grupo?.descripcion || '',
        horario: grupo?.horario || 'mañana',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (grupo) {
            put(route('grupos.update', grupo.id));
        } else {
            post(route('grupos.store'));
        }
    };

    const areaName = React.useMemo(() => {
        if (grupo?.area) {
            return grupo.area.name;
        }
        if (userAreaId) {
            const area = areas.find(a => a.id === userAreaId);
            return area ? area.name : 'Área no encontrada';
        }
        return 'N/A';
    }, [grupo, areas, userAreaId]);

    return (
        <AppLayout breadcrumbs={[{ title: 'Grupos', href: route('grupos.index') }, { title: grupo ? 'Editar' : 'Crear' }]}>
            <Head title={grupo ? 'Editar Grupo' : 'Crear Grupo'} />
            <div className="p-4 md:p-6">
                <h1 className="text-2xl font-bold mb-4">{grupo ? 'Editar' : 'Crear'} Grupo</h1>
                <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
                    <FormField label="Nombre" error={errors.nombre}>
                        <Input value={data.nombre} onChange={(e) => setData('nombre', e.target.value)} />
                    </FormField>
                    <FormField label="Descripción" error={errors.descripcion}>
                        <Textarea value={data.descripcion} onChange={(e) => setData('descripcion', e.target.value)} />
                    </FormField>
                    <FormField label="Horario" error={errors.horario}>
                        <Select value={data.horario} onValueChange={(value) => setData('horario', value)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="mañana">Mañana</SelectItem>
                                <SelectItem value="tarde">Tarde</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormField>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing}>{grupo ? 'Actualizar' : 'Crear'}</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
};

export default GrupoForm;
