'use server';

import { generateCriticalThinkingQuestions as impl } from '@/backend/ai/flows/generate-critical-thinking-questions';

export async function generateCriticalThinkingQuestions(input) {
  return impl(input);
}
