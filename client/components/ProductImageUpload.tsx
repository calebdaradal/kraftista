import { useState, useRef } from "react";
import { Upload, X, Star, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductImageUploadProps {
  images: string[];
  thumbnailIndex?: number;
  onChange: (images: string[], thumbnailIndex: number) => void;
}

export function ProductImageUpload({
  images,
  thumbnailIndex = 0,
  onChange,
}: ProductImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    let loadedCount = 0;
    const newImages: string[] = [...images];

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        newImages.push(dataUrl);
        loadedCount++;

        // Call onChange only after all files are loaded
        if (loadedCount === files.length) {
          const newThumbnailIndex = images.length === 0 ? 0 : thumbnailIndex;
          onChange(newImages, newThumbnailIndex);
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    let newThumbnailIndex = thumbnailIndex;

    // Adjust thumbnail index if needed
    if (index === thumbnailIndex && newImages.length > 0) {
      newThumbnailIndex = 0;
    } else if (index < thumbnailIndex) {
      newThumbnailIndex = thumbnailIndex - 1;
    }

    onChange(newImages, newThumbnailIndex);
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

    const newImages = [...images];
    const [draggedImage] = newImages.splice(draggedIndex, 1);
    newImages.splice(dropIndex, 0, draggedImage);

    // Adjust thumbnail index based on the move
    let newThumbnailIndex = thumbnailIndex;
    if (draggedIndex === thumbnailIndex) {
      newThumbnailIndex = dropIndex;
    } else if (
      draggedIndex < thumbnailIndex &&
      dropIndex >= thumbnailIndex
    ) {
      newThumbnailIndex = thumbnailIndex - 1;
    } else if (
      draggedIndex > thumbnailIndex &&
      dropIndex <= thumbnailIndex
    ) {
      newThumbnailIndex = thumbnailIndex + 1;
    }

    onChange(newImages, newThumbnailIndex);
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
          className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-foreground"
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
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={cn(
                "relative group rounded-lg overflow-hidden border-2 aspect-square bg-muted cursor-move transition-all",
                dragOverIndex === index && draggedIndex !== index
                  ? "border-primary bg-primary/10"
                  : "border-border",
                thumbnailIndex === index && "ring-2 ring-primary ring-offset-1"
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
                  className="p-2.5 bg-muted rounded hover:bg-primary/80 transition-colors"
                  title="Drag to reorder"
                >
                  <GripVertical className="w-4 h-4 text-foreground" />
                </button>

                {/* Thumbnail button */}
                <button
                  type="button"
                  onClick={() => handleSetThumbnail(index)}
                  className={cn(
                    "p-2.5 rounded transition-colors",
                    thumbnailIndex === index
                      ? "bg-primary"
                      : "bg-muted hover:bg-primary/80"
                  )}
                  title={
                    thumbnailIndex === index
                      ? "Current thumbnail"
                      : "Set as thumbnail"
                  }
                >
                  <Star
                    className={cn(
                      "w-4 h-4",
                      thumbnailIndex === index
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
              {thumbnailIndex === index && (
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
          Drag images to reorder • Click star to set thumbnail • First image is
          the primary image
        </p>
      )}
    </div>
  );
}
