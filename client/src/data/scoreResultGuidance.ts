import type { SupportedLocale } from "@/contexts/LanguageContext";

export type ScoreBandGuidance = {
  sectionTitle: string;
  range: string;
  title: string;
  paragraphs: string[];
  disclaimer: string;
  tone: "mint" | "yellow" | "coral";
  scaleDescription?: string;
};

const cesdDisclaimer = {
  ko: "CES-D는 우울증을 진단하는 검사가 아니라 최근 경험한 우울 증상의 정도를 확인하는 선별검사입니다. 검사 결과만으로 우울증 여부를 판단할 수 없습니다.",
  en: "CES-D is a screening measure of recently experienced depressive symptoms, not a test that diagnoses depression. A score alone cannot determine whether someone has depression.",
  ja: "CES-Dは、最近経験した抑うつ症状の程度を確認するためのスクリーニング検査であり、うつ病を診断する検査ではありません。検査結果だけでうつ病の有無を判断することはできません。",
} satisfies Record<SupportedLocale, string>;

const pssDisclaimer = {
  ko: "본 검사는 특정 정신질환을 진단하는 검사가 아닙니다. 점수는 최근 한 달 동안 스스로 지각한 스트레스 정도를 보여주는 참고자료입니다.",
  en: "This is not a diagnostic test for a specific mental health condition. The score is a reference for the stress you have personally perceived during the past month.",
  ja: "この検査は特定の精神疾患を診断するものではありません。点数は、最近1か月間に自分自身が感じたストレスの程度を示す参考資料です。",
} satisfies Record<SupportedLocale, string>;

export function getCesdResultGuidance(score: number, locale: SupportedLocale): ScoreBandGuidance {
  if (score <= 20) {
    return locale === "ko"
      ? { sectionTitle: "우울 검사 CES-D", range: "0~20점", title: "마음이 비교적 안정적이에요", paragraphs: ["최근 일상에서 우울감이나 의욕 저하와 같은 정서적 어려움이 비교적 낮은 수준으로 나타났습니다. 현재의 생활 리듬과 나에게 도움이 되는 활동을 꾸준히 유지해 주세요.", "다만 검사 점수가 낮더라도 지속적으로 힘들거나 일상생활에 어려움을 느낀다면 언제든 상담을 이용할 수 있습니다."], disclaimer: cesdDisclaimer.ko, tone: "mint" }
      : locale === "en"
        ? { sectionTitle: "Depression check · CES-D", range: "0–20", title: "Your mood appears relatively steady", paragraphs: ["Recent responses show a relatively low level of emotional difficulty, such as low mood or reduced motivation, in daily life. Keep up the rhythms and activities that support you.", "Even with a low score, you can use counselling whenever difficult feelings continue or daily life feels hard."], disclaimer: cesdDisclaimer.en, tone: "mint" }
        : { sectionTitle: "抑うつチェック · CES-D", range: "0〜20点", title: "こころは比較的安定しているようです", paragraphs: ["最近の日常では、抑うつ感や意欲の低下などの感情的な困難は比較的低い水準で表れています。今の生活リズムや自分を支える活動を続けてみてください。", "点数が低くても、つらさが続く、または日常生活に困難を感じる場合は、いつでも相談を利用できます。"], disclaimer: cesdDisclaimer.ja, tone: "mint" };
  }
  if (score <= 24) {
    return locale === "ko"
      ? { sectionTitle: "우울 검사 CES-D", range: "21~24점", title: "마음에 조금 더 관심이 필요해요", paragraphs: ["최근 우울감, 의욕 저하, 피로감 등 정서적 어려움을 평소보다 많이 경험하고 있을 가능성이 있습니다. 잠시 현재의 마음 상태와 생활 패턴을 살펴볼 필요가 있습니다.", "충분한 휴식과 수면, 규칙적인 생활을 유지하면서 혼자 해결하기 어렵다고 느껴진다면 학생상담센터에서 전문상담을 받아보는 것을 권합니다."], disclaimer: cesdDisclaimer.ko, tone: "yellow" }
      : locale === "en"
        ? { sectionTitle: "Depression check · CES-D", range: "21–24", title: "Your mood may need a little more attention", paragraphs: ["You may be experiencing emotional difficulties—such as low mood, reduced motivation, or fatigue—more often than usual. This can be a good time to look at your current feelings and daily patterns.", "Try to maintain enough rest, sleep, and routine. If it feels difficult to work through this alone, consider professional counselling at the Student Counselling Center."], disclaimer: cesdDisclaimer.en, tone: "yellow" }
        : { sectionTitle: "抑うつチェック · CES-D", range: "21〜24点", title: "こころにもう少し目を向けてみましょう", paragraphs: ["最近、抑うつ感、意欲の低下、疲労感などの感情的な困難を普段より多く経験している可能性があります。今のこころの状態や生活パターンを少し振り返ってみることが大切です。", "十分な休息と睡眠、規則的な生活を意識し、一人で解決することが難しいと感じる場合は、学生相談センターで専門相談を受けることをおすすめします。"], disclaimer: cesdDisclaimer.ja, tone: "yellow" };
  }
  return locale === "ko"
    ? { sectionTitle: "우울 검사 CES-D", range: "25점 이상", title: "지금은 적극적인 마음 돌봄이 필요해요", paragraphs: ["현재 우울감이나 의욕 저하 등 정서적 어려움이 비교적 높은 수준으로 나타났습니다. 최근의 어려움을 혼자 감당하기보다는 전문가와 함께 현재 상태를 구체적으로 살펴보는 것을 권합니다.", "학생상담센터의 개인상담이나 가까운 정신건강 전문기관을 이용해 도움을 받아보세요."], disclaimer: cesdDisclaimer.ko, tone: "coral" }
    : locale === "en"
      ? { sectionTitle: "Depression check · CES-D", range: "25 or above", title: "This may be a time for active care", paragraphs: ["Emotional difficulties, including low mood or reduced motivation, are showing at a relatively high level. Rather than carrying recent difficulties alone, consider looking at your situation more closely with a professional.", "You may wish to use individual counselling at the Student Counselling Center or a nearby mental health service."], disclaimer: cesdDisclaimer.en, tone: "coral" }
      : { sectionTitle: "抑うつチェック · CES-D", range: "25点以上", title: "今は積極的なこころのケアが必要かもしれません", paragraphs: ["抑うつ感や意欲の低下などの感情的な困難が、比較的高い水準で表れています。最近の困難を一人で抱え込むよりも、専門家と一緒に今の状態を具体的に見ていくことをおすすめします。", "学生相談センターの個別相談や、近くの精神保健専門機関の利用を検討してみてください。"], disclaimer: cesdDisclaimer.ja, tone: "coral" };
}

