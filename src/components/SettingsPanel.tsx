import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { SpriteSheetSettings } from "@/types/spritesheet";

interface SettingsPanelProps {
  settings: SpriteSheetSettings;
  onSettingsChange: (settings: SpriteSheetSettings) => void;
}

export function SettingsPanel({ settings, onSettingsChange }: SettingsPanelProps) {
  const handleChange = (key: keyof SpriteSheetSettings, value: string | number | boolean) => {
    onSettingsChange({
      ...settings,
      [key]: typeof settings[key] === "number" ? Number(value) || 0 : value,
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="input-label">Frame Width</Label>
          <Input
            type="number"
            value={settings.frameWidth}
            onChange={(e) => handleChange("frameWidth", e.target.value)}
            className="font-mono text-sm"
            min={1}
          />
        </div>
        <div>
          <Label className="input-label">Frame Height</Label>
          <Input
            type="number"
            value={settings.frameHeight}
            onChange={(e) => handleChange("frameHeight", e.target.value)}
            className="font-mono text-sm"
            min={1}
          />
        </div>
      </div>

      <div>
        <Label className="input-label">Columns</Label>
        <Input
          type="number"
          value={settings.columns}
          onChange={(e) => handleChange("columns", e.target.value)}
          className="font-mono text-sm"
          min={1}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="input-label">Spacing (px)</Label>
          <Input
            type="number"
            value={settings.spacing}
            onChange={(e) => handleChange("spacing", e.target.value)}
            className="font-mono text-sm"
            min={0}
          />
        </div>
        <div>
          <Label className="input-label">Padding (px)</Label>
          <Input
            type="number"
            value={settings.padding}
            onChange={(e) => handleChange("padding", e.target.value)}
            className="font-mono text-sm"
            min={0}
          />
        </div>
      </div>

      {/* Flip Horizontal Option */}
      <div className="pt-2 border-t border-border">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="flipHorizontal"
            checked={settings.flipHorizontal}
            onCheckedChange={(checked) => handleChange("flipHorizontal", checked === true)}
          />
          <Label
            htmlFor="flipHorizontal"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            Flip horizontally (mirror)
          </Label>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1 ml-6">
          If enabled, each frame will be mirrored horizontally in the generated sheet.
        </p>
      </div>

      <div className="pt-2 border-t border-border">
        <div>
          <Label className="input-label">Animation Name</Label>
          <Input
            type="text"
            value={settings.animationName}
            onChange={(e) => handleChange("animationName", e.target.value)}
            placeholder="e.g. hugo_idle"
            className="font-mono text-sm"
          />
        </div>
      </div>

      <div>
        <Label className="input-label">Suggested FPS (Unity)</Label>
        <Input
          type="number"
          value={settings.suggestedFps}
          onChange={(e) => handleChange("suggestedFps", e.target.value)}
          className="font-mono text-sm"
          min={1}
        />
      </div>
    </div>
  );
}
