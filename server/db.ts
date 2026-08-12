import { and, asc, desc, eq } from "drizzle-orm";
import { createHash } from "node:crypto";
import { nanoid } from "nanoid";
import { drizzle } from "drizzle-orm/mysql2";
import {
  anonymousSessions,
  assessmentResponses,
  InsertUser,
  satisfactionQuestions,
  stationSettings,
  studentAssessmentCurrent,
  studentAssessmentProfiles,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";
import {
  DEFAULT_SATISFACTION_QUESTIONS,
  MAX_SATISFACTION_LIKERT_QUESTIONS,
  MAX_SATISFACTION_QUESTIONS,
  type SatisfactionQuestionDefinition,
  type SatisfactionQuestionType,
  type SupportedLocale,
  type Translation,
} from "./satisfactionDefaults";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId, lastSignedIn: user.lastSignedIn ?? new Date() };
  const updateSet: Record<string, unknown> = { lastSignedIn: values.lastSignedIn };
  for (const field of ["name", "email", "loginMethod"] as const) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  values.role = user.role ?? (user.openId === ENV.ownerOpenId ? "admin" : "user");
  updateSet.role = values.role;
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export type SatisfactionQuestionInput = {
  id?: string;
  sortOrder: number;
  question: Translation;
  questionType: SatisfactionQuestionType;
};

export type PublicSatisfactionQuestion = SatisfactionQuestionDefinition;

function toPublicSatisfactionQuestion(row: typeof satisfactionQuestions.$inferSelect): PublicSatisfactionQuestion {
  return {
    id: row.id,
    sortOrder: row.sortOrder,
    question: { ko: row.questionKo, en: row.questionEn, ja: row.questionJa },
    questionType: row.questionType,
    isActive: row.isActive,
  };
}

async function ensureDefaultSatisfactionQuestions(db: ReturnType<typeof drizzle>) {
  const existing = await db.select({ id: satisfactionQuestions.id }).from(satisfactionQuestions).limit(1);
  if (existing.length > 0) return;
  await db.insert(satisfactionQuestions).values(DEFAULT_SATISFACTION_QUESTIONS.map(question => ({
    id: question.id,
    sortOrder: question.sortOrder,
    questionKo: question.question.ko,
    questionEn: question.question.en,
    questionJa: question.question.ja,
    questionType: question.questionType,
    isActive: true,
  })));
}

export async function getSatisfactionQuestions({ includeInactive = false } = {}) {
  const db = await getDb();
  if (!db) return [];
  await ensureDefaultSatisfactionQuestions(db);
  const query = db.select().from(satisfactionQuestions).orderBy(asc(satisfactionQuestions.sortOrder));
  const rows = includeInactive ? await query : await query.where(eq(satisfactionQuestions.isActive, true));
  return rows.map(toPublicSatisfactionQuestion);
}

export async function upsertSatisfactionQuestion(input: SatisfactionQuestionInput) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available.");
  if (!input.id) {
    const active = await getSatisfactionQuestions();
    const sameType = active.filter(question => question.questionType === input.questionType);
    const typeLimit = input.questionType === "likert" ? MAX_SATISFACTION_LIKERT_QUESTIONS : 1;
    if (sameType.length >= typeLimit || active.length >= MAX_SATISFACTION_QUESTIONS) {
      throw new Error("The satisfaction question limit has been reached.");
    }
  }

  const id = input.id ?? `satisfaction-${nanoid(12)}`;
  const values = {
    id,
    sortOrder: input.sortOrder,
    questionKo: input.question.ko,
    questionEn: input.question.en,
    questionJa: input.question.ja,
    questionType: input.questionType,
    isActive: true,
  };
  await db.insert(satisfactionQuestions).values(values).onDuplicateKeyUpdate({ set: { ...values, updatedAt: new Date() } });
  return { id, sortOrder: input.sortOrder, question: input.question, questionType: input.questionType, isActive: true } satisfies PublicSatisfactionQuestion;
}

export async function deactivateSatisfactionQuestion(id: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available.");
  await db.update(satisfactionQuestions).set({ isActive: false, updatedAt: new Date() }).where(eq(satisfactionQuestions.id, id));
  return { success: true } as const;
}

type SatisfactionAnswer =
  | { questionId: string; questionType: "likert"; value: number }
  | { questionId: string; questionType: "textarea"; text: string };

type AssessmentSubmission = {
  anonymousSessionId: string;
  locale: SupportedLocale;
  studentName: string;
  studentId: string;
  department: string;
  personalDataConsent: true;
  counselingContactConsent: boolean;
  cesdScore: number;
  pssScore: number;
  cesdAnswers: number[];
  pssAnswers: number[];
  satisfactionAnswers: SatisfactionAnswer[];
};

