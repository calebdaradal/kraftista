import { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "default";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
      if (e.key === "Enter") onConfirm();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel, onConfirm]);

  if (!open) return null;

  const confirmClass =
    variant === "danger"
      ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
      : variant === "warning"
        ? "bg-amber-500 text-white hover:bg-amber-600"
        : "bg-primary text-primary-foreground hover:bg-primary/90";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-border bg-card shadow-2xl p-6 space-y-4">
        {/* Close */}
        <button
          type="button"
          onClick={onCancel}
          className="absolute right-4 top-4 p-1 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon + Title */}
        <div className="flex items-start gap-3">
          <div
            className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
              variant === "danger"
                ? "bg-destructive/10 text-destructive"
                : variant === "warning"
                  ? "bg-amber-100 text-amber-600"
                  : "bg-primary/10 text-primary"
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="pt-1">
            <h2 className="font-semibold text-foreground text-base">{title}</h2>
            <p className="text-sm text-muted-foreground mt-1">{message}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${confirmClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
