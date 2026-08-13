import { and, asc, desc, eq } from "drizzle-orm";
import { satisfactionQuestions, studentMindCheckRecords } from "../drizzle/schema";
import type { SupportedLocale } from "./satisfactionDefaults";
import { getDb } from "./db";

type SatisfactionAnswer =
  | { questionId: string; questionType: "likert"; value: number }
  | { questionId: string; questionType: "textarea"; text: string };

type StudentRecordSubmission = {
  anonymousSessionId: string;
  locale: SupportedLocale;
  studentName: string;
  studentId: string;
  contactNumber: string;
  department: string;
  personalDataConsent: true;
  counselingContactConsent: boolean;
  cesdScore: number;
  pssScore: number;
  cesdAnswers: number[];
  pssAnswers: number[];
  satisfactionAnswers: SatisfactionAnswer[];
};

function normalizedDepartment(department?: string) {
  const value = department?.trim();
  return value || undefined;
}

function getSatisfactionValues(answers: SatisfactionAnswer[], orderedQuestions: Array<{ id: string; sortOrder: number; questionType: "likert" | "textarea" }>) {
  const byQuestionId = new Map(answers.map(answer => [answer.questionId, answer]));
  const values = { satisfaction1: 0, satisfaction2: 0, satisfaction3: 0, satisfaction4: 0, satisfaction5: 0, satisfaction6: "" };
  orderedQuestions.forEach(question => {
    const answer = byQuestionId.get(question.id);
    if (question.questionType === "textarea" && answer?.questionType === "textarea") values.satisfaction6 = answer.text.trim();
    if (question.questionType === "likert" && answer?.questionType === "likert" && question.sortOrder >= 1 && question.sortOrder <= 5) {
      values[`satisfaction${question.sortOrder}` as "satisfaction1" | "satisfaction2" | "satisfaction3" | "satisfaction4" | "satisfaction5"] = answer.value;
    }
  });
  return values;
}

export function buildKoreanStudentRecord(input: StudentRecordSubmission, orderedQuestions: Array<{ id: string; sortOrder: number; questionType: "likert" | "textarea" }>, submittedAt: Date) {
  const satisfaction = getSatisfactionValues(input.satisfactionAnswers, orderedQuestions);
  return {
    studentId: input.studentId,
    studentName: input.studentName,
    contactNumber: input.contactNumber,
    department: input.department,
    locale: input.locale,
    personalDataConsent: true,
    personalDataConsentAt: submittedAt,
    counselingContactConsent: input.counselingContactConsent,
    counselingContactConsentAt: input.counselingContactConsent ? submittedAt : null,
    cesdScore: input.cesdScore,
    pssScore: input.pssScore,
    cesdAnswers: JSON.stringify(input.cesdAnswers),
    pssAnswers: JSON.stringify(input.pssAnswers),
    ...satisfaction,
    submittedAt,
  };
}

function toSatisfactionAnswers(row: typeof studentMindCheckRecords.$inferSelect) {
  const answers: SatisfactionAnswer[] = [1, 2, 3, 4, 5]
    .filter(index => row[`satisfaction${index}` as "satisfaction1" | "satisfaction2" | "satisfaction3" | "satisfaction4" | "satisfaction5"] > 0)
    .map(index => ({ questionId: `satisfaction-${index}`, questionType: "likert" as const, value: row[`satisfaction${index}` as "satisfaction1" | "satisfaction2" | "satisfaction3" | "satisfaction4" | "satisfaction5"] }))
  if (row.satisfaction6) answers.push({ questionId: "satisfaction-6", questionType: "textarea", text: row.satisfaction6 });
  return answers;
}

function toSummary(row: typeof studentMindCheckRecords.$inferSelect) {
  const ratings = [row.satisfaction1, row.satisfaction2, row.satisfaction3, row.satisfaction4, row.satisfaction5].filter(value => value > 0);
  return { satisfactionScore: ratings.reduce((total, value) => total + value, 0), satisfactionAnswerCount: ratings.length, satisfactionComment: row.satisfaction6 || null };
}

export async function saveAssessmentResponse(input: StudentRecordSubmission) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available.");
  const questions = await db.select({ id: satisfactionQuestions.id, sortOrder: satisfactionQuestions.sortOrder, questionType: satisfactionQuestions.questionType }).from(satisfactionQuestions).where(eq(satisfactionQuestions.isActive, true)).orderBy(asc(satisfactionQuestions.sortOrder));
  const submittedAt = new Date();
  const record = buildKoreanStudentRecord(input, questions, submittedAt);
  await db.insert(studentMindCheckRecords).values(record).onDuplicateKeyUpdate({ set: { ...record, updatedAt: submittedAt } });
  return { success: true } as const;
}

