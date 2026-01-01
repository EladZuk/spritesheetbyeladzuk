import { useState, useCallback } from "react";
import { FrameData, SpriteSheetSettings, ExportInfo, ValidationError, SpriteSheetMetadata } from "@/types/spritesheet";

const DEFAULT_SETTINGS: SpriteSheetSettings = {
  frameWidth: 500,
  frameHeight: 500,
  columns: 5,
  spacing: 0,
  padding: 0,
  animationName: "",
  suggestedFps: 12,
  flipHorizontal: false,
};

export function useSpriteSheet() {
  const [frames, setFrames] = useState<FrameData[]>([]);
  const [settings, setSettings] = useState<SpriteSheetSettings>(DEFAULT_SETTINGS);
  const [generatedSheet, setGeneratedSheet] = useState<string | null>(null);
  const [exportInfo, setExportInfo] = useState<ExportInfo | null>(null);
  const [metadata, setMetadata] = useState<SpriteSheetMetadata | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [detectedSize, setDetectedSize] = useState<{ width: number; height: number } | null>(null);
  const [showSizeDialog, setShowSizeDialog] = useState(false);
  const [hasManuallySetSize, setHasManuallySetSize] = useState(false);

  const addFiles = useCallback(async (files: FileList) => {
    const newFrames: FrameData[] = [];
    let firstFrameSize: { width: number; height: number } | null = null;

    for (const file of Array.from(files)) {
      if (!file.type.includes("png")) continue;

      const thumbnailUrl = URL.createObjectURL(file);
      
      // Load image to get dimensions
      const dimensions = await new Promise<{ width: number; height: number }>((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ width: img.width, height: img.height });
        img.src = thumbnailUrl;
      });

      // Capture first frame size for auto-detection
      if (!firstFrameSize) {
        firstFrameSize = { width: dimensions.width, height: dimensions.height };
      }

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
    setMetadata(null);

    // Auto-detect frame size from first PNG if not manually set
    if (firstFrameSize && !hasManuallySetSize) {
      setDetectedSize(firstFrameSize);
      setShowSizeDialog(true);
    }
  }, [hasManuallySetSize]);

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
    setMetadata(null);
  }, []);

  const duplicateFrame = useCallback((id: string) => {
    setFrames((prev) => {
      const index = prev.findIndex((f) => f.id === id);
      if (index === -1) return prev;
      
      const frameToDupe = prev[index];
      const newFrame: FrameData = {
        ...frameToDupe,
        id: `${frameToDupe.name}-${Date.now()}-${Math.random()}`,
        name: `${frameToDupe.name.replace(/\.png$/i, '')}_copy.png`,
      };
      
      const newFrames = [...prev];
      newFrames.splice(index + 1, 0, newFrame);
      return newFrames;
    });
    setGeneratedSheet(null);
    setExportInfo(null);
    setMetadata(null);
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
    setMetadata(null);
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
      const { frameWidth, frameHeight, columns, spacing, padding, flipHorizontal } = settings;
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

        if (flipHorizontal) {
          ctx.save();
          ctx.translate(x + frameWidth, y);
          ctx.scale(-1, 1);
          ctx.drawImage(img, 0, 0, frameWidth, frameHeight);
          ctx.restore();
        } else {
          ctx.drawImage(img, x, y, frameWidth, frameHeight);
        }
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

      // Generate metadata
      setMetadata({
        animationName: settings.animationName || "sprite",
        frameWidth,
        frameHeight,
        frameCount,
        columns,
        rows,
        spacing,
        padding,
        suggestedFps: settings.suggestedFps,
        pivot: "BottomCenter",
        frames: frames.map((frame, index) => ({
          index,
          filename: frame.name,
        })),
      });
    } finally {
      setIsGenerating(false);
    }
  }, [frames, settings, validateFrames]);

  const clearAll = useCallback(() => {
    // Revoke all object URLs
    frames.forEach((frame) => URL.revokeObjectURL(frame.thumbnailUrl));
    
    setFrames([]);
    setSettings(DEFAULT_SETTINGS);
    setGeneratedSheet(null);
    setExportInfo(null);
    setMetadata(null);
    setValidationErrors([]);
    setDetectedSize(null);
    setShowSizeDialog(false);
    setHasManuallySetSize(false);
  }, [frames]);

  const applyDetectedSize = useCallback(() => {
    if (detectedSize) {
      setSettings((prev) => ({
        ...prev,
        frameWidth: detectedSize.width,
        frameHeight: detectedSize.height,
      }));
    }
    setShowSizeDialog(false);
  }, [detectedSize]);

  const dismissSizeDialog = useCallback(() => {
    setShowSizeDialog(false);
  }, []);

  const updateSettings = useCallback((newSettings: SpriteSheetSettings) => {
    setSettings(newSettings);
    // Mark as manually set if width or height changed
    setHasManuallySetSize(true);
  }, []);

  return {
    frames,
    settings,
    setSettings: updateSettings,
    addFiles,
    removeFrame,
    duplicateFrame,
    reorderFrames,
    generateSheet,
    generatedSheet,
    exportInfo,
    metadata,
    isGenerating,
    validationErrors,
    validateFrames,
    clearAll,
    detectedSize,
    showSizeDialog,
    applyDetectedSize,
    dismissSizeDialog,
  };
}
