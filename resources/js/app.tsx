import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

import { createRoot } from 'react-dom/client';

import { createInertiaApp } from '@inertiajs/react';

import '../css/app.css';
import './bootstrap';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

const storedTheme = window.localStorage.getItem('sso-theme');
const initialTheme =
    storedTheme === 'light' || storedTheme === 'dark'
        ? storedTheme
        : window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';

document.documentElement.dataset.theme = initialTheme;
document.documentElement.classList.toggle('theme-dark', initialTheme === 'dark');

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob('./Pages/**/*.tsx'),
        ) as any,
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});
