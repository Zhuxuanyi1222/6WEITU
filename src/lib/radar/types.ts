export type Axis = {
  id: string;
  label: string;
};

export type Series = {
  id: string;
  name: string;
  color: string;
  fillOpacity: number;
  values: number[];
  visible: boolean;
};

export type ChartStyle = {
  gridLevels: number;
  showLabels: boolean;
  showValues: boolean;
  showGrid: boolean;
  showAxisLines: boolean;
  filled: boolean;
  strokeWidth: number;
  glow: boolean;
  rounded: boolean;
  breathe: boolean;
  rotation: number;
  maxValue: number;
};

export type ThemeName = "dark" | "light";

export type RadarSnapshot = {
  axes: Axis[];
  series: Series[];
  style: ChartStyle;
  theme: ThemeName;
  activeSeriesId: string;
};

export const MIN_AXES = 3;
export const MAX_AXES = 12;
export const MAX_SERIES = 3;

export const SWATCHES = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
] as const;

export const DEFAULT_STYLE: ChartStyle = {
  gridLevels: 5,
  showLabels: true,
  showValues: true,
  showGrid: true,
  showAxisLines: true,
  filled: true,
  strokeWidth: 2,
  glow: true,
  rounded: false,
  breathe: true,
  rotation: 0,
  maxValue: 100,
};
