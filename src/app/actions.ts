'use server';

import {
  generateQuestionsFromText,
  GenerateQuestionsFromTextInput,
  GenerateQuestionsFromTextOutput,
} from '@/ai/flows/generate-questions-from-text';
import {
  detectBias,
  DetectBiasInput,
  DetectBiasOutput,
} from '@/ai/flows/detect-bias-in-text';

export async function handleGenerateQuestions(
  input: GenerateQuestionsFromTextInput
): Promise<GenerateQuestionsFromTextOutput> {
  // Simple validation
  if (!input.text || input.text.length < 50) {
    throw new Error('Please provide a text with at least 50 characters.');
  }
  return await generateQuestionsFromText(input);
}

export async function handleDetectBias(
  input: DetectBiasInput
): Promise<DetectBiasOutput> {
  // Simple validation
  if (!input.text || input.text.length < 50) {
    throw new Error('Please provide a text with at least 50 characters.');
  }
  return await detectBias(input);
}
