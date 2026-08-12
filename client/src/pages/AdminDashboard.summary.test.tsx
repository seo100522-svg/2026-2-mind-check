import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CohortSummary, OwnerAccessGate, type DashboardStats } from "./AdminDashboard";

const populatedStats: DashboardStats = {
  totalResponses: 4,
  averageCesd: 30,
  averagePss: 10,
  averageSatisfaction: 4.25,
  localeCounts: { ko: 4, en: 0, ja: 0 },
};

describe("CohortSummary", () => {
  it("renders populated averages and satisfaction without database seed data", () => {
    const html = renderToStaticMarkup(<CohortSummary stats={populatedStats} locale="ko" isLoading={false} isError={false} />);

    expect(html).toContain("30.0");
    expect(html).toContain("10.0");
    expect(html).toContain("4.3");
  });

  it("renders dedicated loading and error states instead of treating them as an empty cohort", () => {
    expect(renderToStaticMarkup(<CohortSummary locale="ko" isLoading={true} isError={false} />)).toContain("집계를 불러오는 중");
    expect(renderToStaticMarkup(<CohortSummary locale="ko" isLoading={false} isError={true} />)).toContain("집계를 불러오지 못했습니다");
  });
});

describe("OwnerAccessGate", () => {
  it("blocks a non-owner from seeing protected dashboard content", () => {
    const html = renderToStaticMarkup(<OwnerAccessGate isLoading={false} canManage={false}><div>원자료 CSV</div></OwnerAccessGate>);
    expect(html).toContain("소유자 전용 운영 화면입니다");
    expect(html).toContain("공개 체크리스트로 돌아가기");
    expect(html).not.toContain("원자료 CSV");
  });
});
