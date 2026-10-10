import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend or root directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  llm: {
    provider: (process.env.LLM_PROVIDER || 'gemini').toLowerCase(),
    model: process.env.LLM_MODEL || (process.env.LLM_PROVIDER === 'openai' ? 'google/gemma-4-31b-it' : 'gemini-2.5-flash'),
    apiKey: process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || process.env.LLM_API_KEY || '',
    baseUrl: process.env.LLM_BASE_URL || (process.env.LLM_PROVIDER === 'openai' ? 'https://openrouter.ai/api/v1' : 'https://generativelanguage.googleapis.com/v1beta')
  }
};
