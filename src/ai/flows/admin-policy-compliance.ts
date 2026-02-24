'use server';
/**
 * @fileOverview This file defines a Genkit flow for Admin Policy Compliance.
 * It uses AI to automatically flag students who are approaching or violating attendance policies
 * and suggests proactive interventions or communications.
 *
 * - adminPolicyCompliance - The main function to trigger the attendance policy compliance check.
 * - AdminPolicyComplianceInput - The input type for the adminPolicyCompliance function.
 * - AdminPolicyComplianceOutput - The return type for the adminPolicyCompliance function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Schemas
const StudentInfoForPolicyCheckSchema = z.object({
  id: z.string().describe('Unique ID of the student.'),
  name: z.string().describe('Full name of the student.'),
  studentId: z.string().describe('User-facing student identifier.'),
  attendance: z.record(
    z.string().describe('Date in string format (e.g., "Thu Jan 01 2024")'),
    z.enum(['present', 'late', 'excused', 'unexcused']).describe('Attendance status for the day.')
  ).describe('Record of attendance statuses by date.')
});
export type StudentInfoForPolicyCheck = z.infer<typeof StudentInfoForPolicyCheckSchema>;

const AttendancePolicySchema = z.object({
  maxUnexcusedAbsences: z.number().int().min(0).describe('Maximum allowed unexcused absences.'),
  lateThresholdMinutes: z.number().int().min(0).describe('Minutes after expected arrival time considered late.'),
  expectedArrivalTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).describe('Expected arrival time in HH:MM format.')
});
export type AttendancePolicy = z.infer<typeof AttendancePolicySchema>;

const AdminPolicyComplianceInputSchema = z.object({
  students: z.array(StudentInfoForPolicyCheckSchema).describe('List of students with their attendance records.'),
  policy: AttendancePolicySchema.describe('Attendance policy rules.')
});
export type AdminPolicyComplianceInput = z.infer<typeof AdminPolicyComplianceInputSchema>;

const FlaggedStudentSuggestionSchema = z.object({
  studentId: z.string().describe('User-facing student identifier.'),
  studentName: z.string().describe('Full name of the flagged student.'),
  reason: z.string().describe('Reason for being flagged (e.g., "Exceeded max unexcused absences").'),
  suggestedIntervention: z.string().describe('AI-suggested proactive intervention or communication strategy.')
});
export type FlaggedStudentSuggestion = z.infer<typeof FlaggedStudentSuggestionSchema>;

const AdminPolicyComplianceOutputSchema = z.array(FlaggedStudentSuggestionSchema).describe('List of flagged students with reasons and suggested interventions.');
export type AdminPolicyComplianceOutput = z.infer<typeof AdminPolicyComplianceOutputSchema>;

// Helper prompt for generating intervention suggestions
const getInterventionPrompt = ai.definePrompt({
  name: 'getInterventionSuggestionPrompt',
  input: {
    schema: z.object({
      studentName: z.string().describe('The name of the student.'),
      studentId: z.string().describe('The ID of the student.'),
      reason: z.string().describe('The specific reason why the student was flagged for policy violation.'),
      expectedArrivalTime: z.string().describe('The expected arrival time for attendance.'),
      lateThresholdMinutes: z.number().int().describe('The number of minutes after expected arrival that is considered late.'),
      maxUnexcusedAbsences: z.number().int().describe('The maximum number of unexcused absences allowed.')
    })
  },
  output: {
    schema: z.object({
      suggestedIntervention: z.string().describe('A concise and actionable suggestion for intervention or communication.')
    })
  },
  prompt: `You are an administrative assistant responsible for ensuring student attendance policy compliance.\nGiven the student "{{studentName}}" (ID: {{studentId}}) has been flagged for the following reason: "{{reason}}".\nThe attendance policy states the expected arrival time is {{expectedArrivalTime}} with a {{lateThresholdMinutes}}-minute late threshold, and a maximum of {{maxUnexcusedAbsences}} unexcused absences.\n\nSuggest a proactive and constructive intervention or communication strategy for the administration.\nThe intervention should be specific and actionable, such as scheduling a meeting, sending a specific type of email, or suggesting a support program.\nProvide only the suggested intervention.`
});

// Main Genkit Flow
export async function adminPolicyCompliance(
  input: AdminPolicyComplianceInput
): Promise<AdminPolicyComplianceOutput> {
  return adminPolicyComplianceFlow(input);
}

const adminPolicyComplianceFlow = ai.defineFlow(
  {
    name: 'adminPolicyComplianceFlow',
    inputSchema: AdminPolicyComplianceInputSchema,
    outputSchema: AdminPolicyComplianceOutputSchema
  },
  async (input) => {
    const flaggedStudentsOutput: FlaggedStudentSuggestion[] = [];
    const { students, policy } = input;

    for (const student of students) {
      let unexcusedAbsencesCount = 0;
      let lateCount = 0;
      const attendanceDates = Object.keys(student.attendance);

      for (const date of attendanceDates) {
        const status = student.attendance[date];
        if (status === 'unexcused') {
          unexcusedAbsencesCount++;
        } else if (status === 'late') {
            lateCount++;
        }
      }

      let reason = '';
      if (unexcusedAbsencesCount > policy.maxUnexcusedAbsences) {
        reason = `Exceeded maximum allowed unexcused absences (${unexcusedAbsencesCount}/${policy.maxUnexcusedAbsences}).`;
      } else if (lateCount >= Math.ceil(attendanceDates.length * 0.25) && attendanceDates.length > 0) { // Flag if late 25% or more of recorded days
        reason = `Frequent lateness detected (late ${lateCount} out of ${attendanceDates.length} recorded days).`;
      }

      if (reason) {
        const { output: interventionOutput } = await getInterventionPrompt({
          studentName: student.name,
          studentId: student.studentId,
          reason: reason,
          expectedArrivalTime: policy.expectedArrivalTime,
          lateThresholdMinutes: policy.lateThresholdMinutes,
          maxUnexcusedAbsences: policy.maxUnexcusedAbsences,
        });

        if (interventionOutput) {
          flaggedStudentsOutput.push({
            studentId: student.studentId,
            studentName: student.name,
            reason: reason,
            suggestedIntervention: interventionOutput.suggestedIntervention,
          });
        }
      }
    }
    return flaggedStudentsOutput;
  }
);
