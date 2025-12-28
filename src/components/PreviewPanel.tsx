import { useRef, useEffect } from "react";
import { Download, ZoomIn, ZoomOut, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FrameData, SpriteSheetSettings, ExportInfo } from "@/types/spritesheet";

interface PreviewPanelProps {
  frames: FrameData[];
  settings: SpriteSheetSettings;
  generatedSheet: string | null;
  exportInfo: ExportInfo | null;
  onGenerate: () => void;
  isGenerating: boolean;
  hasValidationErrors: boolean;
  baselineEnabled: boolean;
  baselineOffset: number;
}

export function PreviewPanel({
  frames,
  settings,
  generatedSheet,
  exportInfo,
  onGenerate,
  isGenerating,
  hasValidationErrors,
  baselineEnabled,
  baselineOffset,
}: PreviewPanelProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const canGenerate = frames.length > 0 && settings.frameWidth > 0 && settings.frameHeight > 0 && !hasValidationErrors;

  const downloadSheet = () => {
    if (!generatedSheet) return;
    const link = document.createElement("a");
    link.download = `${settings.animationName || "sprite"}_sheet.png`;
    link.href = generatedSheet;
    link.click();
  };

  // Calculate preview grid dimensions
  const cols = settings.columns;
  const rows = Math.ceil(frames.length / cols);
  const previewCellWidth = 60;
  const previewCellHeight = (previewCellWidth / settings.frameWidth) * settings.frameHeight;

  const isLargeSheet = exportInfo && (exportInfo.sheetWidth > 4096 || exportInfo.sheetHeight > 4096);

  return (
    <div className="h-full flex flex-col">
      {/* Preview Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-foreground">Preview</h2>
        <div className="flex items-center gap-2">
          <Button
            onClick={onGenerate}
            disabled={!canGenerate || isGenerating}
            className="gap-2"
          >
            {isGenerating ? "Generating..." : "Generate Sprite Sheet"}
          </Button>
        </div>
      </div>

      {/* Large Sheet Warning */}
      {isLargeSheet && (
        <div className="mb-4 p-3 rounded-lg bg-warning/10 border border-warning/30 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
          <p className="text-xs text-warning">
            <strong>Warning:</strong> This sheet is {exportInfo.sheetWidth}×{exportInfo.sheetHeight}px. In Unity you may want to reduce frame size, columns, or frames per sheet.
          </p>
        </div>
      )}

      {/* Preview Area */}
      <div
        ref={previewRef}
        className="flex-1 bg-muted/30 rounded-lg border border-border overflow-auto p-4 min-h-[300px]"
        style={{
          backgroundImage: `
            linear-gradient(45deg, hsl(var(--muted)) 25%, transparent 25%),
            linear-gradient(-45deg, hsl(var(--muted)) 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, hsl(var(--muted)) 75%),
            linear-gradient(-45deg, transparent 75%, hsl(var(--muted)) 75%)
          `,
          backgroundSize: "16px 16px",
          backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
        }}
      >
        {generatedSheet ? (
          <div className="flex items-center justify-center min-h-full">
            <img
              src={generatedSheet}
              alt="Generated sprite sheet"
              className="max-w-full h-auto"
              style={{ imageRendering: "pixelated" }}
            />
          </div>
        ) : frames.length > 0 ? (
          <div className="relative inline-block">
            {/* Frame Grid Preview */}
            <div
              className="grid gap-px"
              style={{
                gridTemplateColumns: `repeat(${cols}, ${previewCellWidth}px)`,
              }}
            >
              {frames.map((frame, index) => (
                <div
                  key={frame.id}
                  className="relative bg-secondary/50 overflow-hidden"
                  style={{
                    width: previewCellWidth,
                    height: previewCellHeight,
                  }}
                >
                  <img
                    src={frame.thumbnailUrl}
                    alt={frame.name}
                    className="w-full h-full object-contain"
                    style={{ imageRendering: "pixelated" }}
                  />
                  <span className="absolute bottom-0.5 left-0.5 text-[9px] font-mono bg-background/80 px-1 rounded">
                    {index + 1}
                  </span>
                </div>
              ))}
            </div>

            {/* Baseline Guide Overlay */}
            {baselineEnabled && (
              <div
                className="baseline-guide"
                style={{
                  top: `${(baselineOffset / settings.frameHeight) * 100}%`,
                }}
              />
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            Upload PNG frames to see preview
          </div>
        )}
      </div>

      {/* Export Info & Download */}
      {exportInfo && generatedSheet && (
        <div className="mt-4 p-4 rounded-lg bg-card border border-border">
          <div className="flex items-start justify-between">
            <div className="space-y-2 text-xs font-mono">
              <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                <span className="text-muted-foreground">Animation:</span>
                <span className="text-foreground">{exportInfo.animationName || "sprite"}</span>
                <span className="text-muted-foreground">Frame size:</span>
                <span className="text-foreground">{exportInfo.frameWidth} × {exportInfo.frameHeight}</span>
                <span className="text-muted-foreground">Frames:</span>
                <span className="text-foreground">{exportInfo.frameCount}</span>
                <span className="text-muted-foreground">Grid:</span>
                <span className="text-foreground">{exportInfo.columns} × {exportInfo.rows}</span>
                <span className="text-muted-foreground">Sheet size:</span>
                <span className="text-foreground">{exportInfo.sheetWidth} × {exportInfo.sheetHeight}</span>
                <span className="text-muted-foreground">Unity FPS:</span>
                <span className="text-primary">{exportInfo.suggestedFps}</span>
              </div>
            </div>
            <Button onClick={downloadSheet} className="gap-2">
              <Download className="w-4 h-4" />
              Download PNG
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
