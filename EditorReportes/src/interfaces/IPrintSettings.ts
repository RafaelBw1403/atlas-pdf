
export interface ILayoutSettings {
  format: string;
  orientation: boolean; // true = horizontal, false = vertical
  width?: number;  // Ancho final en mm
  height?: number; // Alto final en mm
  unit: 'mm' | 'cm' | 'in' | 'px'; // Unidad de medida
}

export interface IMarginSettings {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface IOptionSettings {
  scale: number;
  printBackground: boolean;
  pageNumbers: boolean;
}

export interface IPrintConfig {
  layout: ILayoutSettings;
  margin: IMarginSettings;
  options: IOptionSettings;
  headerHeight: number; // Alto fijo del encabezado en mm (0 = automático)
  footerHeight: number; // Alto fijo del pie en mm (0 = automático)
}