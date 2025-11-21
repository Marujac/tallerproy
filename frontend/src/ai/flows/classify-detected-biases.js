'use server';

import { classifyDetectedBiases as impl } from '@/backend/ai/flows/classify-detected-biases';

export async function classifyDetectedBiases(input) {
  return impl(input);
}
