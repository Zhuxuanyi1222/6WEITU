import { create } from "zustand";
import { uid } from "@/lib/utils";
import { defaultSnapshot } from "./presets";
import {
  MAX_AXES,
  MAX_SERIES,
  MIN_AXES,
  SWATCHES,
  type Axis,
  type ChartStyle,
  type RadarSnapshot,
  type Series,
  type ThemeName,
} from "./types";

const STORAGE_KEY = "hexa-radar-v1";

type RadarState = RadarSnapshot & {
  setAxisLabel: (id: string, label: string) => void;
  setValue: (seriesId: string, axisIndex: number, value: number) => void;
  setSeriesName: (id: string, name: string) => void;
  setSeriesColor: (id: string, color: string) => void;
  setSeriesFill: (id: string, fillOpacity: number) => void;
  setSeriesVisible: (id: string, visible: boolean) => void;
  setActiveSeries: (id: string) => void;
  addSeries: () => void;
  removeSeries: (id: string) => void;
  addAxis: () => void;
  removeAxis: (id: string) => void;
  patchStyle: (patch: Partial<ChartStyle>) => void;
  setTheme: (theme: ThemeName) => void;
  applyPreset: (axes: Axis[], series: Series[]) => void;
  randomize: () => void;
  loadSnapshot: (snap: RadarSnapshot) => void;
  toSnapshot: () => RadarSnapshot;
};

function clampValue(v: number, max: number) {
  return Math.min(max, Math.max(0, Math.round(v)));
}

function persistable(s: RadarState): RadarSnapshot {
  return {
    axes: s.axes,
    series: s.series,
    style: s.style,
    theme: s.theme,
    activeSeriesId: s.activeSeriesId,
  };
}

let persistReady = false;

function schedulePersist(state: RadarState) {
  if (!persistReady || typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persistable(state)));
  } catch {
    /* ignore quota */
  }
}

function normalize(raw: Partial<RadarSnapshot>): RadarSnapshot {
  const fallback = defaultSnapshot();
  const axes =
    Array.isArray(raw.axes) && raw.axes.length >= MIN_AXES
      ? raw.axes.slice(0, MAX_AXES).map((a) => ({
          id: String(a.id || uid("ax")),
          label: String(a.label || "维度"),
        }))
      : fallback.axes;
  const n = axes.length;
  const seriesSrc =
    Array.isArray(raw.series) && raw.series.length > 0 ? raw.series : fallback.series;
  const series = seriesSrc.slice(0, MAX_SERIES).map((s, i) => ({
    id: String(s.id || uid("sr")),
    name: String(s.name || `系列 ${i + 1}`),
    color: String(s.color || SWATCHES[i % SWATCHES.length]),
    fillOpacity: Number.isFinite(s.fillOpacity) ? s.fillOpacity : 0.22,
    visible: s.visible !== false,
    values: Array.from({ length: n }, (_, j) =>
      clampValue(Number(s.values?.[j] ?? 50), 100),
    ),
  }));
  return {
    axes,
    series,
    style: { ...fallback.style, ...(raw.style ?? {}) },
    theme: raw.theme === "light" ? "light" : "dark",
    activeSeriesId:
      series.find((s) => s.id === raw.activeSeriesId)?.id ?? series[0]!.id,
  };
}

const initial = defaultSnapshot();

export const useRadarStore = create<RadarState>((set, get) => ({
  ...initial,

  setAxisLabel: (id, label) =>
    set((s) => ({
      axes: s.axes.map((a) => (a.id === id ? { ...a, label } : a)),
    })),

  setValue: (seriesId, axisIndex, value) =>
    set((s) => ({
      series: s.series.map((sr) => {
        if (sr.id !== seriesId) return sr;
        const values = sr.values.slice();
        values[axisIndex] = clampValue(value, s.style.maxValue);
        return { ...sr, values };
      }),
    })),

  setSeriesName: (id, name) =>
    set((s) => ({
      series: s.series.map((sr) => (sr.id === id ? { ...sr, name } : sr)),
    })),

  setSeriesColor: (id, color) =>
    set((s) => ({
      series: s.series.map((sr) => (sr.id === id ? { ...sr, color } : sr)),
    })),

  setSeriesFill: (id, fillOpacity) =>
    set((s) => ({
      series: s.series.map((sr) => (sr.id === id ? { ...sr, fillOpacity } : sr)),
    })),

  setSeriesVisible: (id, visible) =>
    set((s) => ({
      series: s.series.map((sr) => (sr.id === id ? { ...sr, visible } : sr)),
    })),

  setActiveSeries: (id) => set({ activeSeriesId: id }),

  addSeries: () =>
    set((s) => {
      if (s.series.length >= MAX_SERIES) return s;
      const i = s.series.length;
      const next: Series = {
        id: uid("sr"),
        name: `对比 ${i}`,
        color: SWATCHES[i % SWATCHES.length]!,
        fillOpacity: 0.16,
        visible: true,
        values: s.axes.map(() => 50),
      };
      return { series: [...s.series, next], activeSeriesId: next.id };
    }),

  removeSeries: (id) =>
    set((s) => {
      if (s.series.length <= 1) return s;
      const series = s.series.filter((sr) => sr.id !== id);
      return {
        series,
        activeSeriesId:
          s.activeSeriesId === id ? series[0]!.id : s.activeSeriesId,
      };
    }),

  addAxis: () =>
    set((s) => {
      if (s.axes.length >= MAX_AXES) return s;
      const axis: Axis = {
        id: uid("ax"),
        label: `维度 ${s.axes.length + 1}`,
      };
      return {
        axes: [...s.axes, axis],
        series: s.series.map((sr) => ({
          ...sr,
          values: [...sr.values, 50],
        })),
      };
    }),

  removeAxis: (id) =>
    set((s) => {
      if (s.axes.length <= MIN_AXES) return s;
      const index = s.axes.findIndex((a) => a.id === id);
      if (index < 0) return s;
      return {
        axes: s.axes.filter((a) => a.id !== id),
        series: s.series.map((sr) => ({
          ...sr,
          values: sr.values.filter((_, i) => i !== index),
        })),
      };
    }),

  patchStyle: (patch) => set((s) => ({ style: { ...s.style, ...patch } })),

  setTheme: (theme) => set({ theme }),

  applyPreset: (axes, series) =>
    set({
      axes,
      series,
      activeSeriesId: series[0]?.id ?? "",
    }),

  randomize: () =>
    set((s) => ({
      series: s.series.map((sr) =>
        sr.id === s.activeSeriesId
          ? {
              ...sr,
              values: sr.values.map(() => 28 + Math.round(Math.random() * 64)),
            }
          : sr,
      ),
    })),

  loadSnapshot: (snap) => set(normalize(snap)),

  toSnapshot: () => persistable(get()),
}));

useRadarStore.subscribe((state) => schedulePersist(state));

export function hydrateRadarStore() {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<RadarSnapshot>;
      useRadarStore.setState(normalize(parsed));
    }
  } catch {
    /* ignore */
  }
  persistReady = true;
  schedulePersist(useRadarStore.getState());
}
