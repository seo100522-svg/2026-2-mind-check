import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/contexts/LanguageContext", () => ({ useLanguage: () => ({ locale: "ko", setLocale: vi.fn() }) }));

import { IntakeCard } from "./Home";

describe("당첨 안내용 연락처 기본정보", () => {
  it("renders a required telephone input and purpose notice", () => {
    const html = renderToStaticMarkup(<IntakeCard student={{ studentName: "홍길동", studentId: "20261234", department: "성장학과", contactNumber: "010-1234-5678", personalDataConsent: true, counselingContactConsent: false }} onChange={() => undefined} onBack={() => undefined} onContinue={() => undefined} />);
    expect(html).toContain("연락처");
    expect(html).toContain("결과에 따라 안내를 받을 번호를 입력해주세요.");
    expect(html).toContain('type="tel"');
    expect(html).toContain("required");
  });
});
