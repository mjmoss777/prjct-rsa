import { createOpenAI } from '@ai-sdk/openai';

const openrouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
});

export function getModel(modelId?: string) {
  return openrouter(modelId || process.env.OPENROUTER_MODEL || 'openai/gpt-4o');
}

export { openrouter };
