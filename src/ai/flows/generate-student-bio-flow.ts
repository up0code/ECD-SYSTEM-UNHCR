'use server';
/**
 * @fileOverview An AI agent that generates a short student bio.
 *
 * - generateStudentBio - A function that generates a student bio.
 * - GenerateStudentBioInput - The input type for the generateStudentBio function.
 * - GenerateStudentBioOutput - The return type for the generateStudentBio function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateStudentBioInputSchema = z.object({
  name: z.string().describe('The name of the student.'),
  studentClass: z.string().describe('The class the student is in.'),
});
export type GenerateStudentBioInput = z.infer<
  typeof GenerateStudentBioInputSchema
>;

const GenerateStudentBioOutputSchema = z.object({
  bio: z.string().describe('The generated student bio.'),
});
export type GenerateStudentBioOutput = z.infer<
  typeof GenerateStudentBioOutputSchema
>;

export async function generateStudentBio(
  input: GenerateStudentBioInput
): Promise<GenerateStudentBioOutput> {
  return generateStudentBioFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateStudentBioPrompt',
  input: { schema: GenerateStudentBioInputSchema },
  output: { schema: GenerateStudentBioOutputSchema },
  prompt: `You are a helpful assistant. Generate a short, positive, one-paragraph bio for a student named {{name}} in class {{studentClass}}. The bio should be suitable for a school profile. Be creative and encouraging.`,
});

const generateStudentBioFlow = ai.defineFlow(
  {
    name: 'generateStudentBioFlow',
    inputSchema: GenerateStudentBioInputSchema,
    outputSchema: GenerateStudentBioOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate student bio.');
    }
    return output;
  }
);
