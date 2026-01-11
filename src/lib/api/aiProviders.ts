export type AIProvider = 'openrouter' | 'openai' | 'anthropic' | 'perplexity' | 'groq' | 'custom';

export interface AIModel {
  id: string;
  name: string;
  provider: AIProvider;
  contextWindow?: number;
  maxTokens?: number;
  pricing?: {
    input: number; // per 1M tokens
    output: number; // per 1M tokens
  };
}

export interface AIProviderConfig {
  provider: AIProvider;
  apiKey: string;
  baseURL?: string;
  defaultModel?: string;
  enabled: boolean;
}

export const AI_PROVIDERS: Record<AIProvider, { name: string; models: AIModel[] }> = {
  openrouter: {
    name: 'OpenRouter.ai',
    models: [
      // OpenAI Models
      { id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'openrouter' },
      { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openrouter' },
      { id: 'openai/gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'openrouter' },
      { id: 'openai/gpt-4', name: 'GPT-4', provider: 'openrouter' },
      { id: 'openai/gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'openrouter' },
      { id: 'openai/o1-preview', name: 'O1 Preview', provider: 'openrouter' },
      { id: 'openai/o1-mini', name: 'O1 Mini', provider: 'openrouter' },
      // Anthropic Models
      { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'openrouter' },
      { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus', provider: 'openrouter' },
      { id: 'anthropic/claude-3-sonnet', name: 'Claude 3 Sonnet', provider: 'openrouter' },
      { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku', provider: 'openrouter' },
      { id: 'anthropic/claude-2.1', name: 'Claude 2.1', provider: 'openrouter' },
      { id: 'anthropic/claude-2.0', name: 'Claude 2.0', provider: 'openrouter' },
      // Google Models
      { id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5', provider: 'openrouter' },
      { id: 'google/gemini-pro', name: 'Gemini Pro', provider: 'openrouter' },
      { id: 'google/gemini-flash-1.5', name: 'Gemini Flash 1.5', provider: 'openrouter' },
      // Meta Llama Models
      { id: 'meta-llama/llama-3.1-405b-instruct', name: 'Llama 3.1 405B', provider: 'openrouter' },
      { id: 'meta-llama/llama-3.1-70b-instruct', name: 'Llama 3.1 70B', provider: 'openrouter' },
      { id: 'meta-llama/llama-3.1-8b-instruct', name: 'Llama 3.1 8B', provider: 'openrouter' },
      { id: 'meta-llama/llama-3-70b-instruct', name: 'Llama 3 70B', provider: 'openrouter' },
      { id: 'meta-llama/llama-3-8b-instruct', name: 'Llama 3 8B', provider: 'openrouter' },
      // Mistral Models
      { id: 'mistralai/mistral-large-2407', name: 'Mistral Large 2407', provider: 'openrouter' },
      { id: 'mistralai/mistral-large', name: 'Mistral Large', provider: 'openrouter' },
      { id: 'mistralai/mixtral-8x7b-instruct', name: 'Mixtral 8x7B', provider: 'openrouter' },
      { id: 'mistralai/mixtral-8x22b-instruct', name: 'Mixtral 8x22B', provider: 'openrouter' },
      { id: 'mistralai/mistral-7b-instruct', name: 'Mistral 7B', provider: 'openrouter' },
      // Perplexity Models
      { id: 'perplexity/llama-3.1-sonar-large-32k-online', name: 'Perplexity Sonar Large', provider: 'openrouter' },
      { id: 'perplexity/llama-3.1-sonar-small-32k-online', name: 'Perplexity Sonar Small', provider: 'openrouter' },
      // Qwen Models
      { id: 'qwen/qwen-2.5-72b-instruct', name: 'Qwen 2.5 72B', provider: 'openrouter' },
      { id: 'qwen/qwen-2.5-32b-instruct', name: 'Qwen 2.5 32B', provider: 'openrouter' },
      { id: 'qwen/qwen-2.5-14b-instruct', name: 'Qwen 2.5 14B', provider: 'openrouter' },
      { id: 'qwen/qwen-2.5-7b-instruct', name: 'Qwen 2.5 7B', provider: 'openrouter' },
      // Cohere Models
      { id: 'cohere/command-r-plus', name: 'Command R+', provider: 'openrouter' },
      { id: 'cohere/command-r', name: 'Command R', provider: 'openrouter' },
      // DeepSeek Models
      { id: 'deepseek/deepseek-chat', name: 'DeepSeek Chat', provider: 'openrouter' },
      { id: 'deepseek/deepseek-coder', name: 'DeepSeek Coder', provider: 'openrouter' },
      // Other Models
      { id: '01-ai/yi-1.5-34b-chat', name: 'Yi 1.5 34B', provider: 'openrouter' },
      { id: '01-ai/yi-1.5-9b-chat', name: 'Yi 1.5 9B', provider: 'openrouter' },
      { id: 'x-ai/grok-beta', name: 'Grok Beta', provider: 'openrouter' },
    ],
  },
  openai: {
    name: 'OpenAI',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai' },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'openai' },
      { id: 'gpt-4-turbo-preview', name: 'GPT-4 Turbo Preview', provider: 'openai' },
      { id: 'gpt-4', name: 'GPT-4', provider: 'openai' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'openai' },
      { id: 'gpt-3.5-turbo-16k', name: 'GPT-3.5 Turbo 16K', provider: 'openai' },
    ],
  },
  anthropic: {
    name: 'Anthropic (Claude)',
    models: [
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', provider: 'anthropic' },
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', provider: 'anthropic' },
      { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', provider: 'anthropic' },
      { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', provider: 'anthropic' },
      { id: 'claude-2.1', name: 'Claude 2.1', provider: 'anthropic' },
      { id: 'claude-2.0', name: 'Claude 2.0', provider: 'anthropic' },
    ],
  },
  perplexity: {
    name: 'Perplexity',
    models: [
      { id: 'pplx-70b-online', name: 'Perplexity 70B Online', provider: 'perplexity' },
      { id: 'pplx-7b-online', name: 'Perplexity 7B Online', provider: 'perplexity' },
      { id: 'llama-3.1-sonar-large-32k-online', name: 'Sonar Large 32K Online', provider: 'perplexity' },
      { id: 'llama-3.1-sonar-small-32k-online', name: 'Sonar Small 32K Online', provider: 'perplexity' },
      { id: 'llama-3.1-sonar-huge-128k-online', name: 'Sonar Huge 128K Online', provider: 'perplexity' },
    ],
  },
  groq: {
    name: 'Groq',
    models: [
      { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile', provider: 'groq' },
      { id: 'llama-3.1-70b-versatile', name: 'Llama 3.1 70B Versatile', provider: 'groq' },
      { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant', provider: 'groq' },
      { id: 'llama-3.1-405b-reasoning', name: 'Llama 3.1 405B Reasoning', provider: 'groq' },
      { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', provider: 'groq' },
      { id: 'mixtral-8x22b-instruct', name: 'Mixtral 8x22B', provider: 'groq' },
      { id: 'gemma-7b-it', name: 'Gemma 7B IT', provider: 'groq' },
      { id: 'gemma2-9b-it', name: 'Gemma2 9B IT', provider: 'groq' },
      { id: 'llama-3-70b-8192', name: 'Llama 3 70B', provider: 'groq' },
      { id: 'llama-3-8b-8192', name: 'Llama 3 8B', provider: 'groq' },
      { id: 'qwen2.5-72b-instruct', name: 'Qwen2.5 72B', provider: 'groq' },
    ],
  },
  custom: {
    name: 'Custom API',
    models: [
      { id: 'custom', name: 'Custom Model', provider: 'custom' },
    ],
  },
};

export class AIProviderService {
  private configs: Map<AIProvider, AIProviderConfig> = new Map();

  setConfig(config: AIProviderConfig) {
    this.configs.set(config.provider, config);
    // Save to localStorage
    const configs = Array.from(this.configs.values());
    localStorage.setItem('ai_provider_configs', JSON.stringify(configs));
  }

  getConfig(provider: AIProvider): AIProviderConfig | undefined {
    // Load from localStorage
    const stored = localStorage.getItem('ai_provider_configs');
    if (stored) {
      const configs: AIProviderConfig[] = JSON.parse(stored);
      const config = configs.find(c => c.provider === provider);
      if (config) {
        this.configs.set(provider, config);
        return config;
      }
    }
    return this.configs.get(provider);
  }

  getAllConfigs(): AIProviderConfig[] {
    const stored = localStorage.getItem('ai_provider_configs');
    if (stored) {
      return JSON.parse(stored);
    }
    return Array.from(this.configs.values());
  }

  async callAPI(
    provider: AIProvider,
    model: string,
    prompt: string,
    options?: {
      temperature?: number;
      maxTokens?: number;
      systemPrompt?: string;
    }
  ): Promise<string> {
    const config = this.getConfig(provider);
    if (!config || !config.enabled || !config.apiKey) {
      throw new Error(`Provider ${provider} is not configured or enabled`);
    }

    return this.callAPIWithKey(provider, model, prompt, config.apiKey, options);
  }

  async callAPIWithKey(
    provider: AIProvider,
    model: string,
    prompt: string,
    apiKey: string,
    options?: {
      temperature?: number;
      maxTokens?: number;
      systemPrompt?: string;
    }
  ): Promise<string> {
    switch (provider) {
      case 'openrouter':
        return this.callOpenRouter(apiKey, model, prompt, options);
      case 'openai':
        return this.callOpenAI(apiKey, model, prompt, options);
      case 'anthropic':
        return this.callAnthropic(apiKey, model, prompt, options);
      case 'perplexity':
        return this.callPerplexity(apiKey, model, prompt, options);
      case 'groq':
        return this.callGroq(apiKey, model, prompt, options);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  private async callOpenRouter(
    apiKey: string,
    model: string,
    prompt: string,
    options?: any
  ): Promise<string> {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Smart Learning Platform',
      },
      body: JSON.stringify({
        model,
        messages: [
          ...(options?.systemPrompt ? [{ role: 'system', content: options.systemPrompt }] : []),
          { role: 'user', content: prompt },
        ],
        temperature: options?.temperature || 0.7,
        max_tokens: options?.maxTokens || 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'OpenRouter API error');
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  private async callOpenAI(
    apiKey: string,
    model: string,
    prompt: string,
    options?: any
  ): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          ...(options?.systemPrompt ? [{ role: 'system', content: options.systemPrompt }] : []),
          { role: 'user', content: prompt },
        ],
        temperature: options?.temperature || 0.7,
        max_tokens: options?.maxTokens || 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'OpenAI API error');
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  private async callAnthropic(
    apiKey: string,
    model: string,
    prompt: string,
    options?: any
  ): Promise<string> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        max_tokens: options?.maxTokens || 2000,
        temperature: options?.temperature || 0.7,
        system: options?.systemPrompt || '',
        messages: [
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Anthropic API error');
    }

    const data = await response.json();
    return data.content[0]?.text || '';
  }

  private async callPerplexity(
    apiKey: string,
    model: string,
    prompt: string,
    options?: any
  ): Promise<string> {
    // Use existing Perplexity integration
    const { perplexityApi } = await import('./perplexity');
    const result = await perplexityApi.search(prompt, 'smart', 'ar');
    
    if (!result.success || !result.content) {
      throw new Error(result.error || 'Perplexity API error');
    }
    
    return result.content;
  }

  private async callGroq(
    apiKey: string,
    model: string,
    prompt: string,
    options?: any
  ): Promise<string> {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          ...(options?.systemPrompt ? [{ role: 'system', content: options.systemPrompt }] : []),
          { role: 'user', content: prompt },
        ],
        temperature: options?.temperature || 0.7,
        max_tokens: options?.maxTokens || 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Groq API error');
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }
}

export const aiProviderService = new AIProviderService();

