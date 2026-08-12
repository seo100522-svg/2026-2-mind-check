import { describe, expect, it } from "vitest";
import { toChartPercent, toSharePercent } from "./cohortSummary";

describe("cohort summary chart calculations", () => {
  it("normalizes score averages to their assessment scale", () => {
    expect(toChartPercent(30, 60)).toBe(50);
    expect(toChartPercent(10, 40)).toBe(25);
    expect(toChartPercent(100, 60)).toBe(100);
  });

  it("returns stable zero shares for an empty response set", () => {
    expect(toSharePercent(0, 0)).toBe(0);
    expect(toSharePercent(2, 4)).toBe(50);
  });
});
