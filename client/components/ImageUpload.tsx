import { useState, useRef } from "react";
import { Upload, X, Loader } from "lucide-react";
import { ImageStorage } from "@/utils/imageStorage";

interface ImageUploadProps {
  onUpload: (imageUrl: string) => void;
  currentImage?: string;
  onRemove?: () => void;
  label?: string;
}

export function ImageUpload({
  onUpload,
  currentImage,
  onRemove,
  label = "Upload Image",
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError("");

    try {
      const stored = await ImageStorage.uploadImage(file);
      onUpload(stored.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="space-y-3">
      {currentImage ? (
        <div className="relative">
          <div className="w-full aspect-square bg-muted rounded-lg overflow-hidden">
            <img
              src={currentImage}
              alt="Uploaded"
              className="w-full h-full object-cover"
            />
          </div>
          <button
            type="button"
            onClick={() => onRemove?.()}
            className="absolute top-2 right-2 p-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-2 left-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-xs font-semibold flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Change
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="w-full aspect-square border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center hover:border-primary hover:bg-primary/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground mt-2">Uploading...</p>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 text-muted-foreground" />
              <p className="text-sm font-semibold text-foreground mt-2">
                {label}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG — optimized on upload
              </p>
            </>
          )}
        </button>
      )}

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive text-destructive rounded-lg text-sm">
          {error}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
