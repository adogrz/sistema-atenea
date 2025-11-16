import { Olimpiada, FaseOlimpiada } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ResultadosToolbarProps {
    olimpiadas: Olimpiada[];
    fases: FaseOlimpiada[];
    selectedOlimpiadaId: string;
    selectedFaseId: string;
    onOlimpiadaChange: (value: string) => void;
    onFaseChange: (value: string) => void;
}

export const ResultadosToolbar: React.FC<ResultadosToolbarProps> = ({ olimpiadas, fases, selectedOlimpiadaId, selectedFaseId, onOlimpiadaChange, onFaseChange }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
                <Label htmlFor="olimpiada-filter" className="mb-2 block">Olimpiada</Label>
                <Select value={selectedOlimpiadaId} onValueChange={onOlimpiadaChange}>
                    <SelectTrigger id="olimpiada-filter" className="w-full bg-blue-500 text-white hover:bg-blue-600">
                        <SelectValue placeholder="Selecciona una Olimpiada" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Selecciona una Olimpiada</SelectItem>
                        {olimpiadas.map(olimpiada => (
                            <SelectItem key={olimpiada.id} value={String(olimpiada.id)}>{olimpiada.nombre}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label htmlFor="fase-filter" className="mb-2 block">Fase</Label>
                <Select value={selectedFaseId} onValueChange={onFaseChange} disabled={selectedOlimpiadaId === 'all' || fases.length === 0}>
                    <SelectTrigger id="fase-filter" className="w-full bg-blue-500 text-white hover:bg-blue-600">
                        <SelectValue placeholder="Selecciona una Fase" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Selecciona una Fase</SelectItem>
                        {fases.map(fase => (
                            <SelectItem key={fase.id} value={String(fase.id)}>{fase.nombre}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
};
