'use server';
/**
 * @fileOverview Provides an AI-powered summary of student attendance patterns for teachers.
 *
 * - teacherAttendanceInsight - A function that generates an attendance insight summary for a given teacher.
 * - TeacherAttendanceInsightInput - The input type for the teacherAttendanceInsight function.
 * - TeacherAttendanceInsightOutput - The return type for the teacherAttendanceInsight function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

/**
 * Zod schema for a raw student attendance record, mirroring the structure in the HTML.
 */
const StudentRawInputSchema = z.object({
  id: z.string(),
  name: z.string(),
  class: z.string(),
  teacherId: z.string().nullable(),
  // Attendance is a record where keys are date strings (e.g., "Fri Jan 01 2023") and values are status.
  attendance: z.record(z.string(), z.enum(['present', 'late', 'excused', 'unexcused'])),
});

/**
 * Zod schema for the processed attendance data of a single student, used as input for the LLM prompt.
 */
const ProcessedStudentSchema = z.object({
  id: z.string().describe('The student ID.'),
  name: z.string().describe('The student full name.'),
  class: z.string().describe('The student class.'),
  totalRecords: z.number().describe('Total number of attendance records.'),
  presentCount: z.number().describe('Total count of present marks.'),
  lateCount: z.number().describe('Total count of late marks.'),
  excusedCount: z.number().describe('Total count of excused marks.'),
  overallAttendancePercentage: z.number().describe('Overall attendance percentage based on present marks.'),
  recentLateCount: z.number().describe('Number of late marks in the last 30 days.'),
  recentAbsentCount: z.number().describe('Number of absent marks (neither present nor excused) in the last 30 days.'),
  attendanceTrend: z.string().describe('Identified attendance trend: "stable", "improving", or "declining" based on recent periods.'),
});

/**
 * Zod schema for the input required by the attendance insight Genkit prompt.
 */
const PromptInputSchema = z.object({
  teacherName: z.string().describe('The name of the teacher requesting the summary.'),
  processedStudents: z.array(ProcessedStudentSchema).describe('A list of students associated with the teacher, including their processed attendance statistics for AI analysis.'),
});

/**
 * Zod schema for the output of the attendance insight Genkit flow.
 */
const TeacherAttendanceInsightOutputSchema = z.object({
  summary: z.string().describe('A concise AI-powered summary of attendance patterns for the teacher\u0027s students, highlighting overall trends and specific students who might need attention.'),
  studentsNeedingAttention: z.array(z.object({
    id: z.string().describe('The ID of the student.'),
    name: z.string().describe('The name of the student.'),
    reason: z.string().describe('Reason why this student needs attention (e.g., "frequent lateness", "declining attendance", "sporadic attendance").'),
  })).describe('A list of students who might need attention based on their attendance patterns.'),
});

/**
 * Input type for the teacherAttendanceInsight function.
 * Assumes `students` array and `teacherId` are available from the application state.
 */
export type TeacherAttendanceInsightInput = {
  teacherId: string;
  teacherName: string;
  students: z.infer<typeof StudentRawInputSchema>[];
  currentDate: string; // Expected format: YYYY-MM-DD for reliable date calculations
};

/**
 * Output type for the teacherAttendanceInsight function.
 */
export type TeacherAttendanceInsightOutput = z.infer<typeof TeacherAttendanceInsightOutputSchema>;

/**
 * Helper function to calculate detailed attendance data for a student.
 * Assumes date keys in student.attendance are parseable by `new Date()` (e.g., "Fri Jan 01 2023").
 * `currentDateString` should be in "YYYY-MM-DD" format.
 */
function calculateAttendanceData(student: z.infer<typeof StudentRawInputSchema>, currentDateString: string) {
  const today = new Date(currentDateString);

  let totalRecords = 0;
  let presentCount = 0;
  let lateCount = 0;
  let excusedCount = 0;

  let recentLateCount = 0;
  let recentAbsentCount = 0; // neither present nor excused
  let recentPresentCount = 0;
  let recentPeriodTotalDays = 0; // count of actual recorded days in the period

  let previousPresentCount = 0;
  let previousPeriodTotalDays = 0; // count of actual recorded days in the previous period

  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);
  const sixtyDaysAgo = new Date(today);
  sixtyDaysAgo.setDate(today.getDate() - 60);

  for (const dateKey in student.attendance) {
    const recordDate = new Date(dateKey);
    if (isNaN(recordDate.getTime())) {
      console.warn(`Invalid date key in attendance record for student ${student.name}: ${dateKey}`);
      continue;
    }

    totalRecords++;
    const status = student.attendance[dateKey];

    if (status === 'present') {
      presentCount++;
    } else if (status === 'late') {
      lateCount++;
    } else if (status === 'excused') {
      excusedCount++;
    }

    // Check for recent 30-day period (excluding today)
    if (recordDate >= thirtyDaysAgo && recordDate < today) {
      recentPeriodTotalDays++;
      if (status === 'late') recentLateCount++;
      if (status !== 'present' && status !== 'excused') recentAbsentCount++;
      if (status === 'present') recentPresentCount++;
    }
    // Check for previous 30-day period
    else if (recordDate >= sixtyDaysAgo && recordDate < thirtyDaysAgo) {
      previousPeriodTotalDays++;
      if (status === 'present') previousPresentCount++;
    }
  }

  const overallAttendancePercentage = totalRecords > 0 ? (presentCount / totalRecords) * 100 : 0;

  let attendanceTrend: 'stable' | 'improving' | 'declining' = 'stable';
  if (recentPeriodTotalDays > 0 && previousPeriodTotalDays > 0) {
    const recentPeriodPercentage = (recentPresentCount / recentPeriodTotalDays) * 100;
    const previousPeriodPercentage = (previousPeriodCount / previousPeriodTotalDays) * 100;
    const trendThreshold = 5; // Percentage points

    if (recentPeriodPercentage > previousPeriodPercentage + trendThreshold) {
      attendanceTrend = 'improving';
    } else if (recentPeriodPercentage < previousPeriodPercentage - trendThreshold) {
      attendanceTrend = 'declining';
    }
  } else if (recentPeriodTotalDays > 0 && previousPeriodTotalDays === 0) {
    // Only recent data, cannot determine trend yet, assume stable or base on new student status
  } else if (totalRecords > 0 && recentPeriodTotalDays === 0 && previousPeriodTotalDays === 0) {
    // No records in recent 60 days, but total records exist. Could imply long absence.
    if (presentCount === 0 && lateCount === 0) {
      attendanceTrend = 'declining'; // If no recent activity and was previously absent.
    }
  }

  return {
    id: student.id,
    name: student.name,
    class: student.class,
    totalRecords,
    presentCount,
    lateCount,
    excusedCount,
    overallAttendancePercentage: parseFloat(overallAttendancePercentage.toFixed(1)),
    recentLateCount,
    recentAbsentCount,
    attendanceTrend,
  };
}

