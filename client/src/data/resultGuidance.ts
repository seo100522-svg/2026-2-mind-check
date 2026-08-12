import type { SupportedLocale } from "@/contexts/LanguageContext";

type GuidanceItem = {
  title: string;
  body: string;
};

export type ResultGuidance = {
  title: string;
  lead: string;
  items: GuidanceItem[];
};

export const RESULT_GUIDANCE: Record<SupportedLocale, ResultGuidance> = {
  ko: {
    title: "점수를 이렇게 살펴보세요",
    lead: "아래 점수는 최근 응답을 간단히 요약한 마음 점검의 한 장면입니다. 지금의 나를 이해하는 단서로만 활용해 주세요.",
    items: [
      {
        title: "한 번의 결과로 나를 단정하지 마세요",
        body: "이 점수만으로 우울증·불안장애 여부, 원인, 치료 필요성을 판단할 수는 없습니다. 컨디션, 수면, 일정, 관계처럼 그날의 여러 상황도 응답에 영향을 줄 수 있어요.",
      },
      {
        title: "숫자와 생활의 변화를 함께 살펴보세요",
        body: "최근의 기분 변화가 오래 이어지는지, 잠·식사·수업·일·관계에 어려움이 생겼는지를 함께 돌아보면 더 도움이 됩니다. 낮은 점수여도 힘들다면 충분히 도움을 받을 수 있어요.",
      },
      {
        title: "도움 요청은 언제나 선택할 수 있어요",
        body: "혼자 정리하기 어렵거나 이야기할 사람이 필요하다면 신뢰하는 사람, 학생상담센터 또는 전문 상담기관에 연결해 보세요. 점수와 상관없이 지원을 요청하는 것은 자연스러운 선택입니다.",
      },
    ],
  },
  en: {
    title: "How to look at these scores",
    lead: "These scores are a brief snapshot of your recent responses. Use them as one clue for understanding how you have been, not as a conclusion about yourself.",
    items: [
      {
        title: "Do not define yourself by one result",
        body: "A score alone cannot determine whether you have depression or another condition, explain its cause, or decide whether treatment is needed. Sleep, health, workload, and relationships can all shape how you answer on a given day.",
      },
      {
        title: "Look at daily life alongside the number",
        body: "It can help to notice whether difficult feelings are lasting or affecting sleep, eating, study, work, or relationships. You can seek support even when a score is low if you are having a hard time.",
      },
      {
        title: "Support is available whenever you choose",
        body: "If it feels hard to sort through things alone or you want someone to talk with, consider a trusted person, the Student Counselling Center, or a professional service. Asking for support is valid regardless of a score.",
      },
    ],
  },
  ja: {
    title: "点数の受け止め方",
    lead: "この点数は、最近の回答を簡単にまとめたこころのチェックインの一場面です。自分の状態を理解するための一つの手がかりとしてご覧ください。",
    items: [
      {
        title: "一度の結果で自分を決めつけないでください",
        body: "この点数だけで、うつ病などの有無、原因、治療の必要性を判断することはできません。睡眠、体調、予定、人間関係など、その日のさまざまな状況も回答に影響します。",
      },
      {
        title: "数字と日常の変化を一緒に見てみましょう",
        body: "つらい気持ちが長く続いているか、睡眠・食事・授業・仕事・人間関係に影響があるかも振り返ると役立ちます。点数が低くても、つらいときは支援を求めて大丈夫です。",
      },
      {
        title: "必要なときはいつでも支援を選べます",
        body: "一人で整理することが難しい、誰かと話したいと感じるときは、信頼できる人、学生相談センター、専門の相談先につながってみてください。点数にかかわらず、助けを求めることは自然な選択です。",
      },
    ],
  },
};
