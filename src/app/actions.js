"use server";

import { generateCriticalThinkingQuestions } from '@/ai/flows/generate-critical-thinking-questions';

export async function generateQuizAction(text) {
  if (!text || text.trim().length < 50) {
    return { data: null, error: 'Por favor, introduce al menos 50 caracteres de texto para analizar.' };
  }

  try {
    const questionsResult = await generateCriticalThinkingQuestions({ text });
    return {
      data: { questions: questionsResult.questions },
      error: null,
    };
  } catch (error) {
    console.error('Error generating questions:', error);
    return { data: null, error: 'Ocurrió un error inesperado durante el análisis. Por favor, inténtalo de nuevo.' };
  }
}

