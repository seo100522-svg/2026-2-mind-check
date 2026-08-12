import { describe, expect, it } from "vitest";
import { studentAssessmentCurrent } from "../drizzle/schema";
import { getAssessmentStats, getDb, getIdentifiedAssessmentResponses, getRawAssessmentExportRows } from "./db";

describe("student current-record read-only integration", () => {
  it("returns one latest record per student from owner list, statistics, and raw export", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database is required for the current-student integration test.");

    const currentRows = await db.select({ studentId: studentAssessmentCurrent.studentId, responseId: studentAssessmentCurrent.responseId }).from(studentAssessmentCurrent);
    const ownerRows = await getIdentifiedAssessmentResponses(10000);
    const rawRows = await getRawAssessmentExportRows();
    const stats = await getAssessmentStats();

    const currentStudentIds = new Set(currentRows.map(row => row.studentId));
    expect(currentStudentIds.size).toBe(currentRows.length);
    expect(new Set(ownerRows.map(row => row.studentId)).size).toBe(ownerRows.length);
    expect(new Set(rawRows.map(row => row.studentId)).size).toBe(rawRows.length);
    expect(ownerRows).toHaveLength(currentRows.length);
    expect(rawRows).toHaveLength(currentRows.length);
    expect(stats.totalResponses).toBe(currentRows.length);
    expect(new Set(ownerRows.map(row => row.id))).toEqual(new Set(currentRows.map(row => row.responseId)));
    expect(new Set(rawRows.map(row => row.id))).toEqual(new Set(currentRows.map(row => row.responseId)));
  });
});
