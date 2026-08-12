import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "../_core/context";

const mocks = vi.hoisted(() => ({ deactivateSatisfactionQuestion: vi.fn(), getSatisfactionQuestions: vi.fn(), upsertSatisfactionQuestion: vi.fn(), passwordSession: vi.fn() }));
vi.mock("../_core/env", () => ({ ENV: { ownerOpenId: "owner-test" } }));
vi.mock("../adminPassword", () => ({ hasAdministratorPasswordSession: mocks.passwordSession }));
vi.mock("../db", () => ({ deactivateSatisfactionQuestion: mocks.deactivateSatisfactionQuestion, getSatisfactionQuestions: mocks.getSatisfactionQuestions, upsertSatisfactionQuestion: mocks.upsertSatisfactionQuestion }));
import { satisfactionRouter } from "./satisfaction";

const ownerContext = { user: { openId: "owner-test", role: "admin" } } as unknown as TrpcContext;
const otherAdminContext = { user: { openId: "different-admin", role: "admin" } } as unknown as TrpcContext;
const question = { sortOrder: 1, questionType: "likert" as const, question: { ko: "프로그램은 즐거웠다.", en: "The program was enjoyable.", ja: "プログラムは楽しかった。" } };

describe("satisfaction router", () => {
  beforeEach(() => { mocks.getSatisfactionQuestions.mockReset(); mocks.upsertSatisfactionQuestion.mockReset(); mocks.deactivateSatisfactionQuestion.mockReset(); mocks.passwordSession.mockReset(); mocks.passwordSession.mockReturnValue(true); mocks.getSatisfactionQuestions.mockResolvedValue([]); mocks.upsertSatisfactionQuestion.mockResolvedValue({ id: "satisfaction-one", ...question, isActive: true }); mocks.deactivateSatisfactionQuestion.mockResolvedValue({ success: true }); });
  it("exposes only active questions through the public list", async () => { await satisfactionRouter.createCaller({} as TrpcContext).list(); expect(mocks.getSatisfactionQuestions).toHaveBeenCalledWith(); });
  it("allows only the owner to save a fully translated five-point survey question", async () => { const saved = await satisfactionRouter.createCaller(ownerContext).upsert(question); expect(saved).toMatchObject({ id: "satisfaction-one", question: question.question }); expect(mocks.upsertSatisfactionQuestion).toHaveBeenCalledWith(question); });
  it("rejects satisfaction management requests from a different administrator", async () => { await expect(satisfactionRouter.createCaller(otherAdminContext).upsert(question)).rejects.toThrow(); expect(mocks.upsertSatisfactionQuestion).not.toHaveBeenCalled(); });
  it("rejects an owner request before the administrator password is verified", async () => { mocks.passwordSession.mockReturnValue(false); await expect(satisfactionRouter.createCaller(ownerContext).upsert(question)).rejects.toThrow("관리자 비밀번호 확인이 필요합니다."); expect(mocks.upsertSatisfactionQuestion).not.toHaveBeenCalled(); });
});
