'use server';

/**
 * @fileOverview Detects logical fallacies and biases in a given text.
 *
 * - detectLogicalFallacies - A function that takes text as input and returns identified fallacies.
 * - DetectLogicalFallaciesInput - The input type for the detectLogicalFallacies function.
 * - DetectLogicalFallaciesOutput - The return type for the detectLogicalFallacies function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DetectLogicalFallaciesInputSchema = z.object({
  text: z
    .string()
    .describe('El texto a analizar en busca de falacias lógicas y sesgos.'),
});
// Types removed for JS migration

const DetectLogicalFallaciesOutputSchema = z.object({
  fallacies: z
    .array(
      z.object({
        type: z.string().describe('El tipo de falacia lógica o sesgo.'),
        passage: z.string().describe('El pasaje del texto que contiene la falacia.'),
        explanation: z
          .string()
          .describe('Una explicación de por qué el pasaje es una falacia.'),
      })
    )
    .describe('Una lista de falacias lógicas y sesgos encontrados en el texto.'),
});

export async function detectLogicalFallacies(input) {
  return detectLogicalFallaciesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectLogicalFallaciesPrompt',
  input: {schema: DetectLogicalFallaciesInputSchema},
  output: {schema: DetectLogicalFallaciesOutputSchema},
  prompt: `Eres un experto en IA en la identificación de falacias lógicas y sesgos en el texto. Analiza el texto proporcionado e identifica cualquier falacia lógica o sesgo presente. Para cada falacia o sesgo detectado, proporciona el tipo de falacia, el pasaje del texto donde ocurre y una breve explicación de por qué es una falacia. Responde en español.

Texto: {{{text}}}

Formatea tu respuesta como un objeto JSON con un array "fallacies". Cada objeto en el array debe tener las claves "type", "passage" y "explanation". Sé conciso y preciso en tu análisis.

Ejemplo de salida:
{
  "fallacies": [
    {
      "type": "Ad Hominem",
      "passage": "No escuches el argumento de Juan sobre el cambio climático; es un criminal convicto.",
      "explanation": "Esta es una falacia ad hominem porque ataca el carácter de Juan en lugar de abordar la sustancia de su argumento."
    }
  ]
}`,
});

const detectLogicalFallaciesFlow = ai.defineFlow(
  {
    name: 'detectLogicalFallaciesFlow',
    inputSchema: DetectLogicalFallaciesInputSchema,
    outputSchema: DetectLogicalFallaciesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output;
  }
);
