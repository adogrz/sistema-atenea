import { Olimpiada, FaseOlimpiada } from "@/types";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";

interface ResultadosToolbarProps {
    olimpiadas: Olimpiada[];
    fases: FaseOlimpiada[];
    selectedOlimpiadaId: string;
    selectedFaseId: string;
    onOlimpiadaChange: (value: string) => void;
    onFaseChange: (value: string) => void;
}

export const ResultadosToolbar: React.FC<ResultadosToolbarProps> = ({ olimpiadas, fases, selectedOlimpiadaId, selectedFaseId, onOlimpiadaChange, onFaseChange }) => {
    const olimpiadaOptions = olimpiadas.map(o => ({ value: String(o.id), label: o.nombre }));
    const faseOptions = fases.map(f => ({ value: String(f.id), label: f.nombre }));

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
                <Label htmlFor="olimpiada-filter" className="mb-2 block">Olimpiada</Label>
                <Combobox
                    items={olimpiadaOptions}
                    value={selectedOlimpiadaId}
                    onValueChange={onOlimpiadaChange}
                    valueKey="value"
                    labelKey="label"
                    placeholder="Selecciona una Olimpiada"
                    searchPlaceholder="Buscar olimpiada..."
                    emptyText="No se encontraron olimpiadas."
                />
            </div>
            <div>
                <Label htmlFor="fase-filter" className="mb-2 block">Fase</Label>
                <Combobox
                    items={faseOptions}
                    value={selectedFaseId}
                    onValueChange={onFaseChange}
                    valueKey="value"
                    labelKey="label"
                    placeholder="Selecciona una Fase"
                    searchPlaceholder="Buscar fase..."
                    emptyText="No se encontraron fases."
                    disabled={!selectedOlimpiadaId || faseOptions.length === 0}
                />
            </div>
        </div>
    );
};
