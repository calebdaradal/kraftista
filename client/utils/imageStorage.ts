/**
 * Image Storage Utility
 * Simulates image upload/storage using localStorage with base64 encoding
 * In production, this would connect to a real file storage service (AWS S3, Cloudinary, etc.)
 */

export interface StoredImage {
  id: string;
  url: string;
  name: string;
  uploadedAt: number;
}

const STORAGE_KEY = "craft_product_images";
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB source limit (compressed before upload)

// Compression targets: images are downscaled + re-encoded as JPEG before upload
// so the base64 payload sent to the backend stays small (avoids server OOM).
const MAX_DIMENSION = 1600; // px, longest edge
const JPEG_QUALITY = 0.82;

export class ImageStorage {
  static generateId(): string {
    return `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Downscale (longest edge -> MAX_DIMENSION) and re-encode as JPEG.
   * Transparent pixels are flattened onto white so PNGs convert cleanly.
   * Returns a base64 JPEG data URL.
   */
  static async compressImage(file: File): Promise<string> {
    const objectUrl = URL.createObjectURL(file);
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new Image();
        el.onload = () => resolve(el);
        el.onerror = () => reject(new Error("Failed to load image"));
        el.src = objectUrl;
      });

      const { width, height } = img;
      const scale = Math.min(1, MAX_DIMENSION / Math.max(width, height));
      const targetW = Math.max(1, Math.round(width * scale));
      const targetH = Math.max(1, Math.round(height * scale));

      const canvas = document.createElement("canvas");
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");
      // Flatten transparency onto white so JPEG doesn't show black.
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, targetW, targetH);
      ctx.drawImage(img, 0, 0, targetW, targetH);

      return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }

  static async uploadImage(file: File): Promise<StoredImage> {
    // Validate file
    if (!file.type.startsWith("image/")) {
      throw new Error("Please upload an image file");
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new Error("File size must be less than 25MB");
    }

    let base64Data: string;
    try {
      base64Data = await this.compressImage(file);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Failed to process image",
      );
    }

    const image: StoredImage = {
      id: this.generateId(),
      url: base64Data,
      name: file.name,
      uploadedAt: Date.now(),
    };

    // Best-effort local cache; ignore quota errors (large galleries can exceed it).
    try {
      const images = this.getAllImages();
      images.push(image);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(images));
    } catch {
      /* localStorage quota exceeded — safe to skip, upload still proceeds */
    }

    return image;
  }

  static getAllImages(): StoredImage[] {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  static getImageById(id: string): StoredImage | undefined {
    return this.getAllImages().find((img) => img.id === id);
  }

  static deleteImage(id: string): void {
    const images = this.getAllImages().filter((img) => img.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(images));
  }

  static clearAllImages(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}
