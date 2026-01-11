import { supabase } from '@/integrations/supabase/client';

export interface SearchResult {
  success: boolean;
  content?: string;
  citations?: string[];
  model?: string;
  error?: string;
  isConversational?: boolean;
}

export const perplexityApi = {
  async search(
    query: string, 
    searchType: 'general' | 'news' | 'discover' | 'smart' = 'general',
    language: string = 'en'
  ): Promise<SearchResult> {
    const { data, error } = await supabase.functions.invoke('perplexity-search', {
      body: { query, searchType, language },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return data;
  },
};
