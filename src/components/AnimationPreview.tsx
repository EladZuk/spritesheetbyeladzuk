import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { FrameData } from "@/types/spritesheet";

interface AnimationPreviewProps {
  frames: FrameData[];
  fps: number;
  onFpsChange: (fps: number) => void;
  frameWidth: number;
  frameHeight: number;
  flipHorizontal: boolean;
}

export function AnimationPreview({
  frames,
  fps,
  onFpsChange,
  frameWidth,
  frameHeight,
  flipHorizontal,
}: AnimationPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopAnimation = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startAnimation = useCallback(() => {
    stopAnimation();
    if (frames.length === 0) return;
    
    const interval = 1000 / fps;
    intervalRef.current = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % frames.length);
    }, interval);
  }, [frames.length, fps, stopAnimation]);

  // Handle play/pause
  useEffect(() => {
    if (isPlaying && frames.length > 0) {
      startAnimation();
    } else {
      stopAnimation();
    }
    return () => stopAnimation();
  }, [isPlaying, frames.length, fps, startAnimation, stopAnimation]);

  // Reset when frames change
  useEffect(() => {
    setCurrentFrame(0);
  }, [frames]);

  // Stop if no frames
  useEffect(() => {
    if (frames.length === 0) {
      setIsPlaying(false);
      setCurrentFrame(0);
    }
  }, [frames.length]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // Calculate preview size maintaining aspect ratio
  const maxPreviewSize = 150;
  const aspectRatio = frameWidth / frameHeight;
  let previewWidth = maxPreviewSize;
  let previewHeight = maxPreviewSize;
  
  if (aspectRatio > 1) {
    previewHeight = maxPreviewSize / aspectRatio;
  } else {
    previewWidth = maxPreviewSize * aspectRatio;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Animation Preview</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={togglePlay}
          disabled={frames.length === 0}
          className="gap-2"
        >
          {isPlaying ? (
            <>
              <Pause className="w-3 h-3" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-3 h-3" />
              Play
            </>
          )}
        </Button>
      </div>

      {/* Preview Display */}
      <div
        className="flex items-center justify-center rounded-lg border border-border overflow-hidden"
        style={{
          minHeight: 160,
          backgroundImage: `
            linear-gradient(45deg, hsl(var(--muted)) 25%, transparent 25%),
            linear-gradient(-45deg, hsl(var(--muted)) 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, hsl(var(--muted)) 75%),
            linear-gradient(-45deg, transparent 75%, hsl(var(--muted)) 75%)
          `,
          backgroundSize: "12px 12px",
          backgroundPosition: "0 0, 0 6px, 6px -6px, -6px 0px",
        }}
      >
        {frames.length > 0 ? (
          <div className="relative" style={{ width: previewWidth, height: previewHeight }}>
            <img
              src={frames[currentFrame]?.thumbnailUrl}
              alt={`Frame ${currentFrame + 1}`}
              className="w-full h-full object-contain"
              style={{ 
                imageRendering: "pixelated",
                transform: flipHorizontal ? "scaleX(-1)" : undefined,
              }}
            />
            <span className="absolute bottom-1 right-1 text-[10px] font-mono bg-background/80 px-1.5 py-0.5 rounded">
              {currentFrame + 1}/{frames.length}
            </span>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground px-4 text-center">
            Upload frames to preview the animation.
          </p>
        )}
      </div>

      {/* FPS Control */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="input-label">Preview FPS</Label>
          <span className="text-xs font-mono text-primary">{fps}</span>
        </div>
        <Slider
          value={[fps]}
          onValueChange={(value) => onFpsChange(value[0])}
          min={1}
          max={60}
          step={1}
          className="w-full"
        />
      </div>

      <div className="flex items-start gap-1.5 text-[10px] text-muted-foreground">
        <Info className="w-3 h-3 flex-shrink-0 mt-0.5" />
        <span>Preview only. Actual FPS is set in Unity.</span>
      </div>
    </div>
  );
}