import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "../_core/context";

const mocks = vi.hoisted(() => ({ getAssessmentStats: vi.fn(), getCounselingApplicationUrl: vi.fn(), getCounselingContactCandidates: vi.fn(), getDepartmentOptions: vi.fn(), getIdentifiedAssessmentResponses: vi.fn(), getRawAssessmentExportRows: vi.fn(), saveAssessmentResponse: vi.fn(), updateCounselingApplicationUrl: vi.fn() }));
vi.mock("../_core/env", () => ({ ENV: { ownerOpenId: "owner-test" } }));
vi.mock("../adminPassword", () => ({ hasAdministratorPasswordSession: () => true }));
vi.mock("../db", () => ({ getCounselingApplicationUrl: mocks.getCounselingApplicationUrl, updateCounselingApplicationUrl: mocks.updateCounselingApplicationUrl }));
vi.mock("../studentRecordsDb", () => ({ getAssessmentStats: mocks.getAssessmentStats, getCounselingContactCandidates: mocks.getCounselingContactCandidates, getDepartmentOptions: mocks.getDepartmentOptions, getIdentifiedAssessmentResponses: mocks.getIdentifiedAssessmentResponses, getRawAssessmentExportRows: mocks.getRawAssessmentExportRows, saveAssessmentResponse: mocks.saveAssessmentResponse }));

import { assessmentRouter } from "./assessment";
const ownerContext = { user: { openId: "owner-test", role: "admin" } } as unknown as TrpcContext;
const nonOwnerContext = { user: { openId: "another-admin", role: "admin" } } as unknown as TrpcContext;