const teacherAttendanceInsightPrompt = ai.definePrompt({
  name: 'teacherAttendanceInsightPrompt',
  input: { schema: PromptInputSchema },
  output: { schema: TeacherAttendanceInsightOutputSchema },
  prompt: `You are an AI-powered attendance analyst assisting {{teacherName}}. Your task is to review the provided student attendance data and generate a concise summary of their attendance patterns, identifying students who might need attention.

Here is the attendance data for students assigned to {{teacherName}}:

{{#each processedStudents}}
Student Name: {{name}}
Class: {{class}}
Total Attendance Records: {{totalRecords}}
Present Count: {{presentCount}}
Late Count: {{lateCount}}
Excused Count: {{excusedCount}}
Overall Attendance Percentage: {{overallAttendancePercentage}}%
Recent Late Count (last 30 days): {{recentLateCount}}
Recent Absent Count (last 30 days, not present/excused): {{recentAbsentCount}}
Attendance Trend: {{attendanceTrend}}
---
{{/each}}

Based on this data, please provide:

1.  **A concise summary** of the overall attendance patterns across {{teacherName}}'s students. Highlight any general trends (e.g., most students are punctual, a noticeable number are frequently late).
2.  **A list of students who might need attention**, along with a specific reason. Focus on patterns such as:
    *   **Declining attendance:** Students whose attendance trend is 'declining'.
    *   **Frequent lateness:** Students with a high 'recentLateCount'.
    *   **Frequent absenteeism:** Students with a high 'recentAbsentCount'.
    *   **Sporadic attendance:** Students with low 'overallAttendancePercentage' or inconsistent patterns.

Structure your response strictly as a JSON object matching the output schema provided.`,
});

const teacherAttendanceInsightFlow = ai.defineFlow(
  {
    name: 'teacherAttendanceInsightFlow',
    inputSchema: z.object({
      teacherId: z.string().describe('The ID of the teacher.'),
      teacherName: z.string().describe('The name of the teacher.'),
      students: z.array(StudentRawInputSchema).describe('An array of all students, including their raw attendance records.'),
      currentDate: z.string().describe('The current date in "YYYY-MM-DD" format, used for relative date calculations.'),
    }),
    outputSchema: TeacherAttendanceInsightOutputSchema,
  },
  async ({ teacherId, teacherName, students, currentDate }) => {
    // Filter students belonging to the specified teacher
    const teacherStudents = students.filter(s => s.teacherId === teacherId);

    if (teacherStudents.length === 0) {
      return {
        summary: `No students found for teacher ${teacherName}.`,
        studentsNeedingAttention: [],
      };
    }

    // Process attendance data for each student
    const processedStudents = teacherStudents.map(student => calculateAttendanceData(student, currentDate));

    // Call the AI prompt with the processed data
    const { output } = await teacherAttendanceInsightPrompt({
      teacherName,
      processedStudents,
    });

    return output!;
  }
);

/**
 * Generates an AI-powered summary of student attendance patterns for a given teacher.
 * This function processes raw student attendance data and uses an AI model to identify trends and students needing attention.
 *
 * @param input - An object containing the teacher's ID, teacher's name, all available student data (including attendance records),
 *                and the current date in 'YYYY-MM-DD' format.
 * @returns A promise that resolves to an object containing a summary string and a list of students needing attention.
 */
export async function teacherAttendanceInsight(input: TeacherAttendanceInsightInput): Promise<TeacherAttendanceInsightOutput> {
  // The input to this function might contain all students, so we need to ensure
  // the flow inside handles the filtering correctly.
  return teacherAttendanceInsightFlow({
    ...input,
    // The `students` property in TeacherAttendanceInsightInput is already what StudentRawInputSchema expects
    // We just need to pass it through.
  });
}
