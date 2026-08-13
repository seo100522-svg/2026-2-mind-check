import { describe, expect, it } from "vitest";
import { buildKoreanStudentRecord } from "./studentRecordsDb";

describe("한글 학생 통합 기록", () => {
  it("stores one student submission with scores and satisfaction responses 1 through 6", () => {
    const submittedAt = new Date("2026-08-11T00:00:00Z");
    const record = buildKoreanStudentRecord({
      anonymousSessionId: "session", locale: "ko", studentName: "홍길동", studentId: "20261234", department: "성장학과", contactNumber: "010-1234-5678",
      personalDataConsent: true, counselingContactConsent: true, cesdScore: 19, pssScore: 14,
      cesdAnswers: Array(20).fill(1), pssAnswers: Array(10).fill(2),
      satisfactionAnswers: [
        { questionId: "satisfaction-1", questionType: "likert", value: 5 },
        { questionId: "satisfaction-2", questionType: "likert", value: 4 },
        { questionId: "satisfaction-3", questionType: "likert", value: 3 },
        { questionId: "satisfaction-4", questionType: "likert", value: 2 },
        { questionId: "satisfaction-5", questionType: "likert", value: 1 },
        { questionId: "satisfaction-6", questionType: "textarea", text: "다음에도 참여하고 싶습니다." },
      ],
    }, [
      { id: "satisfaction-1", sortOrder: 1, questionType: "likert" }, { id: "satisfaction-2", sortOrder: 2, questionType: "likert" }, { id: "satisfaction-3", sortOrder: 3, questionType: "likert" }, { id: "satisfaction-4", sortOrder: 4, questionType: "likert" }, { id: "satisfaction-5", sortOrder: 5, questionType: "likert" }, { id: "satisfaction-6", sortOrder: 6, questionType: "textarea" },
    ], submittedAt);
    expect(record).toMatchObject({ studentName: "홍길동", studentId: "20261234", department: "성장학과", contactNumber: "010-1234-5678", cesdScore: 19, pssScore: 14, satisfaction1: 5, satisfaction2: 4, satisfaction3: 3, satisfaction4: 2, satisfaction5: 1, satisfaction6: "다음에도 참여하고 싶습니다." });
  });
});
