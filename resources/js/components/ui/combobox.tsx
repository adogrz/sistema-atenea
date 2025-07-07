import { Check, ChevronsUpDown } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface ComboboxProps<T> {
    items: T[];
    value: string | number | null;
    onChange: (value: string) => void; // El valor siempre será el 'name' o 'id' como string
    valueKey: keyof T;
    labelKey: keyof T;
    placeholder: string;
    searchPlaceholder: string;
    disabled?: boolean;
}

export function Combobox<T extends Record<string, any>>({
    items,
    value,
    onChange,
    valueKey,
    labelKey,
    placeholder,
    searchPlaceholder,
    disabled = false,
}: ComboboxProps<T>) {
    const [open, setOpen] = React.useState(false);

    // Encontrar el item seleccionado para mostrar su etiqueta
    const selectedItem = items.find((item) => item[valueKey] === value);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn('w-full justify-between', !value && 'text-muted-foreground')}
                    disabled={disabled}
                >
                    {selectedItem ? String(selectedItem[labelKey]) : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                    <CommandInput placeholder={searchPlaceholder} />
                    <CommandList>
                        <CommandEmpty>No se encontraron resultados.</CommandEmpty>
                        <CommandGroup>
                            {items.map((item) => (
                                <CommandItem
                                    key={item[valueKey]}
                                    value={String(item[labelKey])} // Buscar por la etiqueta visible
                                    onSelect={() => {
                                        onChange(String(item[valueKey])); // Devolver el valor único
                                        setOpen(false);
                                    }}
                                >
                                    <Check className={cn('mr-2 h-4 w-4', value === item[valueKey] ? 'opacity-100' : 'opacity-0')} />
                                    {String(item[labelKey])}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}