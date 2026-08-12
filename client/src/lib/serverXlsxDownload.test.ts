import { afterEach, describe, expect, it, vi } from "vitest";
import { downloadOwnerRawAssessmentXlsx } from "./serverXlsxDownload";

describe("downloadOwnerRawAssessmentXlsx", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("requests the protected XLSX endpoint without cache and downloads the server-provided xlsx filename", async () => {
    const click = vi.fn();
    const remove = vi.fn();
    const anchor = { href: "", download: "", style: {}, click, remove };
    const fetchMock = vi.fn().mockResolvedValue(new Response(new Blob(["xlsx"], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), { status: 200, headers: { "content-disposition": "attachment; filename=healing-play-station-raw.xlsx", "x-export-count": "3" } }));
    const createObjectURL = vi.fn(() => "blob:test");
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("document", { createElement: vi.fn(() => anchor), body: { appendChild: vi.fn() } });
    vi.stubGlobal("window", { setTimeout: (callback: () => void) => callback() });
    vi.stubGlobal("URL", { createObjectURL, revokeObjectURL, searchParams: URLSearchParams });
    vi.stubGlobal("sessionStorage", { getItem: vi.fn(() => null) });
    await expect(downloadOwnerRawAssessmentXlsx("성장학과")).resolves.toBe(3);
    expect(fetchMock).toHaveBeenCalledWith("/api/assessment/raw-export.xlsx?department=%EC%84%B1%EC%9E%A5%ED%95%99%EA%B3%BC", expect.objectContaining({ credentials: "include", cache: "no-store" }));
    expect(anchor.download).toBe("healing-play-station-raw.xlsx");
    expect(click).toHaveBeenCalledOnce();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:test");
  });
});
