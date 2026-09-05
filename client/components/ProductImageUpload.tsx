import { useState, useRef } from "react";
import { Upload, X, Star, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { ImageStorage } from "@/utils/imageStorage";

interface ProductImageUploadProps {
  images: string[];
  thumbnailIndex?: number;
  onChange: (images: string[], thumbnailIndex: number) => void;
}

export function ProductImageUpload({
  images,
  thumbnailIndex: _thumbnailIndex = 0,
  onChange,
}: ProductImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    // Reset input early so the same file can be re-selected later.
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (files.length === 0) return;

    const newImages: string[] = [...images];
    // Compress sequentially to keep peak memory low with many large images.
    for (const file of files) {
      if (!file.type.startsWith("image/")) continue;
      try {
        const dataUrl = await ImageStorage.compressImage(file);
        newImages.push(dataUrl);
      } catch {
        /* skip files that fail to load/compress */
      }
    }

    onChange(newImages, 0);
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages, 0);
  };

  const handleSetThumbnail = (index: number) => {
    // Move the selected image to the first position
    if (index === 0) {
      onChange(images, 0);
      return;
    }

    const newImages = [...images];
    const [selectedImage] = newImages.splice(index, 1);
    newImages.unshift(selectedImage);

    onChange(newImages, 0);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    // Thumbnail (index 0) is not a reorder drop target for other images
    if (index === 0 && draggedIndex != null && draggedIndex > 0) return;
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    setDragOverIndex(null);

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    // Thumbnail stays at index 0; only reorder images at index 1+
    if (draggedIndex === 0 || dropIndex === 0) {
      setDraggedIndex(null);
      return;
    }

    const newImages = [...images];
    const [draggedImage] = newImages.splice(draggedIndex, 1);
    newImages.splice(dropIndex, 0, draggedImage);

    onChange(newImages, 0);
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="space-y-3">
      {/* Upload Input */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 px-4 py-4 border-2 border-dashed border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-foreground"
        >
          <Upload className="w-4 h-4" />
          <span className="text-sm font-semibold">Select Images</span>
        </button>
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {images.map((image, index) => (
            <div
              key={index}
              draggable={index > 0}
              onDragStart={() => index > 0 && handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={cn(
                "relative group rounded-lg overflow-hidden border-2 aspect-square bg-muted transition-all",
                index > 0 ? "cursor-move" : "cursor-default",
                dragOverIndex === index && draggedIndex !== index
                  ? "border-primary bg-primary/10"
                  : "border-border",
                index === 0 && "ring-2 ring-primary ring-offset-1"
              )}
            >
              {/* Image */}
              <img
                src={image}
                alt={`Product ${index + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {/* Drag handle */}
                <button
                  type="button"
                  className={cn(
                    "p-2.5 rounded transition-colors",
                    index > 0
                      ? "bg-muted hover:bg-primary/80"
                      : "bg-muted/50 cursor-not-allowed opacity-60"
                  )}
                  title={
                    index > 0
                      ? "Drag to reorder"
                      : "Thumbnail stays first — reorder other images"
                  }
                  disabled={index === 0}
                >
                  <GripVertical className="w-4 h-4 text-foreground" />
                </button>

                {/* Thumbnail button */}
                <button
                  type="button"
                  onClick={() => handleSetThumbnail(index)}
                  className={cn(
                    "p-2.5 rounded transition-colors",
                    index === 0
                      ? "bg-primary"
                      : "bg-muted hover:bg-primary/80"
                  )}
                  title={
                    index === 0
                      ? "Current thumbnail"
                      : "Set as thumbnail"
                  }
                >
                  <Star
                    className={cn(
                      "w-4 h-4",
                      index === 0
                        ? "fill-primary-foreground text-primary-foreground"
                        : "text-foreground"
                    )}
                  />
                </button>

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="p-2.5 bg-destructive/80 rounded hover:bg-destructive transition-colors"
                  title="Remove image"
                >
                  <X className="w-4 h-4 text-destructive-foreground" />
                </button>
              </div>

              {/* Thumbnail badge */}
              {index === 0 && (
                <div className="absolute top-1 left-1 bg-primary text-primary-foreground rounded-full p-1">
                  <Star className="w-3 h-3 fill-current" />
                </div>
              )}

              {/* Drag handle indicator */}
              {draggedIndex === index && (
                <div className="absolute inset-0 border-4 border-primary bg-primary/10" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Help text */}
      {images.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Drag images (except the first) to reorder • Click star to move an image
          to the front as thumbnail • The first image is always the primary image
        </p>
      )}
    </div>
  );
}