export function buildCurrentStudentRecord(input: Pick<AssessmentSubmission, "studentId" | "studentName" | "department" | "counselingContactConsent">, responseId: number, consentedAt: Date) {
  return {
    studentId: input.studentId,
    responseId,
    studentName: input.studentName,
    department: input.department,
    personalDataConsent: true,
    personalDataConsentAt: consentedAt,
    counselingContactConsent: input.counselingContactConsent,
    counselingContactConsentAt: input.counselingContactConsent ? consentedAt : null,
  };
}

export async function saveAssessmentResponse(input: AssessmentSubmission, database?: ReturnType<typeof drizzle>) {
  const db = database ?? await getDb();
  if (!db) throw new Error("Database is not available.");

  const sessionHash = createHash("sha256").update(input.anonymousSessionId).digest("hex");
  await db.insert(anonymousSessions).values({ sessionHash, locale: input.locale }).onDuplicateKeyUpdate({ set: { locale: input.locale, updatedAt: new Date() } });
  const [session] = await db.select({ id: anonymousSessions.id }).from(anonymousSessions).where(eq(anonymousSessions.sessionHash, sessionHash)).limit(1);
  if (!session) throw new Error("Anonymous session could not be created.");

  const ratedAnswers = input.satisfactionAnswers.filter((answer): answer is Extract<SatisfactionAnswer, { questionType: "likert" }> => answer.questionType === "likert");
  const satisfactionScore = ratedAnswers.reduce((total, answer) => total + answer.value, 0);
  const satisfactionComment = input.satisfactionAnswers.find((answer): answer is Extract<SatisfactionAnswer, { questionType: "textarea" }> => answer.questionType === "textarea")?.text.trim() || null;
  await db.transaction(async tx => {
    const insert = await tx.insert(assessmentResponses).values({
      sessionId: session.id,
      locale: input.locale,
      cesdScore: input.cesdScore,
      pssScore: input.pssScore,
      legacyMallangiType: "retired",
      legacyMallangiAnswers: "[]",
      recommendedGame: "retired",
      satisfactionScore,
      satisfactionAnswerCount: ratedAnswers.length,
      satisfactionAnswers: JSON.stringify(input.satisfactionAnswers),
      satisfactionComment,
      cesdAnswers: JSON.stringify(input.cesdAnswers),
      pssAnswers: JSON.stringify(input.pssAnswers),
    });
    const responseId = Number(insert[0]?.insertId ?? 0);
    if (!responseId) throw new Error("Assessment response could not be created.");
    const consentedAt = new Date();
    await tx.insert(studentAssessmentProfiles).values({
      responseId,
      studentName: input.studentName,
      studentId: input.studentId,
      department: input.department,
      personalDataConsent: true,
      personalDataConsentAt: consentedAt,
      counselingContactConsent: input.counselingContactConsent,
      counselingContactConsentAt: input.counselingContactConsent ? consentedAt : null,
    });
    const currentRecord = buildCurrentStudentRecord(input, responseId, consentedAt);
    await tx.insert(studentAssessmentCurrent).values(currentRecord).onDuplicateKeyUpdate({ set: { ...currentRecord, updatedAt: consentedAt } });
  });
  return { success: true } as const;
}

function normalizedDepartment(department?: string) {
  const value = department?.trim();
  return value || undefined;
}

export async function getDepartmentOptions() {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.selectDistinct({ department: studentAssessmentCurrent.department }).from(studentAssessmentCurrent).orderBy(asc(studentAssessmentCurrent.department));
  return rows.map(row => row.department).filter(Boolean);
}

export async function getIdentifiedAssessmentResponses(limit = 100, department?: string) {
  const db = await getDb();
  if (!db) return [];
  const departmentFilter = normalizedDepartment(department);
  return db.select({
    id: assessmentResponses.id, studentName: studentAssessmentCurrent.studentName, studentId: studentAssessmentCurrent.studentId, department: studentAssessmentCurrent.department,
    locale: assessmentResponses.locale, cesdScore: assessmentResponses.cesdScore, pssScore: assessmentResponses.pssScore,
    satisfactionScore: assessmentResponses.satisfactionScore, satisfactionAnswerCount: assessmentResponses.satisfactionAnswerCount, satisfactionComment: assessmentResponses.satisfactionComment,
    personalDataConsent: studentAssessmentCurrent.personalDataConsent, personalDataConsentAt: studentAssessmentCurrent.personalDataConsentAt,
    counselingContactConsent: studentAssessmentCurrent.counselingContactConsent, counselingContactConsentAt: studentAssessmentCurrent.counselingContactConsentAt,
    createdAt: assessmentResponses.createdAt,
  }).from(studentAssessmentCurrent).innerJoin(assessmentResponses, eq(studentAssessmentCurrent.responseId, assessmentResponses.id)).where(departmentFilter ? eq(studentAssessmentCurrent.department, departmentFilter) : undefined).orderBy(desc(assessmentResponses.createdAt)).limit(limit);
}

