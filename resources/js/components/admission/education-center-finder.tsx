'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CentroEducativo } from '@/types/admission/education';
import { Building, Check, Globe, Hash, MapPin, School, Search } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';

interface EducationCenterFinderProps {
    centros_educativos: CentroEducativo[];
}

export default function EducationCenterFinder({ centros_educativos }: EducationCenterFinderProps) {
    const form = useFormContext();
    const [searchQuery, setSearchQuery] = useState('');
    const [showResults, setShowResults] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const resultsRef = useRef<HTMLDivElement>(null);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Observar valores del formulario
    const centro_educativo = form.watch('centro_educativo'); // Código del centro
    const centro_nombre = form.watch('centro_nombre'); // Nombre del centro para mostrar
    const sector = form.watch('sector');
    const zona = form.watch('zona');
    const internacional = form.watch('internacional');

    // Determinar si hay un centro seleccionado
    const hasCentroSelected = centro_educativo && centro_nombre;

    // Filtrar resultados de búsqueda con optimización de performance
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
            .slice(0, 6); // Incrementamos a 6 para mejor experiencia
    }, [centros_educativos, searchQuery]);

    // Manejar selección de centro educativo
    const handleSeleccionCentro = useCallback(
        (centro: CentroEducativo) => {
            // IMPORTANTE: centro_educativo ahora guarda el código, no el nombre
            // El nombre se guarda en un campo separado solo para mostrar en UI
            form.setValue('centro_educativo', centro.codigo); // ← Código del centro
            form.setValue('centro_nombre', centro.nombre); // ← Nombre para mostrar en UI
            form.setValue('sector', centro.sector);
            form.setValue('zona', centro.zona);
            form.setValue('internacional', centro.internacional);

            setSearchQuery('');
            setShowResults(false);
            setSelectedIndex(-1);

            setTimeout(() => {
                form.trigger(['centro_educativo', 'sector', 'zona', 'internacional']);
            }, 100);
        },
        [form],
    );

    // Limpiar selección y permitir nueva búsqueda
    const handleCambiarCentro = useCallback(() => {
        form.setValue('centro_educativo', '');
        form.setValue('centro_nombre', '');
        form.setValue('sector', '');
        form.setValue('zona', '');
        form.setValue('internacional', '');

        setSearchQuery('');
        setShowResults(false);
        setSelectedIndex(-1);

        setTimeout(() => {
            searchInputRef.current?.focus();
        }, 100);
    }, [form]);

    // Manejar cambios en el input de búsqueda con debounce
    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);
        setSelectedIndex(-1);

        // Limpiar timeout anterior
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        // Configurar nuevo timeout con debounce
        debounceTimerRef.current = setTimeout(() => {
            setShowResults(value.trim().length > 0);
            setIsLoading(false);
        }, 300);

        // Mostrar loading inmediatamente si hay texto
        if (value.trim().length > 0) {
            setIsLoading(true);
        } else {
            setShowResults(false);
            setIsLoading(false);
        }
    }, []);

    // Manejar navegación por teclado
    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (!showResults || resultados.length === 0) return;

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setSelectedIndex((prev) => (prev < resultados.length - 1 ? prev + 1 : 0));
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : resultados.length - 1));
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (selectedIndex >= 0 && selectedIndex < resultados.length) {
                        handleSeleccionCentro(resultados[selectedIndex]);
                    }
                    break;
                case 'Escape':
                    e.preventDefault();
                    setShowResults(false);
                    setSelectedIndex(-1);
                    break;
            }
        },
        [showResults, resultados, selectedIndex, handleSeleccionCentro],
    );

    // Cerrar resultados al hacer clic fuera y limpiar timeouts
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                resultsRef.current &&
                !resultsRef.current.contains(event.target as Node) &&
                searchInputRef.current &&
                !searchInputRef.current.contains(event.target as Node)
            ) {
                setShowResults(false);
                setSelectedIndex(-1);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    // Si hay un centro seleccionado, mostrar resumen
    if (hasCentroSelected) {
        return (
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-foreground">Centro educativo</Label>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleCambiarCentro}
                        className="h-8 px-3 text-xs font-medium transition-colors hover:bg-muted/50"
                    >
                        Cambiar centro
                    </Button>
                </div>

                <Card className="relative border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20">
                    <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
                                <Check className="h-5 w-5 text-green-700 dark:text-green-400" />
                            </div>
                            <div className="min-w-0 flex-1 space-y-3">
                                <div className="space-y-1">
                                    <h4 className="pr-2 leading-tight font-semibold text-foreground">{centro_nombre}</h4>
                                    {centro_educativo && (
                                        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                            <Hash className="h-3.5 w-3.5" />
                                            {centro_educativo}
                                        </p>
                                    )}
                                </div>

                                {(sector || zona || internacional) && (
                                    <div className="flex flex-wrap gap-1.5">
                                        {sector && (
                                            <Badge
                                                variant="outline"
                                                className="border-green-300 bg-green-50 text-xs font-medium text-green-800 dark:border-green-700 dark:bg-green-950/50 dark:text-green-300"
                                            >
                                                <Building className="mr-1 h-3 w-3" />
                                                {sector}
                                            </Badge>
                                        )}
                                        {zona && (
                                            <Badge
                                                variant="outline"
                                                className="border-green-300 bg-green-50 text-xs font-medium text-green-800 dark:border-green-700 dark:bg-green-950/50 dark:text-green-300"
                                            >
                                                <MapPin className="mr-1 h-3 w-3" />
                                                {zona}
                                            </Badge>
                                        )}
                                        {internacional && (
                                            <Badge
                                                variant="outline"
                                                className="border-green-300 bg-green-50 text-xs font-medium text-green-800 dark:border-green-700 dark:bg-green-950/50 dark:text-green-300"
                                            >
                                                <Globe className="mr-1 h-3 w-3" />
                                                {internacional === 'SI' ? 'Internacional' : 'Nacional'}
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

    // Mostrar buscador
    return (
        <div className="space-y-3">
            <Label className="text-sm font-medium text-foreground">Centro educativo</Label>

            <div className="relative" ref={resultsRef}>
                <div className="relative">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        ref={searchInputRef}
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Busca por nombre o código del centro educativo..."
                        className="h-11 pl-10 text-sm"
                        onFocus={() => {
                            if (searchQuery.trim()) {
                                setShowResults(true);
                            }
                        }}
                        aria-label="Buscar centro educativo"
                        aria-describedby="search-help"
                        aria-expanded={showResults}
                        aria-autocomplete="list"
                        role="combobox"
                    />
                </div>
                <p id="search-help" className="sr-only">
                    Escribe para buscar tu centro educativo. Usa las flechas para navegar y Enter para seleccionar.
                </p>

                {/* Dropdown de resultados */}
                {showResults && (
                    <Card className="absolute top-full right-0 left-0 z-50 mt-2 border-border/80 shadow-lg">
                        <CardContent className="p-0">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-6">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                                        Buscando centros educativos...
                                    </div>
                                </div>
                            ) : resultados.length > 0 ? (
                                <div className="max-h-80 overflow-auto">
                                    {resultados.map((centro, index) => (
                                        <div
                                            key={centro.codigo}
                                            onClick={() => handleSeleccionCentro(centro)}
                                            className={`group cursor-pointer border-b border-border/50 p-4 transition-all duration-150 last:border-b-0 ${
                                                selectedIndex === index ? 'border-primary/20 bg-primary/5' : 'hover:bg-muted/50'
                                            } `}
                                            role="option"
                                            aria-selected={selectedIndex === index}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div
                                                    className={`mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-colors ${
                                                        selectedIndex === index
                                                            ? 'bg-primary/10 text-primary'
                                                            : 'bg-muted text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary'
                                                    } `}
                                                >
                                                    <School className="h-4 w-4" />
                                                </div>
                                                <div className="min-w-0 flex-1 space-y-2.5">
                                                    <div>
                                                        <h4 className="pr-2 leading-tight font-medium text-foreground">{centro.nombre}</h4>
                                                        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                                                            <Hash className="h-3 w-3" />
                                                            {centro.codigo}
                                                        </p>
                                                    </div>

                                                    {(centro.sector || centro.zona || centro.internacional) && (
                                                        <div className="flex flex-wrap gap-1">
                                                            {centro.sector && (
                                                                <Badge variant="secondary" className="px-2 py-0.5 text-xs font-normal">
                                                                    <Building className="mr-1 h-2.5 w-2.5" />
                                                                    {centro.sector}
                                                                </Badge>
                                                            )}
                                                            {centro.zona && (
                                                                <Badge variant="secondary" className="px-2 py-0.5 text-xs font-normal">
                                                                    <MapPin className="mr-1 h-2.5 w-2.5" />
                                                                    {centro.zona}
                                                                </Badge>
                                                            )}
                                                            {centro.internacional && (
                                                                <Badge variant="secondary" className="px-2 py-0.5 text-xs font-normal">
                                                                    <Globe className="mr-1 h-2.5 w-2.5" />
                                                                    {centro.internacional}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="px-4 py-8 text-center">
                                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                        <Search className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <h4 className="mb-1 text-sm font-medium text-foreground">No se encontraron centros educativos</h4>
                                    <p className="mx-auto max-w-sm text-xs text-muted-foreground">
                                        Verifica la ortografía o intenta con un término de búsqueda diferente.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
