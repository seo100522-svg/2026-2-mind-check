import { describe, expect, it, vi } from "vitest";
import * as XLSX from "xlsx";
import { buildExcelWorkbookFromCsv, buildRawAssessmentCsv, buildRawAssessmentWorkbook, createRawAssessmentExcelDownload, downloadRawAssessmentExcel, toExcelFileName, type RawAssessmentExportRow } from "./rawAssessmentCsv";

describe("buildRawAssessmentCsv", () => {
  it("includes all requested raw fields, response columns, a UTF-8 BOM, and spreadsheet formula protection", () => {
    const rows: RawAssessmentExportRow[] = [{
      id: 1,
      studentName: "=HYPERLINK(\"https://example.com\")",
      studentId: "20261234",
      department: "성장학과",
      locale: "ko",
      cesdScore: 16,
      pssScore: 12,
      satisfactionScore: 10,
      satisfactionAnswerCount: 2,
      satisfactionComment: "다음에도 참여하고 싶습니다.",
      cesdAnswers: Array(20).fill(1),
      pssAnswers: Array(10).fill(2),
      satisfactionAnswers: [{ questionId: "satisfaction-1", questionType: "likert", value: 5 }, { questionId: "satisfaction-2", questionType: "likert", value: 5 }, { questionId: "satisfaction-6", questionType: "textarea", text: "다음에도 참여하고 싶습니다." }],
      personalDataConsent: true,
      personalDataConsentAt: new Date("2026-07-01T00:00:00Z"),
      counselingContactConsent: false,
      counselingContactConsentAt: null,
      createdAt: new Date("2026-07-01T01:00:00Z"),
    }];

    const csv = buildRawAssessmentCsv(rows);

    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toContain("성명");
    expect(csv).toContain("CES-D_20");
    expect(csv).toContain("PSS-10_10");
    expect(csv).toContain("만족도_응답_satisfaction-1");
    expect(csv).toContain("만족도_주관식_의견");
    expect(csv).toContain("다음에도 참여하고 싶습니다.");
    expect(csv).toContain("'=HYPERLINK");
  });
  it("keeps only the latest record when a student number appears more than once", () => {
    const base: RawAssessmentExportRow = {
      id: 1, studentName: "홍길동", studentId: "20261234", department: "성장학과", locale: "ko",
      cesdScore: 10, pssScore: 10, satisfactionScore: 20, satisfactionAnswerCount: 5, satisfactionComment: "첫 기록",
      cesdAnswers: Array(20).fill(1), pssAnswers: Array(10).fill(2), satisfactionAnswers: [],
      personalDataConsent: true, personalDataConsentAt: new Date("2026-07-01T00:00:00Z"), counselingContactConsent: false, counselingContactConsentAt: null, createdAt: new Date("2026-07-01T01:00:00Z"),
    };
    const csv = buildRawAssessmentCsv([base, { ...base, id: 2, cesdScore: 18, satisfactionComment: "최신 기록", createdAt: new Date("2026-07-02T01:00:00Z") }]);
    expect((csv.match(/20261234/g) ?? [])).toHaveLength(1);
    expect(csv).toContain("최신 기록");
    expect(csv).not.toContain("첫 기록");
  });
  it("creates an Excel workbook that preserves Korean text, text-formatted student IDs, and safe formula-like input", () => {
    const workbook = buildRawAssessmentWorkbook([{
      id: 1, studentName: "=HYPERLINK(\"https://example.com\")", studentId: "020261234", department: "성장학과", locale: "ko",
      cesdScore: 16, pssScore: 12, satisfactionScore: 10, satisfactionAnswerCount: 2, satisfactionComment: "다음에도 참여하고 싶습니다.",
      cesdAnswers: Array(20).fill(1), pssAnswers: Array(10).fill(2), satisfactionAnswers: [], personalDataConsent: true,
      personalDataConsentAt: new Date("2026-07-01T00:00:00Z"), counselingContactConsent: false, counselingContactConsentAt: null, createdAt: new Date("2026-07-01T01:00:00Z"),
    }]);
    expect(workbook.Sheets["원자료"]["!cols"]?.[4]?.wch).toBeGreaterThanOrEqual(18);
    const bytes = XLSX.write(workbook, { bookType: "xlsx", type: "array", compression: true });
    const reloaded = XLSX.read(bytes, { type: "array" });
    const worksheet = reloaded.Sheets["원자료"];
    expect(worksheet["D2"]?.v).toBe("'=HYPERLINK(\"https://example.com\")");
    expect(worksheet["E2"]?.v).toBe("020261234");
    expect(worksheet["E2"]?.t).toBe("s");
    expect(worksheet["F2"]?.v).toBe("성장학과");
  });
  it("converts the CSV download path to an xlsx workbook with a safe filename", () => {
    const csv = buildRawAssessmentCsv([{
      id: 1, studentName: "홍길동", studentId: "020261234", department: "성장학과", locale: "ko",
      cesdScore: 16, pssScore: 12, satisfactionScore: 5, satisfactionAnswerCount: 1, satisfactionComment: "한글 의견",
      cesdAnswers: Array(20).fill(1), pssAnswers: Array(10).fill(2), satisfactionAnswers: [{ questionId: "satisfaction-1", questionType: "likert", value: 5 }], personalDataConsent: true,
      personalDataConsentAt: new Date("2026-07-01T00:00:00Z"), counselingContactConsent: false, counselingContactConsentAt: null, createdAt: new Date("2026-07-01T01:00:00Z"),
    }]);
    const workbook = buildExcelWorkbookFromCsv(csv);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    expect(worksheet["D2"]?.v).toBe("홍길동");
    expect(worksheet["E2"]?.v).toBe("020261234");
    expect(worksheet["F2"]?.v).toBe("성장학과");
    expect(worksheet["P2"]?.v).toBe(1);
    expect(worksheet["AI2"]?.v).toBe(1);
    expect(worksheet["AJ2"]?.v).toBe(2);
    expect(worksheet["AS2"]?.v).toBe(2);
    expect(worksheet["AT2"]?.v).toBe(5);
    expect(toExcelFileName("healing-play-station-raw.csv")).toBe("healing-play-station-raw.xlsx");
  });
  it("creates a real XLSX binary with an xlsx filename without converting through CSV", async () => {
    const rows: RawAssessmentExportRow[] = [{
      id: 1, studentName: "홍길동", studentId: "020261234", department: "성장학과", locale: "ko",
      cesdScore: 16, pssScore: 12, satisfactionScore: 5, satisfactionAnswerCount: 1, satisfactionComment: "한글 의견",
      cesdAnswers: Array(20).fill(1), pssAnswers: Array(10).fill(2), satisfactionAnswers: [{ questionId: "satisfaction-1", questionType: "likert", value: 5 }], personalDataConsent: true,
      personalDataConsentAt: new Date("2026-07-01T00:00:00Z"), counselingContactConsent: false, counselingContactConsentAt: null, createdAt: new Date("2026-07-01T01:00:00Z"),
    }];
    const download = createRawAssessmentExcelDownload(rows, "healing-play-station-raw.csv");
    const bytes = new Uint8Array(await download.blob.arrayBuffer());
    const workbook = XLSX.read(bytes, { type: "array" });
    expect(download.fileName).toBe("healing-play-station-raw.xlsx");
    expect(download.blob.type).toBe("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    expect(String.fromCharCode(...bytes.slice(0, 2))).toBe("PK");
    expect(workbook.Sheets["원자료"]["F2"]?.v).toBe("성장학과");
  });
  it("passes an xlsx filename to the browser download anchor", () => {
    const click = vi.fn();
    const remove = vi.fn();
    const appendChild = vi.fn();
    const anchor = { href: "", download: "", style: {}, click, remove };
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("document", { createElement: vi.fn(() => anchor), body: { appendChild } });
    vi.stubGlobal("window", { setTimeout: (callback: () => void) => callback() });
    vi.stubGlobal("URL", { createObjectURL: vi.fn(() => "blob:test"), revokeObjectURL });
    try {
      downloadRawAssessmentExcel([{ id: 1, studentName: "홍길동", studentId: "020261234", department: "성장학과", locale: "ko", cesdScore: 16, pssScore: 12, satisfactionScore: 5, satisfactionAnswerCount: 1, satisfactionComment: null, cesdAnswers: Array(20).fill(1), pssAnswers: Array(10).fill(2), satisfactionAnswers: [], personalDataConsent: true, personalDataConsentAt: new Date("2026-07-01T00:00:00Z"), counselingContactConsent: false, counselingContactConsentAt: null, createdAt: new Date("2026-07-01T01:00:00Z") }], "healing-play-station-raw.csv");
      expect(anchor.download).toBe("healing-play-station-raw.xlsx");
      expect(click).toHaveBeenCalledOnce();
      expect(revokeObjectURL).toHaveBeenCalledWith("blob:test");
    } finally { vi.unstubAllGlobals(); }
  });
});
