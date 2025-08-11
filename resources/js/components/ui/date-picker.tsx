import * as React from "react";
import { CalendarIcon } from "lucide-react";
import {
  Button,
  DatePicker as AriaDatePicker,
  Dialog,
  Group,
  Label,
  Popover,
  type DateValue,
} from "react-aria-components";
import { Calendar } from "@/components/ui/calendar-rac";
import { DateInput } from "@/components/ui/datefield-rac";
import { parseDate } from "@internationalized/date";
import { type PropsBase } from "react-day-picker";

export interface DatePickerProps {
  value?: Date;
  onChange?: (date?: Date) => void;
  label?: string;
  placeholder?: string; // Para compatibilidad API - no se usa internamente
  disabled?: boolean;
  disableDates?: (date: Date) => boolean;
  className?: string;
  buttonClassName?: string;
  align?: "start" | "center" | "end"; // Para compatibilidad API - no se usa internamente
  captionLayout?: PropsBase["captionLayout"]; // Para compatibilidad API - no se usa internamente
  format?: (date: Date) => string; // Para compatibilidad API - no se usa internamente
  icon?: React.ReactNode;
  locale?: unknown; // Para compatibilidad API - no se usa internamente
}

// Función para convertir Date a DateValue (React Aria format)
function dateToDateValue(date: Date): DateValue {
  try {
    // Validar que sea una instancia válida de Date
    if (!(date instanceof Date)) {
      throw new Error('Not a Date instance');
    }

    // Verificar que sea una fecha válida en general
    if (date.toString() === 'Invalid Date' || isNaN(date.getTime())) {
      throw new Error('Invalid Date object');
    }

    const year = date.getFullYear();
    const month = date.getMonth() + 1; // Los meses en DateValue son 1-based
    const day = date.getDate();

    // Validar que la fecha tenga valores válidos
    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      throw new Error('Invalid date values');
    }

    // Validar rangos razonables para evitar fechas con años incorrectos
    if (year < 1000 || year > 9999) {
      throw new Error('Year out of reasonable range');
    }

    if (month < 1 || month > 12) {
      throw new Error('Month out of valid range');
    }

    if (day < 1 || day > 31) {
      throw new Error('Day out of valid range');
    }

    const dateString = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

    try {
      return parseDate(dateString);
    } catch {
      // Si parseDate falla con el formato ISO, usar fecha actual
      throw new Error('Parse date failed');
    }
  } catch {
    // Retornar fecha actual como fallback sin mostrar advertencias
    // para evitar spam en la consola durante la escritura
    const today = new Date();
    const fallbackString = today.toISOString().split('T')[0];
    return parseDate(fallbackString);
  }
}

// Función para convertir DateValue a Date
function dateValueToDate(dateValue: DateValue): Date {
  return dateValue.toDate("UTC");
}

export function DatePicker({
  value,
  onChange,
  label,
  placeholder, // eslint-disable-line @typescript-eslint/no-unused-vars
  disabled = false,
  disableDates,
  className = "",
  buttonClassName = "",
  align = "start", // eslint-disable-line @typescript-eslint/no-unused-vars
  captionLayout = "dropdown", // eslint-disable-line @typescript-eslint/no-unused-vars
  format, // eslint-disable-line @typescript-eslint/no-unused-vars
  icon,
  locale, // eslint-disable-line @typescript-eslint/no-unused-vars
}: DatePickerProps) {
  // Convertir el valor de Date a DateValue si existe
  const ariaValue = React.useMemo(() => {
    // Si no hay valor, retornar undefined de manera consistente
    if (!value) return undefined;

    // Validar que sea una fecha válida antes de convertir
    if (!(value instanceof Date) || isNaN(value.getTime()) || value.toString() === 'Invalid Date') {
      return undefined; // Mantener undefined para fechas inválidas
    }

    // Validar que el año esté en un rango razonable
    const year = value.getFullYear();
    if (year < 1000 || year > 9999) {
      return undefined; // Mantener undefined para años fuera de rango
    }

    return dateToDateValue(value);
  }, [value]);

  // Handler para cambios desde React Aria
  const handleChange = React.useCallback((newValue: DateValue | null) => {
    if (!onChange) return;

    if (!newValue) {
      onChange(undefined);
    } else {
      onChange(dateValueToDate(newValue));
    }
  }, [onChange]);

  // Función para validar fechas deshabilitadas
  const isDateUnavailable = React.useCallback((date: DateValue) => {
    if (!disableDates) return false;
    const jsDate = dateValueToDate(date);
    return disableDates(jsDate);
  }, [disableDates]);

  return (
    <AriaDatePicker
      className={`*:not-first:mt-2 ${className}`}
      value={ariaValue || null}
      onChange={handleChange}
      isDisabled={disabled}
      isDateUnavailable={isDateUnavailable}
      aria-label={label || "Seleccionar fecha"}
    >
      {label && (
        <Label className="text-foreground text-sm font-medium px-1">{label}</Label>
      )}
      <div className="flex">
        <Group className="w-full">
          <DateInput
            className={`pe-9 ${buttonClassName}`}
            aria-label={label || "Campo de fecha"}
          />
        </Group>
        <Button className="text-muted-foreground/80 hover:text-foreground data-focus-visible:border-ring data-focus-visible:ring-ring/50 z-10 -ms-9 -me-px flex w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none data-focus-visible:ring-[3px]">
          {icon || <CalendarIcon size={16} />}
        </Button>
      </div>
      <Popover
        className="bg-background text-popover-foreground data-entering:animate-in data-exiting:animate-out data-[entering]:fade-in-0 data-[exiting]:fade-out-0 data-[entering]:zoom-in-95 data-[exiting]:zoom-out-95 data-[placement=bottom]:slide-in-from-top-2 data-[placement=left]:slide-in-from-right-2 data-[placement=right]:slide-in-from-left-2 data-[placement=top]:slide-in-from-bottom-2 z-50 rounded-lg border shadow-lg outline-hidden"
        offset={4}
      >
        <Dialog className="max-h-[inherit] overflow-auto p-2">
          <Calendar />
        </Dialog>
      </Popover>
    </AriaDatePicker>
  );
}
