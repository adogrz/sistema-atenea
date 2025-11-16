import * as React from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface TimePickerProps {
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    id?: string;
}

export function TimePicker({ 
    value = "", 
    onChange, 
    placeholder = "Seleccionar hora",
    disabled = false,
    id 
}: TimePickerProps) {
    const [open, setOpen] = React.useState(false);
    const [hour, setHour] = React.useState("");
    const [minute, setMinute] = React.useState("");

    // Inicializar valores desde el prop value
    React.useEffect(() => {
        if (value) {
            const [h, m] = value.split(":");
            setHour(h || "");
            setMinute(m || "");
        } else {
            setHour("");
            setMinute("");
        }
    }, [value]);

    const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        // Solo permitir números y limitar a 23
        if (val === "" || (/^\d{1,2}$/.test(val) && parseInt(val) <= 23)) {
            setHour(val);
        }
    };

    const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        // Solo permitir números y limitar a 59
        if (val === "" || (/^\d{1,2}$/.test(val) && parseInt(val) <= 59)) {
            setMinute(val);
        }
    };

    const handleSet = () => {
        if (hour && minute) {
            const formattedHour = hour.padStart(2, "0");
            const formattedMinute = minute.padStart(2, "0");
            const timeString = `${formattedHour}:${formattedMinute}`;
            onChange?.(timeString);
            setOpen(false);
        }
    };

    const handleClear = () => {
        setHour("");
        setMinute("");
        onChange?.("");
        setOpen(false);
    };

    const handleQuickTime = (h: number, m: number = 0) => {
        const formattedHour = h.toString().padStart(2, "0");
        const formattedMinute = m.toString().padStart(2, "0");
        const timeString = `${formattedHour}:${formattedMinute}`;
        setHour(formattedHour);
        setMinute(formattedMinute);
        onChange?.(timeString);
        setOpen(false);
    };

    const displayValue = value || placeholder;
    const hasValue = Boolean(value);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    id={id}
                    variant="outline"
                    className={cn(
                        "w-full justify-start text-left font-normal",
                        !hasValue && "text-muted-foreground"
                    )}
                    disabled={disabled}
                >
                    <Clock className="mr-2 h-4 w-4" />
                    {displayValue}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4" align="start">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Establecer hora</Label>
                        <div className="flex items-center gap-2">
                            <div className="flex-1">
                                <Input
                                    type="text"
                                    placeholder="HH"
                                    value={hour}
                                    onChange={handleHourChange}
                                    maxLength={2}
                                    className="text-center text-lg"
                                />
                                <p className="mt-1 text-center text-xs text-muted-foreground">Hora</p>
                            </div>
                            <span className="text-2xl font-bold">:</span>
                            <div className="flex-1">
                                <Input
                                    type="text"
                                    placeholder="MM"
                                    value={minute}
                                    onChange={handleMinuteChange}
                                    maxLength={2}
                                    className="text-center text-lg"
                                />
                                <p className="mt-1 text-center text-xs text-muted-foreground">Minutos</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Horarios rápidos</Label>
                        <div className="grid grid-cols-3 gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuickTime(8, 0)}
                                className="text-xs"
                            >
                                08:00
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuickTime(9, 0)}
                                className="text-xs"
                            >
                                09:00
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuickTime(10, 0)}
                                className="text-xs"
                            >
                                10:00
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuickTime(12, 0)}
                                className="text-xs"
                            >
                                12:00
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuickTime(14, 0)}
                                className="text-xs"
                            >
                                14:00
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuickTime(16, 0)}
                                className="text-xs"
                            >
                                16:00
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuickTime(17, 0)}
                                className="text-xs"
                            >
                                17:00
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuickTime(18, 0)}
                                className="text-xs"
                            >
                                18:00
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuickTime(20, 0)}
                                className="text-xs"
                            >
                                20:00
                            </Button>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={handleClear}
                        >
                            Limpiar
                        </Button>
                        <Button
                            type="button"
                            className="flex-1"
                            onClick={handleSet}
                            disabled={!hour || !minute}
                        >
                            Establecer
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
