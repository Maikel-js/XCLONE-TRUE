declare namespace NodeJS {
    interface ProcessEnv {
        NEXT_PUBLIC_API_BASE: string
        NEXT_PUBLIC_WS_URL: string
    }
}

interface ImportMetaEnv {
    readonly NEXT_PUBLIC_API_BASE: string
    readonly NEXT_PUBLIC_WS_URL: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
