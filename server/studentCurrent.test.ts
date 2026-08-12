import { describe, expect, it } from "vitest";
import { buildCurrentStudentRecord } from "./db";

describe("student current-record contract", () => {
  it("replaces a same-student submission with the newest response, identity, department, and consent values", () => {
    const first = buildCurrentStudentRecord({ studentId: "20261234", studentName: "첫 이름", department: "첫 학과", counselingContactConsent: false }, 11, new Date("2026-08-01T01:00:00Z"));
    const latest = buildCurrentStudentRecord({ studentId: "20261234", studentName: "최신 이름", department: "최신 학과", counselingContactConsent: true }, 27, new Date("2026-08-02T01:00:00Z"));
    const currentByStudentId = new Map([[first.studentId, first]]);
    currentByStudentId.set(latest.studentId, latest);

    expect(currentByStudentId).toHaveLength(1);
    expect(currentByStudentId.get("20261234")).toMatchObject({
      responseId: 27,
      studentName: "최신 이름",
      department: "최신 학과",
      counselingContactConsent: true,
      counselingContactConsentAt: new Date("2026-08-02T01:00:00Z"),
    });
  });
});
