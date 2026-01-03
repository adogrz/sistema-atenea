import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useForm } from '@inertiajs/react';
import { FaseOlimpiada, Resultado } from '@/types';

interface ResultadosViewProps {
    fase: FaseOlimpiada;
    resultados: Resultado[];
}

const ResultadosView: React.FC<ResultadosViewProps> = ({ fase, resultados }) => {
    const { post } = useForm();

    const aprobados = resultados.filter(r => r.aprobado);
    const reprobados = resultados.filter(r => !r.aprobado);

    const handleGenerateIds = () => {
        const studentIds = aprobados.map(r => r.estudiante.user_id);
        post(route('estudiantes.generate-permanent-ids'), { student_ids: studentIds });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Resultados de la Fase: {fase.nombre}</CardTitle>
                <CardDescription>
                    Nota mínima de aprobación: {fase.nota_minima_aprobacion}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="aprobados">
                    <TabsList>
                        <TabsTrigger value="aprobados">Aprobados ({aprobados.length})</TabsTrigger>
                        <TabsTrigger value="reprobados">Reprobados ({reprobados.length})</TabsTrigger>
                    </TabsList>
                    <TabsContent value="aprobados">
                        <div className="flex justify-end mb-4">
                            <Button onClick={handleGenerateIds}>Generar IDs Permanentes</Button>
                        </div>
                        <DataTable data={aprobados} />
                    </TabsContent>
                    <TabsContent value="reprobados">
                        <DataTable data={reprobados} />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
};

const DataTable = ({ data }: { data: Resultado[] }) => (
    <Table>
        <TableHeader>
            <TableRow>
                <TableHead>Estudiante</TableHead>
                <TableHead className="text-right">Puntaje</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {data.length > 0 ? (
                data.map(resultado => (
                    <TableRow key={resultado.estudiante.codigo}>
                        <TableCell>{resultado.estudiante.nombre_completo}</TableCell>
                        <TableCell className="text-right">{resultado.puntaje.toFixed(2)}</TableCell>
                    </TableRow>
                ))
            ) : (
                <TableRow>
                    <TableCell colSpan={2} className="text-center">No hay estudiantes en esta categoría.</TableCell>
                </TableRow>
            )}
        </TableBody>
    </Table>
);

export default ResultadosView;