export async function getRawAssessmentExportRows(department?: string) {
  const db = await getDb();
  if (!db) return [];
  const departmentFilter = normalizedDepartment(department);
  return db.select({
    id: assessmentResponses.id, studentName: studentAssessmentCurrent.studentName, studentId: studentAssessmentCurrent.studentId, department: studentAssessmentCurrent.department,
    locale: assessmentResponses.locale, cesdScore: assessmentResponses.cesdScore, pssScore: assessmentResponses.pssScore,
    satisfactionScore: assessmentResponses.satisfactionScore, satisfactionAnswerCount: assessmentResponses.satisfactionAnswerCount, satisfactionComment: assessmentResponses.satisfactionComment,
    cesdAnswers: assessmentResponses.cesdAnswers, pssAnswers: assessmentResponses.pssAnswers, satisfactionAnswers: assessmentResponses.satisfactionAnswers,
    personalDataConsent: studentAssessmentCurrent.personalDataConsent, personalDataConsentAt: studentAssessmentCurrent.personalDataConsentAt,
    counselingContactConsent: studentAssessmentCurrent.counselingContactConsent, counselingContactConsentAt: studentAssessmentCurrent.counselingContactConsentAt,
    createdAt: assessmentResponses.createdAt,
  }).from(studentAssessmentCurrent).innerJoin(assessmentResponses, eq(studentAssessmentCurrent.responseId, assessmentResponses.id)).where(departmentFilter ? eq(studentAssessmentCurrent.department, departmentFilter) : undefined).orderBy(desc(assessmentResponses.createdAt));
}

export async function getCounselingContactCandidates(limit = 100, department?: string) {
  const db = await getDb();
  if (!db) return [];
  const departmentFilter = normalizedDepartment(department);
  return db.select({
    id: assessmentResponses.id, studentName: studentAssessmentCurrent.studentName, studentId: studentAssessmentCurrent.studentId, department: studentAssessmentCurrent.department,
    cesdScore: assessmentResponses.cesdScore, pssScore: assessmentResponses.pssScore,
    counselingContactConsent: studentAssessmentCurrent.counselingContactConsent, counselingContactConsentAt: studentAssessmentCurrent.counselingContactConsentAt, createdAt: assessmentResponses.createdAt,
  }).from(studentAssessmentCurrent).innerJoin(assessmentResponses, eq(studentAssessmentCurrent.responseId, assessmentResponses.id)).where(and(eq(studentAssessmentCurrent.counselingContactConsent, true), departmentFilter ? eq(studentAssessmentCurrent.department, departmentFilter) : undefined)).orderBy(desc(assessmentResponses.createdAt)).limit(limit);
}

export async function getAssessmentStats(department?: string) {
  const db = await getDb();
  const emptyLocales: Record<SupportedLocale, number> = { ko: 0, en: 0, ja: 0 };
  if (!db) return { totalResponses: 0, averageCesd: 0, averagePss: 0, averageSatisfaction: 0, localeCounts: emptyLocales };
  const departmentFilter = normalizedDepartment(department);
  const records = await db.select().from(assessmentResponses).innerJoin(studentAssessmentCurrent, eq(studentAssessmentCurrent.responseId, assessmentResponses.id)).where(departmentFilter ? eq(studentAssessmentCurrent.department, departmentFilter) : undefined);
  const totalResponses = records.length;
  if (totalResponses === 0) return { totalResponses, averageCesd: 0, averagePss: 0, averageSatisfaction: 0, localeCounts: emptyLocales };
  let cesdTotal = 0; let pssTotal = 0; let satisfactionTotal = 0; let satisfactionCount = 0;
  records.forEach(({ assessment_responses: response }) => {
    cesdTotal += response.cesdScore;
    pssTotal += response.pssScore;
    satisfactionTotal += response.satisfactionScore;
    satisfactionCount += response.satisfactionAnswerCount;
    if (response.locale in emptyLocales) emptyLocales[response.locale as SupportedLocale] += 1;
  });
  return {
    totalResponses,
    averageCesd: cesdTotal / totalResponses,
    averagePss: pssTotal / totalResponses,
    averageSatisfaction: satisfactionCount ? satisfactionTotal / satisfactionCount : 0,
    localeCounts: emptyLocales,
  };
}

const COUNSELING_APPLICATION_URL_KEY = "counseling_application_url";

export async function getCounselingApplicationUrl() {
  const db = await getDb();
  if (!db) return "";
  const rows = await db.select({ value: stationSettings.settingValue }).from(stationSettings).where(eq(stationSettings.settingKey, COUNSELING_APPLICATION_URL_KEY)).limit(1);
  return rows[0]?.value ?? "";
}

export async function updateCounselingApplicationUrl(url: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available.");
  await db.insert(stationSettings).values({ settingKey: COUNSELING_APPLICATION_URL_KEY, settingValue: url }).onDuplicateKeyUpdate({ set: { settingValue: url, updatedAt: new Date() } });
  return { counselingApplicationUrl: url };
}
