import { useCallback } from "react";
import { GripVertical, X, AlertCircle, Copy, ArrowDownUp } from "lucide-react";
import { FrameData, ValidationError } from "@/types/spritesheet";
import { Button } from "@/components/ui/button";

interface FrameListProps {
  frames: FrameData[];
  onReorder: (fromIndex: number, toIndex: number) => void;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
  onReverse: () => void;
  validationErrors: ValidationError[];
  expectedWidth: number;
  expectedHeight: number;
}

export function FrameList({
  frames,
  onReorder,
  onRemove,
  onDuplicate,
  onReverse,
  validationErrors,
  expectedWidth,
  expectedHeight,
}: FrameListProps) {
  const handleDragStart = useCallback(
    (e: React.DragEvent, index: number) => {
      e.dataTransfer.setData("text/plain", index.toString());
      e.dataTransfer.effectAllowed = "move";
    },
    []
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, targetIndex: number) => {
      e.preventDefault();
      const sourceIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
      if (sourceIndex !== targetIndex) {
        onReorder(sourceIndex, targetIndex);
      }
    },
    [onReorder]
  );

  const getError = (fileName: string) =>
    validationErrors.find((e) => e.fileName === fileName);

  if (frames.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        No frames loaded yet
      </div>
    );
  }

  const showReverseButton = frames.length >= 2;

  return (
    <div className="space-y-2">
      {showReverseButton && (
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2"
          onClick={onReverse}
        >
          <ArrowDownUp className="w-3.5 h-3.5" />
          Reverse Order
        </Button>
      )}
      <div className="space-y-1.5 max-h-64 overflow-y-auto scrollbar-thin pr-1">
        {frames.map((frame, index) => {
        const error = getError(frame.name);
        return (
          <div
            key={frame.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            className={`flex items-center gap-2 p-2 rounded-md bg-secondary/50 border transition-all hover:bg-secondary group ${
              error ? "border-destructive/50" : "border-transparent"
            }`}
          >
            <div className="drag-handle text-muted-foreground hover:text-foreground transition-colors">
              <GripVertical className="w-4 h-4" />
            </div>
            <div className="w-10 h-10 rounded bg-muted flex-shrink-0 overflow-hidden">
              <img
                src={frame.thumbnailUrl}
                alt={frame.name}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-mono truncate text-foreground">
                {frame.name}
              </p>
              <p className="text-[10px] text-muted-foreground font-mono">
                {frame.width} × {frame.height}
              </p>
            </div>
            {error && (
              <div className="flex items-center gap-1 text-destructive" title={`Expected ${expectedWidth}×${expectedHeight}`}>
                <AlertCircle className="w-3.5 h-3.5" />
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onDuplicate(frame.id)}
              title="Duplicate frame"
            >
              <Copy className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onRemove(frame.id)}
              title="Remove frame"
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        );
      })}
      </div>
    </div>
  );
}
