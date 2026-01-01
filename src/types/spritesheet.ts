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
  flipHorizontal: boolean;
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

export interface FrameMetadata {
  index: number;
  filename: string;
}

export interface SpriteSheetMetadata {
  animationName: string;
  frameWidth: number;
  frameHeight: number;
  frameCount: number;
  columns: number;
  rows: number;
  spacing: number;
  padding: number;
  suggestedFps: number;
  pivot: string;
  frames: FrameMetadata[];
}

export interface ValidationError {
  fileName: string;
  expectedSize: string;
  actualSize: string;
}
