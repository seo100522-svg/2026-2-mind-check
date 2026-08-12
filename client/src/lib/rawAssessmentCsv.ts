import * as XLSX from "xlsx";

export type RawSatisfactionAnswer = { questionId: string; questionType: "likert"; value: number } | { questionId: string; questionType: "textarea"; text: string };
export type RawAssessmentExportRow = {
  id: number; studentName: string; studentId: string; department: string; locale: "ko" | "en" | "ja";
  cesdScore: number; pssScore: number; satisfactionScore: number; satisfactionAnswerCount: number; satisfactionComment?: string | null;
  cesdAnswers: number[]; pssAnswers: number[]; satisfactionAnswers: RawSatisfactionAnswer[];
  personalDataConsent: boolean; personalDataConsentAt: Date | string; counselingContactConsent: boolean; counselingContactConsentAt: Date | string | null; createdAt: Date | string;
};
function formatTimestamp(value: Date | string | null) { if (!value) return ""; const date = value instanceof Date ? value : new Date(value); return Number.isNaN(date.getTime()) ? String(value) : date.toISOString(); }
function protectSpreadsheetText(value: unknown) { const text = value === null || value === undefined ? "" : String(value); return /^[=+\-@]/.test(text) ? `'${text}` : text; }
function escapeCsvCell(value: unknown) { return `"${protectSpreadsheetText(value).replace(/"/g, '""')}"`; }
function timestampValue(value: Date | string) { const date = value instanceof Date ? value : new Date(value); return Number.isNaN(date.getTime()) ? 0 : date.getTime(); }
export function buildRawAssessmentExportTable(rows: RawAssessmentExportRow[]) {
  const latestByStudent = new Map<string, RawAssessmentExportRow>();
  rows.forEach(row => {
    const current = latestByStudent.get(row.studentId);
    if (!current || timestampValue(row.createdAt) >= timestampValue(current.createdAt)) latestByStudent.set(row.studentId, row);
  });
  const currentRows = Array.from(latestByStudent.values());
  const questionIds = Array.from(new Set(currentRows.flatMap(row => row.satisfactionAnswers.filter((answer): answer is Extract<RawSatisfactionAnswer, { questionType: "likert" }> => answer.questionType === "likert").map(answer => answer.questionId))));
  const headers = ["응답_ID", "제출_시각_UTC", "언어", "성명", "학번", "학과", "개인정보_수집이용_동의", "개인정보_동의시각_UTC", "상담센터_연락_동의", "상담센터_연락_동의시각_UTC", "CES-D_총점", "PSS-10_총점", "만족도_총점", "만족도_응답수", "만족도_주관식_의견", ...Array.from({ length: 20 }, (_, index) => `CES-D_${index + 1}`), ...Array.from({ length: 10 }, (_, index) => `PSS-10_${index + 1}`), ...questionIds.map(questionId => `만족도_응답_${questionId}`)];
  const records = currentRows.map(row => {
    const answers = new Map(row.satisfactionAnswers.filter((answer): answer is Extract<RawSatisfactionAnswer, { questionType: "likert" }> => answer.questionType === "likert").map(answer => [answer.questionId, answer.value]));
    const comment = row.satisfactionComment ?? row.satisfactionAnswers.find((answer): answer is Extract<RawSatisfactionAnswer, { questionType: "textarea" }> => answer.questionType === "textarea")?.text ?? "";
    return [row.id, formatTimestamp(row.createdAt), row.locale, row.studentName, row.studentId, row.department, row.personalDataConsent ? "동의" : "미동의", formatTimestamp(row.personalDataConsentAt), row.counselingContactConsent ? "동의" : "미동의", formatTimestamp(row.counselingContactConsentAt), row.cesdScore, row.pssScore, row.satisfactionScore, row.satisfactionAnswerCount, comment, ...Array.from({ length: 20 }, (_, index) => row.cesdAnswers[index] ?? ""), ...Array.from({ length: 10 }, (_, index) => row.pssAnswers[index] ?? ""), ...questionIds.map(questionId => answers.get(questionId) ?? "")];
  });
  return { headers, records };
}
export function buildRawAssessmentCsv(rows: RawAssessmentExportRow[]) {
  const { headers, records } = buildRawAssessmentExportTable(rows);
  return `\uFEFF${[headers, ...records].map(record => record.map(escapeCsvCell).join(",")).join("\r\n")}`;
}

