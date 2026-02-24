'use server';
/**
 * @fileOverview An AI agent that analyzes detailed attendance reports and provides a summary and key takeaways.
 *
 * - comprehensiveReportAnalysis - A function that handles the report analysis process.
 * - ComprehensiveReportAnalysisInput - The input type for the comprehensiveReportAnalysis function.
 * - ComprehensiveReportAnalysisOutput - The return type for the comprehensiveReportAnalysis function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ComprehensiveReportAnalysisInputSchema = z.object({
  reportContent: z
    .string()
    .describe(
      'The detailed attendance report content, typically in CSV or tabular format.'
    ),
});
export type ComprehensiveReportAnalysisInput = z.infer<
  typeof ComprehensiveReportAnalysisInputSchema
>;

const ComprehensiveReportAnalysisOutputSchema = z.object({
  summary: z.string().describe('An AI-generated summary of the attendance report, highlighting overall trends and key statistics.'),
  keyTakeaways: z
    .array(z.string())
    .describe(
      'A list of bullet points detailing the most important insights, patterns, or actionable information from the report.'
    ),
});
export type ComprehensiveReportAnalysisOutput = z.infer<
  typeof ComprehensiveReportAnalysisOutputSchema
>;

export async function comprehensiveReportAnalysis(
  input: ComprehensiveReportAnalysisInput
): Promise<ComprehensiveReportAnalysisOutput> {
  return comprehensiveReportAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'comprehensiveReportAnalysisPrompt',
  input: { schema: ComprehensiveReportAnalysisInputSchema },
  output: { schema: ComprehensiveReportAnalysisOutputSchema },
  prompt: `You are an expert attendance analyst. Your task is to review a detailed attendance report and provide a concise summary and a list of key takeaways.

Focus on identifying overall school-wide trends, significant patterns (e.g., specific classes or students with high rates of absence/lateness), and any information that could inform administrative decisions.

Report Content:
{{{reportContent}}}

---
Based on the report content, provide:
1. A comprehensive summary of the attendance data.
2. A list of key takeaways, including any notable trends, issues, or positive observations.
`,
});

const comprehensiveReportAnalysisFlow = ai.defineFlow(
  {
    name: 'comprehensiveReportAnalysisFlow',
    inputSchema: ComprehensiveReportAnalysisInputSchema,
    outputSchema: ComprehensiveReportAnalysisOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate report analysis.');
    }
    return output;
  }
);
