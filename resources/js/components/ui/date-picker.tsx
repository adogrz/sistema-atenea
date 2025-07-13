import * as React from "react"
import { ChevronDownIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  /** Texto del label */
  label?: string
  /** Texto del placeholder cuando no hay fecha seleccionada */
  placeholder?: string
  /** Fecha seleccionada inicial */
  value?: Date
  /** Función callback cuando se selecciona una fecha */
  onChange?: (date: Date | undefined) => void
  /** ID del input para asociar con el label */
  id?: string
  /** Ancho del botón (clase CSS) */
  width?: string
  /** Desactivar el componente o función para deshabilitar fechas específicas */
  disabled?: boolean | ((date: Date) => boolean)
  /** Formato de fecha personalizado */
  dateFormat?: (date: Date) => string
  /** Configuración adicional del calendario */
  calendarProps?: Record<string, unknown>
}

export function DatePicker({
  label,
  placeholder = "Seleccionar fecha",
  value,
  onChange,
  id,
  width = "w-48",
  disabled = false,
  dateFormat = (date: Date) => date.toLocaleDateString(),
  calendarProps = {},
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [date, setDate] = React.useState<Date | undefined>(value)

  // Sincronizar estado interno con prop value
  React.useEffect(() => {
    setDate(value)
  }, [value])

  const handleSelectDate = (selectedDate: Date | undefined) => {
    setDate(selectedDate)
    onChange?.(selectedDate)
    setOpen(false)
  }

  // Separar disabled boolean de la función de validación
  const isComponentDisabled = typeof disabled === 'boolean' ? disabled : false
  const dateValidator = typeof disabled === 'function' ? disabled : undefined

  return (
    <div className="flex flex-col gap-3">
      {label && (
        <Label htmlFor={id} className="px-1">
          {label}
        </Label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id={id}
            disabled={isComponentDisabled}
            className={`${width} justify-between font-normal ${
              isComponentDisabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {date ? dateFormat(date) : placeholder}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            captionLayout="dropdown"
            onSelect={handleSelectDate}
            disabled={dateValidator}
            {...calendarProps}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
