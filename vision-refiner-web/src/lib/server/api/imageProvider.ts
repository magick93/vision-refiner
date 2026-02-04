// vision-refiner-web/src/lib/server/api/imageProvider.ts
export interface ImageGenerationResult {
  imageUrl: string;
  success: boolean;
  error?: string;
}

export interface ImageProvider {
  generateImage(prompt: string): Promise<ImageGenerationResult>;
}
