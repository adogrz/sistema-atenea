// components/ui/combobox.tsx
'use client'

import * as React from 'react'
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface ComboboxProps {
  options: { value: string; label: string }[]
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  noOptionsMessage?: string
  defaultLabel?: string
}

/**
 * Renders a searchable dropdown combobox for selecting an option from a list.
 *
 * Displays the selected option's label or a default label if none is selected. Users can filter options via a search input, and selecting an option triggers the provided callback with the new value. The dropdown closes automatically upon selection.
 *
 * @param options - Array of selectable options, each with a value and label.
 * @param value - The currently selected value.
 * @param onValueChange - Callback invoked when the selection changes, receiving the new value.
 * @param placeholder - Optional placeholder text for the search input.
 * @param noOptionsMessage - Optional message shown when no options match the search.
 * @param defaultLabel - Optional label shown when no value is selected.
 * @returns The combobox component UI.
 */
export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = 'Buscar...',
  noOptionsMessage = 'No se encontraron opciones.',
  defaultLabel = 'Selecciona una opción',
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value
            ? options.find((option) => option.value === value)?.label
            : defaultLabel}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder={placeholder} className="h-9" />
          <CommandList>
            <CommandEmpty>{noOptionsMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? '' : currentValue)
                    setOpen(false)
                  }}
                >
                  <CheckIcon
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === option.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}