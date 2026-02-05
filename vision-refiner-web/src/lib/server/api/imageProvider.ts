// vision-refiner-web/src/lib/server/api/imageProvider.ts
export interface ImageGenerationResult {
  imageUrl: string;
  success: boolean;
  error?: string;
}

export interface AnalysisResult {
  description: string;
  detectedObjects: string[];
  suggestedEdits: string[];
  success: boolean;
  error?: string;
}

export interface EditInstructions {
  // Placeholder for future edit instruction details
  // Could include regions, masks, parameters, etc.
  prompt: string;
  mask?: string; // base64 mask image
  strength?: number;
}

export interface ImageProvider {
  generateImage(prompt: string): Promise<ImageGenerationResult>;
  analyzeImage(image: Blob | string): Promise<AnalysisResult>;
  editImage(sourceImage: Blob | string, prompt: string): Promise<ImageGenerationResult>;
}
