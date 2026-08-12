import { describe, expect, it, vi } from "vitest";

vi.mock("./_core/env", () => ({ ENV: { cookieSecret: "password-session-test-secret", adminAccessPassword: process.env.ADMIN_ACCESS_PASSWORD ?? "" } }));

import { ADMIN_PASSWORD_COOKIE, hasAdministratorPasswordSession, issueAdministratorPasswordSession } from "./adminPassword";

describe("administrator password session", () => {
  it("issues a signed, user-bound password session cookie", () => {
    const res = { cookie: vi.fn() };
    issueAdministratorPasswordSession({ headers: {}, protocol: "https" } as never, res as never, "owner-open-id");
    const [cookieName, token] = res.cookie.mock.calls[0];
    expect(cookieName).toBe(ADMIN_PASSWORD_COOKIE);
    expect(hasAdministratorPasswordSession({ headers: { cookie: `${cookieName}=${token}` } } as never, "owner-open-id")).toBe(true);
    expect(hasAdministratorPasswordSession({ headers: { cookie: `${cookieName}=${token}` } } as never, "other-open-id")).toBe(false);
  });
});
