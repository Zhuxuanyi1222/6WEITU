import { useEffect, useId, useMemo, useRef, useState, type CSSProperties, type RefObject } from "react";
import {
  axisAngle,
  labelAnchor,
  polar,
  polygonPath,
  projectOntoAxis,
  smoothClosedPath,
  svgPoint,
} from "@/lib/radar/geometry";
import { useRadarStore } from "@/lib/radar/store";
import { useSpringGrid } from "@/lib/radar/use-spring-grid";
import { cn } from "@/lib/utils";

const VB = 540;
const CX = 270;
const CY = 270;
const MAX_R = 148;
const LABEL_R = 186;

type Hover = { seriesId: string; axisIndex: number } | null;

export function RadarCanvas({ svgRef }: { svgRef: RefObject<SVGSVGElement | null> }) {
  const axes = useRadarStore((s) => s.axes);
  const series = useRadarStore((s) => s.series);
  const style = useRadarStore((s) => s.style);
  const activeSeriesId = useRadarStore((s) => s.activeSeriesId);
  const setValue = useRadarStore((s) => s.setValue);
  const setActiveSeries = useRadarStore((s) => s.setActiveSeries);

  const [hover, setHover] = useState<Hover>(null);
  const [dragging, setDragging] = useState<Hover>(null);
  const [reduced, setReduced] = useState(false);
  const rawId = useId().replace(/:/g, "");

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const targetGrid = useMemo(() => series.map((s) => s.values), [series]);

  const animated = useSpringGrid(targetGrid, {
    enabled: !reduced,
    snap: Boolean(dragging) || reduced,
  });

  const n = axes.length;
  const angles = useMemo(
    () => axes.map((_, i) => axisAngle(i, n, style.rotation)),
    [n, style.rotation, axes],
  );

  const gridPolys = useMemo(() => {
    return Array.from({ length: style.gridLevels }, (_, i) => {
      const r = ((i + 1) / style.gridLevels) * MAX_R;
      const pts = angles.map((a) => polar(CX, CY, r, a));
      return polygonPath(pts);
    });
  }, [angles, style.gridLevels]);

  const axisLines = useMemo(
    () => angles.map((a) => ({ a, p: polar(CX, CY, MAX_R, a) })),
    [angles],
  );

  const seriesPaths = animated.map((values, si) => {
    const pts = values.map((v, i) => {
      const r = (v / style.maxValue) * MAX_R;
      return polar(CX, CY, r, angles[i] ?? 0);
    });
    const d = style.rounded ? smoothClosedPath(pts) : polygonPath(pts);
    return { pts, d, series: series[si]! };
  });

  const dragRef = useRef<Hover>(null);
  dragRef.current = dragging;

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: PointerEvent) => {
      const svg = svgRef.current;
      const cur = dragRef.current;
      if (!svg || !cur) return;
      e.preventDefault();
      const pt = svgPoint(svg, e.clientX, e.clientY);
      const angle = angles[cur.axisIndex];
      if (angle === undefined) return;
      const r = projectOntoAxis(pt.x, pt.y, CX, CY, angle, MAX_R);
      setValue(cur.seriesId, cur.axisIndex, (r / MAX_R) * style.maxValue);
    };
    const onUp = () => setDragging(null);
    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [dragging, angles, setValue, style.maxValue, svgRef]);

  const focus = dragging ?? hover;
  const focusAxis = focus ? axes[focus.axisIndex] : null;
  const focusSeries = focus ? series.find((s) => s.id === focus.seriesId) : null;
  const focusValue = focus
    ? Math.round(series.find((s) => s.id === focus.seriesId)?.values[focus.axisIndex] ?? 0)
    : null;

  const glowId = `glow-${rawId}`;

  return (
    <div className="relative aspect-square w-full">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VB} ${VB}`}
        className={cn(
          "h-full w-full touch-none select-none",
          dragging ? "cursor-grabbing" : "cursor-default",
        )}
        role="img"
        aria-label="六维雷达图"
        onPointerLeave={() => {
          if (!dragging) setHover(null);
        }}
      >
        <defs>
          <filter id={glowId} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle
          cx={CX}
          cy={CY}
          r={MAX_R + 22}
          fill="var(--surface)"
          className="radar-plate"
        />
        <circle
          cx={CX}
          cy={CY}
          r={MAX_R + 22}
          fill="none"
          stroke="var(--border-strong)"
          strokeWidth="1"
        />

        {style.showGrid &&
          gridPolys.map((d, i) => (
            <path
              key={i}
              d={d}
              fill="none"
              stroke="var(--grid-line)"
              strokeWidth={i === gridPolys.length - 1 ? 1.2 : 0.8}
              className="radar-grid-line"
              style={{ animationDelay: `${i * 50}ms` }}
            />
          ))}

        {style.showAxisLines &&
          axisLines.map((line, i) => (
            <g key={axes[i]?.id ?? i}>
              <line
                x1={CX}
                y1={CY}
                x2={line.p.x}
                y2={line.p.y}
                stroke={
                  focus?.axisIndex === i ? "var(--fg-muted)" : "var(--grid-line)"
                }
                strokeWidth={focus?.axisIndex === i ? 1.4 : 0.9}
                className="transition-[stroke] duration-[var(--motion-quick)]"
              />
              <line
                x1={CX}
                y1={CY}
                x2={line.p.x}
                y2={line.p.y}
                stroke="transparent"
                strokeWidth="18"
                className="cursor-pointer"
                data-hide-export=""
                onPointerDown={(e) => {
                  e.preventDefault();
                  const sid = activeSeriesId;
                  const pt = svgRef.current
                    ? svgPoint(svgRef.current, e.clientX, e.clientY)
                    : null;
                  if (pt) {
                    const r = projectOntoAxis(pt.x, pt.y, CX, CY, line.a, MAX_R);
                    setValue(sid, i, (r / MAX_R) * style.maxValue);
                  }
                  setDragging({ seriesId: sid, axisIndex: i });
                }}
                onPointerEnter={() =>
                  setHover({ seriesId: activeSeriesId, axisIndex: i })
                }
              />
            </g>
          ))}

        {seriesPaths.map(({ d, series: sr }, si) => {
          if (!sr.visible) return null;
          return (
            <path
              key={`${sr.id}-fill`}
              d={d}
              fill={style.filled ? sr.color : "none"}
              stroke="none"
              className={style.breathe && style.filled ? "radar-fill" : undefined}
              style={
                {
                  fillOpacity: style.filled ? sr.fillOpacity : 0,
                  ["--fill-o" as string]: String(sr.fillOpacity),
                  ["--fill-o-hi" as string]: String(
                    Math.min(0.48, sr.fillOpacity * 1.45),
                  ),
                  animationDelay: `${si * 120}ms`,
                } as CSSProperties
              }
            />
          );
        })}

        {seriesPaths.map(({ d, series: sr }) => {
          if (!sr.visible) return null;
          return (
            <path
              key={`${sr.id}-stroke`}
              d={d}
              fill="none"
              stroke={sr.color}
              strokeWidth={sr.id === activeSeriesId ? style.strokeWidth + 0.4 : style.strokeWidth}
              strokeLinejoin="round"
              filter={style.glow && sr.id === activeSeriesId ? `url(#${glowId})` : undefined}
              className="radar-stroke"
            />
          );
        })}

        {seriesPaths
          .map((entry, si) => ({ ...entry, si }))
          .sort((a, b) => {
            const av = a.series.id === activeSeriesId ? 1 : 0;
            const bv = b.series.id === activeSeriesId ? 1 : 0;
            return av - bv;
          })
          .map(({ pts, series: sr }) => {
          if (!sr.visible) return null;
          const active = sr.id === activeSeriesId;
          return pts.map((p, i) => {
            const isFocus =
              focus?.seriesId === sr.id && focus.axisIndex === i;
            const r = isFocus ? 7 : active ? 5 : 3.2;
            return (
              <g key={`${sr.id}-${axes[i]?.id ?? i}`}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={r + 10}
                  fill="transparent"
                  className="cursor-grab"
                  data-hide-export=""
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveSeries(sr.id);
                    setDragging({ seriesId: sr.id, axisIndex: i });
                  }}
                  onPointerEnter={() =>
                    setHover({ seriesId: sr.id, axisIndex: i })
                  }
                />
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={r}
                  fill="var(--bg)"
                  stroke={sr.color}
                  strokeWidth={active ? 2.2 : 1.5}
                  className="pointer-events-none transition-[r] duration-[var(--motion-quick)] ease-[var(--ease-out)]"
                />
                {isFocus && (
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={2.2}
                    fill={sr.color}
                    className="pointer-events-none"
                  />
                )}
              </g>
            );
          });
        })}

        {style.showValues &&
          seriesPaths.map(({ pts, series: sr }) => {
            if (sr.id !== activeSeriesId || !sr.visible) return null;
            return pts.map((p, i) => {
              const angle = angles[i] ?? 0;
              const tip = polar(CX, CY, Math.hypot(p.x - CX, p.y - CY) + 14, angle);
              const val = Math.round(animated[series.indexOf(sr)]?.[i] ?? 0);
              return (
                <text
                  key={`v-${sr.id}-${i}`}
                  x={tip.x}
                  y={tip.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="radar-label pointer-events-none"
                  fill="var(--fg-muted)"
                  fontSize="11"
                  fontFamily="var(--font-sans)"
                  style={{ animationDelay: `${180 + i * 40}ms` }}
                >
                  {val}
                </text>
              );
            });
          })}

        {style.showLabels &&
          axes.map((axis, i) => {
            const angle = angles[i] ?? 0;
            const p = polar(CX, CY, LABEL_R, angle);
            const { textAnchor, dy } = labelAnchor(angle);
            const on = focus?.axisIndex === i;
            return (
              <text
                key={axis.id}
                x={p.x}
                y={p.y + dy}
                textAnchor={textAnchor}
                fill={on ? "var(--fg)" : "var(--fg-muted)"}
                fontSize="12"
                fontWeight={on ? 600 : 500}
                fontFamily="var(--font-sans)"
                className="radar-label pointer-events-none"
                style={{ animationDelay: `${80 + i * 50}ms` }}
              >
                {axis.label}
              </text>
            );
          })}
      </svg>

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div
          className={cn(
            "flex flex-col items-center text-center transition-[opacity,filter,transform] duration-[var(--motion-fast)] ease-[var(--ease-out)]",
            focus ? "translate-y-0 opacity-100 blur-0" : "translate-y-0 opacity-100",
          )}
        >
          <span className="font-display text-lg leading-tight tracking-[var(--tracking-display)] text-fg">
            {focusAxis ? focusAxis.label : "HEXA"}
          </span>
          <span className="mt-0.5 text-xs tracking-wide text-muted tabular-nums">
            {focus && focusSeries
              ? `${focusSeries.name}  ${focusValue}`
              : `${n} 维`}
          </span>
        </div>
      </div>
    </div>
  );
}
