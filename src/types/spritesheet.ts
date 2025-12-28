export interface FrameData {
  id: string;
  file: File;
  name: string;
  thumbnailUrl: string;
  width: number;
  height: number;
}

export interface SpriteSheetSettings {
  frameWidth: number;
  frameHeight: number;
  columns: number;
  spacing: number;
  padding: number;
  animationName: string;
  suggestedFps: number;
}

export interface ExportInfo {
  animationName: string;
  frameWidth: number;
  frameHeight: number;
  frameCount: number;
  columns: number;
  rows: number;
  suggestedFps: number;
  sheetWidth: number;
  sheetHeight: number;
}

export interface ValidationError {
  fileName: string;
  expectedSize: string;
  actualSize: string;
}
