import { router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import React from 'react';
import { EvaluacionFase, Inscripcion } from '@/types/cal/register';

interface Props extends PageProps {
  yaCalificadas: EvaluacionFase[];
  reclamadas: EvaluacionFase[];
  noReclamadas: Inscripcion[];
  stats: {
    finalizadas: number;
    enProceso: number;
    disponibles: number;
  };
}

/**
 * Dashboard del calificador
 * Muestra tres listas: evaluaciones en proceso, finalizadas, y disponibles.
 */
export default function DashboardCalificador({ yaCalificadas, reclamadas, noReclamadas, stats }: Props) {
  const handleClaim = (inscripcionId: number) => {
    router.post(`/calificaciones/inscripciones/${inscripcionId}/claim`);
  };

  return (
    <AppLayout>
      <Head title="Mis Evaluaciones" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Reclamadas */}
        <Card>
          <CardContent>
            <h2 className="text-lg font-bold mb-2">En proceso</h2>
            {reclamadas.length === 0 && <p className="text-gray-500">Sin evaluaciones reclamadas.</p>}
            {reclamadas.map(({ id, inscripcion }) => (
              <div key={id} className="mb-4 border p-2 rounded">
                <p><strong>{inscripcion?.participante?.nombre_completo}</strong></p>
                <p>Fase: {inscripcion?.fase?.nombre}</p>
                <Badge variant="secondary">Estado: En proceso</Badge>
                <Button className="mt-2" onClick={() => router.visit(`/calificaciones/inscripciones/${inscripcion.id}/edit`)}>Continuar</Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* No reclamadas */}
        <Card>
          <CardContent>
            <h2 className="text-lg font-bold mb-2">Disponibles</h2>
            {noReclamadas.length === 0 && <p className="text-gray-500">Sin evaluaciones disponibles.</p>}
            {noReclamadas.map(({ id, participante, fase }) => (
              <div key={id} className="mb-4 border p-2 rounded">
                <p><strong>{participante?.nombre_completo}</strong></p>
                <p>Fase: {fase?.nombre}</p>
                <Badge variant="outline">Pendiente</Badge>
                <Button className="mt-2" onClick={() => handleClaim(id)}>Reclamar</Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Ya calificadas */}
        <Card>
          <CardContent>
            <h2 className="text-lg font-bold mb-2">Finalizadas</h2>
            {yaCalificadas.length === 0 && <p className="text-gray-500">Aún no has finalizado evaluaciones.</p>}
            {yaCalificadas.map(({ id, inscripcion, total }) => (
              <div key={id} className="mb-4 border p-2 rounded">
                <p><strong>{inscripcion?.participante?.nombre_completo}</strong></p>
                <p>Fase: {inscripcion?.fase?.nombre}</p>
                <p>Total: <strong>{total}</strong></p>
                <Badge variant="default">Finalizado</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
