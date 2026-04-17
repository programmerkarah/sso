import { AxiosInstance } from 'axios';

declare global {
    interface Window {
        axios: AxiosInstance;
    }
}

declare module '*.css' {
    const content: string;
    export default content;
}

interface ImportMetaEnv {
    readonly VITE_APP_NAME: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
    readonly glob: (pattern: string) => Record<string, () => Promise<unknown>>;
}
