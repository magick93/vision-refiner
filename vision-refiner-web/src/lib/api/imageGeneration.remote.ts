// vision-refiner-web/src/lib/api/imageGeneration.remote.ts
import { query, command } from '$app/server';
import { NanoBananaProvider } from '$lib/server/api/nanoBanana/nanoBanana';
import type { ImageGenerationResult, AnalysisResult } from '$lib/server/api/imageProvider';

const provider = new NanoBananaProvider();

// Query to get image generation status (if we had persistent storage)
export const getImageStatus = query('unchecked', async (id: string) => {
  // For now, just return a placeholder
  return { id, status: 'unknown' };
});

// Command to generate an image
export const generateImage = command('unchecked', async (prompt: string) => {
  if (!prompt || prompt.trim() === '') {
    throw new Error('Prompt is required');
  }

  const result: ImageGenerationResult = await provider.generateImage(prompt.trim());
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to generate image');
  }

  return result;
});

// Command to analyze an image
export const analyzeImage = command('unchecked', async (image: Blob | string) => {
  if (!image) {
    throw new Error('Image is required');
  }

  const result: AnalysisResult = await provider.analyzeImage(image);

  console.log('Analysis result:', result);
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to analyze image');
  }

  return result;
});

// Command to edit an image
export const editImage = command('unchecked', async (args: { sourceImage: Blob | string; prompt: string }) => {
  const { sourceImage, prompt } = args;
  if (!sourceImage) {
    throw new Error('Source image is required');
  }
  if (!prompt || prompt.trim() === '') {
    throw new Error('Edit prompt is required');
  }

  const result: ImageGenerationResult = await provider.editImage(sourceImage, prompt.trim());
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to edit image');
  }

  return result;
});