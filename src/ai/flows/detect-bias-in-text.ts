// src/ai/flows/detect-bias-in-text.ts
'use server';
/**
 * @fileOverview Detects biases or logical fallacies in text, highlighting suspect passages and suggesting categories.
 *
 * - detectBias - A function that handles the bias detection process.
 * - DetectBiasInput - The input type for the detectBias function.
 * - DetectBiasOutput - The return type for the detectBias function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectBiasInputSchema = z.object({
  text: z.string().describe('The text to analyze for biases and logical fallacies.'),
});
export type DetectBiasInput = z.infer<typeof DetectBiasInputSchema>;

const DetectBiasOutputSchema = z.object({
  biasedPassages: z.array(
    z.object({
      passage: z.string().describe('The potentially biased passage from the text.'),
      biasCategory: z.string().describe('The suggested category of bias or logical fallacy.'),
    })
  ).describe('An array of passages identified as potentially biased, along with their suggested bias categories.'),
});
export type DetectBiasOutput = z.infer<typeof DetectBiasOutputSchema>;

export async function detectBias(input: DetectBiasInput): Promise<DetectBiasOutput> {
  return detectBiasFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectBiasPrompt',
  input: {schema: DetectBiasInputSchema},
  output: {schema: DetectBiasOutputSchema},
  prompt: `You are an AI expert in detecting biases and logical fallacies in texts. Analyze the provided text and identify any passages that exhibit bias or contain logical fallacies. For each suspect passage, suggest the specific category of bias or fallacy.

Text to analyze: {{{text}}}

Output Format: Provide the output in JSON format, with an array of objects. Each object should contain the biased passage and the suggested bias category.

Example:
[
  {
    "passage": "This policy is a disaster and will ruin our economy.",
    "biasCategory": "Loaded language/inflammatory rhetoric"
  },
  {
    "passage": "Everyone knows that immigration is bad for the country.",
    "biasCategory": "Bandwagon fallacy"
  }
]

Your Analysis:`,  
});

const detectBiasFlow = ai.defineFlow(
  {
    name: 'detectBiasFlow',
    inputSchema: DetectBiasInputSchema,
    outputSchema: DetectBiasOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
