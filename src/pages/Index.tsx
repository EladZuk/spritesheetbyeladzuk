import { useState, useEffect } from "react";
import { Layers, Grid3X3, Film, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/FileUpload";
import { FrameList } from "@/components/FrameList";
import { SettingsPanel } from "@/components/SettingsPanel";
import { BaselineGuide } from "@/components/BaselineGuide";
import { PreviewPanel } from "@/components/PreviewPanel";
import { UnityGuide } from "@/components/UnityGuide";
import { TopBar } from "@/components/TopBar";
import { AnimationPreview } from "@/components/AnimationPreview";
import { ClearAllDialog } from "@/components/ClearAllDialog";
import { FrameSizeDetectedDialog } from "@/components/FrameSizeDetectedDialog";
import { useSpriteSheet } from "@/hooks/useSpriteSheet";

const Index = () => {
  const {
    frames,
    settings,
    setSettings,
    addFiles,
    removeFrame,
    duplicateFrame,
    reorderFrames,
    reverseFrames,
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
  } = useSpriteSheet();

  const [baselineEnabled, setBaselineEnabled] = useState(false);
  const [baselineOffset, setBaselineOffset] = useState(Math.round(settings.frameHeight * 0.85));
  const [captureMode, setCaptureMode] = useState(false);

  // Update baseline offset when frame height changes
  useEffect(() => {
    setBaselineOffset(Math.round(settings.frameHeight * 0.85));
  }, [settings.frameHeight]);

  // Validate frames when settings change
  useEffect(() => {
    if (frames.length > 0) {
      validateFrames();
    }
  }, [frames, settings.frameWidth, settings.frameHeight, validateFrames]);

  const handleFpsChange = (fps: number) => {
    setSettings({ ...settings, suggestedFps: fps });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Credit Bar */}
      <TopBar />

      <div
        className={
          captureMode
            ? "mx-auto bg-background overflow-hidden border border-border"
            : ""
        }
        style={
          captureMode
            ? {
                aspectRatio: "9 / 16",
                height: "calc(100vh - 40px)",
                width: "calc((100vh - 40px) * 9 / 16)",
                maxWidth: "100vw",
                overflowY: "auto",
              }
            : undefined
        }
      >
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Grid3X3 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">
                  Unity Sprite Sheet Builder
                </h1>
                <p className="text-xs text-muted-foreground">
                  Upload PNG frames, get a Unity-ready sprite sheet.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={captureMode ? "default" : "outline"}
                size="sm"
                onClick={() => setCaptureMode((v) => !v)}
                className="gap-2"
                title="Constrain layout to a 16:9 frame for video capture"
              >
                <Video className="w-4 h-4" />
                {captureMode ? "Exit 16:9" : "16:9 Capture"}
              </Button>
              <ClearAllDialog onConfirm={clearAll} disabled={frames.length === 0} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-[360px_1fr] gap-6">
          {/* Left Sidebar - Controls */}
          <aside className="space-y-4">
            {/* File Upload */}
            <div className="panel">
              <div className="panel-header">
                <Layers className="w-4 h-4 text-primary" />
                <span>Frames</span>
              </div>
              <FileUpload onFilesSelected={addFiles} frameCount={frames.length} />
              <div className="mt-4">
                <FrameList
                  frames={frames}
                  onReorder={reorderFrames}
                  onRemove={removeFrame}
                  onDuplicate={duplicateFrame}
                  onReverse={reverseFrames}
                  validationErrors={validationErrors}
                  expectedWidth={settings.frameWidth}
                  expectedHeight={settings.frameHeight}
                />
              </div>
            </div>

            {/* Settings */}
            <div className="panel">
              <div className="panel-header">
                <Grid3X3 className="w-4 h-4 text-primary" />
                <span>Settings</span>
              </div>
              <SettingsPanel settings={settings} onSettingsChange={setSettings} />
            </div>

            {/* Baseline Guide */}
            <div className="panel">
              <BaselineGuide
                enabled={baselineEnabled}
                offset={baselineOffset}
                frameHeight={settings.frameHeight}
                onEnabledChange={setBaselineEnabled}
                onOffsetChange={setBaselineOffset}
              />
            </div>

            {/* Unity Guide */}
            <UnityGuide />
          </aside>

          {/* Right Panel - Preview & Animation */}
          <section className="space-y-4">
            {/* Sprite Sheet Preview */}
            <div className="panel min-h-[500px]">
              <PreviewPanel
                frames={frames}
                settings={settings}
                generatedSheet={generatedSheet}
                exportInfo={exportInfo}
                metadata={metadata}
                onGenerate={generateSheet}
                isGenerating={isGenerating}
                hasValidationErrors={validationErrors.length > 0}
                baselineEnabled={baselineEnabled}
                baselineOffset={baselineOffset}
              />
            </div>

            {/* Animation Preview */}
            <div className="panel">
              <div className="panel-header mb-0">
                <Film className="w-4 h-4 text-primary" />
                <span>Animation Preview</span>
              </div>
              <AnimationPreview
                frames={frames}
                fps={settings.suggestedFps}
                onFpsChange={handleFpsChange}
                frameWidth={settings.frameWidth}
                frameHeight={settings.frameHeight}
                flipHorizontal={settings.flipHorizontal}
              />
            </div>
          </section>
        </div>
      </main>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="fixed bottom-4 right-4 max-w-sm p-4 rounded-lg bg-destructive/10 border border-destructive/30 animate-fade-in">
          <p className="text-sm font-medium text-destructive mb-2">
            Frame size mismatch
          </p>
          <ul className="text-xs text-destructive/80 space-y-1">
            {validationErrors.slice(0, 3).map((error) => (
              <li key={error.fileName} className="font-mono">
                {error.fileName}: {error.actualSize} (expected {error.expectedSize})
              </li>
            ))}
            {validationErrors.length > 3 && (
              <li className="text-destructive/60">
                ...and {validationErrors.length - 3} more
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Frame Size Detection Dialog */}
      <FrameSizeDetectedDialog
        open={showSizeDialog}
        detectedWidth={detectedSize?.width || 0}
        detectedHeight={detectedSize?.height || 0}
        onUseDetected={applyDetectedSize}
        onChangeManually={dismissSizeDialog}
      />
      </div>
    </div>
  );
};

export default Index;