export const SUPPORTED_LOCALES = ["ko", "en", "ja"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
export type Translation = Record<SupportedLocale, string>;

export const MAX_SATISFACTION_LIKERT_QUESTIONS = 5;
export const MAX_SATISFACTION_QUESTIONS = 6;
export type SatisfactionQuestionType = "likert" | "textarea";

export type SatisfactionQuestionDefinition = {
  id: string;
  sortOrder: number;
  question: Translation;
  questionType: SatisfactionQuestionType;
  isActive: boolean;
};

export const DEFAULT_SATISFACTION_QUESTIONS: SatisfactionQuestionDefinition[] = [
  { id: "satisfaction-1", sortOrder: 1, questionType: "likert", isActive: true, question: { ko: "전반적인 프로그램 만족도는 어느 정도 입니까?", en: "How satisfied are you with the program overall?", ja: "プログラム全体への満足度はいかがですか。" } },
  { id: "satisfaction-2", sortOrder: 2, questionType: "likert", isActive: true, question: { ko: "프로그램 내용은 어느 정도 만족스럽습니까?", en: "How satisfied are you with the program content?", ja: "プログラム内容への満足度はいかがですか。" } },
  { id: "satisfaction-3", sortOrder: 3, questionType: "likert", isActive: true, question: { ko: "부스에 대한 만족도는 어느 정도 입니까?", en: "How satisfied are you with the booth?", ja: "ブースへの満足度はいかがですか。" } },
  { id: "satisfaction-4", sortOrder: 4, questionType: "likert", isActive: true, question: { ko: "일정 및 시간 등의 만족도는 어느 정도 입니까?", en: "How satisfied are you with the schedule and timing?", ja: "日程や時間への満足度はいかがですか。" } },
  { id: "satisfaction-5", sortOrder: 5, questionType: "likert", isActive: true, question: { ko: "운영 장소에 대한 만족도는 어느 정도 입니까?", en: "How satisfied are you with the venue?", ja: "運営場所への満足度はいかがですか。" } },
  { id: "satisfaction-6", sortOrder: 6, questionType: "textarea", isActive: true, question: { ko: "향후 본 프로그램에 바라는 점 또는 참여 소감을 작성해주세요.", en: "Please share what you hope for from this program or any thoughts about your participation.", ja: "今後このプログラムに期待すること、または参加した感想を自由にご記入ください。" } },
];
