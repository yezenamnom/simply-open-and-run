export {};

declare global {
  interface Window {
    puter?: {
      ai?: {
        chat: (prompt: string, options?: { model?: string; [key: string]: unknown }) => Promise<any>;
        listModels: () => Promise<string[]>;
      };
    };
  }
}

