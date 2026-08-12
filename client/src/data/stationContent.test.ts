import { describe, expect, it } from "vitest";
import { SATISFACTION_OPTIONS, STATION_COPY } from "./stationContent";

describe("healing play station locales", () => {
  it("provides descending satisfaction labels with an intuitive emoji in every supported language", () => {
    expect(SATISFACTION_OPTIONS).toHaveLength(5);
    expect(SATISFACTION_OPTIONS.map(option => option.value)).toEqual([5, 4, 3, 2, 1]);
    expect(SATISFACTION_OPTIONS[0].label.ko).toBe("😍 매우 만족");
    expect(SATISFACTION_OPTIONS[0].label.en).toBe("😍 Very satisfied");
    expect(SATISFACTION_OPTIONS[4].label.ja).toBe("😣 大変不満");
    expect(STATION_COPY.en.satisfactionTitle).toBeTruthy();
    expect(STATION_COPY.ja.satisfactionTitle).toBeTruthy();
    expect(STATION_COPY.en.mindPassTitle).toBeTruthy();
    expect(STATION_COPY.ja.mindPassTitle).toBeTruthy();
  });

  it("uses gentle, non-assessment-first copy on the Korean welcome screen", () => {
    expect(STATION_COPY.ko.welcomeLead).toBe("잠시 나에게 집중해 보는 가벼운 마음 체크 시간이에요.");
    expect(STATION_COPY.ko.start).toBe("가볍게 시작하기");
  });
});
