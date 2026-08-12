export function toChartPercent(value: number, maximum: number) {
  if (!Number.isFinite(value) || !Number.isFinite(maximum) || maximum <= 0) return 0;
  return Math.round((Math.min(Math.max(value, 0), maximum) / maximum) * 100);
}

export function toSharePercent(count: number, total: number) {
  if (!Number.isFinite(count) || !Number.isFinite(total) || total <= 0) return 0;
  return Math.round((Math.max(count, 0) / total) * 100);
}
