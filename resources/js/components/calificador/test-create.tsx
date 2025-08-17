import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface FormState {
  nombre: string;
  descripcion: string;
  estado: 'borrador' | 'publicado' | 'archivado';
}

export default function CrearDefinicionEvaluacion() {
  const [form, setForm] = useState<FormState>({
    nombre: '',
    descripcion: '',
    estado: 'borrador',
  });

  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    setProcessing(true);
    setErrors({});

    router.post('/definiciones-evaluacion', form, {
      onFinish: () => setProcessing(false),
      onError: (e) => setErrors(e),
    });
  };

  return (
    <AppLayout>
      <Head title="Nueva Definición de Evaluación" />

      <Card className="max-w-2xl mx-auto mt-8">
        <CardContent className="space-y-4">
          <h1 className="text-xl font-bold">Crear definición de evaluación</h1>

          <div>
            <label className="text-sm">Nombre *</label>
            <Input
              value={form.nombre}
              onChange={(e) => handleChange('nombre', e.target.value)}
              required
            />
            {errors.nombre && <p className="text-sm text-red-500">{errors.nombre[0]}</p>}
          </div>

          <div>
            <label className="text-sm">Descripción</label>
            <Textarea
              value={form.descripcion}
              onChange={(e) => handleChange('descripcion', e.target.value)}
            />
            {errors.descripcion && <p className="text-sm text-red-500">{errors.descripcion[0]}</p>}
          </div>

          <div>
            <label className="text-sm">Estado</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={form.estado}
              onChange={(e) => handleChange('estado', e.target.value as FormState['estado'])}
            >
              <option value="borrador">Borrador</option>
              <option value="publicado">Publicado</option>
              <option value="archivado">Archivado</option>
            </select>
            {errors.estado && <p className="text-sm text-red-500">{errors.estado[0]}</p>}
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSubmit} disabled={processing}>
              Guardar definición
            </Button>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
