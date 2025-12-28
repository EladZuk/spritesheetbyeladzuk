import { useCallback } from "react";
import { Upload, Image as ImageIcon } from "lucide-react";

interface FileUploadProps {
  onFilesSelected: (files: FileList) => void;
  frameCount: number;
}

export function FileUpload({ onFilesSelected, frameCount }: FileUploadProps) {
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        onFilesSelected(files);
      }
    },
    [onFilesSelected]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        onFilesSelected(files);
      }
    },
    [onFilesSelected]
  );

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="relative border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer group"
    >
      <input
        type="file"
        accept="image/png"
        multiple
        onChange={handleChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary/20 transition-colors">
          <Upload className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">
            Drop PNG frames here
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            or click to browse
          </p>
        </div>
        {frameCount > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-primary mt-2">
            <ImageIcon className="w-3.5 h-3.5" />
            <span className="font-mono">{frameCount} frames loaded</span>
          </div>
        )}
      </div>
    </div>
  );
}
