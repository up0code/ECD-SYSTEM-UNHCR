'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/comprehensive-report-analysis-flow.ts';
import '@/ai/flows/admin-policy-compliance.ts';
import '@/ai/flows/teacher-attendance-insight.ts';
import '@/ai/flows/generate-student-bio-flow.ts';
