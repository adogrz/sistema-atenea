import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { getLocalTimeZone, parseDate } from "@internationalized/date";
import {
  Button,
  DatePicker as ReactAriaDatePicker,
  Dialog,
  Group,
  Label,
  Popover,
  type DateValue,
} from "react-aria-components";
import { Calendar } from "@/components/ui/calendar-rac";
import { Calendar as ShadcnCalendar } from "@/components/ui/calendar-improved";
import { DateInput } from "@/components/ui/datefield-rac";
import { Button as ShadcnButton } from "@/components/ui/button";
import { Popover as ShadcnPopover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { type PropsBase } from "react-day-picker";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export interface DatePickerProps {
  value?: Date;
  onChange?: (date?: Date) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  disableDates?: (date: Date) => boolean;
  className?: string;
  buttonClassName?: string;
  align?: "start" | "center" | "end";
  captionLayout?: PropsBase["captionLayout"]; // "label" o "dropdown"
  format?: (date: Date) => string;
  icon?: React.ReactNode;
  locale?: unknown;
  calendarType?: "aria" | "shadcn"; // Tipo de calendario a usar
}

// Función mejorada para convertir Date a DateValue - usando getLocalTimeZone()
function dateToDateValue(date: Date): DateValue | null {
  try {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return null;
    }

    const year = date.getFullYear();
    const month = date.getMonth() + 1; // Los meses en DateValue son 1-based
    const day = date.getDate();

    // Validar rangos
    if (year < 1000 || year > 9999 || month < 1 || month > 12 || day < 1 || day > 31) {
      return null;
    }

    // Crear la fecha usando el formato ISO
    const isoString = `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    return parseDate(isoString);
  } catch {
    return null;
  }
}

// Función mejorada para convertir DateValue a Date
function dateValueToDate(dateValue: DateValue): Date {
  // Usar getLocalTimeZone para evitar problemas de zona horaria
  return dateValue.toDate(getLocalTimeZone());
}

function ShadcnDatePicker({
  value,
  onChange,
  label,
  placeholder = "Seleccionar fecha",
  disabled = false,
  disableDates,
  className = "",
  buttonClassName = "",
  captionLayout = "dropdown",
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const formatDisplayValue = React.useCallback((date: Date | undefined) => {
    if (!date) return placeholder;
    try {
      return format(date, "dd/MM/yyyy", { locale: es });
    } catch {
      return placeholder;
    }
  }, [placeholder]);

  const handleSelect = React.useCallback((selectedDate: Date | undefined) => {
    if (onChange) {
      onChange(selectedDate);
    }
    setOpen(false);
  }, [onChange]);

  const isDateDisabled = React.useCallback((date: Date) => {
    if (!disableDates) return false;
    return disableDates(date);
  }, [disableDates]);

  // Determinar el mes inicial para mostrar en el calendario
  const defaultMonth = React.useMemo(() => {
    // Si hay una fecha seleccionada, mostrar ese mes
    if (value && value instanceof Date && !isNaN(value.getTime())) {
      return value;
    }
    // Si no hay fecha seleccionada, mostrar el mes actual
    return new Date();
  }, [value]);

  return (
    <div className={className}>
      {label && (
        <Label className="text-foreground text-sm font-medium px-1 mb-2 block">
          {label}
        </Label>
      )}
      <ShadcnPopover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <ShadcnButton
            variant="outline"
            className={`w-full justify-between font-normal ${buttonClassName}`}
            disabled={disabled}
          >
            {formatDisplayValue(value)}
            <CalendarIcon className="ml-2 h-4 w-4" />
          </ShadcnButton>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <ShadcnCalendar
            mode="single"
            selected={value}
            onSelect={handleSelect}
            captionLayout={captionLayout}
            disabled={isDateDisabled}
            defaultMonth={defaultMonth} // Enfocar automáticamente en el mes de la fecha seleccionada
            initialFocus
          />
        </PopoverContent>
      </ShadcnPopover>
    </div>
  );
}

function AriaDatePickerComponent({
  value,
  onChange,
  label,
  disabled = false,
  disableDates,
  className = "",
  buttonClassName = "",
  icon,
}: DatePickerProps) {
  // Convertir el valor de Date a DateValue - mejorado
  const ariaValue = React.useMemo(() => {
    if (!value) return null;
    return dateToDateValue(value);
  }, [value]);

  // Handler para cambios - simplificado y corregido
  const handleChange = React.useCallback((newValue: DateValue | null) => {
    if (!onChange) return;

    if (!newValue) {
      onChange(undefined);
    } else {
      try {
        const jsDate = dateValueToDate(newValue);
        onChange(jsDate);
      } catch (error) {
        console.warn('Error converting date value:', error);
      }
    }
  }, [onChange]);

  // Función para validar fechas deshabilitadas - mejorada siguiendo el patrón del ejemplo
  const isDateUnavailable = React.useCallback((date: DateValue) => {
    if (!disableDates) return false;
    try {
      const jsDate = dateValueToDate(date);
      return disableDates(jsDate);
    } catch {
      return true;
    }
  }, [disableDates]);

  return (
    <ReactAriaDatePicker
      className={`*:not-first:mt-2 ${className}`}
      value={ariaValue}
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
    </ReactAriaDatePicker>
  );
}

export function DatePicker(props: DatePickerProps) {
  const { calendarType = "aria", ...rest } = props;

  if (calendarType === "shadcn") {
    return <ShadcnDatePicker {...rest} />;
  }

  return <AriaDatePickerComponent {...rest} />;
}
