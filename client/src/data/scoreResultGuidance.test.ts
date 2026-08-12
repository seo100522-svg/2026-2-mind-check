import { describe, expect, it } from "vitest";
import { getRecoveryTips } from "./scoreResultGuidance";

describe("score-specific recovery tips", () => {
  it("returns tailored Korean CES-D tips for each score band", () => {
    expect(getRecoveryTips("cesd", 20, "ko").items[0]?.title).toBe("하루의 리듬을 지켜보세요");
    expect(getRecoveryTips("cesd", 24, "ko").items[0]?.title).toBe("10분의 빈틈을 예약하세요");
    expect(getRecoveryTips("cesd", 25, "ko").items[0]?.title).toBe("오늘 연락할 사람을 한 명 정해 보세요");
  });

  it("returns tailored Korean PSS-10 tips for each score band", () => {
    expect(getRecoveryTips("pss", 13, "ko").items[0]?.title).toBe("잘 된 방법을 이름 붙여 보세요");
    expect(getRecoveryTips("pss", 26, "ko").items[0]?.title).toBe("회복 시간을 일정에 넣으세요");
    expect(getRecoveryTips("pss", 27, "ko").items[0]?.title).toBe("오늘 미룰 수 있는 일을 찾아보세요");
  });
});
