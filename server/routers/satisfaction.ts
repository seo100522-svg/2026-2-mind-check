import { z } from "zod";
import { MAX_SATISFACTION_QUESTIONS } from "../satisfactionDefaults";
import { deactivateSatisfactionQuestion, getSatisfactionQuestions, upsertSatisfactionQuestion } from "../db";
import { administratorPasswordProcedure, publicProcedure, router } from "../_core/trpc";

const translationSchema = z.object({ ko: z.string().trim().min(1).max(2000), en: z.string().trim().min(1).max(2000), ja: z.string().trim().min(1).max(2000) });
const questionSchema = z.object({ id: z.string().min(1).max(64).optional(), sortOrder: z.number().int().min(1).max(999), question: translationSchema, questionType: z.enum(["likert", "textarea"]) });

export const satisfactionRouter = router({
  list: publicProcedure.query(() => getSatisfactionQuestions()),
  adminList: administratorPasswordProcedure.query(() => getSatisfactionQuestions({ includeInactive: true })),
  upsert: administratorPasswordProcedure.input(questionSchema).mutation(({ input }) => upsertSatisfactionQuestion(input)),
  remove: administratorPasswordProcedure.input(z.object({ id: z.string().min(1).max(64) })).mutation(({ input }) => deactivateSatisfactionQuestion(input.id)),
  maxQuestions: administratorPasswordProcedure.query(() => MAX_SATISFACTION_QUESTIONS),
});
