import { Minus, Plus, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { PRESETS } from "@/lib/radar/presets";
import { useRadarStore } from "@/lib/radar/store";
import { MAX_AXES, MAX_SERIES, MIN_AXES, SWATCHES } from "@/lib/radar/types";
import { cn } from "@/lib/utils";

function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex h-8 items-center justify-between">
        <h2 className="text-xs font-medium tracking-widest text-muted uppercase">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex h-11 items-center justify-between gap-3">
      <span className="text-sm text-fg">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  );
}

export function ControlPanel() {
  const axes = useRadarStore((s) => s.axes);
  const series = useRadarStore((s) => s.series);
  const style = useRadarStore((s) => s.style);
  const activeSeriesId = useRadarStore((s) => s.activeSeriesId);
  const setAxisLabel = useRadarStore((s) => s.setAxisLabel);
  const setValue = useRadarStore((s) => s.setValue);
  const setSeriesName = useRadarStore((s) => s.setSeriesName);
  const setSeriesColor = useRadarStore((s) => s.setSeriesColor);
  const setSeriesFill = useRadarStore((s) => s.setSeriesFill);
  const setSeriesVisible = useRadarStore((s) => s.setSeriesVisible);
  const setActiveSeries = useRadarStore((s) => s.setActiveSeries);
  const addSeries = useRadarStore((s) => s.addSeries);
  const removeSeries = useRadarStore((s) => s.removeSeries);
  const addAxis = useRadarStore((s) => s.addAxis);
  const removeAxis = useRadarStore((s) => s.removeAxis);
  const patchStyle = useRadarStore((s) => s.patchStyle);
  const applyPreset = useRadarStore((s) => s.applyPreset);

  const active = series.find((s) => s.id === activeSeriesId) ?? series[0]!;

  return (
    <div className="flex flex-col gap-6">
      <Section title="预设">
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                const built = p.build();
                applyPreset(built.axes, built.series);
              }}
              className="h-9 rounded-full px-3 text-sm text-fg shadow-[var(--shadow-border)] transition-[background-color,transform] duration-[var(--motion-quick)] ease-[var(--ease-out)] hover:bg-elevated active:scale-[0.96]"
            >
              {p.name}
            </button>
          ))}
        </div>
      </Section>

      <Separator />

      <Section
        title="系列"
        action={
          <Button
            variant="ghost"
            size="sm"
            onClick={addSeries}
            disabled={series.length >= MAX_SERIES}
          >
            <Plus />
            对比
          </Button>
        }
      >
        <div className="flex flex-col gap-2">
          {series.map((sr) => {
            const on = sr.id === active.id;
            return (
              <button
                key={sr.id}
                type="button"
                onClick={() => setActiveSeries(sr.id)}
                className={cn(
                  "flex h-11 items-center gap-3 rounded-md px-3 text-left transition-[background-color,box-shadow] duration-[var(--motion-quick)]",
                  on
                    ? "bg-elevated shadow-[var(--shadow-border)]"
                    : "hover:bg-elevated/60",
                )}
              >
                <span
                  className="size-2.5 rounded-full"
                  style={{ background: sr.color }}
                />
                <span className="min-w-0 flex-1 truncate text-sm text-fg">
                  {sr.name}
                </span>
                <span
                  role="presentation"
                  className={cn(
                    "text-xs tabular-nums text-muted",
                    sr.visible ? "opacity-100" : "opacity-40",
                  )}
                >
                  {sr.visible ? "显示" : "隐藏"}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 rounded-sm bg-elevated p-3">
          <div className="flex items-center gap-2">
            <Input
              value={active.name}
              onChange={(e) => setSeriesName(active.id, e.target.value)}
              aria-label="系列名称"
            />
            {series.length > 1 && (
              <Button
                variant="danger"
                size="icon"
                onClick={() => removeSeries(active.id)}
                aria-label="删除系列"
              >
                <Trash2 />
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {SWATCHES.map((sw) => (
              <button
                key={sw}
                type="button"
                aria-label={`颜色 ${sw}`}
                onClick={() => setSeriesColor(active.id, sw)}
                className={cn(
                  "size-7 rounded-full transition-transform duration-[var(--motion-quick)] active:scale-[0.96]",
                  active.color === sw
                    ? "ring-2 ring-fg ring-offset-2 ring-offset-elevated"
                    : "opacity-80 hover:opacity-100",
                )}
                style={{ background: sw }}
              />
            ))}
            <label className="relative size-7 overflow-hidden rounded-full shadow-[var(--shadow-border)]">
              <span className="sr-only">自定义颜色</span>
              <input
                type="color"
                className="absolute top-1/2 left-1/2 size-10 -translate-x-1/2 -translate-y-1/2 scale-150 cursor-pointer border-0 p-0"
                value={
                  active.color.startsWith("#") ? active.color : "#8ec8c4"
                }
                onChange={(e) => setSeriesColor(active.id, e.target.value)}
              />
            </label>
          </div>

          <ToggleRow
            label="显示此系列"
            checked={active.visible}
            onChange={(v) => setSeriesVisible(active.id, v)}
          />

          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">填充浓度</span>
              <span className="tabular-nums text-fg">
                {Math.round(active.fillOpacity * 100)}%
              </span>
            </div>
            <Slider
              min={0}
              max={50}
              step={1}
              value={[Math.round(active.fillOpacity * 100)]}
              onValueChange={([v]) => setSeriesFill(active.id, (v ?? 0) / 100)}
              rangeClassName="bg-fg/70"
            />
          </div>
        </div>
      </Section>

      <Separator />

      <Section
        title="维度"
        action={
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => {
                const last = axes[axes.length - 1];
                if (last) removeAxis(last.id);
              }}
              disabled={axes.length <= MIN_AXES}
              aria-label="减少维度"
            >
              <Minus />
            </Button>
            <span className="w-6 text-center text-xs tabular-nums text-muted">
              {axes.length}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={addAxis}
              disabled={axes.length >= MAX_AXES}
              aria-label="增加维度"
            >
              <Plus />
            </Button>
          </div>
        }
      >
        <ul className="flex flex-col gap-3">
          {axes.map((axis, i) => (
            <li key={axis.id} className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Input
                  value={axis.label}
                  onChange={(e) => setAxisLabel(axis.id, e.target.value)}
                  className="h-10 min-w-0 flex-1"
                  aria-label={`维度名称 ${i + 1}`}
                />
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="shrink-0 text-muted hover:text-danger"
                  onClick={() => removeAxis(axis.id)}
                  disabled={axes.length <= MIN_AXES}
                  aria-label={`删除 ${axis.label}`}
                >
                  <Minus />
                </Button>
              </div>
              <div className="flex items-center gap-3">
                <Slider
                  className="min-w-0 flex-1"
                  min={0}
                  max={style.maxValue}
                  step={1}
                  value={[active.values[i] ?? 0]}
                  onValueChange={([v]) => setValue(active.id, i, v ?? 0)}
                  rangeClassName="bg-accent"
                />
                <span className="w-8 text-right text-sm tabular-nums text-fg">
                  {active.values[i] ?? 0}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Separator />

      <Section title="外观">
        <div className="flex flex-col">
          <ToggleRow
            label="网格"
            checked={style.showGrid}
            onChange={(v) => patchStyle({ showGrid: v })}
          />
          <ToggleRow
            label="轴线"
            checked={style.showAxisLines}
            onChange={(v) => patchStyle({ showAxisLines: v })}
          />
          <ToggleRow
            label="标签"
            checked={style.showLabels}
            onChange={(v) => patchStyle({ showLabels: v })}
          />
          <ToggleRow
            label="数值"
            checked={style.showValues}
            onChange={(v) => patchStyle({ showValues: v })}
          />
          <ToggleRow
            label="填充"
            checked={style.filled}
            onChange={(v) => patchStyle({ filled: v })}
          />
          <ToggleRow
            label="光晕"
            checked={style.glow}
            onChange={(v) => patchStyle({ glow: v })}
          />
          <ToggleRow
            label="圆角造型"
            checked={style.rounded}
            onChange={(v) => patchStyle({ rounded: v })}
          />
          <ToggleRow
            label="呼吸"
            checked={style.breathe}
            onChange={(v) => patchStyle({ breathe: v })}
          />
        </div>

        <div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">网格层数</span>
            <span className="tabular-nums text-fg">{style.gridLevels}</span>
          </div>
          <Slider
            min={3}
            max={8}
            step={1}
            value={[style.gridLevels]}
            onValueChange={([v]) => patchStyle({ gridLevels: v ?? 5 })}
          />
        </div>

        <div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">描边</span>
            <span className="tabular-nums text-fg">{style.strokeWidth}</span>
          </div>
          <Slider
            min={1}
            max={5}
            step={0.5}
            value={[style.strokeWidth]}
            onValueChange={([v]) => patchStyle({ strokeWidth: v ?? 2 })}
          />
        </div>

        <div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">旋转</span>
            <span className="tabular-nums text-fg">{style.rotation}°</span>
          </div>
          <Slider
            min={0}
            max={360}
            step={1}
            value={[style.rotation]}
            onValueChange={([v]) => patchStyle({ rotation: v ?? 0 })}
          />
        </div>
      </Section>
    </div>
  );
}
