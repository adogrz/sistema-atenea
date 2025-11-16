import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { PageProps } from '@/types';
import { Inscripcion, ItemDefinido } from '@/types/cal/register';

interface Props extends PageProps {
  inscripcion: Inscripcion;
  evaluacion: {
    id: number;
    estado: string;
    total: number;
  };
  items: ItemDefinido[];
  calificaciones: Record<number, {
    puntaje: number;
    observacion: string;
  }>;
}

export default function CalificarInscripcion({ inscripcion, evaluacion, items, calificaciones }: Props) {
  const [form, setForm] = useState(
    items.map(item => ({
      item_definido_id: item.id,
      puntaje: calificaciones[item.id]?.puntaje ?? 0,
      observacion: calificaciones[item.id]?.observacion ?? '',
    }))
  );

  const handleChange = (index: number, field: 'puntaje' | 'observacion', value: string | number) => {
    const updated = [...form];
    updated[index][field] = field === 'puntaje' ? parseFloat(value as string) : value;
    setForm(updated);
  };

  const handleSubmit = (finalizar: boolean) => {
    router.post(`/calificaciones/inscripciones/${inscripcion.id}/update`, {
      items: form,
      finalizar,
    });
  };

  return (
    <AppLayout>
      <Head title="Calificar inscripción" />

      <h1 className="text-xl font-bold mb-4">Calificar: {inscripcion.participante?.nombre_completo}</h1>

      <div className="space-y-4">
        {items.map((item, index) => (
          <Card key={item.id}>
            <CardContent className="space-y-2">
              <div>
                <h2 className="font-semibold">{item.nombre}</h2>
                <p className="text-sm text-gray-600">{item.descripcion}</p>
              </div>

              <div className="flex items-center gap-4">
                <label className="text-sm">Puntaje (máx. {item.puntaje_maximo}):</label>
                <Input
                  type="number"
                  min={0}
                  max={item.puntaje_maximo}
                  step="0.01"
                  value={form[index].puntaje}
                  onChange={(e) => handleChange(index, 'puntaje', e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm">Observación:</label>
                <Textarea
                  value={form[index].observacion}
                  onChange={(e) => handleChange(index, 'observacion', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end gap-4 mt-6">
        <Button variant="outline" onClick={() => handleSubmit(false)}>
          Guardar
        </Button>
        <Button onClick={() => handleSubmit(true)}>
          Finalizar evaluación
        </Button>
      </div>
    </AppLayout>
  );
}
