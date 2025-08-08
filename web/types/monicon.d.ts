declare module '@monicon/vite' {
  export function monicon(options?: {
    collections?: string[];
    autoInstall?: boolean;
  }): any;
}