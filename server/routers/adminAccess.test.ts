import { describe, expect, it, vi } from "vitest";

const secret = vi.hoisted(() => process.env.ADMIN_ACCESS_PASSWORD);
vi.mock("../_core/env", () => ({ ENV: { ownerOpenId: "owner-test", cookieSecret: "test-cookie-secret", adminAccessPassword: secret } }));

import { adminAccessRouter } from "./adminAccess";

describe("admin password access", () => {
  it("accepts the configured administrator password through the protected verification endpoint", async () => {
    expect(secret).toBeTruthy();
    const res = { cookie: vi.fn() };
    const caller = adminAccessRouter.createCaller({ user: { openId: "owner-test", role: "admin" }, req: { headers: {} }, res } as never);
    await expect(caller.verifyPassword({ password: secret ?? "" })).resolves.toEqual({ unlocked: true });
    expect(res.cookie).toHaveBeenCalledOnce();
  });
  it("rejects an incorrect password", async () => {
    const caller = adminAccessRouter.createCaller({ user: { openId: "owner-test", role: "admin" }, req: { headers: {} }, res: { cookie: vi.fn() } } as never);
    await expect(caller.verifyPassword({ password: "incorrect" })).rejects.toThrow("관리자 비밀번호가 올바르지 않습니다.");
  });
});
