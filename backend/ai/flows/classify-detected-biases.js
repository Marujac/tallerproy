'use server';

import { ai } from '../genkit';
import { z } from 'genkit';

const ClassifyDetectedBiasesInputSchema = z.object({
  text: z
    .string()
    .describe('El texto a analizar en busca de sesgos.'),
  detectedBias: z.string().describe('El sesgo o falacia específica detectada en el texto.'),
});

const ClassifyDetectedBiasesOutputSchema = z.object({
  biasType: z.string().describe('La clasificación del sesgo o falacia detectada.'),
  explanation: z
    .string()
    .describe('Una explicación del tipo de sesgo identificado y por qué es problemático.'),
});

export async function classifyDetectedBiases(input) {
  return classifyDetectedBiasesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'classifyDetectedBiasesPrompt',
  input: { schema: ClassifyDetectedBiasesInputSchema },
  output: { schema: ClassifyDetectedBiasesOutputSchema },
  prompt: `Eres un experto en identificar y clasificar falacias lógicas y sesgos cognitivos.

  Dado el siguiente texto y un sesgo detectado, clasifica el tipo de sesgo y explica por qué es problemático. Responde en español.

  Texto: {{{text}}}
  Sesgo Detectado: {{{detectedBias}}}

  Responde en un formato JSON:
  {
    "biasType": "Tipo de sesgo",
    "explanation": "Explicación del sesgo y por qué es problemático"
  }`,
});

const classifyDetectedBiasesFlow = ai.defineFlow(
  {
    name: 'classifyDetectedBiasesFlow',
    inputSchema: ClassifyDetectedBiasesInputSchema,
    outputSchema: ClassifyDetectedBiasesOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output;
  }
);

