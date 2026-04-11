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
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export class ImageStorage {
  static generateId(): string {
    return `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static async uploadImage(file: File): Promise<StoredImage> {
    // Validate file
    if (!file.type.startsWith("image/")) {
      throw new Error("Please upload an image file");
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new Error("File size must be less than 5MB");
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        try {
          const base64Data = reader.result as string;

          const image: StoredImage = {
            id: this.generateId(),
            url: base64Data,
            name: file.name,
            uploadedAt: Date.now(),
          };

          // Store in localStorage
          const images = this.getAllImages();
          images.push(image);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(images));

          resolve(image);
        } catch (error) {
          reject(new Error("Failed to process image"));
        }
      };

      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };

      reader.readAsDataURL(file);
    });
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
