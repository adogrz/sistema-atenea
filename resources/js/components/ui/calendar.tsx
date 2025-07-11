"use client"

import React from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Locale }  from "date-fns/locale"

interface CalendarProps {
  mode?: "single" | "range";
  selected?: Date | null;
  onSelect?: (date: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  disabled?: (date: Date) => boolean;
  initialFocus?: boolean;
  className?: string;
  datePickerClassName?: string;
  label?: string;
  labelClassName?: string;
  locale?: string | Locale; // Soporte para idioma
  region?: string; // Soporte para región
  showPreview?: boolean;
  dateFormat?: string; // Formato de fecha
}

const Calendar: React.FC<CalendarProps> = ({
  mode = "single",
  selected,
  onSelect,
  minDate,
  maxDate,
  disabled,
  initialFocus,
  className,
  datePickerClassName,
  label,
  labelClassName,
  locale,
  region,
  showPreview = true,
  dateFormat = "dd/MM/yyyy",
}) => {
  const [internalDate, setInternalDate] = React.useState<Date | null>(selected ?? null);

  React.useEffect(() => {
    setInternalDate(selected ?? null);
  }, [selected]);

  // Registrar el locale si es necesario
  React.useEffect(() => {
    if (locale) {
      import(`date-fns/locale/${locale}/index.js`)
        .then((mod) => {
          registerLocale(locale.toString(), mod.default);
        })
        .catch(() => {});
    }
  }, [locale]);

  const handleChange = (date: Date | null) => {
    setInternalDate(date);
    if (onSelect) onSelect(date);
  };

  return (
    <div className={className}>
      {label && (
        <label htmlFor="calendar" className={labelClassName}>
          {label}
        </label>
      )}
      <DatePicker
        id="calendar"
        selected={internalDate}
        onChange={handleChange}
        dateFormat={dateFormat}
        minDate={minDate}
        maxDate={maxDate}
        showYearDropdown
        scrollableYearDropdown
        yearDropdownItemNumber={100}
        placeholderText="Selecciona la fecha"
        filterDate={disabled ? (date) => !disabled(date) : undefined}
        autoFocus={initialFocus}
        className={datePickerClassName}
        locale={locale}
        showPopperArrow={showPreview}
      />
    </div>
  );
};

export default Calendar;