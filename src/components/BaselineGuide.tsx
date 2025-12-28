import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface BaselineGuideProps {
  enabled: boolean;
  offset: number;
  frameHeight: number;
  onEnabledChange: (enabled: boolean) => void;
  onOffsetChange: (offset: number) => void;
}

export function BaselineGuide({
  enabled,
  offset,
  frameHeight,
  onEnabledChange,
  onOffsetChange,
}: BaselineGuideProps) {
  const percentage = Math.round((offset / frameHeight) * 100);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Checkbox
          id="baseline"
          checked={enabled}
          onCheckedChange={(checked) => onEnabledChange(checked === true)}
        />
        <Label htmlFor="baseline" className="text-sm text-foreground cursor-pointer">
          Show baseline guide
        </Label>
      </div>

      {enabled && (
        <div className="pl-6 space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Offset from top</Label>
            <span className="text-xs font-mono text-primary">
              {offset}px ({percentage}%)
            </span>
          </div>
          <Slider
            value={[offset]}
            onValueChange={([value]) => onOffsetChange(value)}
            max={frameHeight}
            min={0}
            step={1}
            className="w-full"
          />
        </div>
      )}
    </div>
  );
}
