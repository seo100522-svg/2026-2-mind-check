import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const language = vi.hoisted(() => ({ locale: "en" as "en" | "ja" }));
vi.mock("@/contexts/LanguageContext", () => ({ useLanguage: () => ({ locale: language.locale, setLocale: vi.fn() }) }));

import { SATISFACTION_OPTIONS, STATION_COPY } from "@/data/stationContent";
import { RESULT_GUIDANCE } from "@/data/resultGuidance";
import { getSatisfactionAccessibleLabel, QuestionnaireCard, ResultCard } from "./Home";

function renderSurvey(locale: "en" | "ja") {
  language.locale = locale;
  return renderToStaticMarkup(<QuestionnaireCard kind="satisfaction" questionIndex={0} total={1} question={locale === "en" ? "The station was fun." : "ステーションは楽しかった。"} options={SATISFACTION_OPTIONS.map(option => ({ value: option.value, label: option.label[locale] }))} onChoose={() => undefined} onBack={() => undefined} onNext={() => undefined} nextLabel="Next" />);
}

function renderResult(locale: "en" | "ja", counselingApplicationUrl = "") {
  language.locale = locale;
  return renderToStaticMarkup(<ResultCard result={{ cesdScore: 10, pssScore: 12, counselingContactConsent: false, satisfactionAnswerCount: 5 }} counselingApplicationUrl={counselingApplicationUrl} onRestart={() => undefined} />);
}

describe("localized public station experience", () => {
  it("renders the English satisfaction step and Mind Pass guidance", () => {
    expect(renderSurvey("en")).toContain(STATION_COPY.en.satisfactionTitle);
    expect(renderSurvey("en")).toContain(SATISFACTION_OPTIONS[0].label.en);
    expect(renderResult("en")).toContain(STATION_COPY.en.mindPassTitle);
  });
  it("renders the Japanese satisfaction step and Mind Pass guidance", () => {
    expect(renderSurvey("ja")).toContain(STATION_COPY.ja.satisfactionTitle);
    expect(renderSurvey("ja")).toContain(SATISFACTION_OPTIONS[4].label.ja);
    expect(renderResult("ja")).toContain(STATION_COPY.ja.mindPassTitle);
  });
  it("renders detailed, non-diagnostic score guidance in each public language", () => {
    expect(renderResult("en")).toContain(RESULT_GUIDANCE.en.title);
    expect(renderResult("en")).toContain(RESULT_GUIDANCE.en.items[0].body);
    expect(renderResult("ja")).toContain(RESULT_GUIDANCE.ja.title);
    expect(renderResult("ja")).toContain(RESULT_GUIDANCE.ja.items[1].body);
  });
  it("renders the individual counselling call to action when an owner-configured URL is available", () => {
    const html = renderResult("en", "https://counsel.example.edu/apply");
    expect(html).toContain(STATION_COPY.en.counselingTitle);
    expect(html).toContain("https://counsel.example.edu/apply");
  });
  it("creates an icon-free accessible name for satisfaction option labels", () => {
    expect(getSatisfactionAccessibleLabel("😍 매우 만족")).toBe("매우 만족");
    expect(getSatisfactionAccessibleLabel("😣 Very dissatisfied")).toBe("Very dissatisfied");
  });
});
