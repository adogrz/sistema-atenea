'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Check, Loader2, Search, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface EntityItem {
    value: string;
    label: string;
    sublabel?: string;
    [key: string]: unknown;
}

interface EntityFinderProps {
    /** Ruta del backend para buscar entidades */
    searchRoute: string;
    /** Parámetros adicionales para la búsqueda (ej: type, sede) */
    searchParams?: Record<string, unknown>;
    /** Valor seleccionado */
    value: string;
    /** Callback cuando se selecciona una entidad */
    onSelect: (item: EntityItem) => void;
    /** Callback cuando se limpia la selección */
    onClear: () => void;
    /** Placeholder del input */
    placeholder?: string;
    /** Label del campo */
    label?: string;
    /** Información seleccionada para mostrar */
    selectedInfo?: {
        title: string;
        subtitle?: string;
    };
    /** Mensaje de error */
    error?: string;
    /** Número máximo de resultados */
    maxResults?: number;
    /** Clase adicional */
    className?: string;
    /** Deshabilitado */
    disabled?: boolean;
}

export function EntityFinder({
    searchRoute,
    searchParams = {},
    value,
    onSelect,
    onClear,
    placeholder = 'Buscar...',
    label,
    selectedInfo,
    error,
    maxResults = 6,
    className,
    disabled = false,
}: EntityFinderProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState<EntityItem[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [isReplacing, setIsReplacing] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const resultsRef = useRef<HTMLDivElement>(null);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    // Función para realizar la búsqueda
    const performSearch = useCallback(
        async (query: string) => {
            if (query.trim().length < 2) {
                setResults([]);
                setIsLoading(false);
                return;
            }

            // Cancelar búsqueda anterior si existe
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            abortControllerRef.current = new AbortController();

            try {
                const response = await fetch(
                    route(searchRoute, {
                        search: query,
                        limit: maxResults,
                        ...searchParams,
                    }),
                    {
                        signal: abortControllerRef.current.signal,
                        headers: {
                            'X-Requested-With': 'XMLHttpRequest',
                        },
                    },
                );

                if (!response.ok) throw new Error('Error en la búsqueda');

                const data = await response.json();
                setResults(data);
            } catch (error: unknown) {
                if (error instanceof Error && error.name !== 'AbortError') {
                    console.error('Error buscando:', error);
                    setResults([]);
                }
            } finally {
                setIsLoading(false);
            }
        },
        [searchRoute, searchParams, maxResults],
    );

    // Manejar cambios en el input con debounce
    const handleSearchChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const query = e.target.value;
            setSearchQuery(query);
            setSelectedIndex(-1);

            // Limpiar timeout anterior
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }

            if (query.trim().length > 0) {
                setIsLoading(true);
                setShowResults(true);

                // Configurar nuevo timeout
                debounceTimerRef.current = setTimeout(() => {
                    performSearch(query);
                }, 300);
            } else {
                setShowResults(false);
                setIsLoading(false);
                setResults([]);
            }
        },
        [performSearch],
    );

    // Manejar selección
    const handleSelect = useCallback(
        (item: EntityItem) => {
            onSelect(item);
            setSearchQuery('');
            setShowResults(false);
            setSelectedIndex(-1);
            setResults([]);
            setIsReplacing(false);
            // Anunciar selección para lectores de pantalla
            const announcement = `Seleccionado: ${item.label}${item.sublabel ? `, ${item.sublabel}` : ''}`;
            const liveRegion = document.createElement('div');
            liveRegion.setAttribute('role', 'status');
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.className = 'sr-only';
            liveRegion.textContent = announcement;
            document.body.appendChild(liveRegion);
            setTimeout(() => document.body.removeChild(liveRegion), 1000);
        },
        [onSelect],
    );

    // Manejar limpieza
    const handleClear = useCallback(() => {
        onClear();
        setSearchQuery('');
        setShowResults(false);
        setSelectedIndex(-1);
        setResults([]);
        setIsReplacing(false);
        // Anunciar limpieza para lectores de pantalla
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('role', 'status');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.className = 'sr-only';
        liveRegion.textContent = 'Selección eliminada';
        document.body.appendChild(liveRegion);
        setTimeout(() => document.body.removeChild(liveRegion), 1000);
        setTimeout(() => {
            searchInputRef.current?.focus();
        }, 100);
    }, [onClear]);

    // Navegación por teclado
    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (!showResults || results.length === 0) return;

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (selectedIndex >= 0 && selectedIndex < results.length) {
                        handleSelect(results[selectedIndex]);
                    }
                    break;
                case 'Escape':
                    e.preventDefault();
                    setShowResults(false);
                    setSelectedIndex(-1);
                    break;
            }
        },
        [showResults, results, selectedIndex, handleSelect],
    );

    // Scroll automático al item seleccionado
    useEffect(() => {
        if (selectedIndex >= 0 && resultsRef.current) {
            const selectedElement = resultsRef.current.querySelector(`[data-index="${selectedIndex}"]`);
            selectedElement?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    }, [selectedIndex]);

    // Cerrar al hacer clic fuera
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
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    // Si hay valor seleccionado y no está en modo reemplazo, mostrar card de resumen
    if (value && selectedInfo && !isReplacing) {
        return (
            <div className={cn('space-y-1.5', className)}>
                {label && <Label className={cn("text-sm font-medium", disabled ? "text-muted-foreground" : "text-foreground")}>{label}</Label>}
                <div
                    className={cn(
                        "relative rounded-md border shadow-sm transition-all duration-200 animate-in fade-in-50 slide-in-from-top-1",
                        disabled
                            ? "border-border/50 bg-muted/30 opacity-60 cursor-not-allowed"
                            : "border-green-200/80 bg-green-50/40 dark:border-green-800/60 dark:bg-green-950/20 cursor-pointer hover:border-green-300/90 dark:hover:border-green-700/70 hover:bg-green-50/60 dark:hover:bg-green-950/30 hover:shadow-sm"
                    )}
                    onClick={!disabled ? () => {
                        setIsReplacing(true);
                        setSearchQuery('');
                        setShowResults(false);
                        setTimeout(() => searchInputRef.current?.focus(), 50);
                    } : undefined}
                    role="button"
                    tabIndex={disabled ? -1 : 0}
                    onKeyDown={(e) => {
                        if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
                            e.preventDefault();
                            setIsReplacing(true);
                            setSearchQuery('');
                            setShowResults(false);
                            setTimeout(() => searchInputRef.current?.focus(), 50);
                        }
                    }}
                    aria-label={disabled ? `${label} seleccionado: ${selectedInfo.title}` : `${label} seleccionado: ${selectedInfo.title}. Clic para cambiar selección`}
                    aria-pressed={!disabled}
                >
                    <div className="flex items-center justify-between gap-2 px-2.5 py-3">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className={cn(
                                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                                disabled
                                    ? "bg-muted dark:bg-muted/50"
                                    : "bg-green-100/80 dark:bg-green-900/30"
                            )}>
                                <Check className={cn(
                                    "h-2.5 w-2.5",
                                    disabled
                                        ? "text-muted-foreground/50"
                                        : "text-green-600 dark:text-green-400"
                                )} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={cn(
                                    "text-sm font-medium truncate leading-none",
                                    disabled ? "text-muted-foreground" : "text-foreground"
                                )}>{selectedInfo.title}</p>
                                {selectedInfo.subtitle && (
                                    <p className={cn(
                                        "text-xs truncate leading-none mt-1",
                                        disabled ? "text-muted-foreground/60" : "text-muted-foreground/90"
                                    )}>{selectedInfo.subtitle}</p>
                                )}
                            </div>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleClear();
                            }}
                            disabled={disabled}
                            className={cn(
                                "h-5 w-5 p-0 shrink-0 transition-all",
                                !disabled && "hover:bg-green-100/80 dark:hover:bg-green-900/40 hover:text-green-700 dark:hover:text-green-300 hover:scale-105"
                            )}
                            aria-label="Limpiar selección completamente"
                        >
                            <X className="h-2.5 w-2.5" />
                        </Button>
                    </div>
                </div>
                {!disabled && (
                    <p className="text-xs text-muted-foreground/70 leading-relaxed" role="status" aria-live="polite">
                        Clic en la tarjeta para cambiar o en × para limpiar
                    </p>
                )}
                {error && <p className="text-sm text-destructive mt-1.5" role="alert">{error}</p>}
            </div>
        );
    }

    // Mostrar buscador
    return (
        <div className={cn('space-y-1.5', className)}>
            {label && <Label className="text-sm font-medium text-foreground">{label}</Label>}
            <div className="relative" ref={resultsRef}>
                <div className="relative">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    <Input
                        ref={searchInputRef}
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        className={cn(
                            'h-10 pl-9 pr-9 text-sm transition-colors',
                            error && 'border-destructive focus-visible:ring-destructive',
                            disabled && 'cursor-not-allowed opacity-70 bg-muted/50 text-muted-foreground border-border/50'
                        )}
                        disabled={disabled}
                        onFocus={() => {
                            if (searchQuery.trim().length > 0) {
                                setShowResults(true);
                            }
                        }}
                        aria-label={label || placeholder}
                        aria-expanded={showResults}
                        aria-autocomplete="list"
                        aria-controls="search-results"
                        role="combobox"
                        aria-activedescendant={selectedIndex >= 0 ? `result-item-${selectedIndex}` : undefined}
                    />
                    {isLoading && (
                        <div className="absolute top-1/2 right-3 -translate-y-1/2 pointer-events-none">
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                    )}
                </div>

                {/* Resultados */}
                {showResults && (
                    <div className="absolute z-50 w-full mt-1 rounded-md border border-border bg-card shadow-lg transition-opacity duration-200 animate-in fade-in-50 slide-in-from-top-2">
                        <div
                            className="max-h-[280px] overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/40 scrollbar-track-transparent"
                            role="listbox"
                            id="search-results"
                            aria-label={`Resultados de búsqueda para ${label}`}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center py-8" role="status">
                                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                    <span className="ml-2 text-sm text-muted-foreground">Buscando...</span>
                                    <span className="sr-only">Buscando resultados</span>
                                </div>
                            ) : results.length === 0 ? (
                                <div className="py-8 text-center" role="status">
                                    <p className="text-sm text-muted-foreground">No se encontraron resultados</p>
                                    <span className="sr-only">No hay resultados para mostrar</span>
                                </div>
                            ) : (
                                <div className="py-0.5">
                                    {results.map((item, index) => (
                                        <button
                                            key={item.value}
                                            id={`result-item-${index}`}
                                            type="button"
                                            data-index={index}
                                            onClick={() => handleSelect(item)}
                                            role="option"
                                            aria-selected={selectedIndex === index}
                                            className={cn(
                                                'w-full px-3 py-2.5 text-left transition-all duration-150',
                                                'hover:bg-accent focus:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                                                selectedIndex === index && 'bg-accent shadow-sm',
                                                'border-b last:border-b-0 border-border/40'
                                            )}
                                        >
                                            <div className="space-y-0.5">
                                                <p className="text-sm font-medium text-foreground leading-tight">{item.label}</p>
                                                {item.sublabel && <p className="text-xs text-muted-foreground leading-tight truncate">{item.sublabel}</p>}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            {error && <p className="text-sm text-destructive mt-1.5" role="alert">{error}</p>}
        </div>
    );
}
