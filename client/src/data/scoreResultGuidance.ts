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

export type RecoveryTip = { title: string; body: string };

export type RecoveryTips = { title: string; lead: string; items: RecoveryTip[] };

export function getRecoveryTips(kind: "cesd" | "pss", score: number, locale: SupportedLocale): RecoveryTips {
  if (kind === "cesd") {
    if (score <= 20) {
      return locale === "ko"
        ? { title: "오늘을 위한 회복 팁", lead: "지금 유지하고 있는 생활 리듬을 가볍게 지켜보세요.", items: [{ title: "하루의 리듬을 지켜보세요", body: "이번 주에도 잠드는 시간, 식사 시간, 가벼운 움직임 중 한 가지를 일정하게 유지해 보세요." }, { title: "기분을 짧게 기록해 보세요", body: "하루가 끝날 때 괜찮았던 순간 한 가지와 힘들었던 순간 한 가지를 적어 보면 내게 도움이 되는 활동을 알아차리는 데 도움이 됩니다." }] }
        : locale === "en"
          ? { title: "Recovery tips for today", lead: "Gently protect the rhythms that are already supporting you.", items: [{ title: "Keep one daily rhythm", body: "This week, try to keep one routine—such as bedtime, meals, or light movement—fairly consistent." }, { title: "Make a brief mood note", body: "At the end of the day, note one moment that felt okay and one that felt difficult. This can help you notice what supports you." }] }
          : { title: "今日のための回復のヒント", lead: "今の自分を支えている生活リズムを、無理のない範囲で守ってみましょう。", items: [{ title: "一つの生活リズムを保ちましょう", body: "今週は、就寝時間、食事、軽い運動のうち一つを、できるだけ一定に保ってみてください。" }, { title: "気分を短く記録してみましょう", body: "一日の終わりに、よかった瞬間と大変だった瞬間を一つずつ書くと、自分を支えることに気づきやすくなります。" }] };
    }
    if (score <= 24) {
      return locale === "ko"
        ? { title: "오늘을 위한 회복 팁", lead: "부담을 줄이고, 회복할 시간을 의식적으로 만들어 보세요.", items: [{ title: "10분의 빈틈을 예약하세요", body: "하루 중 10분만 알림을 끄고, 천천히 걷거나 창밖을 보는 시간을 미리 정해 보세요." }, { title: "해야 할 일을 작게 나누세요", body: "가장 부담스러운 일을 10분 안에 시작할 수 있는 첫 단계로 나누고, 오늘은 그 첫 단계만 해도 충분하다고 정해 보세요." }] }
        : locale === "en"
          ? { title: "Recovery tips for today", lead: "Reduce the load where you can and deliberately make room to recover.", items: [{ title: "Schedule a 10-minute pause", body: "Choose one 10-minute time each day to silence alerts, walk slowly, or simply look out the window." }, { title: "Make tasks smaller", body: "Break the heaviest task into a first step you can start within 10 minutes, and let that first step be enough for today." }] }
          : { title: "今日のための回復のヒント", lead: "負担を少し減らし、回復のための時間を意識して作ってみましょう。", items: [{ title: "10分の余白を予定に入れましょう", body: "一日の中で10分だけ通知をオフにし、ゆっくり歩く、窓の外を見るなどの時間をあらかじめ決めてみてください。" }, { title: "やることを小さく分けましょう", body: "一番負担に感じることを、10分以内に始められる最初の一歩に分け、今日はその一歩だけでも十分だと決めてみましょう。" }] };
    }
    return locale === "ko"
      ? { title: "오늘을 위한 회복 팁", lead: "혼자 버티기보다, 기본적인 돌봄과 연결을 먼저 챙겨 보세요.", items: [{ title: "오늘 연락할 사람을 한 명 정해 보세요", body: "친구·가족·지도교수·상담센터 중 한 곳에 ‘요즘 조금 힘들다’고 짧게 알릴 수 있는 사람이나 곳을 정해 보세요." }, { title: "기본 돌봄을 가장 작게 시작하세요", body: "물 마시기, 간단히 먹기, 씻기, 잠자리에 들기 중 지금 가능한 한 가지를 먼저 해 보세요. 모든 것을 한꺼번에 해결할 필요는 없습니다." }] }
      : locale === "en"
        ? { title: "Recovery tips for today", lead: "Rather than carrying this alone, start with basic care and connection.", items: [{ title: "Choose one person or place to contact", body: "Choose a friend, family member, instructor, or counselling center you can briefly tell: “I have been having a hard time lately.”" }, { title: "Start with the smallest basic-care step", body: "Try one possible step first: drink water, eat something simple, wash up, or get ready for bed. You do not need to solve everything at once." }] }
        : { title: "今日のための回復のヒント", lead: "一人で抱え込むよりも、基本的なケアとつながりを先に大切にしてみましょう。", items: [{ title: "今日連絡する人や場所を一つ決めましょう", body: "友人・家族・指導教員・相談センターの中から、「最近少しつらい」と短く伝えられる人や場所を一つ決めてみてください。" }, { title: "一番小さなセルフケアから始めましょう", body: "水を飲む、簡単に食べる、身支度をする、寝る準備をするなど、今できる一つから始めてみてください。すべてを一度に解決する必要はありません。" }] };
  }

  if (score <= 13) {
    return locale === "ko"
      ? { title: "오늘을 위한 회복 팁", lead: "현재 효과가 있는 나만의 스트레스 관리 방식을 계속 활용해 보세요.", items: [{ title: "잘 된 방법을 이름 붙여 보세요", body: "최근 도움이 되었던 휴식 방법 하나를 적어 두고, 다음에 바쁠 때도 바로 꺼내 쓸 수 있게 해 보세요." }, { title: "작은 점검 시간을 남겨 두세요", body: "주 1회 5분만 이번 주의 부담과 회복 시간을 돌아보며, 다음 주에 유지할 한 가지를 정해 보세요." }] }
      : locale === "en"
        ? { title: "Recovery tips for today", lead: "Keep using the stress-management practices that are working for you.", items: [{ title: "Name what has been helping", body: "Write down one rest practice that has helped recently so it is easy to return to when life becomes busy." }, { title: "Leave room for a short check-in", body: "Once a week, take five minutes to notice your stress and recovery time, then choose one helpful practice to continue next week." }] }
        : { title: "今日のための回復のヒント", lead: "今うまくいっている自分なりのストレス管理方法を、これからも活用してみましょう。", items: [{ title: "役立った方法に名前をつけましょう", body: "最近助けになった休息方法を一つ書き留め、忙しくなったときにもすぐに使えるようにしてみてください。" }, { title: "短い振り返りの時間を残しましょう", body: "週に一度5分だけ、今週の負担と回復の時間を振り返り、来週も続ける一つを決めてみてください。" }] };
  }
  if (score <= 26) {
    return locale === "ko"
      ? { title: "오늘을 위한 회복 팁", lead: "회복 시간을 일정으로 지키고, 부담을 한 가지씩 분리해 보세요.", items: [{ title: "회복 시간을 일정에 넣으세요", body: "수면·휴식·운동·취미 중 하나를 이번 주 일정에 먼저 적고, 다른 약속처럼 지켜 보세요." }, { title: "부담을 나눠 적어 보세요", body: "지금의 부담을 ‘내가 할 수 있는 일’과 ‘도움을 요청할 일’로 나누어 적으면 혼자 떠안는 느낌을 줄이는 데 도움이 됩니다." }] }
      : locale === "en"
        ? { title: "Recovery tips for today", lead: "Protect recovery time in your schedule and separate burdens one at a time.", items: [{ title: "Put recovery time on the calendar", body: "Schedule one period for sleep, rest, movement, or a hobby this week and treat it like another appointment." }, { title: "Separate the burdens", body: "Write down what feels heavy in two groups: what you can do and what you can ask for help with. This can make the load feel less solitary." }] }
        : { title: "今日のための回復のヒント", lead: "回復の時間を予定として守り、負担を一つずつ分けてみましょう。", items: [{ title: "回復の時間を予定に入れましょう", body: "睡眠・休息・運動・趣味のうち一つを今週の予定に先に入れ、ほかの約束と同じように守ってみてください。" }, { title: "負担を分けて書いてみましょう", body: "今の負担を「自分でできること」と「助けを求めること」に分けて書くと、一人で抱え込む感覚を減らす助けになります。" }] };
  }
  return locale === "ko"
    ? { title: "오늘을 위한 회복 팁", lead: "지금은 부담을 덜고, 도움을 연결하는 일을 우선순위에 두어 보세요.", items: [{ title: "오늘 미룰 수 있는 일을 찾아보세요", body: "꼭 오늘 해야 하는 일과 미뤄도 되는 일을 구분해 보고, 한 가지라도 일정에서 덜어내 보세요." }, { title: "상담 연결을 작은 다음 단계로 삼으세요", body: "학생상담센터 상담 신청 페이지를 열어 보거나, 운영 시간에 문의 전화를 해 보세요. 연결을 시작하는 것만으로도 충분한 첫걸음입니다." }] }
    : locale === "en"
      ? { title: "Recovery tips for today", lead: "For now, prioritize lightening the load and connecting with support.", items: [{ title: "Find one thing to postpone", body: "Separate what truly needs to happen today from what can wait, and try removing at least one item from your schedule." }, { title: "Make connecting with counselling the next small step", body: "Open the Student Counselling Center application page or call during opening hours. Starting the connection is a meaningful first step." }] }
      : { title: "今日のための回復のヒント", lead: "今は、負担を減らし、支援につながることを優先してみましょう。", items: [{ title: "今日先延ばしにできることを探しましょう", body: "今日必ず必要なことと待てることを分け、予定から一つでも減らしてみてください。" }, { title: "相談につながることを小さな次の一歩にしましょう", body: "学生相談センターの相談申込みページを開く、または運営時間内に問い合わせの電話をしてみてください。つながりを始めるだけでも十分な第一歩です。" }] };
}
