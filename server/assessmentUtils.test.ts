import { describe, expect, it } from "vitest";
import { scoreCesd, scorePss } from "./assessmentUtils";

describe("assessment scoring", () => {
  it("applies the four CES-D positive-affect reverse scores", () => {
    expect(scoreCesd(Array(20).fill(0))).toBe(12);
    expect(scoreCesd(Array(20).fill(3))).toBe(48);
  });
  it("applies the five PSS-10 control-item reverse scores", () => {
    expect(scorePss(Array(10).fill(0))).toBe(20);
    expect(scorePss(Array(10).fill(4))).toBe(20);
  });
  it("rejects incomplete or out-of-range answers", () => {
    expect(() => scoreCesd(Array(19).fill(0))).toThrow("Expected 20 answers");
    expect(() => scorePss([5, ...Array(9).fill(0)])).toThrow("between 0 and 4");
  });
});
