import { Column } from '@tanstack/react-table';
import { Dispatch, SetStateAction } from 'react';

import {
    MultiSelector,
    MultiSelectorContent,
    MultiSelectorInput,
    MultiSelectorItem,
    MultiSelectorList,
    MultiSelectorTrigger,
} from '@/components/ui/multi-select';

interface MultiSelectColumnFilterProps<TData> {
    column: Column<TData, unknown>;
    selectedValues: string[];
    setSelectedValues: Dispatch<SetStateAction<string[]>>;
    options: string[];
    placeholder: string;
}

export function MultiSelectColumnFilter<TData>({
    column,
    selectedValues,
    setSelectedValues,
    options,
    placeholder,
}: MultiSelectColumnFilterProps<TData>) {
    const handleValuesChange = (values: string[]) => {
        setSelectedValues(values);
        column.setFilterValue(values.length > 0 ? values : undefined);
    };

    return (
        <MultiSelector values={selectedValues} onValuesChange={handleValuesChange} className="w-full">
            <MultiSelectorTrigger>
                <MultiSelectorInput placeholder={placeholder} autoFocus />
            </MultiSelectorTrigger>
            <MultiSelectorContent>
                <MultiSelectorList>
                    {options.map((option) => (
                        <MultiSelectorItem key={option} value={option}>
                            {option}
                        </MultiSelectorItem>
                    ))}
                </MultiSelectorList>
            </MultiSelectorContent>
        </MultiSelector>
    );
}
