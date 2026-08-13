import * as XLSX from "xlsx";

export type RawAssessmentExportRecord = {
  id: number; studentName: string; studentId: string; contactNumber: string; department: string; locale: "ko" | "en" | "ja";
  cesdScore: number; pssScore: number; satisfactionScore: number; satisfactionAnswerCount: number; satisfactionComment: string | null;
  cesdAnswers: string; pssAnswers: string; satisfactionAnswers: string;
  personalDataConsent: boolean; personalDataConsentAt: Date | string; counselingContactConsent: boolean; counselingContactConsentAt: Date | string | null; createdAt: Date | string;
};

type SatisfactionAnswer = { questionId: string; questionType: "likert"; value: number } | { questionId: string; questionType: "textarea"; text: string };

function formatTimestamp(value: Date | string | null) { if (!value) return ""; const date = value instanceof Date ? value : new Date(value); return Number.isNaN(date.getTime()) ? String(value) : date.toISOString(); }
function protectText(value: unknown) { const text = value === null || value === undefined ? "" : String(value); return /^[=+\-@]/.test(text) ? `'${text}` : text; }
function parseNumberList(value: string) { try { const parsed: unknown = JSON.parse(value); return Array.isArray(parsed) ? parsed.filter(item => typeof item === "number") : []; } catch { return []; } }
function parseSatisfactionList(value: string): SatisfactionAnswer[] { try { const parsed: unknown = JSON.parse(value); return Array.isArray(parsed) ? parsed.filter((item): item is SatisfactionAnswer => typeof item === "object" && item !== null && typeof (item as { questionId?: unknown }).questionId === "string" && ((item as { questionType?: unknown }).questionType === "likert" || (item as { questionType?: unknown }).questionType === "textarea")) : []; } catch { return []; } }
function widthForHeader(header: string) { if (header === "만족도_6번_주관식_소감") return 44; if (header.includes("시각")) return 26; if (["성명", "학번", "학과", "연락처"].includes(header)) return 18; if (header.startsWith("CES-D_") || header.startsWith("PSS-10_") || header.startsWith("만족도_응답_")) return 15; return Math.max(14, Math.min(28, header.length + 5)); }

export function buildRawAssessmentXlsx(rows: RawAssessmentExportRecord[]) {
  const parsedRows = rows.map(row => ({ ...row, cesd: parseNumberList(row.cesdAnswers), pss: parseNumberList(row.pssAnswers), satisfaction: parseSatisfactionList(row.satisfactionAnswers) }));
  const questionIds = Array.from(new Set(parsedRows.flatMap(row => row.satisfaction.filter((answer): answer is Extract<SatisfactionAnswer, { questionType: "likert" }> => answer.questionType === "likert").map(answer => answer.questionId))));
  const headers = ["응답_ID", "제출_시각_UTC", "언어", "성명", "연락처", "학번", "학과", "만족도_6번_주관식_소감", "개인정보_수집이용_동의", "개인정보_동의시각_UTC", "상담센터_연락_동의", "상담센터_연락_동의시각_UTC", "CES-D_총점", "PSS-10_총점", "만족도_총점", "만족도_응답수", ...Array.from({ length: 20 }, (_, index) => `CES-D_${index + 1}`), ...Array.from({ length: 10 }, (_, index) => `PSS-10_${index + 1}`), ...questionIds.map(questionId => `만족도_응답_${questionId}`)];
  const records = parsedRows.map(row => {
    const ratings = new Map(row.satisfaction.filter((answer): answer is Extract<SatisfactionAnswer, { questionType: "likert" }> => answer.questionType === "likert").map(answer => [answer.questionId, answer.value]));
    return [row.id, formatTimestamp(row.createdAt), row.locale, protectText(row.studentName), protectText(row.contactNumber), row.studentId, protectText(row.department), protectText(row.satisfactionComment), row.personalDataConsent ? "동의" : "미동의", formatTimestamp(row.personalDataConsentAt), row.counselingContactConsent ? "동의" : "미동의", formatTimestamp(row.counselingContactConsentAt), row.cesdScore, row.pssScore, row.satisfactionScore, row.satisfactionAnswerCount, ...Array.from({ length: 20 }, (_, index) => row.cesd[index] ?? ""), ...Array.from({ length: 10 }, (_, index) => row.pss[index] ?? ""), ...questionIds.map(questionId => ratings.get(questionId) ?? "")];
  });
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...records]);
  worksheet["!cols"] = headers.map(widthForHeader).map(wch => ({ wch }));
  worksheet["!rows"] = [{ hpt: 24 }];
  worksheet["!autofilter"] = { ref: XLSX.utils.encode_range(XLSX.utils.decode_range(worksheet["!ref"] ?? "A1")) };
  const workbook = XLSX.utils.book_new();
  const commentsWorksheet = XLSX.utils.aoa_to_sheet([["응답_ID", "제출_시각_UTC", "성명", "연락처", "학번", "학과", "만족도_6번_주관식_소감"], ...parsedRows.filter(row => Boolean(row.satisfactionComment?.trim())).map(row => [row.id, formatTimestamp(row.createdAt), protectText(row.studentName), protectText(row.contactNumber), row.studentId, protectText(row.department), protectText(row.satisfactionComment)])]);
  commentsWorksheet["!cols"] = [{ wch: 12 }, { wch: 26 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 50 }];
  commentsWorksheet["!rows"] = [{ hpt: 24 }];
  commentsWorksheet["!autofilter"] = { ref: XLSX.utils.encode_range(XLSX.utils.decode_range(commentsWorksheet["!ref"] ?? "A1")) };
  XLSX.utils.book_append_sheet(workbook, commentsWorksheet, "주관식 소감");
  XLSX.utils.book_append_sheet(workbook, worksheet, "원자료");
  return XLSX.write(workbook, { bookType: "xlsx", type: "buffer", compression: true });
}
