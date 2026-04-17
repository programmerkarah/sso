/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_APP_NAME: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

declare module '*.css' {
    const content: string;
    export default content;
}
