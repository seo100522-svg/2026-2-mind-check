import { COOKIE_NAME } from "@shared/const";

const XLSX_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

function authHeaders(): Record<string, string> {
  try {
    const raw = sessionStorage.getItem("manus-cookie");
    const prefix = `${COOKIE_NAME}=`;
    const pair = raw?.split(";").find(value => value.trim().startsWith(prefix));
    const token = pair?.trim().slice(prefix.length);
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch { return {}; }
}

function fileNameFromDisposition(value: string | null) {
  const encoded = value?.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  if (encoded) return decodeURIComponent(encoded);
  const plain = value?.match(/filename="?([^";]+)"?/i)?.[1];
  return plain || "healing-play-station-raw.xlsx";
}

export async function downloadOwnerRawAssessmentXlsx(department?: string) {
  const params = new URLSearchParams();
  if (department) params.set("department", department);
  const response = await fetch(`/api/assessment/raw-export.xlsx${params.size ? `?${params}` : ""}`, { credentials: "include", headers: authHeaders(), cache: "no-store" });
  if (!response.ok) throw new Error("원자료 엑셀 파일을 준비하지 못했습니다.");
  const blob = await response.blob();
  if (blob.type !== XLSX_MIME) throw new Error("엑셀 파일 형식이 올바르지 않습니다.");
  const fileName = fileNameFromDisposition(response.headers.get("content-disposition"));
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName.endsWith(".xlsx") ? fileName : `${fileName}.xlsx`;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  window.setTimeout(() => { anchor.remove(); URL.revokeObjectURL(url); }, 0);
  return Number(response.headers.get("x-export-count") ?? 0);
}
