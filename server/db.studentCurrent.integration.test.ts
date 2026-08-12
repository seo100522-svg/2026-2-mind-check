import { describe, expect, it } from "vitest";
import { assessmentResponses, studentAssessmentCurrent, studentAssessmentProfiles } from "../drizzle/schema";
import { saveAssessmentResponse } from "./db";

function createSubmission(overrides: Partial<{ studentName: string; studentId: string; department: string; counselingContactConsent: boolean }> = {}) {
  return {
    anonymousSessionId: "e995be3f-8e37-4580-af8d-85fdc84c89eb",
    locale: "ko" as const,
    studentName: "첫 이름",
    studentId: "20261234",
    department: "첫 학과",
    personalDataConsent: true as const,
    counselingContactConsent: false,
    cesdScore: 12,
    pssScore: 10,
    cesdAnswers: Array(20).fill(1),
    pssAnswers: Array(10).fill(2),
    satisfactionAnswers: [],
    ...overrides,
  };
}

describe("student current-record storage integration", () => {
  it("upserts the latest response and identity fields when the same student number submits again", async () => {
    const currentValues: Array<Record<string, unknown>> = [];
    const currentUpdateSets: Array<Record<string, unknown>> = [];
    let nextResponseId = 101;
    const tx = {
      insert: (table: unknown) => ({
        values: (value: Record<string, unknown>) => {
          if (table === assessmentResponses) return Promise.resolve([{ insertId: nextResponseId++ }]);
          if (table === studentAssessmentProfiles) return Promise.resolve([{ insertId: 1 }]);
          if (table === studentAssessmentCurrent) {
            currentValues.push(value);
            return { onDuplicateKeyUpdate: async ({ set }: { set: Record<string, unknown> }) => { currentUpdateSets.push(set); return [{ affectedRows: 1 }]; } };
          }
          return Promise.resolve([{ insertId: 1 }]);
        },
      }),
    };
    const database = {
      insert: () => ({ values: () => ({ onDuplicateKeyUpdate: async () => [{ affectedRows: 1 }] }) }),
      select: () => ({ from: () => ({ where: () => ({ limit: async () => [{ id: 7 }] }) }) }),
      transaction: async (callback: (transaction: typeof tx) => Promise<unknown>) => callback(tx),
    };

    await saveAssessmentResponse(createSubmission(), database as never);
    await saveAssessmentResponse(createSubmission({ studentName: "최신 이름", department: "최신 학과", counselingContactConsent: true }), database as never);

    expect(currentValues).toHaveLength(2);
    expect(currentUpdateSets).toHaveLength(2);
    expect(currentUpdateSets[1]).toMatchObject({
      studentId: "20261234",
      responseId: 102,
      studentName: "최신 이름",
      department: "최신 학과",
      counselingContactConsent: true,
    });
  });
});
