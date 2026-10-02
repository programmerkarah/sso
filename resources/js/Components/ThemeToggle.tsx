import { Moon, Sun } from 'lucide-react';

import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

const applyTheme = (theme: Theme) => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.toggle('theme-dark', theme === 'dark');
};

export default function ThemeToggle({
    compact = false,
}: {
    compact?: boolean;
}) {
    const [theme, setTheme] = useState<Theme>('light');

    useEffect(() => {
        const stored = window.localStorage.getItem('sso-theme') as Theme | null;
        const initial =
            stored === 'light' || stored === 'dark'
                ? stored
                : window.matchMedia('(prefers-color-scheme: dark)').matches
                  ? 'dark'
                  : 'light';

        setTheme(initial);
        applyTheme(initial);
    }, []);

    const toggle = () => {
        const next: Theme = theme === 'dark' ? 'light' : 'dark';
        setTheme(next);
        window.localStorage.setItem('sso-theme', next);
        applyTheme(next);
    };

    const dark = theme === 'dark';

    return (
        <button
            type="button"
            onClick={toggle}
            className={
                'inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--bps-border)] bg-[var(--bps-surface)] text-[var(--bps-muted)] transition hover:bg-[var(--bps-surface-soft)] hover:text-[var(--bps-text)] ' +
                (compact ? 'h-9 w-9' : 'h-9 px-3 text-sm font-medium')
            }
            title={dark ? 'Gunakan mode terang' : 'Gunakan mode gelap'}
            aria-label={dark ? 'Gunakan mode terang' : 'Gunakan mode gelap'}
        >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {!compact && <span>{dark ? 'Terang' : 'Gelap'}</span>}
        </button>
    );
}