export async function getDepartmentOptions() {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.selectDistinct({ department: studentMindCheckRecords.department }).from(studentMindCheckRecords).orderBy(asc(studentMindCheckRecords.department));
  return rows.map(row => row.department).filter(Boolean);
}

export async function getIdentifiedAssessmentResponses(limit = 100, department?: string) {
  const db = await getDb();
  if (!db) return [];
  const departmentFilter = normalizedDepartment(department);
  const rows = await db.select().from(studentMindCheckRecords).where(departmentFilter ? eq(studentMindCheckRecords.department, departmentFilter) : undefined).orderBy(desc(studentMindCheckRecords.submittedAt)).limit(limit);
  return rows.map(row => ({ id: row.recordId, studentName: row.studentName, studentId: row.studentId, contactNumber: row.contactNumber, department: row.department, locale: row.locale, cesdScore: row.cesdScore, pssScore: row.pssScore, ...toSummary(row), personalDataConsent: row.personalDataConsent, personalDataConsentAt: row.personalDataConsentAt, counselingContactConsent: row.counselingContactConsent, counselingContactConsentAt: row.counselingContactConsentAt, createdAt: row.submittedAt }));
}

export async function getRawAssessmentExportRows(department?: string) {
  const db = await getDb();
  if (!db) return [];
  const departmentFilter = normalizedDepartment(department);
  const rows = await db.select().from(studentMindCheckRecords).where(departmentFilter ? eq(studentMindCheckRecords.department, departmentFilter) : undefined).orderBy(desc(studentMindCheckRecords.submittedAt));
  return rows.map(row => ({ id: row.recordId, studentName: row.studentName, studentId: row.studentId, contactNumber: row.contactNumber, department: row.department, locale: row.locale, cesdScore: row.cesdScore, pssScore: row.pssScore, ...toSummary(row), cesdAnswers: row.cesdAnswers, pssAnswers: row.pssAnswers, satisfactionAnswers: JSON.stringify(toSatisfactionAnswers(row)), personalDataConsent: row.personalDataConsent, personalDataConsentAt: row.personalDataConsentAt, counselingContactConsent: row.counselingContactConsent, counselingContactConsentAt: row.counselingContactConsentAt, createdAt: row.submittedAt }));
}

export async function getCounselingContactCandidates(limit = 100, department?: string) {
  const db = await getDb();
  if (!db) return [];
  const departmentFilter = normalizedDepartment(department);
  const rows = await db.select().from(studentMindCheckRecords).where(and(eq(studentMindCheckRecords.counselingContactConsent, true), departmentFilter ? eq(studentMindCheckRecords.department, departmentFilter) : undefined)).orderBy(desc(studentMindCheckRecords.submittedAt)).limit(limit);
  return rows.map(row => ({ id: row.recordId, studentName: row.studentName, studentId: row.studentId, contactNumber: row.contactNumber, department: row.department, cesdScore: row.cesdScore, pssScore: row.pssScore, counselingContactConsent: row.counselingContactConsent, counselingContactConsentAt: row.counselingContactConsentAt, createdAt: row.submittedAt }));
}

export async function getAssessmentStats(department?: string) {
  const db = await getDb();
  const localeCounts: Record<SupportedLocale, number> = { ko: 0, en: 0, ja: 0 };
  if (!db) return { totalResponses: 0, averageCesd: 0, averagePss: 0, averageSatisfaction: 0, localeCounts };
  const departmentFilter = normalizedDepartment(department);
  const rows = await db.select().from(studentMindCheckRecords).where(departmentFilter ? eq(studentMindCheckRecords.department, departmentFilter) : undefined);
  if (!rows.length) return { totalResponses: 0, averageCesd: 0, averagePss: 0, averageSatisfaction: 0, localeCounts };
  let cesdTotal = 0; let pssTotal = 0; let satisfactionTotal = 0; let satisfactionCount = 0;
  rows.forEach(row => { const summary = toSummary(row); cesdTotal += row.cesdScore; pssTotal += row.pssScore; satisfactionTotal += summary.satisfactionScore; satisfactionCount += summary.satisfactionAnswerCount; localeCounts[row.locale] += 1; });
  return { totalResponses: rows.length, averageCesd: cesdTotal / rows.length, averagePss: pssTotal / rows.length, averageSatisfaction: satisfactionCount ? satisfactionTotal / satisfactionCount : 0, localeCounts };
}
