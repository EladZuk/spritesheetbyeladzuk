import { useState, useCallback } from "react";
import { FrameData, SpriteSheetSettings, ExportInfo, ValidationError } from "@/types/spritesheet";

export function useSpriteSheet() {
  const [frames, setFrames] = useState<FrameData[]>([]);
  const [settings, setSettings] = useState<SpriteSheetSettings>({
    frameWidth: 500,
    frameHeight: 500,
    columns: 5,
    spacing: 0,
    padding: 0,
    animationName: "",
    suggestedFps: 12,
  });
  const [generatedSheet, setGeneratedSheet] = useState<string | null>(null);
  const [exportInfo, setExportInfo] = useState<ExportInfo | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  const addFiles = useCallback(async (files: FileList) => {
    const newFrames: FrameData[] = [];

    for (const file of Array.from(files)) {
      if (!file.type.includes("png")) continue;

      const thumbnailUrl = URL.createObjectURL(file);
      
      // Load image to get dimensions
      const dimensions = await new Promise<{ width: number; height: number }>((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ width: img.width, height: img.height });
        img.src = thumbnailUrl;
      });

      newFrames.push({
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        file,
        name: file.name,
        thumbnailUrl,
        width: dimensions.width,
        height: dimensions.height,
      });
    }

    // Sort by filename
    newFrames.sort((a, b) => a.name.localeCompare(b.name));

    setFrames((prev) => {
      const combined = [...prev, ...newFrames];
      combined.sort((a, b) => a.name.localeCompare(b.name));
      return combined;
    });
    setGeneratedSheet(null);
    setExportInfo(null);
  }, []);

  const removeFrame = useCallback((id: string) => {
    setFrames((prev) => {
      const frame = prev.find((f) => f.id === id);
      if (frame) {
        URL.revokeObjectURL(frame.thumbnailUrl);
      }
      return prev.filter((f) => f.id !== id);
    });
    setGeneratedSheet(null);
    setExportInfo(null);
  }, []);

  const reorderFrames = useCallback((fromIndex: number, toIndex: number) => {
    setFrames((prev) => {
      const newFrames = [...prev];
      const [removed] = newFrames.splice(fromIndex, 1);
      newFrames.splice(toIndex, 0, removed);
      return newFrames;
    });
    setGeneratedSheet(null);
    setExportInfo(null);
  }, []);

  const validateFrames = useCallback(() => {
    const errors: ValidationError[] = [];
    
    for (const frame of frames) {
      if (frame.width !== settings.frameWidth || frame.height !== settings.frameHeight) {
        errors.push({
          fileName: frame.name,
          expectedSize: `${settings.frameWidth}×${settings.frameHeight}`,
          actualSize: `${frame.width}×${frame.height}`,
        });
      }
    }

    setValidationErrors(errors);
    return errors.length === 0;
  }, [frames, settings.frameWidth, settings.frameHeight]);

  const generateSheet = useCallback(async () => {
    if (!validateFrames()) return;

    setIsGenerating(true);

    try {
      const { frameWidth, frameHeight, columns, spacing, padding } = settings;
      const frameCount = frames.length;
      const rows = Math.ceil(frameCount / columns);

      const totalWidth = padding * 2 + columns * frameWidth + (columns - 1) * spacing;
      const totalHeight = padding * 2 + rows * frameHeight + (rows - 1) * spacing;

      // Create canvas
      const canvas = document.createElement("canvas");
      canvas.width = totalWidth;
      canvas.height = totalHeight;
      const ctx = canvas.getContext("2d")!;

      // Transparent background
      ctx.clearRect(0, 0, totalWidth, totalHeight);

      // Load and draw each frame
      for (let i = 0; i < frames.length; i++) {
        const frame = frames[i];
        const row = Math.floor(i / columns);
        const col = i % columns;
        const x = padding + col * (frameWidth + spacing);
        const y = padding + row * (frameHeight + spacing);

        const img = await new Promise<HTMLImageElement>((resolve) => {
          const image = new Image();
          image.onload = () => resolve(image);
          image.src = frame.thumbnailUrl;
        });

        ctx.drawImage(img, x, y, frameWidth, frameHeight);
      }

      // Export as PNG
      const dataUrl = canvas.toDataURL("image/png");
      setGeneratedSheet(dataUrl);

      setExportInfo({
        animationName: settings.animationName || "sprite",
        frameWidth,
        frameHeight,
        frameCount,
        columns,
        rows,
        suggestedFps: settings.suggestedFps,
        sheetWidth: totalWidth,
        sheetHeight: totalHeight,
      });
    } finally {
      setIsGenerating(false);
    }
  }, [frames, settings, validateFrames]);

  return {
    frames,
    settings,
    setSettings,
    addFiles,
    removeFrame,
    reorderFrames,
    generateSheet,
    generatedSheet,
    exportInfo,
    isGenerating,
    validationErrors,
    validateFrames,
  };
}
