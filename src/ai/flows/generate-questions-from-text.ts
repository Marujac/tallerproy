'use server';

/**
 * @fileOverview Generates multiple-choice questions from a given text to aid critical thinking.
 *
 * - generateQuestionsFromText - A function that generates questions from text.
 * - GenerateQuestionsFromTextInput - The input type for the generateQuestionsFromText function.
 * - GenerateQuestionsFromTextOutput - The return type for the generateQuestionsFromText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateQuestionsFromTextInputSchema = z.object({
  text: z
    .string()
    .describe('The text from which to generate multiple-choice questions.'),
  numQuestions: z.number().describe('The number of questions to generate.'),
});
export type GenerateQuestionsFromTextInput = z.infer<
  typeof GenerateQuestionsFromTextInputSchema
>;

const GenerateQuestionsFromTextOutputSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string().describe('The generated question.'),
      options: z.array(z.string()).describe('The multiple-choice options.'),
      answer: z.string().describe('The correct answer to the question.'),
    })
  ),
});
export type GenerateQuestionsFromTextOutput = z.infer<
  typeof GenerateQuestionsFromTextOutputSchema
>;

export async function generateQuestionsFromText(
  input: GenerateQuestionsFromTextInput
): Promise<GenerateQuestionsFromTextOutput> {
  return generateQuestionsFromTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuestionsFromTextPrompt',
  input: {schema: GenerateQuestionsFromTextInputSchema},
  output: {schema: GenerateQuestionsFromTextOutputSchema},
  prompt: `You are an expert educator creating multiple-choice questions to test critical thinking skills. Generate {{numQuestions}} questions based on the following text. Each question should have 4 options, with one correct answer. Ensure the questions are relevant to the content and designed to promote critical thinking. The answer field should be one of the options.

Text: {{{text}}}

Output the questions in JSON format.

Example Output:
{
  "questions": [
    {
      "question": "What is the main idea of the text?",
      "options": [
        "Option 1",
        "Option 2",
        "Option 3",
        "Option 4"
      ],
      "answer": "Option 1"
    }
  ]
}`,
});

const generateQuestionsFromTextFlow = ai.defineFlow(
  {
    name: 'generateQuestionsFromTextFlow',
    inputSchema: GenerateQuestionsFromTextInputSchema,
    outputSchema: GenerateQuestionsFromTextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