function widthForHeader(header: string) {
  if (header === "만족도_주관식_의견") return 44;
  if (header.includes("시각")) return 26;
  if (["성명", "학번", "학과"].includes(header)) return 18;
  if (header.startsWith("CES-D_") || header.startsWith("PSS-10_") || header.startsWith("만족도_응답_")) return 15;
  return Math.max(14, Math.min(28, header.length + 5));
}

function isNumericExportHeader(header: string) {
  return header === "응답_ID" || header === "CES-D_총점" || header === "PSS-10_총점" || header === "만족도_총점" || header === "만족도_응답수" || /^CES-D_\d+$/.test(header) || /^PSS-10_\d+$/.test(header) || header.startsWith("만족도_응답_");
}

function prepareExcelWorksheet(worksheet: XLSX.WorkSheet) {
  const range = XLSX.utils.decode_range(worksheet["!ref"] ?? "A1");
  const headers = Array.from({ length: range.e.c + 1 }, (_, column) => String(worksheet[XLSX.utils.encode_cell({ r: 0, c: column })]?.v ?? ""));
  for (let row = 0; row <= range.e.r; row += 1) {
    for (let column = 0; column <= range.e.c; column += 1) {
      const address = XLSX.utils.encode_cell({ r: row, c: column });
      const cell = worksheet[address];
      if (!cell || typeof cell.v !== "string") continue;
      const header = headers[column] ?? "";
      if (row > 0 && isNumericExportHeader(header) && /^\d+(?:\.\d+)?$/.test(cell.v)) {
        cell.t = "n";
        cell.v = Number(cell.v);
        cell.z = "0";
        continue;
      }
      cell.t = "s";
      cell.v = protectSpreadsheetText(cell.v);
      cell.z = "@";
    }
  }
  worksheet["!cols"] = headers.map(widthForHeader).map(wch => ({ wch }));
  worksheet["!rows"] = [{ hpt: 24 }];
  worksheet["!autofilter"] = { ref: XLSX.utils.encode_range(range) };
}

export function buildRawAssessmentWorkbook(rows: RawAssessmentExportRow[]) {
  const { headers, records } = buildRawAssessmentExportTable(rows);
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...records]);
  prepareExcelWorksheet(worksheet);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "원자료");
  return workbook;
}

export function buildExcelWorkbookFromCsv(csv: string) {
  const workbook = XLSX.read(csv, { type: "string", raw: true, codepage: 65001 });
  const worksheet = workbook.Sheets[workbook.SheetNames[0] ?? ""];
  if (!worksheet) throw new Error("원자료를 엑셀 통합문서로 변환할 수 없습니다.");
  prepareExcelWorksheet(worksheet);
  return workbook;
}

export function toExcelFileName(fileName: string) { return fileName.replace(/\.csv$/i, ".xlsx"); }

export function createRawAssessmentExcelDownload(rows: RawAssessmentExportRow[], fileName: string) {
  const bytes = XLSX.write(buildRawAssessmentWorkbook(rows), { bookType: "xlsx", type: "array", compression: true });
  return { blob: new Blob([bytes], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), fileName: toExcelFileName(fileName) };
}

export function downloadRawAssessmentExcel(rows: RawAssessmentExportRow[], fileName: string) {
  const { blob, fileName: excelFileName } = createRawAssessmentExcelDownload(rows, fileName);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = excelFileName;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  window.setTimeout(() => { anchor.remove(); URL.revokeObjectURL(url); }, 0);
}

export function downloadCsv(csv: string, fileName: string) {
  XLSX.writeFile(buildExcelWorkbookFromCsv(csv), toExcelFileName(fileName), { bookType: "xlsx", compression: true });
}
