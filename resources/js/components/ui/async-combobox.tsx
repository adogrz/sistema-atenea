import * as React from 'react';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface AsyncComboboxItem {
    value: string;
    label: string;
    [key: string]: unknown;
}

interface AsyncComboboxProps {
    value: string;
    onValueChange: (value: string, item?: AsyncComboboxItem) => void;
    onSearchChange: (search: string) => void;
    items: AsyncComboboxItem[];
    placeholder?: string;
    searchPlaceholder?: string;
    emptyText?: string;
    loadingText?: string;
    className?: string;
    contentClassName?: string;
    disabled?: boolean;
    isLoading?: boolean;
    selectedLabel?: string;
}

export function AsyncCombobox({
    value,
    onValueChange,
    onSearchChange,
    items,
    placeholder = 'Seleccionar...',
    searchPlaceholder = 'Buscar...',
    emptyText = 'No se encontraron resultados.',
    loadingText = 'Buscando...',
    className,
    contentClassName,
    disabled = false,
    isLoading = false,
    selectedLabel,
}: AsyncComboboxProps) {
    const [open, setOpen] = React.useState(false);
    const [buttonWidth, setButtonWidth] = React.useState(0);
    const [search, setSearch] = React.useState('');
    const buttonRef = React.useRef<HTMLButtonElement>(null);
    const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    React.useEffect(() => {
        if (buttonRef.current) {
            setButtonWidth(buttonRef.current.offsetWidth);
        }
    }, [open, items]);

    const handleSearchChange = (newSearch: string) => {
        setSearch(newSearch);

        // Debounce la búsqueda
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            onSearchChange(newSearch);
        }, 300);
    };

    const handleSelect = (currentValue: string) => {
        const selectedItem = items.find((item) => item.value === currentValue);
        onValueChange(currentValue === value ? '' : currentValue, selectedItem);
        setOpen(false);
        setSearch('');
    };

    const displayLabel = selectedLabel || items.find((item) => item.value === value)?.label;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    ref={buttonRef}
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn('justify-between', className)}
                    disabled={disabled}
                >
                    <span className="truncate">{displayLabel || placeholder}</span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent style={{ width: buttonWidth > 0 ? buttonWidth : undefined }} className={cn('p-0', contentClassName)}>
                <Command shouldFilter={false}>
                    <CommandInput placeholder={searchPlaceholder} className="h-9" value={search} onValueChange={handleSearchChange} />
                    <CommandList
                        className={cn(
                            'max-h-[300px] overflow-y-auto overflow-x-hidden',
                            '[&::-webkit-scrollbar]:w-2',
                            '[&::-webkit-scrollbar-track]:bg-transparent',
                            '[&::-webkit-scrollbar-thumb]:bg-muted-foreground/40',
                            '[&::-webkit-scrollbar-thumb]:rounded-full',
                            '[&::-webkit-scrollbar-thumb:hover]:bg-muted-foreground/60',
                        )}
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center py-6">
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                <span className="ml-2 text-sm text-muted-foreground">{loadingText}</span>
                            </div>
                        ) : (
                            <>
                                <CommandEmpty>{emptyText}</CommandEmpty>
                                <CommandGroup>
                                    {items.map((item) => (
                                        <CommandItem key={item.value} value={item.value} onSelect={handleSelect}>
                                            <span className="truncate">{item.label}</span>
                                            <Check className={cn('ml-auto h-4 w-4', value === item.value ? 'opacity-100' : 'opacity-0')} />
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
