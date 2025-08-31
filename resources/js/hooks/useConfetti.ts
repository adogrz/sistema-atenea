import { useCallback, useEffect, useState } from 'react';

// Importación dinámica de canvas-confetti para evitar problemas de SSR
let confetti: ((options?: ConfettiOptions) => Promise<null>) | null = null;

const loadConfetti = async () => {
    if (typeof window !== 'undefined' && !confetti) {
        const module = await import('canvas-confetti');
        confetti = module.default;
    }
    return confetti;
};

interface ConfettiOptions {
    particleCount?: number;
    angle?: number;
    spread?: number;
    origin?: { x?: number; y?: number };
    colors?: string[];
    startVelocity?: number;
    gravity?: number;
    drift?: number;
    ticks?: number;
}

export function useConfetti() {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    // Detectar preferencia de movimiento reducido
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            setPrefersReducedMotion(mediaQuery.matches);

            const handleChange = (e: MediaQueryListEvent) => {
                setPrefersReducedMotion(e.matches);
            };

            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }
    }, []);

    const fireConfetti = useCallback(async (options: ConfettiOptions = {}) => {
        // No ejecutar si el usuario prefiere movimiento reducido
        if (prefersReducedMotion) {
            return;
        }

        try {
            const confettiInstance = await loadConfetti();
            if (!confettiInstance) return;

            const defaultOptions: ConfettiOptions = {
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'],
                startVelocity: 30,
                gravity: 0.5,
                drift: 0,
                ticks: 200,
            };

            const finalOptions = { ...defaultOptions, ...options };
            confettiInstance(finalOptions);
        } catch (error) {
            console.warn('Error al cargar confetti:', error);
        }
    }, [prefersReducedMotion]);

    const fireSuccessConfetti = useCallback(async () => {
        // Secuencia de confetti para celebración de éxito
        await fireConfetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
        });

        // Segundo burst desde los lados
        setTimeout(async () => {
            await fireConfetti({
                particleCount: 50,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
            });
        }, 250);

        setTimeout(async () => {
            await fireConfetti({
                particleCount: 50,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
            });
        }, 400);
    }, [fireConfetti]);

    return {
        fireConfetti,
        fireSuccessConfetti,
        prefersReducedMotion,
    };
}
