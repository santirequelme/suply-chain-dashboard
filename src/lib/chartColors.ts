import { useAppStore } from "@/store/useAppStore";

const DARK = {
  text: "#718096",
  textSecondary: "#A0AEC0",
  gridLine: "rgba(255,255,255,0.06)",
  tooltipBg: "#0F1535",
  tooltipBorder: "rgba(255,255,255,0.10)",
  tooltipText: "#FFFFFF",
  tooltipSub: "#A0AEC0",
  primary: "#4318FF",
  primaryLight: "#868CFF",
  success: "#01B574",
  axisLine: "transparent",
};

const LIGHT = {
  text: "#64748B",
  textSecondary: "#475569",
  gridLine: "rgba(0,0,0,0.06)",
  tooltipBg: "#FFFFFF",
  tooltipBorder: "rgba(0,0,0,0.10)",
  tooltipText: "#0F172A",
  tooltipSub: "#64748B",
  primary: "#4318FF",
  primaryLight: "#868CFF",
  success: "#01B574",
  axisLine: "transparent",
};

export type ChartColors = typeof DARK;

export function useChartColors(): ChartColors {
  const darkMode = useAppStore((s) => s.darkMode);
  return darkMode ? DARK : LIGHT;
}
