import * as XLSX from "xlsx";
import { describe, expect, it } from "vitest";
import { buildRawAssessmentXlsx } from "./rawAssessmentXlsx";

describe("buildRawAssessmentXlsx", () => {
  it("creates an Excel binary with Korean text, a text student ID, scores, and answer columns", () => {
    const bytes = buildRawAssessmentXlsx([{
      id: 1, studentName: "홍길동", studentId: "020261234", department: "성장학과", locale: "ko", cesdScore: 16, pssScore: 12, satisfactionScore: 5, satisfactionAnswerCount: 1, satisfactionComment: "한글 의견",
      cesdAnswers: JSON.stringify(Array(20).fill(1)), pssAnswers: JSON.stringify(Array(10).fill(2)), satisfactionAnswers: JSON.stringify([{ questionId: "satisfaction-1", questionType: "likert", value: 5 }]),
      personalDataConsent: true, personalDataConsentAt: new Date("2026-08-11T00:00:00Z"), counselingContactConsent: false, counselingContactConsentAt: null, createdAt: new Date("2026-08-11T01:00:00Z"),
    }]);
    const workbook = XLSX.read(bytes, { type: "buffer" });
    const worksheet = workbook.Sheets["원자료"];
    expect(bytes.subarray(0, 2).toString()).toBe("PK");
    expect(worksheet["D2"]?.v).toBe("홍길동");
    expect(worksheet["E2"]?.v).toBe("020261234");
    expect(worksheet["F2"]?.v).toBe("성장학과");
    expect(worksheet["G1"]?.v).toBe("만족도_6번_주관식_소감");
    expect(worksheet["G2"]?.v).toBe("한글 의견");
    expect(worksheet["L2"]?.v).toBe(16);
    expect(worksheet["P2"]?.v).toBe(1);
    expect(worksheet["AJ2"]?.v).toBe(2);
    expect(worksheet["AT2"]?.v).toBe(5);
    expect(workbook.SheetNames[0]).toBe("주관식 소감");
    expect(workbook.Sheets["주관식 소감"]?.["F2"]?.v).toBe("한글 의견");
  });
});
