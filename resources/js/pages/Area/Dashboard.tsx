import React, { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage, router, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Olimpiada, FaseOlimpiada } from '@/types/olympics';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AreaDashboardProps extends PageProps {
    olimpiadas: Olimpiada[];
    selectedFase: FaseOlimpiada | null;
    faseDetails: any;
}

const AreaDashboard: React.FC<AreaDashboardProps> = ({ olimpiadas, selectedFase, faseDetails }) => {
    const [selectedOlimpiadaId, setSelectedOlimpiadaId] = useState<number | null>(null);

    const { data, setData, put, processing, errors } = useForm({
        cupos: selectedFase?.cupos || '',
        nota_minima_aprobacion: selectedFase?.nota_minima_aprobacion || '',
        fecha_inicio_inscripcion: selectedFase?.fecha_inicio_inscripcion || '',
        fecha_fin_inscripcion: selectedFase?.fecha_fin_inscripcion || '',
    });

    useEffect(() => {
        if (selectedFase) {
            setData({
                cupos: selectedFase.cupos || '',
                nota_minima_aprobacion: selectedFase.nota_minima_aprobacion || '',
                fecha_inicio_inscripcion: selectedFase.fecha_inicio_inscripcion || '',
                fecha_fin_inscripcion: selectedFase.fecha_fin_inscripcion || '',
            });
        }
    }, [selectedFase]);

    const handleFaseSelect = (faseId: number) => {
        router.get(route('area.dashboard', { fase_id: faseId }), {}, { preserveState: true });
    };

    const handleUpdateFase = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedFase) {
            put(route('fases.gestion.update', selectedFase.id));
        }
    };

    const handlePublishResults = () => {
        if (selectedFase) {
            if (confirm('¿Está seguro de que desea publicar los resultados? Esta acción es irreversible.')) {
                router.post(route('fases.gestion.publishResults', selectedFase.id));
            }
        }
    };

    const selectedOlimpiada = olimpiadas.find(o => o.id === selectedOlimpiadaId);

    return (
        <AppLayout>
            <Head title="Dashboard de Área" />
            <div className="p-4 md:p-8">
                <h2 className="text-2xl font-bold tracking-tight mb-4">Centro de Control de Fases</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="col-span-1">
                        <h3 className="text-lg font-semibold mb-2">Olimpiadas</h3>
                        <div className="space-y-2">
                            {olimpiadas.map((olimpiada) => (
                                <div key={olimpiada.id}>
                                    <h4 className="font-semibold p-2 rounded-lg cursor-pointer" onClick={() => setSelectedOlimpiadaId(olimpiada.id)}>{olimpiada.nombre}</h4>
                                    {selectedOlimpiadaId === olimpiada.id && (
                                        <div className="ml-4 space-y-1">
                                            {olimpiada.fases.map((fase) => (
                                                <div key={fase.id}
                                                     className={`p-2 rounded-lg cursor-pointer ${selectedFase?.id === fase.id ? 'bg-gray-200' : 'bg-gray-100'}`}
                                                     onClick={() => handleFaseSelect(fase.id)}>
                                                    <p>{fase.nombre}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="col-span-2">
                        {selectedFase && (
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Detalles de {selectedFase.nombre}</h3>
                                
                                <div className="mb-4 p-4 bg-white rounded-lg shadow">
                                    <h4 className="font-semibold mb-2">Progreso de Calificación</h4>
                                    <p>{faseDetails.evaluaciones_completadas} / {faseDetails.total_inscripciones} Evaluaciones Completadas</p>
                                </div>

                                <form onSubmit={handleUpdateFase} className="mb-4 p-4 bg-white rounded-lg shadow">
                                    <h4 className="font-semibold mb-2">Actualizar Parámetros de la Fase</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input label="Cupos" type="number" value={data.cupos} onChange={e => setData('cupos', e.target.value)} error={errors.cupos} />
                                        <Input label="Nota Mínima de Aprobación" type="number" value={data.nota_minima_aprobacion} onChange={e => setData('nota_minima_aprobacion', e.target.value)} error={errors.nota_minima_aprobacion} />
                                        <Input label="Fecha Inicio Inscripción" type="datetime-local" value={data.fecha_inicio_inscripcion} onChange={e => setData('fecha_inicio_inscripcion', e.target.value)} error={errors.fecha_inicio_inscripcion} />
                                        <Input label="Fecha Fin Inscripción" type="datetime-local" value={data.fecha_fin_inscripcion} onChange={e => setData('fecha_fin_inscripcion', e.target.value)} error={errors.fecha_fin_inscripcion} />
                                    </div>
                                    <Button type="submit" className="mt-4" disabled={processing}>Actualizar Fase</Button>
                                </form>

                                <div className="p-4 bg-white rounded-lg shadow">
                                    <h4 className="font-semibold mb-2">Publicar Resultados</h4>
                                    <Button onClick={handlePublishResults} disabled={selectedFase.resultados_publicados}>
                                        {selectedFase.resultados_publicados ? 'Resultados Publicados' : 'Publicar Resultados'}
                                    </Button>
                                </div>

                                <div className="mt-4 p-4 bg-white rounded-lg shadow">
                                    <h4 className="font-semibold mb-2">Inscripciones</h4>
                                    <ul>
                                        {faseDetails.inscripciones.map((inscripcion: any) => (
                                            <li key={inscripcion.id}>{inscripcion.estudiante.nombre}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default AreaDashboard;
