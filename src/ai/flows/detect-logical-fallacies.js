'use server';

import { detectLogicalFallacies as impl } from '@/backend/ai/flows/detect-logical-fallacies';

export async function detectLogicalFallacies(input) {
  return impl(input);
}
