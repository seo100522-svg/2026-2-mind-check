import { describe, expect, it } from "vitest";
import { DEFAULT_SATISFACTION_QUESTIONS } from "./satisfactionDefaults";

describe("DEFAULT_SATISFACTION_QUESTIONS", () => {
  it("keeps English and Japanese prompts aligned with the Korean satisfaction questions", () => {
    expect(DEFAULT_SATISFACTION_QUESTIONS.map(question => question.question)).toEqual([
      { ko: "전반적인 프로그램 만족도는 어느 정도 입니까?", en: "Overall, how satisfied are you with this program?", ja: "このプログラム全体にどの程度満足していますか。" },
      { ko: "프로그램 내용은 어느 정도 만족스럽습니까?", en: "How satisfied are you with the content of this program?", ja: "このプログラムの内容にどの程度満足していますか。" },
      { ko: "검사 진행 방식에 대한 만족도는 어느 정도 입니까?", en: "How satisfied are you with how the check-in was conducted?", ja: "チェックの進め方にどの程度満足していますか。" },
      { ko: "검사결과 및 해석 내용에 대한 만족도는 어느 정도입니까?", en: "How satisfied are you with the results and interpretation provided?", ja: "検査結果とその解釈の内容にどの程度満足していますか。" },
      { ko: "마음상태 이해 도움 정도에 대한 만족도는 어느 정도 입니까?", en: "How satisfied are you with how much this program helped you understand your current state of mind?", ja: "このプログラムが自分の心の状態を理解する助けになった度合いに、どの程度満足していますか。" },
      { ko: "향후 본 프로그램에 바라는 점 또는 참여 소감을 작성해주세요.", en: "Please share any suggestions for this program or your thoughts on taking part.", ja: "今後このプログラムに望むこと、または参加した感想をご自由にお書きください。" },
    ]);
  });
});
