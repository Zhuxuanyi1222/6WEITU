function resolveCssVars(svgMarkup: string) {
  const cs = getComputedStyle(document.documentElement);
  return svgMarkup.replace(/var\((--[a-z0-9-]+)\)/gi, (full, name: string) => {
    const v = cs.getPropertyValue(name).trim();
    return v || full;
  });
}

function serializeSvg(svg: SVGSVGElement) {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.querySelectorAll("[data-hide-export]").forEach((el) => el.remove());
  const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  bg.setAttribute("width", "100%");
  bg.setAttribute("height", "100%");
  bg.setAttribute(
    "fill",
    getComputedStyle(document.documentElement).getPropertyValue("--bg").trim() ||
      "#09090b",
  );
  clone.insertBefore(bg, clone.firstChild);
  return resolveCssVars(new XMLSerializer().serializeToString(clone));
}

function download(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportSvg(svg: SVGSVGElement, filename = "hexa-radar.svg") {
  const markup = serializeSvg(svg);
  download(filename, new Blob([markup], { type: "image/svg+xml;charset=utf-8" }));
}

export function exportPng(svg: SVGSVGElement, filename = "hexa-radar.png") {
  const markup = serializeSvg(svg);
  const blob = new Blob([markup], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1600;
    canvas.height = 1600;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(img, 0, 0, 1600, 1600);
    canvas.toBlob((out) => {
      if (out) download(filename, out);
      URL.revokeObjectURL(url);
    }, "image/png");
  };
  img.onerror = () => URL.revokeObjectURL(url);
  img.src = url;
}

export async function copyJson(data: unknown) {
  await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
}
