import type { SupportedLocale } from "@/contexts/LanguageContext";

export type LocalizedText = Record<SupportedLocale, string>;

/** Values preserve 1=very dissatisfied through 5=very satisfied, while presentation is intentionally descending. */
export const SATISFACTION_OPTIONS: Array<{ value: number; label: LocalizedText }> = [
  { value: 5, label: { ko: "😍 매우 만족", en: "😍 Very satisfied", ja: "😍 大変満足" } },
  { value: 4, label: { ko: "🙂 만족", en: "🙂 Satisfied", ja: "🙂 満足" } },
  { value: 3, label: { ko: "😐 보통", en: "😐 Neutral", ja: "😐 どちらともいえない" } },
  { value: 2, label: { ko: "🙁 불만족", en: "🙁 Dissatisfied", ja: "🙁 不満" } },
  { value: 1, label: { ko: "😣 매우 불만족", en: "😣 Very dissatisfied", ja: "😣 大変不満" } },
];

export const STATION_COPY: Record<SupportedLocale, {
  brand: string; brandSub: string; privacy: string; welcomeEyebrow: string; welcomeTitle: string; welcomeLead: string; start: string;
  satisfactionSequence: string; satisfactionTitle: string; satisfactionLead: string; satisfactionCommentTitle: string; satisfactionCommentLead: string; satisfactionCommentPlaceholder: string;
  resultTitle: string; resultLead: string; mindPassTitle: string; mindPassLead: string; counselingTitle: string; counselingLead: string; counselingButton: string; admin: string;
}> = {
  ko: {
    brand: "마음체크인", brandSub: "마음체크리스트", privacy: "학생상담센터", admin: "운영자 전용",
    welcomeEyebrow: "2026-2학기 마음건강 지원 프로그램", welcomeTitle: "마음체크인:\n마음체크리스트", welcomeLead: "마음과 스트레스를 가볍게 돌아보고, 지금 나에게 필요한 돌봄을 생각해 보세요.", start: "마음체크 시작",
    satisfactionSequence: "만족도 조사", satisfactionTitle: "마음체크인 만족도 조사", satisfactionLead: "각 문항에 대해 가장 알맞은 답을 선택해 주세요.", satisfactionCommentTitle: "참여 소감", satisfactionCommentLead: "향후 본 프로그램에 바라는 점 또는 참여 소감을 작성해주세요.", satisfactionCommentPlaceholder: "자유롭게 작성해 주세요.",
    resultTitle: "검사 결과 안내", resultLead: "각 점수는 최근의 경험을 이해하기 위한 참고자료입니다. 점수와 일상에서 느끼는 변화를 함께 살펴보세요.", mindPassTitle: "마음패스를 받아 오락을 즐기세요!", mindPassLead: "본 페이지를 스태프에게 보여주고 ‘마음패스’를 받아 오락을 즐기세요!", counselingTitle: "개인상담 신청", counselingLead: "학생상담센터에서 현재의 어려움을 함께 정리해 볼 수 있습니다.", counselingButton: "개인상담 신청하기",
  },
  en: {
    brand: "Mind Check-in", brandSub: "Mind Checklist", privacy: "Student Counselling Center", admin: "Owner only",
    welcomeEyebrow: "2026 Semester 2 Mind-Health Support Program", welcomeTitle: "Mind Check-in:\nMind Checklist", welcomeLead: "Gently reflect on mood and stress, then consider the care that may help you today.", start: "Start check-in",
    satisfactionSequence: "Satisfaction", satisfactionTitle: "Mind Check-in Satisfaction Survey", satisfactionLead: "Choose the answer that fits each statement best.", satisfactionCommentTitle: "Your thoughts", satisfactionCommentLead: "Please share what you hope for from this program or any thoughts about your participation.", satisfactionCommentPlaceholder: "Write freely here.",
    resultTitle: "Assessment results", resultLead: "Each score is a reference for understanding recent experiences. Consider it alongside changes you notice in daily life.", mindPassTitle: "Collect your Mind Pass and enjoy the games!", mindPassLead: "Show this page to a staff member, collect your Mind Pass, and enjoy the games!", counselingTitle: "Apply for individual counselling", counselingLead: "The Student Counselling Center can help you make sense of current difficulties.", counselingButton: "Apply for counselling",
  },
  ja: {
    brand: "こころチェックイン", brandSub: "こころのチェックリスト", privacy: "学生相談センター", admin: "運営者専用",
    welcomeEyebrow: "2026年度後期 こころの健康支援プログラム", welcomeTitle: "こころチェックイン:\nこころのチェックリスト", welcomeLead: "こころとストレスを軽く振り返り、今の自分に必要なケアを考えてみましょう。", start: "チェックを始める",
    satisfactionSequence: "満足度調査", satisfactionTitle: "こころチェックイン満足度調査", satisfactionLead: "各質問について、もっともあてはまる答えを選んでください。", satisfactionCommentTitle: "参加の感想", satisfactionCommentLead: "今後このプログラムに期待すること、または参加した感想を自由にご記入ください。", satisfactionCommentPlaceholder: "自由にご記入ください。",
    resultTitle: "検査結果のご案内", resultLead: "各点数は最近の経験を理解するための参考資料です。日常で感じる変化とあわせて見てみましょう。", mindPassTitle: "マインドパスを受け取って遊びを楽しみましょう！", mindPassLead: "このページをスタッフに見せて「マインドパス」を受け取り、遊びを楽しんでください！", counselingTitle: "個別相談の申込み", counselingLead: "学生相談センターで、今の困難を一緒に整理することができます。", counselingButton: "個別相談を申し込む",
  },
};
