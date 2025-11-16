import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { router } from '@inertiajs/react';
import { Eye } from 'lucide-react';

interface RecentRecord {
    id: number;
    student_name: string;
    student_nie: string;
    doctor_name?: string;
    psychologist_name?: string;
    created_at: string;
    consultations_count?: number;
    sessions_count?: number;
}

interface RecentRecordsTableProps {
    title: string;
    description: string;
    records: RecentRecord[];
    type: 'medical' | 'psychological';
    emptyMessage?: string;
}

export function RecentRecordsTable({ title, description, records, type, emptyMessage = 'No hay expedientes recientes' }: RecentRecordsTableProps) {
    const handleViewRecord = (recordId: number) => {
        const routeName = type === 'medical' ? 'clinical-records.medical-records.show' : 'clinical-records.psychological-records.show';
        router.get(route(routeName, recordId));
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                {records.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">{emptyMessage}</div>
                ) : (
                    <div className="space-y-3">
                        {records.map((record) => (
                            <div
                                key={record.id}
                                className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-medium">{record.student_name}</p>
                                        <span className="text-xs text-muted-foreground">NIE: {record.student_nie}</span>
                                    </div>
                                    <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                                        <span>{type === 'medical' ? record.doctor_name : record.psychologist_name}</span>
                                        <span>•</span>
                                        <span>{record.created_at}</span>
                                        {type === 'medical' && record.consultations_count !== undefined && (
                                            <>
                                                <span>•</span>
                                                <span>{record.consultations_count} consultas</span>
                                            </>
                                        )}
                                        {type === 'psychological' && record.sessions_count !== undefined && (
                                            <>
                                                <span>•</span>
                                                <span>{record.sessions_count} sesiones</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => handleViewRecord(record.id)}>
                                    <Eye className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
