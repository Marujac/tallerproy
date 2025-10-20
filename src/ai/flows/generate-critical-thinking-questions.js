'use server';

/**
 * @fileOverview Generates critical thinking questions for a given text.
 *
 * - generateCriticalThinkingQuestions - A function that generates critical thinking questions.
 * - GenerateCriticalThinkingQuestionsInput - The input type for the generateCriticalThinkingQuestions function.
 * - GenerateCriticalThinkingQuestionsOutput - The return type for the generateCriticalThinkingQuestions function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateCriticalThinkingQuestionsInputSchema = z.object({
  text: z.string().describe('El texto para el que se generarán las preguntas.'),
});
// Types removed for JS migration

const QuestionSchema = z.object({
  question: z.string().describe('La pregunta de opción múltiple.'),
  options: z.array(z.string()).describe('Un array de 4 posibles respuestas.'),
  correctAnswer: z.number().describe('El índice (0-3) de la respuesta correcta en el array de opciones.'),
  explanation: z.string().describe('Una breve explicación de por qué la respuesta es correcta.'),
});

const GenerateCriticalThinkingQuestionsOutputSchema = z.object({
  questions: z.array(QuestionSchema).describe('Un array de 5 preguntas de pensamiento crítico en formato de cuestionario.'),
});
// Types removed for JS migration

export async function generateCriticalThinkingQuestions(input) {
  return generateCriticalThinkingQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCriticalThinkingQuestionsPrompt',
  input: {schema: GenerateCriticalThinkingQuestionsInputSchema},
  output: {schema: GenerateCriticalThinkingQuestionsOutputSchema},
  prompt: `Eres un asistente de IA diseñado para generar un cuestionario de pensamiento crítico basado en un texto dado.

  Genera 5 preguntas de opción múltiple que animen al usuario a pensar críticamente sobre el texto. Cada pregunta debe ser relevante para el contenido y promover una comprensión más profunda. Responde en español.

  Texto: {{{text}}}

  Formatea tu respuesta como un objeto JSON con un array "questions". Cada objeto en el array debe tener las claves "question", "options" (un array de 4 strings), "correctAnswer" (el índice de la respuesta correcta), y "explanation" (una explicación de por qué la respuesta es correcta).
  `,
});

const generateCriticalThinkingQuestionsFlow = ai.defineFlow(
  {
    name: 'generateCriticalThinkingQuestionsFlow',
    inputSchema: GenerateCriticalThinkingQuestionsInputSchema,
    outputSchema: GenerateCriticalThinkingQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output;
  }
);
