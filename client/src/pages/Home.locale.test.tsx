import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const language = vi.hoisted(() => ({ locale: "en" as "ko" | "en" | "ja" }));
vi.mock("@/contexts/LanguageContext", () => ({ useLanguage: () => ({ locale: language.locale, setLocale: vi.fn() }) }));

import { SATISFACTION_OPTIONS, STATION_COPY } from "@/data/stationContent";
import { getCesdResultGuidance, getPssResultGuidance } from "@/data/scoreResultGuidance";
import { DEFAULT_COUNSELING_APPLICATION_URL, getSatisfactionAccessibleLabel, PRIZE_CONTACT_COPY, QuestionnaireCard, ResultCard } from "./Home";

function renderSurvey(locale: "en" | "ja") {
  language.locale = locale;
  return renderToStaticMarkup(<QuestionnaireCard kind="satisfaction" questionIndex={0} total={1} question={locale === "en" ? "The station was fun." : "ステーションは楽しかった。"} options={SATISFACTION_OPTIONS.map(option => ({ value: option.value, label: option.label[locale] }))} onChoose={() => undefined} onBack={() => undefined} onNext={() => undefined} nextLabel="Next" />);
}

function renderResult(locale: "ko" | "en" | "ja", options: { cesdScore?: number; pssScore?: number; counselingApplicationUrl?: string } = {}) {
  language.locale = locale;
  return renderToStaticMarkup(<ResultCard result={{ cesdScore: options.cesdScore ?? 10, pssScore: options.pssScore ?? 12, counselingContactConsent: false, satisfactionAnswerCount: 5 }} counselingApplicationUrl={options.counselingApplicationUrl ?? ""} onRestart={() => undefined} />);
}

describe("localized public station experience", () => {
  it("renders the English satisfaction step and score-specific guidance", () => {
    expect(renderSurvey("en")).toContain(STATION_COPY.en.satisfactionTitle);
    expect(renderSurvey("en")).toContain(SATISFACTION_OPTIONS[0].label.en);
    expect(renderResult("en")).toContain(getCesdResultGuidance(10, "en").title);
  });
  it("renders the Japanese satisfaction step and score-specific guidance", () => {
    expect(renderSurvey("ja")).toContain(STATION_COPY.ja.satisfactionTitle);
    expect(renderSurvey("ja")).toContain(SATISFACTION_OPTIONS[4].label.ja);
    expect(renderResult("ja")).toContain(getPssResultGuidance(12, "ja").title);
  });
  it("renders the requested Korean guidance for each CES-D and PSS-10 score band", () => {
    expect(renderResult("ko", { cesdScore: 20, pssScore: 13 })).toContain("마음이 비교적 안정적이에요");
    expect(renderResult("ko", { cesdScore: 24, pssScore: 26 })).toContain("마음에 조금 더 관심이 필요해요");
    expect(renderResult("ko", { cesdScore: 25, pssScore: 27 })).toContain("지금은 적극적인 마음 돌봄이 필요해요");
    expect(renderResult("ko", { cesdScore: 25, pssScore: 27 })).toContain("적극적인 스트레스 관리가 필요해요");
    expect(renderResult("ko", { cesdScore: 25, pssScore: 27 })).toContain("CES-D는 우울증을 진단하는 검사가 아니라");
    expect(renderResult("ko", { cesdScore: 25, pssScore: 27 })).toContain("PSS-10은 최근 1개월 동안");
  });
  it("always renders tailored recovery tips and an official counselling link", () => {
    const html = renderResult("ko", { cesdScore: 25, pssScore: 27 });
    expect(html).toContain("오늘을 위한 회복 팁");
    expect(html).toContain("오늘 연락할 사람을 한 명 정해 보세요");
    expect(html).toContain("오늘 미룰 수 있는 일을 찾아보세요");
    expect(html).toContain(DEFAULT_COUNSELING_APPLICATION_URL);
  });
  it("renders the individual counselling call to action when an owner-configured URL is available", () => {
    const html = renderResult("en", { counselingApplicationUrl: "https://counsel.example.edu/apply" });
    expect(html).toContain(STATION_COPY.en.counselingButton);
    expect(html).toContain("https://counsel.example.edu/apply");
  });
  it("creates an icon-free accessible name for satisfaction option labels", () => {
    expect(getSatisfactionAccessibleLabel("😍 매우 만족")).toBe("매우 만족");
    expect(getSatisfactionAccessibleLabel("😣 Very dissatisfied")).toBe("Very dissatisfied");
  });
  it("explains prize-notification contact collection in every supported language", () => {
    expect(PRIZE_CONTACT_COPY.ko.label).toContain("당첨 안내용");
    expect(PRIZE_CONTACT_COPY.ko.collection).toContain("당첨될 경우 안내를 받을 수 있는 연락처");
    expect(PRIZE_CONTACT_COPY.en.label).toContain("prize notification");
    expect(PRIZE_CONTACT_COPY.ja.label).toContain("当選案内用");
  });
});
