import { z } from "zod";
import {
  getCounselingApplicationUrl,
  updateCounselingApplicationUrl,
} from "../db";
import { getAssessmentStats, getCounselingContactCandidates, getDepartmentOptions, getIdentifiedAssessmentResponses, getRawAssessmentExportRows, saveAssessmentResponse } from "../studentRecordsDb";
import { administratorPasswordProcedure, ownerProcedure, publicProcedure, router } from "../_core/trpc";

const localeSchema = z.enum(["ko", "en", "ja"]);
const departmentFilterSchema = z.object({ department: z.string().trim().min(1).max(160).optional() }).optional();
const satisfactionAnswerSchema = z.discriminatedUnion("questionType", [
  z.object({ questionId: z.string().min(1).max(64), questionType: z.literal("likert"), value: z.number().int().min(1).max(5) }),
  z.object({ questionId: z.string().min(1).max(64), questionType: z.literal("textarea"), text: z.string().trim().min(1).max(2000) }),
]);

function parseNumericAnswers(serialized: string) {
  try { const parsed = z.array(z.number().int()).safeParse(JSON.parse(serialized)); return parsed.success ? parsed.data : []; } catch { return []; }
}
function parseSatisfactionAnswers(serialized: string) {
  try { const parsed = z.array(satisfactionAnswerSchema).safeParse(JSON.parse(serialized)); return parsed.success ? parsed.data : []; } catch { return []; }
}

export const assessmentRouter = router({
  ownerAccess: ownerProcedure.query(() => true as const),
  submit: publicProcedure.input(z.object({
    anonymousSessionId: z.string().uuid(), locale: localeSchema, studentName: z.string().trim().min(1).max(120), studentId: z.string().trim().min(1).max(64), department: z.string().trim().min(1).max(160), contactNumber: z.string().trim().min(7).max(30).regex(/^[0-9+()\- ]+$/, "연락처는 숫자와 +, -, 공백, 괄호만 사용할 수 있습니다."),
    personalDataConsent: z.literal(true), counselingContactConsent: z.boolean(),
    cesdAnswers: z.array(z.number().int().min(0).max(3)).length(20), pssAnswers: z.array(z.number().int().min(0).max(4)).length(10),
    satisfactionAnswers: z.array(satisfactionAnswerSchema).max(6),
  })).mutation(async ({ input }) => {
    const { scoreCesd, scorePss } = await import("../assessmentUtils");
    const cesdScore = scoreCesd(input.cesdAnswers); const pssScore = scorePss(input.pssAnswers);
    await saveAssessmentResponse({ ...input, cesdScore, pssScore });
    return { cesdScore, pssScore, satisfactionAnswerCount: input.satisfactionAnswers.filter(answer => answer.questionType === "likert").length };
  }),
  ownerList: administratorPasswordProcedure.input(departmentFilterSchema).query(({ input }) => getIdentifiedAssessmentResponses(100, input?.department)),
  contactCandidates: administratorPasswordProcedure.input(departmentFilterSchema).query(({ input }) => getCounselingContactCandidates(100, input?.department)),
  departments: administratorPasswordProcedure.query(() => getDepartmentOptions()),
  stats: administratorPasswordProcedure.input(departmentFilterSchema).query(({ input }) => getAssessmentStats(input?.department)),
  rawExport: administratorPasswordProcedure.input(departmentFilterSchema).mutation(async ({ input }) => {
    const rows = await getRawAssessmentExportRows(input?.department);
    return rows.map(row => ({ ...row, cesdAnswers: parseNumericAnswers(row.cesdAnswers), pssAnswers: parseNumericAnswers(row.pssAnswers), satisfactionAnswers: parseSatisfactionAnswers(row.satisfactionAnswers) }));
  }),
  publicSettings: publicProcedure.query(async () => ({ counselingApplicationUrl: await getCounselingApplicationUrl() })),
  ownerSettings: administratorPasswordProcedure.query(async () => ({ counselingApplicationUrl: await getCounselingApplicationUrl() })),
  updateCounselingApplicationUrl: administratorPasswordProcedure.input(z.object({ counselingApplicationUrl: z.string().trim().max(2048).refine(value => value === "" || /^https?:\/\//i.test(value), "상담 신청 링크는 http 또는 https URL이어야 합니다.") })).mutation(({ input }) => updateCounselingApplicationUrl(input.counselingApplicationUrl)),
});
