
import React, { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

interface NivelEducativo {
    codigo: number;
    descripcion: string;
    nivel: string;
}

interface NivelEducativoComboBoxProps {
    nivelesEducativos: NivelEducativo[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    emptyText?: string;
}

export const NivelEducativoComboBox: React.FC<NivelEducativoComboBoxProps> = ({
    nivelesEducativos,
    value,
    onChange,
    placeholder = 'Selecciona un nivel...',
    emptyText = 'No se encontraron niveles.',
}) => {
    const [open, setOpen] = useState(false);

    const selectedNivel = nivelesEducativos.find(
        (nivel) => String(nivel.codigo) === value
    );

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    {selectedNivel
                        ? `${selectedNivel.nivel} - ${selectedNivel.descripcion}`
                        : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
                <Command>
                    <CommandInput placeholder="Buscar nivel..." />
                    <CommandEmpty>{emptyText}</CommandEmpty>
                    <CommandGroup>
                        {nivelesEducativos.map((nivel) => (
                            <CommandItem
                                key={nivel.codigo}
                                value={String(nivel.codigo)}
                                onSelect={(currentValue) => {
                                    onChange(currentValue === value ? '' : currentValue);
                                    setOpen(false);
                                }}
                            >
                                <Check
                                    className={cn(
                                        'mr-2 h-4 w-4',
                                        value === String(nivel.codigo)
                                            ? 'opacity-100'
                                            : 'opacity-0'
                                    )}
                                />
                                {`${nivel.nivel} - ${nivel.descripcion}`}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    );
};
