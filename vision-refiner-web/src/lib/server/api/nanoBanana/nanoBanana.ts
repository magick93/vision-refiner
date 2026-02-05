// vision-refiner-web/src/lib/server/api/nanoBanana/nanoBanana.ts
import { env } from '$env/dynamic/private';
import type { ImageProvider, ImageGenerationResult, AnalysisResult } from '../imageProvider';
import { GoogleGenAI } from '@google/genai';

export class NanoBananaProvider implements ImageProvider {
  private ai: GoogleGenAI;
  private model: string;
  private aspectRatio: string;

  constructor(options?: { model?: string; aspectRatio?: string }) {
    const apiKey = env.NANO_BANANA_API_KEY;
    if (!apiKey) {
      throw new Error('NANO_BANANA_API_KEY environment variable is not set');
    }
    this.ai = new GoogleGenAI({ apiKey });
    // Use gemini-2.5-flash-image for speed (Nano Banana) by default
    // Could use gemini-3-pro-image-preview for high fidelity (Nano Banana Pro)
    this.model = options?.model || 'gemini-2.5-flash-image';
    this.aspectRatio = options?.aspectRatio || '1:1';
  }

  async generateImage(prompt: string): Promise<ImageGenerationResult> {
    try {
      const response = await this.ai.models.generateContent({
        model: this.model,
        contents: prompt,
        config: {
          responseModalities: ['IMAGE'], // We only want image response
          imageConfig: {
            aspectRatio: this.aspectRatio,
          },
        },
      });

      // Check if we have a candidate with image data
      const candidate = response.candidates?.[0];
      if (!candidate?.content?.parts) {
        return {
          imageUrl: '',
          success: false,
          error: 'No valid response candidate from API',
        };
      }

      // Look for image data in the response parts
      for (const part of candidate.content.parts) {
        if (part.inlineData?.data) {
          // Convert base64 image data to a data URL
          const imageData = part.inlineData.data;
          const mimeType = part.inlineData.mimeType || 'image/png';
          const dataUrl = `data:${mimeType};base64,${imageData}`;
          
          return {
            imageUrl: dataUrl,
            success: true,
          };
        }
      }

      // If we get here, no image was found in the response
      return {
        imageUrl: '',
        success: false,
        error: 'No image data in API response',
      };
    } catch (error: any) {
      console.error('Nano Banana API error:', error);
      return {
        imageUrl: '',
        success: false,
        error: error.message || 'An unknown error occurred while generating image',
      };
    }
  }

  async analyzeImage(image: Blob | string): Promise<AnalysisResult> {
    // Mock implementation for MVP
    console.log('Analyzing image (mock)');
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log('Received image for analysis');
    
    // Return a realistic mock analysis
    return {
      success: true,
      description: 'A scenic landscape with mountains, a lake, and a clear sky.',
      detectedObjects: ['mountain', 'lake', 'sky', 'tree', 'cloud'],
      suggestedEdits: [
        'Add a sunset',
        'Make it winter',
        'Add a cabin by the lake',
        'Increase saturation',
        'Convert to black and white',
      ],
    };
  }

  async editImage(sourceImage: Blob | string, prompt: string): Promise<ImageGenerationResult> {
    try {
      // Logging to validate assumptions about parameters
      console.log(`[DEBUG] editImage called with prompt: "${prompt}"`);
      console.log(`[DEBUG] sourceImage type: ${typeof sourceImage}, is Blob: ${sourceImage instanceof Blob}`);
      
      // Convert source image to base64 data for API
      let imageData: string;
      let mimeType: string;
      
      if (typeof sourceImage === 'string') {
        console.log(`[DEBUG] sourceImage is string, length: ${sourceImage.length}`);
        // Extract base64 data from data URL
        const dataUrlMatch = sourceImage.match(/^data:(image\/[^;]+);base64,(.+)$/);
        if (!dataUrlMatch) {
          console.error(`[DEBUG] Invalid data URL format: ${sourceImage.substring(0, 100)}...`);
          return {
            imageUrl: '',
            success: false,
            error: 'Invalid image format. Expected data URL with base64 encoded image.',
          };
        }
        mimeType = dataUrlMatch[1];
        imageData = dataUrlMatch[2];
        console.log(`[DEBUG] Extracted mimeType: ${mimeType}, data length: ${imageData.length}`);
      } else {
        console.log(`[DEBUG] sourceImage is Blob, size: ${sourceImage.size}, type: ${sourceImage.type}`);
        // Convert Blob to base64
        const arrayBuffer = await sourceImage.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        imageData = buffer.toString('base64');
        mimeType = sourceImage.type || 'image/png';
        console.log(`[DEBUG] Converted Blob to base64, data length: ${imageData.length}`);
      }
      
      // Call Gemini API for image editing
      console.log(`[DEBUG] Calling Gemini API for image editing with model: ${this.model}`);
      const response = await this.ai.models.generateContent({
        model: this.model,
        contents: [
          {
            role: 'user',
            parts: [
              { inlineData: { data: imageData, mimeType } },
              { text: prompt },
            ],
          },
        ],
        config: {
          responseModalities: ['IMAGE'],
          imageConfig: {
            aspectRatio: this.aspectRatio,
          },
        },
      });

      // Check if we have a candidate with image data
      const candidate = response.candidates?.[0];
      if (!candidate?.content?.parts) {
        console.error(`[DEBUG] No valid response candidate from API: ${JSON.stringify(response)}`);
        return {
          imageUrl: '',
          success: false,
          error: 'No valid response candidate from API',
        };
      }

      // Look for image data in the response parts
      for (const part of candidate.content.parts) {
        if (part.inlineData?.data) {
          // Convert base64 image data to a data URL
          const editedImageData = part.inlineData.data;
          const editedMimeType = part.inlineData.mimeType || 'image/png';
          const dataUrl = `data:${editedMimeType};base64,${editedImageData}`;
          
          console.log(`[DEBUG] Successfully edited image, data URL length: ${dataUrl.length}`);
          return {
            imageUrl: dataUrl,
            success: true,
          };
        }
      }

      // If we get here, no image was found in the response
      console.error(`[DEBUG] No image data in API response: ${JSON.stringify(candidate.content.parts)}`);
      return {
        imageUrl: '',
        success: false,
        error: 'No image data in API response',
      };
    } catch (error: any) {
      console.error('[DEBUG] Nano Banana API error during image editing:', error);
      return {
        imageUrl: '',
        success: false,
        error: error.message || 'An unknown error occurred while editing image',
      };
    }
  }
}