export function getPssResultGuidance(score: number, locale: SupportedLocale): ScoreBandGuidance {
  const scaleDescription = locale === "ko"
    ? "PSS-10은 최근 1개월 동안 상황을 얼마나 예측하기 어렵고, 통제하기 어렵고, 부담스럽게 느꼈는지를 측정하는 검사입니다. 총점은 0~40점이며 점수가 높을수록 지각된 스트레스가 높다는 의미입니다."
    : locale === "en"
      ? "PSS-10 measures how unpredictable, uncontrollable, and overwhelming you have found situations during the past month. Scores range from 0 to 40; higher scores indicate higher perceived stress."
      : "PSS-10は、最近1か月間に状況をどの程度予測しにくく、コントロールしにくく、負担に感じたかを測る検査です。総点は0〜40点で、点数が高いほど知覚されたストレスが高いことを示します。";

  if (score <= 13) {
    return locale === "ko"
      ? { sectionTitle: "스트레스 검사 PSS-10", range: "0~13점", title: "스트레스를 잘 조절하고 있어요", paragraphs: ["최근 스트레스를 비교적 잘 조절하며 일상을 유지하고 있는 것으로 보입니다. 지금 사용하고 있는 나만의 휴식 방법이나 스트레스 관리 방식을 계속 유지해 보세요.", "스트레스는 상황에 따라 달라질 수 있으므로 힘든 일이 생겼을 때 자신의 상태를 다시 살펴보는 것도 도움이 됩니다."], disclaimer: pssDisclaimer.ko, tone: "mint", scaleDescription }
      : locale === "en"
        ? { sectionTitle: "Stress check · PSS-10", range: "0–13", title: "You appear to be managing stress well", paragraphs: ["You appear to be maintaining daily life while managing recent stress relatively well. Keep using the rest and stress-management practices that work for you.", "Stress can change with circumstances, so it may help to check in with yourself again when difficult events arise."], disclaimer: pssDisclaimer.en, tone: "mint", scaleDescription }
        : { sectionTitle: "ストレスチェック · PSS-10", range: "0〜13点", title: "ストレスを上手に調整できているようです", paragraphs: ["最近のストレスを比較的うまく調整しながら、日常を保てているようです。今行っている自分なりの休息方法やストレス管理の方法を続けてみてください。", "ストレスは状況によって変わるため、つらい出来事が起きたときは、改めて自分の状態を振り返ることも役立ちます。"], disclaimer: pssDisclaimer.ja, tone: "mint", scaleDescription };
  }
  if (score <= 26) {
    return locale === "ko"
      ? { sectionTitle: "스트레스 검사 PSS-10", range: "14~26점", title: "잠시 쉬어갈 시간이 필요해요", paragraphs: ["최근 여러 상황을 부담스럽거나 통제하기 어렵게 느끼는 경험이 어느 정도 있는 것으로 보입니다.", "최근 나를 가장 힘들게 하는 일이 무엇인지 살펴보고, 수면·휴식·운동·취미 등 회복할 수 있는 시간을 의식적으로 확보해 보세요. 스트레스가 지속되거나 학업·대인관계·일상생활에 영향을 주고 있다면 상담을 통해 함께 정리해 볼 수 있습니다."], disclaimer: pssDisclaimer.ko, tone: "yellow", scaleDescription }
      : locale === "en"
        ? { sectionTitle: "Stress check · PSS-10", range: "14–26", title: "You may need time to pause and recover", paragraphs: ["You appear to have had some experiences of finding recent situations burdensome or difficult to control.", "Notice what has been weighing on you most, and intentionally make time for recovery through sleep, rest, movement, or hobbies. If stress continues or affects study, relationships, or daily life, counselling can help you sort through it."], disclaimer: pssDisclaimer.en, tone: "yellow", scaleDescription }
        : { sectionTitle: "ストレスチェック · PSS-10", range: "14〜26点", title: "少し立ち止まって休む時間が必要かもしれません", paragraphs: ["最近、さまざまな状況を負担に感じたり、コントロールしにくいと感じたりする経験がある程度あるようです。", "最近最も負担になっていることを振り返り、睡眠・休息・運動・趣味など、回復のための時間を意識して確保してみてください。ストレスが続く、または学業・対人関係・日常生活に影響している場合は、相談を通じて一緒に整理することができます。"], disclaimer: pssDisclaimer.ja, tone: "yellow", scaleDescription };
  }
  return locale === "ko"
    ? { sectionTitle: "스트레스 검사 PSS-10", range: "27~40점", title: "적극적인 스트레스 관리가 필요해요", paragraphs: ["현재 일상에서 느끼는 스트레스가 상당히 높은 수준으로 나타났습니다. 여러 가지 부담이 한꺼번에 쌓여 있거나 상황을 통제하기 어렵다고 느끼고 있을 가능성이 있습니다.", "혼자 버티기보다는 현재의 스트레스 요인과 대처 방법을 전문가와 함께 점검해 보는 것을 권합니다. 학생상담센터의 개인상담 등 전문적인 도움을 활용해 보세요."], disclaimer: pssDisclaimer.ko, tone: "coral", scaleDescription }
    : locale === "en"
      ? { sectionTitle: "Stress check · PSS-10", range: "27–40", title: "Active stress management may be helpful now", paragraphs: ["Stress in daily life is showing at a fairly high level. Several burdens may be building up at once, or situations may feel hard to control.", "Rather than enduring it alone, consider reviewing your current stressors and coping methods with a professional. You can use professional support such as individual counselling at the Student Counselling Center."], disclaimer: pssDisclaimer.en, tone: "coral", scaleDescription }
      : { sectionTitle: "ストレスチェック · PSS-10", range: "27〜40点", title: "積極的なストレス管理が必要かもしれません", paragraphs: ["現在、日常で感じているストレスがかなり高い水準で表れています。さまざまな負担が一度に重なっている、または状況をコントロールしにくいと感じている可能性があります。", "一人で耐えるよりも、現在のストレス要因と対処方法を専門家と一緒に確認することをおすすめします。学生相談センターの個別相談など、専門的な支援を活用してみてください。"], disclaimer: pssDisclaimer.ja, tone: "coral", scaleDescription };
}
