import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CalificadorItemAsignado, ChartData } from '@/types';
import { ColumnDef, ColumnFiltersState } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface AllAssignmentsTabProps {
    allAssignments: CalificadorItemAsignado[];
    chartsData: ChartData;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const AllAssignmentsTab: React.FC<AllAssignmentsTabProps> = ({ allAssignments, chartsData }) => {
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [selectedYear, setSelectedYear] = useState<string>(() => new Date().getFullYear().toString());
    const [graderSearch, setGraderSearch] = useState('');

    const columns: ColumnDef<CalificadorItemAsignado>[] = useMemo(() => [
        { accessorKey: 'olimpiada_nombre', header: 'Olimpiada' },
        {
            accessorKey: 'olimpiada_tipo',
            header: 'Tipo',
            cell: ({ row }) => <Badge variant="secondary">{row.getValue('olimpiada_tipo')}</Badge>
        },
        { accessorKey: 'fase_olimpiada_nombre', header: 'Fase' },
        { accessorKey: 'item_definido_nombre', header: 'Ítem' },
        { accessorKey: 'calificador_name', header: 'Calificador' },
        {
            accessorKey: 'area_name',
            header: 'Área',
            cell: ({ row }) => <Badge variant="outline">{row.getValue('area_name')}</Badge>
        },
        {
            accessorKey: 'year',
            header: 'Año',
            cell: ({ row }) => <Badge>{row.getValue('year')}</Badge>
        },
    ], []);

    const filterOptions = useMemo(() => {
        const olimpiadas = [...new Set(allAssignments.map(a => a.olimpiada_nombre))].map(o => ({ label: o, value: o }));
        const fases = [...new Set(allAssignments.map(a => a.fase_olimpiada_nombre))].map(f => ({ label: f, value: f }));
        const years = [...new Set(allAssignments.map(a => a.year))].map(y => ({ label: String(y), value: String(y) }));
        return { olimpiadas, fases, years };
    }, [allAssignments]);

    const chartDataForYear = useMemo(() => {
        const yearData = chartsData.assignmentsByYearAndCalificador[selectedYear] || {};
        const graderData = Object.entries(yearData)
            .map(([name, count]) => ({ name, asignaciones: count }))
            .filter(g => g.name.toLowerCase().includes(graderSearch.toLowerCase()));

        const areaDataForYear = chartsData.assignmentsByYearAndArea[selectedYear] || {};
        const areaData = Object.entries(areaDataForYear).map(([name, value]) => ({ name, value }));

        const total = chartsData.totalAssignmentsByYear[selectedYear] || 0;

        return { graderData, areaData, total };
    }, [chartsData, selectedYear, graderSearch]);

    const toolbarOptions = {
        searchableColumnId: 'calificador_name',
        filters: [
            { columnId: 'olimpiada_nombre', title: 'Olimpiada', options: filterOptions.olimpiadas },
            { columnId: 'fase_olimpiada_nombre', title: 'Fase', options: filterOptions.fases },
            { columnId: 'year', title: 'Año', options: filterOptions.years },
        ],
    };

    return (
        <div className="space-y-6">
            <Accordion type="single" collapsible>
                <AccordionItem value="item-1">
                    <AccordionTrigger>Ver Estadísticas</AccordionTrigger>
                    <AccordionContent>
                        <Card>
                            <CardHeader>
                                <CardTitle>Estadísticas de Asignaciones</CardTitle>
                                <CardDescription>Visualiza la distribución de asignaciones de ítems a calificadores.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="w-48">
                                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar Año" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.keys(chartsData.totalAssignmentsByYear).sort((a, b) => Number(b) - Number(a)).map(year => (
                                                <SelectItem key={year} value={year}>{year}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <Card className="lg:col-span-2">
                                        <CardHeader>
                                            <CardTitle>Asignaciones por Calificador ({selectedYear})</CardTitle>
                                            <Input 
                                                placeholder="Buscar calificador..."
                                                value={graderSearch}
                                                onChange={(e) => setGraderSearch(e.target.value)}
                                                className="mt-2"
                                            />
                                        </CardHeader>
                                        <CardContent>
                                            <ResponsiveContainer width="100%" height={300}>
                                                <BarChart data={chartDataForYear.graderData}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="name" />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Legend />
                                                    <Bar dataKey="asignaciones" fill="#8884d8" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Distribución por Área ({selectedYear})</CardTitle>
                                            <CardDescription>Total: {chartDataForYear.total}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <ResponsiveContainer width="100%" height={300}>
                                                <PieChart>
                                                    <Pie data={chartDataForYear.areaData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                                                        {chartDataForYear.areaData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                    <Legend />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </CardContent>
                                    </Card>
                                </div>
                            </CardContent>
                        </Card>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            <Card>
                <CardHeader>
                    <CardTitle>Listado de Todas las Asignaciones</CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={allAssignments}
                        columnFilters={columnFilters}
                        setColumnFilters={setColumnFilters}
                        toolbarOptions={toolbarOptions}
                    />
                </CardContent>
            </Card>
        </div>
    );
};

export default AllAssignmentsTab;