import { useRef, useState } from "react";
import { Download, AlertTriangle, Copy, Check, Film, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FrameData, SpriteSheetSettings, ExportInfo } from "@/types/spritesheet";
import { toast } from "sonner";
import GIF from "gif.js";

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
  const [copied, setCopied] = useState(false);
  const [isExportingGif, setIsExportingGif] = useState(false);
  const canGenerate = frames.length > 0 && settings.frameWidth > 0 && settings.frameHeight > 0 && !hasValidationErrors;

  const downloadSheet = () => {
    if (!generatedSheet) return;
    const link = document.createElement("a");
    link.download = `${settings.animationName || "sprite"}_sheet.png`;
    link.href = generatedSheet;
    link.click();
  };

  const exportAsGif = async () => {
    if (frames.length === 0) return;
    
    setIsExportingGif(true);
    
    try {
      const gif = new GIF({
        workers: 2,
        quality: 10,
        width: settings.frameWidth,
        height: settings.frameHeight,
        workerScript: "https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.worker.js",
      });

      // Load all frame images
      for (const frame of frames) {
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const image = new Image();
          image.crossOrigin = "anonymous";
          image.onload = () => resolve(image);
          image.onerror = reject;
          image.src = frame.thumbnailUrl;
        });

        // Draw to canvas for GIF
        const canvas = document.createElement("canvas");
        canvas.width = settings.frameWidth;
        canvas.height = settings.frameHeight;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, settings.frameWidth, settings.frameHeight);
        
        gif.addFrame(ctx, { copy: true, delay: Math.round(1000 / settings.suggestedFps) });
      }

      gif.on("finished", (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = `${settings.animationName || "sprite"}_animation.gif`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        setIsExportingGif(false);
        toast.success("GIF exported successfully!");
      });

      gif.render();
    } catch (error) {
      console.error("GIF export failed:", error);
      toast.error("Failed to export GIF");
      setIsExportingGif(false);
    }
  };

  const copyExportInfo = async () => {
    if (!exportInfo) return;
    
    const text = `Animation name: ${exportInfo.animationName || "sprite"}
Frame size: ${exportInfo.frameWidth} × ${exportInfo.frameHeight}
Frames: ${exportInfo.frameCount}
Columns: ${exportInfo.columns}
Rows: ${exportInfo.rows}
Suggested FPS (Unity): ${exportInfo.suggestedFps}`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Export info copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy to clipboard");
    }
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
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 text-xs font-mono flex-1">
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
            <div className="flex flex-col gap-2">
              <Button onClick={copyExportInfo} variant="outline" size="sm" className="gap-2">
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied!" : "Copy Info"}
              </Button>
              <Button onClick={downloadSheet} className="gap-2">
                <Download className="w-4 h-4" />
                Download PNG
              </Button>
              <Button onClick={exportAsGif} variant="secondary" className="gap-2" disabled={isExportingGif || frames.length === 0}>
                {isExportingGif ? <Loader2 className="w-4 h-4 animate-spin" /> : <Film className="w-4 h-4" />}
                {isExportingGif ? "Exporting..." : "Export GIF"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
