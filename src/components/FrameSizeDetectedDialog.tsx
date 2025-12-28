import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface FrameSizeDetectedDialogProps {
  open: boolean;
  detectedWidth: number;
  detectedHeight: number;
  onUseDetected: () => void;
  onChangeManually: () => void;
}

export function FrameSizeDetectedDialog({
  open,
  detectedWidth,
  detectedHeight,
  onUseDetected,
  onChangeManually,
}: FrameSizeDetectedDialogProps) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Frame size detected</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Detected frame size: <span className="font-mono text-foreground">{detectedWidth} × {detectedHeight} px</span>
            </p>
            <p>Do you want to use this size, or change it manually?</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onChangeManually}>Change manually</AlertDialogCancel>
          <AlertDialogAction onClick={onUseDetected}>Use detected size</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}