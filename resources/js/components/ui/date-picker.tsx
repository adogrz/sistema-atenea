import * as React from "react";
import { ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PropsBase } from "react-day-picker";
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
  captionLayout?: PropsBase["captionLayout"];
  format?: (date: Date) => string;
  icon?: React.ReactNode;
  locale?: Locale;
}

export function DatePicker({
  value,
  onChange,
  label,
  placeholder = "Select date",
  disabled = false,
  disableDates,
  className = "",
  buttonClassName = "",
  align = "start",
  captionLayout = "dropdown",
  format = (date) => date.toLocaleDateString('es-ES'),
  icon = <ChevronDownIcon />,
  locale = es, // Establecer español como predeterminado
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {label && (
        <Label htmlFor="date-picker" className="px-1">
          {label}
        </Label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date-picker"
            disabled={disabled}
            className={`w-48 justify-between font-normal ${buttonClassName}`}
          >
            {value ? format(value) : placeholder}
            {icon}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align={align}>
          <Calendar
            mode="single"
            selected={value}
            onSelect={(date) => {
              onChange?.(date);
              setOpen(false);
            }}
            disabled={disableDates}
            captionLayout={captionLayout}
            locale={locale}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
