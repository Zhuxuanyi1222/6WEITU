import { Download, Moon, RotateCcw, Shuffle, Sun, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { RadarCanvas } from "@/components/radar/RadarCanvas";
import { ControlPanel } from "@/components/radar/ControlPanel";
import { Button } from "@/components/ui/button";
import { copyJson, exportPng, exportSvg } from "@/lib/radar/export";
import { hydrateRadarStore, useRadarStore } from "@/lib/radar/store";

export function AppShell() {
  const svgRef = useRef<SVGSVGElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const theme = useRadarStore((s) => s.theme);
  const setTheme = useRadarStore((s) => s.setTheme);
  const randomize = useRadarStore((s) => s.randomize);
  const loadSnapshot = useRadarStore((s) => s.loadSnapshot);
  const toSnapshot = useRadarStore((s) => s.toSnapshot);
  const [notice, setNotice] = useState<string | null>(null);
  const [exportOpen, setExportOpen] = useState(false);

  useEffect(() => {
    hydrateRadarStore();
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    if (!exportOpen) return;
    const close = () => setExportOpen(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [exportOpen]);

  useEffect(() => {
    if (!notice) return;
    const t = window.setTimeout(() => setNotice(null), 1800);
    return () => window.clearTimeout(t);
  }, [notice]);

  const replayIntro = () => {
    const snap = toSnapshot();
    const zeroed = {
      ...snap,
      series: snap.series.map((s) => ({
        ...s,
        values: s.values.map(() => 0),
      })),
    };
    loadSnapshot(zeroed);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => loadSnapshot(snap));
    });
  };

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-5 pb-20 sm:px-8 lg:px-10 lg:py-8">
        <header className="flex flex-wrap items-center gap-3">
          <div className="mr-auto min-w-0">
            <p className="text-xs font-medium tracking-widest text-muted uppercase">
              Radar Studio
            </p>
            <h1 className="font-display text-3xl leading-none tracking-[var(--tracking-display)] text-balance sm:text-4xl">
              HEXA
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="subtle" size="sm" onClick={randomize}>
              <Shuffle />
              随机
            </Button>
            <Button variant="subtle" size="sm" onClick={replayIntro}>
              <RotateCcw />
              回放
            </Button>
            <div className="relative">
              <Button
                variant="subtle"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setExportOpen((v) => !v);
                }}
                aria-expanded={exportOpen}
              >
                <Download />
                导出
              </Button>
              {exportOpen && (
                <div
                  className="absolute right-0 z-20 mt-2 w-44 rounded-lg bg-surface p-1.5 shadow-[var(--shadow-border)]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    className="flex h-10 w-full items-center rounded-sm px-3 text-sm text-fg hover:bg-elevated"
                    onClick={() => {
                      if (svgRef.current) exportPng(svgRef.current);
                      setExportOpen(false);
                      setNotice("已导出 PNG");
                    }}
                  >
                    导出 PNG
                  </button>
                  <button
                    type="button"
                    className="flex h-10 w-full items-center rounded-sm px-3 text-sm text-fg hover:bg-elevated"
                    onClick={() => {
                      if (svgRef.current) exportSvg(svgRef.current);
                      setExportOpen(false);
                      setNotice("已导出 SVG");
                    }}
                  >
                    导出 SVG
                  </button>
                  <button
                    type="button"
                    className="flex h-10 w-full items-center rounded-sm px-3 text-sm text-fg hover:bg-elevated"
                    onClick={async () => {
                      await copyJson(toSnapshot());
                      setExportOpen(false);
                      setNotice("配置已复制");
                    }}
                  >
                    复制 JSON
                  </button>
                </div>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileRef.current?.click()}
            >
              <Upload />
              导入
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (!file) return;
                try {
                  const text = await file.text();
                  loadSnapshot(JSON.parse(text));
                  setNotice("已导入配置");
                } catch {
                  setNotice("导入失败");
                }
              }}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label={theme === "dark" ? "切换浅色" : "切换深色"}
            >
              <span className="relative size-4">
                <Sun
                  className={cnIcon(theme === "light")}
                />
                <Moon
                  className={cnIcon(theme === "dark")}
                />
              </span>
            </Button>
          </div>
        </header>

        <div className="grid items-start gap-6 lg:grid-cols-5">
          <section className="min-w-0 rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-8 lg:col-span-3">
            <RadarCanvas svgRef={svgRef} />
            <p className="mt-3 px-2 text-center text-sm text-muted">
              拖动顶点或点击轴线调整数值，切换预设可看到形态过渡。
            </p>
          </section>

          <aside className="min-w-0 rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5 lg:col-span-2">
            <ControlPanel />
          </aside>
        </div>
      </div>

      <div
        className={`pointer-events-none fixed bottom-6 left-1/2 z-30 -translate-x-1/2 rounded-full bg-elevated px-4 py-2 text-sm text-fg shadow-[var(--shadow-border)] transition-[opacity,transform,filter] duration-[var(--motion-fast)] ease-[var(--ease-out)] ${
          notice
            ? "translate-y-0 opacity-100 blur-0"
            : "translate-y-2 opacity-0 blur-[2px]"
        }`}
        role="status"
      >
        {notice ?? " "}
      </div>
    </div>
  );
}

function cnIcon(active: boolean) {
  return [
    "absolute inset-0 size-4 transition-[opacity,transform,filter] duration-[var(--motion-fast)] ease-[var(--ease-out)]",
    active
      ? "scale-100 opacity-100 blur-0"
      : "scale-[0.25] opacity-0 blur-[4px]",
  ].join(" ");
}