describe("healing play assessment router", () => {
  beforeEach(() => { Object.values(mocks).forEach(mock => mock.mockReset()); mocks.saveAssessmentResponse.mockResolvedValue({ success: true }); mocks.getAssessmentStats.mockResolvedValue({ totalResponses: 0, averageCesd: 0, averagePss: 0, averageSatisfaction: 0, localeCounts: { ko: 0, en: 0, ja: 0 } }); mocks.getCounselingApplicationUrl.mockResolvedValue(""); mocks.updateCounselingApplicationUrl.mockResolvedValue({ counselingApplicationUrl: "https://counsel.example.edu/apply" }); mocks.getDepartmentOptions.mockResolvedValue([]); mocks.getIdentifiedAssessmentResponses.mockResolvedValue([]); mocks.getCounselingContactCandidates.mockResolvedValue([]); mocks.getRawAssessmentExportRows.mockResolvedValue([]); });
  it("scores a consented response and records rated and free-text satisfaction answers", async () => {
    const satisfactionAnswers = [1, 2, 3, 4, 5].map(value => ({ questionId: `satisfaction-${value}`, questionType: "likert" as const, value: 5 })).concat({ questionId: "satisfaction-6", questionType: "textarea" as const, text: "좋았습니다." });
    const result = await assessmentRouter.createCaller({} as TrpcContext).submit({ anonymousSessionId: "e995be3f-8e37-4580-af8d-85fdc84c89eb", locale: "ko", studentName: "홍길동", studentId: "20261234", department: "성장학과", personalDataConsent: true, counselingContactConsent: true, cesdAnswers: Array(20).fill(0), pssAnswers: Array(10).fill(0), satisfactionAnswers });
    expect(result).toMatchObject({ cesdScore: 12, pssScore: 20, satisfactionAnswerCount: 5 });
    expect(mocks.saveAssessmentResponse).toHaveBeenCalledWith(expect.objectContaining({ department: "성장학과", satisfactionAnswers }));
  });
  it("rejects submission without the required personal-data consent", async () => {
    await expect(assessmentRouter.createCaller({} as TrpcContext).submit({ anonymousSessionId: "e995be3f-8e37-4580-af8d-85fdc84c89eb", locale: "ko", studentName: "홍길동", studentId: "20261234", department: "성장학과", personalDataConsent: false, counselingContactConsent: false, cesdAnswers: Array(20).fill(0), pssAnswers: Array(10).fill(0), satisfactionAnswers: [] } as never)).rejects.toThrow();
    expect(mocks.saveAssessmentResponse).not.toHaveBeenCalled();
  });
  it("applies the selected department to owner-only summary and raw-export calls", async () => {
    const caller = assessmentRouter.createCaller(ownerContext); await caller.stats({ department: "성장학과" }); await caller.rawExport({ department: "성장학과" });
    expect(mocks.getAssessmentStats).toHaveBeenCalledWith("성장학과"); expect(mocks.getRawAssessmentExportRows).toHaveBeenCalledWith("성장학과");
  });
  it("parses satisfaction answers for the owner-only raw export", async () => {
    mocks.getRawAssessmentExportRows.mockResolvedValue([{ id: 3, studentName: "홍길동", studentId: "20261234", department: "성장학과", locale: "ko", cesdScore: 16, pssScore: 12, satisfactionScore: 8, satisfactionAnswerCount: 2, satisfactionComment: "참여 소감", cesdAnswers: JSON.stringify(Array(20).fill(1)), pssAnswers: JSON.stringify(Array(10).fill(2)), satisfactionAnswers: JSON.stringify([{ questionId: "satisfaction-1", questionType: "likert", value: 4 }, { questionId: "satisfaction-6", questionType: "textarea", text: "참여 소감" }]), personalDataConsent: true, personalDataConsentAt: new Date(), counselingContactConsent: false, counselingContactConsentAt: null, createdAt: new Date() }]);
    const rows = await assessmentRouter.createCaller(ownerContext).rawExport(); expect(rows[0]).toMatchObject({ satisfactionComment: "참여 소감", satisfactionAnswers: [{ questionId: "satisfaction-1", questionType: "likert", value: 4 }, { questionId: "satisfaction-6", questionType: "textarea", text: "참여 소감" }] });
  });
  it("keeps owner list and raw export at one latest row per student number", async () => {
    const latestRow = { id: 27, studentName: "최신 이름", studentId: "20261234", department: "최신 학과", cesdScore: 18, pssScore: 12, satisfactionScore: 20, satisfactionAnswerCount: 5, satisfactionComment: "최신 의견", counselingContactConsent: true, createdAt: new Date("2026-08-02T01:00:00Z") };
    mocks.getIdentifiedAssessmentResponses.mockResolvedValue([latestRow]);
    mocks.getRawAssessmentExportRows.mockResolvedValue([{ ...latestRow, locale: "ko", cesdAnswers: JSON.stringify(Array(20).fill(1)), pssAnswers: JSON.stringify(Array(10).fill(2)), satisfactionAnswers: "[]", personalDataConsent: true, personalDataConsentAt: new Date(), counselingContactConsentAt: new Date() }]);
    mocks.getAssessmentStats.mockResolvedValue({ totalResponses: 1, averageCesd: 18, averagePss: 12, averageSatisfaction: 4, localeCounts: { ko: 1, en: 0, ja: 0 } });
    const caller = assessmentRouter.createCaller(ownerContext);
    await expect(caller.ownerList()).resolves.toHaveLength(1);
    await expect(caller.rawExport()).resolves.toHaveLength(1);
    await expect(caller.stats()).resolves.toMatchObject({ totalResponses: 1 });
  });
  it("returns a free-text satisfaction comment only through the owner list", async () => {
    mocks.getIdentifiedAssessmentResponses.mockResolvedValue([{ id: 4, studentName: "홍길동", studentId: "20261234", department: "성장학과", cesdScore: 12, pssScore: 8, satisfactionScore: 20, satisfactionAnswerCount: 5, satisfactionComment: "다음에도 참여하고 싶습니다.", counselingContactConsent: false, createdAt: new Date() }]);
    const rows = await assessmentRouter.createCaller(ownerContext).ownerList();
    expect(rows[0]).toMatchObject({ satisfactionComment: "다음에도 참여하고 싶습니다." });
    await expect(assessmentRouter.createCaller(nonOwnerContext).ownerList()).rejects.toThrow();
  });
  it("does not expose student records to a different administrator", async () => {
    const caller = assessmentRouter.createCaller(nonOwnerContext); await expect(caller.ownerList()).rejects.toThrow(); await expect(caller.rawExport()).rejects.toThrow(); expect(mocks.getIdentifiedAssessmentResponses).not.toHaveBeenCalled(); expect(mocks.getRawAssessmentExportRows).not.toHaveBeenCalled();
  });
  it("exposes a counseling link publicly but allows only the owner to change a valid URL", async () => {
    mocks.getCounselingApplicationUrl.mockResolvedValue("https://counsel.example.edu/apply");
    await expect(assessmentRouter.createCaller({} as TrpcContext).publicSettings()).resolves.toEqual({ counselingApplicationUrl: "https://counsel.example.edu/apply" });
    await expect(assessmentRouter.createCaller(ownerContext).updateCounselingApplicationUrl({ counselingApplicationUrl: "https://counsel.example.edu/apply" })).resolves.toEqual({ counselingApplicationUrl: "https://counsel.example.edu/apply" });
    await expect(assessmentRouter.createCaller(ownerContext).updateCounselingApplicationUrl({ counselingApplicationUrl: "mailto:counsel@example.edu" })).rejects.toThrow();
    await expect(assessmentRouter.createCaller(nonOwnerContext).updateCounselingApplicationUrl({ counselingApplicationUrl: "https://counsel.example.edu/apply" })).rejects.toThrow();
  });
});
