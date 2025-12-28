import { Info, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

export function UnityGuide() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="panel">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="panel-header mb-0">
          <Info className="w-4 h-4 text-info" />
          <span>Unity Setup Guide</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-3 text-xs text-muted-foreground">
          <ol className="space-y-2 list-decimal list-inside">
            <li>Import the generated PNG into Unity.</li>
            <li>
              In the Inspector, set:
              <ul className="ml-5 mt-1 space-y-1 list-disc list-inside">
                <li>
                  <span className="text-foreground">Texture Type:</span> Sprite (2D and UI)
                </li>
                <li>
                  <span className="text-foreground">Sprite Mode:</span> Multiple
                </li>
                <li>
                  <span className="text-foreground">Pixels Per Unit:</span> choose a consistent value
                </li>
              </ul>
            </li>
            <li>
              Open <span className="text-foreground">Sprite Editor → Slice</span>:
              <ul className="ml-5 mt-1 space-y-1 list-disc list-inside">
                <li>
                  <span className="text-foreground">Type:</span> Grid By Cell Size
                </li>
                <li>
                  <span className="text-foreground">Cell Size:</span> [frameWidth] × [frameHeight]
                </li>
                <li>
                  <span className="text-foreground">Pivot:</span> Bottom Center (good for characters)
                </li>
              </ul>
            </li>
            <li>
              Apply, then create an Animation using the sliced sprites.
            </li>
            <li>
              Set the FPS in the Animation window to match the suggested FPS.
            </li>
          </ol>

          <p className="text-[10px] text-muted-foreground/70 pt-2 border-t border-border">
            Tip: FPS timing is handled in Unity's Animation window, not in this tool.
          </p>
        </div>
      )}
    </div>
  );
}
