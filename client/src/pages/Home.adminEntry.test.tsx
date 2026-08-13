import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import React from "react";

const state = vi.hoisted(() => ({
  user: null as { id: number } | null,
  ownerAccess: undefined as boolean | undefined,
}));

vi.mock("@/contexts/LanguageContext", () => ({ useLanguage: () => ({ locale: "ko", setLocale: vi.fn() }) }));
vi.mock("@/_core/hooks/useAuth", () => ({ useAuth: () => ({ user: state.user, loading: false }) }));
vi.mock("@/lib/trpc", () => ({ trpc: { assessment: { ownerAccess: { useQuery: () => ({ data: state.ownerAccess }) } } } }));
vi.mock("wouter", () => ({ Link: ({ children }: { children: React.ReactNode }) => children }));

import { AppHeader } from "./Home";

describe("administrator entry in the public header", () => {
  it("always shows the administrator login action until owner access succeeds", () => {
    state.user = null;
    state.ownerAccess = undefined;
    expect(renderToStaticMarkup(<AppHeader />)).toContain("운영자 로그인");

    state.user = { id: 1 };
    state.ownerAccess = false;
    expect(renderToStaticMarkup(<AppHeader />)).toContain("운영자 로그인");
  });

  it("shows the administrator dashboard action after owner access succeeds", () => {
    state.user = { id: 1 };
    state.ownerAccess = true;
    const html = renderToStaticMarkup(<AppHeader />);
    expect(html).toContain("운영자 화면");
  });
});
