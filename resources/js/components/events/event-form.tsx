import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import InputError from '@/components/input-error';

interface EventFormData {
    name: string;
    type: string;
    start_date: string;
    end_date: string;
    start_time: string;
    end_time: string;
    description: string;
    location: string;
}

interface EventFormProps {
    form: {
        data: EventFormData;
        setData: (key: keyof EventFormData, value: string) => void;
        errors: Partial<Record<keyof EventFormData, string>>;
    };
    processing: boolean;
    isEditMode?: boolean;
}

const EVENT_TYPES = [
    { value: 'registro-aspirantes', label: 'Registro de Aspirantes' },
    { value: 'inscripcion', label: 'Inscripción' },
    { value: 'academia-sabatina', label: 'Academia Sabatina' },
    { value: 'fin-de-mes', label: 'Fin de Mes' },
    { value: 'fdtc', label: 'FDTC' },
    { value: 'fin-de-semana', label: 'Fin de Semana' },
    { value: 'examen', label: 'Examen' },
    { value: 'graduacion', label: 'Graduación' },
];

export default function EventForm({ form, processing, isEditMode = false }: EventFormProps) {
    const { data, setData, errors } = form;

    return (
        <div className="space-y-6">
            {/* Información Básica */}
            <div className="space-y-6">
                <div className="border-b pb-4">
                    <h3 className="text-lg font-semibold">Información Básica</h3>
                    <p className="text-sm text-muted-foreground">
                        {isEditMode ? 'Actualiza los datos del evento' : 'Completa los datos del evento'}
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Nombre */}
                    <div className="space-y-2 lg:col-span-2">
                        <Label htmlFor="name">
                            Nombre del Evento <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="name"
                            placeholder="Ej. Registro de Aspirantes 2025"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            disabled={processing}
                            className={errors.name ? 'border-red-500' : ''}
                        />
                        <InputError message={errors.name} />
                    </div>

                    {/* Tipo */}
                    <div className="space-y-2">
                        <Label htmlFor="type">
                            Tipo de Evento <span className="text-red-500">*</span>
                        </Label>
                        <Select 
                            value={data.type} 
                            onValueChange={(value) => setData('type', value)}
                            disabled={processing}
                        >
                            <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                                <SelectValue placeholder="Selecciona un tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                {EVENT_TYPES.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                        {type.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.type} />
                    </div>

                    {/* Ubicación */}
                    <div className="space-y-2">
                        <Label htmlFor="location">Ubicación</Label>
                        <Input
                            id="location"
                            placeholder="Ej. Auditorio Principal"
                            value={data.location}
                            onChange={(e) => setData('location', e.target.value)}
                            disabled={processing}
                            className={errors.location ? 'border-red-500' : ''}
                        />
                        <InputError message={errors.location} />
                    </div>
                </div>

                {/* Descripción */}
                <div className="space-y-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                        id="description"
                        placeholder="Descripción del evento..."
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        disabled={processing}
                        className={errors.description ? 'border-red-500' : ''}
                        rows={3}
                    />
                    <InputError message={errors.description} />
                </div>
            </div>

            {/* Fechas y Horarios */}
            <div className="space-y-6">
                <div className="border-b pb-4">
                    <h3 className="text-lg font-semibold">Fechas y Horarios</h3>
                    <p className="text-sm text-muted-foreground">Define cuándo será el evento</p>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Fecha inicio */}
                    <div className="space-y-2">
                        <Label htmlFor="start_date">
                            Fecha de Inicio <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="start_date"
                            type="date"
                            value={data.start_date}
                            onChange={(e) => setData('start_date', e.target.value)}
                            disabled={processing}
                            className={errors.start_date ? 'border-red-500' : ''}
                        />
                        <InputError message={errors.start_date} />
                    </div>

                    {/* Fecha fin */}
                    <div className="space-y-2">
                        <Label htmlFor="end_date">
                            Fecha de Fin <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="end_date"
                            type="date"
                            value={data.end_date}
                            onChange={(e) => setData('end_date', e.target.value)}
                            disabled={processing}
                            className={errors.end_date ? 'border-red-500' : ''}
                        />
                        <InputError message={errors.end_date} />
                    </div>

                    {/* Hora inicio */}
                    <div className="space-y-2">
                        <Label htmlFor="start_time">Hora de Inicio</Label>
                        <Input
                            id="start_time"
                            type="time"
                            value={data.start_time}
                            onChange={(e) => setData('start_time', e.target.value)}
                            disabled={processing}
                            className={errors.start_time ? 'border-red-500' : ''}
                        />
                        <InputError message={errors.start_time} />
                    </div>

                    {/* Hora fin */}
                    <div className="space-y-2">
                        <Label htmlFor="end_time">Hora de Fin</Label>
                        <Input
                            id="end_time"
                            type="time"
                            value={data.end_time}
                            onChange={(e) => setData('end_time', e.target.value)}
                            disabled={processing}
                            className={errors.end_time ? 'border-red-500' : ''}
                        />
                        <InputError message={errors.end_time} />
                    </div>
                </div>
            </div>
        </div>
    );
}