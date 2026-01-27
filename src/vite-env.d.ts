/// <reference types="vite/client" />

interface ImportMeta {
  readonly glob: <T = Record<string, () => Promise<unknown>>>(pattern: string, options?: { eager?: boolean; import?: string; query?: string | Record<string, string | boolean | number> }) => Record<string, T>;
}
