export const CHART_COLORS = {
  primary: "var(--ams-chart-primary)",
  present: "var(--ams-chart-present)",
  late: "var(--ams-chart-late)",
  leave: "var(--ams-chart-leave)",
  absent: "var(--ams-chart-absent)",
  neutral: "var(--ams-chart-neutral)",
  grid: "var(--ams-chart-grid)",
  surface: "var(--ams-surface)",
  text: "var(--ams-text)",
  mutedText: "var(--ams-text-muted)",
  border: "var(--ams-border)",
} as const;

export const CHART_TOOLTIP_STYLE = {
  border: `1px solid ${CHART_COLORS.border}`,
  borderRadius: "10px",
  background: CHART_COLORS.surface,
  boxShadow: "0 8px 24px rgb(16 24 40 / 0.08)",
  fontSize: "12px",
} as const;

export const CHART_AXIS_STYLE = {
  fill: CHART_COLORS.mutedText,
  fontSize: 12,
} as const;
