
import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

function getTheme(): Theme {
    if (typeof window === 'undefined') {
        return 'system';
    }
    if (document.documentElement.classList.contains('dark')) {
        return 'dark';
    }
    return 'light';
}

export function useTheme() {
    const [theme, setTheme] = useState<Theme>(getTheme());

    useEffect(() => {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (
                    mutation.type === 'attributes' &&
                    mutation.attributeName === 'class'
                ) {
                    setTheme(getTheme());
                }
            });
        });

        observer.observe(document.documentElement, {
            attributes: true,
        });

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            setTheme(getTheme());
        };
        mediaQuery.addEventListener('change', handleChange);

        return () => {
            observer.disconnect();
            mediaQuery.removeEventListener('change', handleChange);
        };
    }, []);

    return {
        theme:
            theme === 'system'
                ? window.matchMedia('(prefers-color-scheme: dark)').matches
                    ? 'dark'
                    : 'light'
                : theme,
    };
}
