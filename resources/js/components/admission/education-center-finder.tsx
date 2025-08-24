'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CentroEducativo } from '@/types/admission/education';
import { Building, Check, Globe, Hash, MapPin, School, Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';

interface EducationCenterFinderProps {
    centros_educativos: CentroEducativo[];
}

export default function EducationCenterFinder({ centros_educativos }: EducationCenterFinderProps) {
    const form = useFormContext();
    const [searchQuery, setSearchQuery] = useState('');
    const [showResults, setShowResults] = useState(false);
    const [showManualInput, setShowManualInput] = useState(false);
    const [manualCentroName, setManualCentroName] = useState('');
    const searchInputRef = useRef<HTMLInputElement>(null);
    const resultsRef = useRef<HTMLDivElement>(null);

    // Observar valores del formulario
    const codigo = form.watch('codigo');
    const centro_educativo = form.watch('centro_educativo');
    const sector = form.watch('sector');
    const zona = form.watch('zona');
    const internacional = form.watch('internacional');

    // Determinar si hay un centro seleccionado
    const hasCentroSelected = codigo && centro_educativo;

    // Filtrar resultados de búsqueda
    const resultados = useMemo(() => {
        if (!searchQuery.trim() || !centros_educativos || !Array.isArray(centros_educativos)) {
            return [];
        }

        const query = searchQuery.toLowerCase().trim();
        return centros_educativos
            .filter((centro) => {
                const matchNombre = centro.nombre?.toLowerCase().includes(query);
                const matchCodigo = centro.codigo?.toLowerCase().includes(query);
                return matchNombre || matchCodigo;
            })
            .slice(0, 5);
    }, [centros_educativos, searchQuery]);

    // Manejar selección de centro educativo
    const handleSeleccionCentro = (centro: CentroEducativo) => {
        form.setValue('codigo', centro.codigo);
        form.setValue('centro_educativo', centro.nombre);
        form.setValue('sector', centro.sector);
        form.setValue('zona', centro.zona);
        form.setValue('internacional', centro.internacional);

        setSearchQuery('');
        setShowResults(false);

        setTimeout(() => {
            form.trigger(['codigo', 'centro_educativo', 'sector', 'zona', 'internacional']);
        }, 100);
    };

    // Limpiar selección y permitir nueva búsqueda
    const handleCambiarCentro = () => {
        form.setValue('codigo', '');
        form.setValue('centro_educativo', '');
        form.setValue('sector', '');
        form.setValue('zona', '');
        form.setValue('internacional', '');

        setSearchQuery('');
        setShowResults(false);
        setShowManualInput(false);
        setManualCentroName('');

        setTimeout(() => {
            searchInputRef.current?.focus();
        }, 100);
    };

    // Manejar entrada manual de centro educativo
    const handleManualInput = () => {
        setShowManualInput(true);
        setSearchQuery('');
        setShowResults(false);
    };

    // Guardar centro educativo manual
    const handleSaveManualCentro = () => {
        if (manualCentroName.trim()) {
            form.setValue('codigo', '');
            form.setValue('centro_educativo', manualCentroName.trim());
            form.setValue('sector', '');
            form.setValue('zona', '');
            form.setValue('internacional', '');

            setShowManualInput(false);

            setTimeout(() => {
                form.trigger('centro_educativo');
            }, 100);
        }
    };

    // Cancelar entrada manual
    const handleCancelManual = () => {
        setShowManualInput(false);
        setManualCentroName('');
        setTimeout(() => {
            searchInputRef.current?.focus();
        }, 100);
    };

    // Manejar cambios en el input de búsqueda
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);
        setShowResults(value.trim().length > 0);
    };

    // Cerrar resultados al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                resultsRef.current &&
                !resultsRef.current.contains(event.target as Node) &&
                searchInputRef.current &&
                !searchInputRef.current.contains(event.target as Node)
            ) {
                setShowResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Si hay un centro seleccionado, mostrar resumen
    if (hasCentroSelected && !showManualInput) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Centro educativo</Label>
                    <Button type="button" variant="outline" size="sm" onClick={handleCambiarCentro}>
                        Cambiar
                    </Button>
                </div>

                <Card className="relative">
                    <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                                <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="flex-1 space-y-3">
                                <div>
                                    <h4 className="leading-tight font-medium">{centro_educativo}</h4>
                                    {codigo && <p className="text-sm text-muted-foreground">Código: {codigo}</p>}
                                </div>

                                {(sector || zona || internacional) && (
                                    <div className="flex flex-wrap gap-2">
                                        {sector && (
                                            <Badge variant="secondary" className="text-xs">
                                                <Building className="mr-1 h-3 w-3" />
                                                {sector}
                                            </Badge>
                                        )}
                                        {zona && (
                                            <Badge variant="secondary" className="text-xs">
                                                <MapPin className="mr-1 h-3 w-3" />
                                                {zona}
                                            </Badge>
                                        )}
                                        {internacional && (
                                            <Badge variant="secondary" className="text-xs">
                                                <Globe className="mr-1 h-3 w-3" />
                                                {internacional}
                                            </Badge>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Si está en modo manual, mostrar input manual
    if (showManualInput) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Centro educativo</Label>
                    <Button type="button" variant="ghost" size="sm" onClick={handleCancelManual}>
                        <X className="mr-1 h-4 w-4" />
                        Cancelar
                    </Button>
                </div>

                <Card>
                    <CardContent className="space-y-4 p-4">
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Ingresa manualmente el nombre de tu centro educativo</p>
                            <Input
                                value={manualCentroName}
                                onChange={(e) => setManualCentroName(e.target.value)}
                                placeholder="Ej. Centro Escolar Mi Comunidad"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleSaveManualCentro();
                                    }
                                }}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button type="button" onClick={handleSaveManualCentro} disabled={!manualCentroName.trim()} className="flex-1">
                                Guardar centro
                            </Button>
                            <Button type="button" variant="outline" onClick={handleCancelManual}>
                                Cancelar
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Mostrar buscador
    return (
        <div className="space-y-4">
            <Label className="text-sm font-medium">Centro educativo</Label>

            <div className="relative" ref={resultsRef}>
                <div className="relative">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        ref={searchInputRef}
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder="Busca por nombre o código del centro educativo..."
                        className="pl-10"
                        onFocus={() => {
                            if (searchQuery.trim()) {
                                setShowResults(true);
                            }
                        }}
                    />
                </div>

                {/* Dropdown de resultados */}
                {showResults && (
                    <Card className="absolute top-full right-0 left-0 z-50 mt-1 max-h-80 overflow-auto">
                        <CardContent className="p-2">
                            {resultados.length > 0 ? (
                                <div className="space-y-1">
                                    {resultados.map((centro) => (
                                        <div
                                            key={centro.codigo}
                                            onClick={() => handleSeleccionCentro(centro)}
                                            className="cursor-pointer rounded-md p-3 transition-colors hover:bg-muted"
                                        >
                                            <div className="flex items-start gap-3">
                                                <School className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                                                <div className="flex-1 space-y-2">
                                                    <p className="text-sm leading-tight font-medium">{centro.nombre}</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        <Badge variant="outline" className="text-xs">
                                                            <Hash className="mr-1 h-3 w-3" />
                                                            {centro.codigo}
                                                        </Badge>
                                                        <Badge variant="outline" className="text-xs">
                                                            <Building className="mr-1 h-3 w-3" />
                                                            {centro.sector}
                                                        </Badge>
                                                        <Badge variant="outline" className="text-xs">
                                                            <MapPin className="mr-1 h-3 w-3" />
                                                            {centro.zona}
                                                        </Badge>
                                                        <Badge variant="outline" className="text-xs">
                                                            <Globe className="mr-1 h-3 w-3" />
                                                            {centro.internacional}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-3 p-4 text-center">
                                    <p className="text-sm text-muted-foreground">No se encontraron centros educativos</p>
                                    <Button type="button" variant="outline" size="sm" onClick={handleManualInput}>
                                        Ingresar manualmente
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Botón "No encuentro mi centro" */}
            <div className="text-center">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleManualInput}
                    className="text-sm text-muted-foreground hover:text-foreground"
                >
                    ¿No encuentras tu centro? Ingrésalo manualmente
                </Button>
            </div>
        </div>
    );
}
