import { createOpenAI } from '@ai-sdk/openai';
import type { AiSource } from '@/config/db/schema/config-schema';

const openrouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
  fetch: async (url, options) => {
    // @ai-sdk/openai v3 sends response_format: { type: "json_schema" } which most
    // OpenRouter providers reject. Downgrade to json_object which is widely supported.
    if (options?.body && typeof options.body === 'string') {
      const body = JSON.parse(options.body);
      if (body.response_format?.type === 'json_schema') {
        body.response_format = { type: 'json_object' };
        options = { ...options, body: JSON.stringify(body) };
      }
    }
    return globalThis.fetch(url, options);
  },
});

const nvidia = createOpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

const providers: Record<AiSource, ReturnType<typeof createOpenAI>> = {
  openrouter,
  nvidia,
  aistudio: createOpenAI({
    apiKey: process.env.AISTUDIO_API_KEY,
    baseURL: process.env.AISTUDIO_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta/openai',
  }),
  togetherai: createOpenAI({
    apiKey: process.env.TOGETHERAI_API_KEY,
    baseURL: 'https://api.together.xyz/v1',
  }),
};

export function getModel(modelId?: string, source?: AiSource) {
  const s = source || (process.env.AI_SOURCE as AiSource) || 'openrouter';
  const provider = providers[s];
  const id = modelId || process.env.AI_MODEL || process.env.OPENROUTER_MODEL || 'openai/gpt-4o';
  return provider.chat(id);
}

export { openrouter, nvidia, providers };
