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
});
