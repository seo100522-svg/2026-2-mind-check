import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getDb: vi.fn(), limit: vi.fn() }));
vi.mock("./_core/env", () => ({ ENV: { ownerOpenId: "configured-owner" } }));
vi.mock("./db", () => ({ getDb: mocks.getDb }));

import { isProjectOwner } from "./ownerAccess";

const legacyAdmin = { id: 17, openId: "legacy-owner", role: "admin" } as never;

describe("isProjectOwner", () => {
  beforeEach(() => { mocks.getDb.mockReset(); mocks.limit.mockReset(); mocks.getDb.mockResolvedValue({ select: () => ({ from: () => ({ where: () => ({ limit: mocks.limit }) }) }) }); });
  it("allows the configured project owner without querying the database", async () => {
    await expect(isProjectOwner({ ...legacyAdmin, openId: "configured-owner" })).resolves.toBe(true);
    expect(mocks.getDb).not.toHaveBeenCalled();
  });
  it("allows the legacy administrator when exactly one administrator OpenID matches", async () => {
    mocks.limit.mockResolvedValue([{ openId: "legacy-owner" }]);
    await expect(isProjectOwner(legacyAdmin)).resolves.toBe(true);
  });
  it("does not expand sensitive access when multiple administrators exist", async () => {
    mocks.limit.mockResolvedValue([{ openId: "legacy-owner" }, { openId: "another-admin" }]);
    await expect(isProjectOwner(legacyAdmin)).resolves.toBe(false);
  });
  it("rejects users without the administrator role", async () => {
    await expect(isProjectOwner({ ...legacyAdmin, role: "user" })).resolves.toBe(false);
  });
});
