export type Pt = { x: number; y: number };

export function axisAngle(index: number, count: number, rotationDeg: number) {
  const step = (Math.PI * 2) / count;
  return -Math.PI / 2 + (rotationDeg * Math.PI) / 180 + index * step;
}

export function polar(cx: number, cy: number, r: number, angle: number): Pt {
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}

export function polygonPath(points: Pt[]) {
  if (points.length === 0) return "";
  return `M ${points.map((p) => `${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" L ")} Z`;
}

/** Closed Catmull-Rom spline converted to cubic Beziers. */
export function smoothClosedPath(points: Pt[], tension = 0.85) {
  const n = points.length;
  if (n < 3) return polygonPath(points);
  let d = `M ${points[0]!.x.toFixed(2)} ${points[0]!.y.toFixed(2)}`;
  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n]!;
    const p1 = points[i]!;
    const p2 = points[(i + 1) % n]!;
    const p3 = points[(i + 2) % n]!;
    const cp1x = p1.x + ((p2.x - p0.x) / 6) * tension;
    const cp1y = p1.y + ((p2.y - p0.y) / 6) * tension;
    const cp2x = p2.x - ((p3.x - p1.x) / 6) * tension;
    const cp2y = p2.y - ((p3.y - p1.y) / 6) * tension;
    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return `${d} Z`;
}

export function projectOntoAxis(
  px: number,
  py: number,
  cx: number,
  cy: number,
  angle: number,
  maxR: number,
) {
  const vx = Math.cos(angle);
  const vy = Math.sin(angle);
  const proj = (px - cx) * vx + (py - cy) * vy;
  return Math.min(maxR, Math.max(0, proj));
}

export function svgPoint(svg: SVGSVGElement, clientX: number, clientY: number): Pt {
  const ctm = svg.getScreenCTM();
  if (!ctm) {
    const rect = svg.getBoundingClientRect();
    const viewBox = svg.viewBox.baseVal;
    return {
      x: ((clientX - rect.left) / rect.width) * viewBox.width,
      y: ((clientY - rect.top) / rect.height) * viewBox.height,
    };
  }
  const pt = svg.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  const loc = pt.matrixTransform(ctm.inverse());
  return { x: loc.x, y: loc.y };
}

export function labelAnchor(angle: number): {
  textAnchor: "start" | "middle" | "end";
  dy: number;
} {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  let textAnchor: "start" | "middle" | "end" = "middle";
  if (c > 0.35) textAnchor = "start";
  else if (c < -0.35) textAnchor = "end";
  let dy = 0;
  if (s > 0.55) dy = 6;
  else if (s < -0.55) dy = -2;
  return { textAnchor, dy };
}
