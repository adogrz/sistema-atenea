import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface ComboboxProps<T> {
    items: T[];
    value: string;
    onValueChange: (value: string) => void;
    valueKey: keyof T;
    labelKey: keyof T;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyText?: string;
    className?: string;
    contentClassName?: string;
    disabled?: boolean;
}

/**
 * A generic, reusable combobox component with search functionality.
 *
 * @template T - The type of the items in the combobox, must be an object.
 *
 * @param {T[]} [items=[]] - The array of items to display in the dropdown. Defaults to an empty array.
 * @param {string} value - The currently selected value.
 * @param {(value: string) => void} onValueChange - Callback function when the value changes.
 * @param {keyof T} valueKey - The key in the item object to use as the value.
 * @param {keyof T} labelKey - The key in the item object to use as the display label.
 * @param {string} [placeholder="Select item..."] - Placeholder text for the button when no item is selected.
 * @param {string} [searchPlaceholder="Search..."] - Placeholder text for the search input.
 * @param {string} [emptyText="No item found."] - Text to display when the search yields no results.
 * @param {string} [className] - Optional CSS class for the trigger button.
 * @param {string} [contentClassName] - Optional CSS class for the popover content.
 * @param {boolean} [disabled=false] - Whether the combobox is disabled.
 */
export function Combobox<T extends Record<string, unknown>>({
    items = [],
    value,
    onValueChange,
    valueKey,
    labelKey,
    placeholder = "Select item...",
    searchPlaceholder = "Search...",
    emptyText = "No item found.",
    className,
    contentClassName,
    disabled = false,
}: ComboboxProps<T>) {
    const [open, setOpen] = React.useState(false)
    const [buttonWidth, setButtonWidth] = React.useState(0);
    const buttonRef = React.useRef<HTMLButtonElement>(null);

    React.useEffect(() => {
        if (buttonRef.current) {
            setButtonWidth(buttonRef.current.offsetWidth);
        }
    }, [open, items]);

    const safeItems = React.useMemo(() => Array.isArray(items) ? items : [], [items]);

    const sortedItems = React.useMemo(() => {
        return [...safeItems].sort((a, b) => {
            const labelA = String(a[labelKey]).toLowerCase();
            const labelB = String(b[labelKey]).toLowerCase();
            return labelA.localeCompare(labelB);
        });
    }, [safeItems, labelKey]);

    const selectedLabel = safeItems.find((item) => item[valueKey] === value)?.[labelKey] as string | undefined;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    ref={buttonRef}
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("justify-between", className)}
                    disabled={disabled}
                >
                    {selectedLabel || placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                style={{ width: buttonWidth > 0 ? buttonWidth : undefined }}
                className={cn("p-0", contentClassName)}
            >
                <Command>
                    <CommandInput placeholder={searchPlaceholder} className="h-9" />
                    <CommandList
                        className={cn(
                            "max-h-[300px] overflow-y-auto overflow-x-hidden",
                            "[&::-webkit-scrollbar]:w-2",
                            "[&::-webkit-scrollbar-track]:bg-transparent",
                            "[&::-webkit-scrollbar-thumb]:bg-muted-foreground/40",
                            "[&::-webkit-scrollbar-thumb]:rounded-full",
                            "[&::-webkit-scrollbar-thumb:hover]:bg-muted-foreground/60"
                        )}
                    >
                        <CommandEmpty>{emptyText}</CommandEmpty>
                        <CommandGroup>
                            {sortedItems.map((item) => (
                                <CommandItem
                                    key={String(item[valueKey])}
                                    value={String(item[valueKey])}
                                    onSelect={(currentValue) => {
                                        onValueChange(currentValue === value ? "" : currentValue);
                                        setOpen(false);
                                    }}
                                >
                                    {item[labelKey] as string}
                                    <Check
                                        className={cn(
                                            "ml-auto h-4 w-4",
                                            value === item[valueKey] ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
