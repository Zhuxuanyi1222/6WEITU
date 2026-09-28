import { useEffect, useRef, useState } from "react";

function keyOf(grid: number[][]) {
  return grid.map((row) => row.join(",")).join("|");
}

export function useSpringGrid(
  target: number[][],
  opts: { enabled: boolean; snap: boolean },
) {
  const [value, setValue] = useState(target);
  const valueRef = useRef(target);
  const velRef = useRef(target.map((row) => row.map(() => 0)));
  const targetRef = useRef(target);
  targetRef.current = target;

  useEffect(() => {
    const t = targetRef.current;
    if (!opts.enabled || opts.snap) {
      valueRef.current = t;
      velRef.current = t.map((row) => row.map(() => 0));
      setValue(t);
      return;
    }

    let raf = 0;
    const stiffness = 0.16;
    const damping = 0.72;

    const tick = () => {
      const nextTarget = targetRef.current;
      let cur = valueRef.current;
      let vel = velRef.current;
      if (cur.length !== nextTarget.length || cur[0]?.length !== nextTarget[0]?.length) {
        cur = nextTarget.map((row, i) =>
          row.map((_, j) => cur[i]?.[j] ?? 0),
        );
        vel = nextTarget.map((row, i) =>
          row.map((_, j) => vel[i]?.[j] ?? 0),
        );
      }
      let moving = false;
      const next = cur.map((row, i) =>
        row.map((c, j) => {
          const d = (nextTarget[i]?.[j] ?? 0) - c;
          const v = ((vel[i]?.[j] ?? 0) + d * stiffness) * damping;
          if (!vel[i]) vel[i] = [];
          vel[i]![j] = v;
          if (Math.abs(d) > 0.05 || Math.abs(v) > 0.05) moving = true;
          return c + v;
        }),
      );
      valueRef.current = next;
      velRef.current = vel;
      setValue(next);
      if (moving) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [keyOf(target), opts.enabled, opts.snap]);

  return value;
}
