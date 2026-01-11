import { useCallback, useEffect, useMemo, useState } from 'react';

export type PuterModel = string;

const STORAGE_KEY = 'puter-claude-model';

export const useClaudeModelSelection = () => {
  const [selectedModel, setSelectedModel] = useState<PuterModel>(() => {
    return localStorage.getItem(STORAGE_KEY) || 'claude-sonnet-4';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, selectedModel);
  }, [selectedModel]);

  return { selectedModel, setSelectedModel };
};

export const usePuterClaudeModels = () => {
  const [isReady, setIsReady] = useState(false);
  const [models, setModels] = useState<PuterModel[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ready = !!window.puter?.ai?.chat && !!window.puter?.ai?.listModels;
    setIsReady(ready);

    if (!ready) return;

    let cancelled = false;
    window.puter!.ai!.listModels()
      .then((all) => {
        if (cancelled) return;
        // Only Claude models
        const claude = all.filter((m) => m.toLowerCase().startsWith('claude-') || m.toLowerCase().includes('claude'));
        setModels(claude);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e?.message || String(e));
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { isReady, models, error };
};

export const usePuterClaudeChat = () => {
  const chat = useCallback(async (prompt: string, model: string) => {
    if (!window.puter?.ai?.chat) {
      throw new Error('Puter AI is not available');
    }
    const res = await window.puter.ai.chat(prompt, { model });
    if (typeof res === 'string') return res;
    if (res && typeof res === 'object') {
      return (res as any).message ?? (res as any).text ?? JSON.stringify(res);
    }
    return String(res);
  }, []);

  return { chat };
};

