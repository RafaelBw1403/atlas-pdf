import { ITemplate } from "../types/mongo.types";

const WATERMARK_MAP: Record<string, { label: string; color: string; fontSize: string }> = {
  qa:         { label: "QA - PRUEBAS",  color: "rgba(255, 165, 0, 0.25)", fontSize: "120px" },
  production: { label: "PRODUCCIÓN",    color: "rgba(0, 200, 0, 0.20)",   fontSize: "100px" },
  draft:      { label: "BORRADOR",      color: "rgba(128, 128, 128, 0.25)", fontSize: "100px" },
  historical: { label: "HISTÓRICO",     color: "rgba(100, 100, 150, 0.25)", fontSize: "100px" },
};

function buildWatermarkCss(label: string, color: string, fontSize: string): string {
  return `
    body::after {
      content: "${label}";
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: ${fontSize};
      color: ${color};
      z-index: 9999;
      pointer-events: none;
      white-space: nowrap;
      font-family: sans-serif;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 10px;
    }
  `;
}

export function applyWatermark(document: ITemplate): void {
  const config = WATERMARK_MAP[document.stage];
  if (config) {
    document.css += buildWatermarkCss(config.label, config.color, config.fontSize);
  }
}
