// vision-refiner-web/src/lib/machines/imagePipelineMachine.ts
import { createMachine, assign, fromPromise } from 'xstate';
import type { ImageGenerationResult, AnalysisResult } from '$lib/server/api/imageProvider';
import { generateImage, analyzeImage, editImage } from '$lib/api/imageGeneration.remote';

// Context types
export interface ImagePipelineContext {
  originalImage?: Blob | string;
  currentImage?: Blob | string;
  history: Array<{
    image: Blob | string;
    prompt?: string;
    result?: ImageGenerationResult | AnalysisResult;
    timestamp: number;
  }>;
  lastError?: string;
  currentPrompt?: string;
  analysisResult?: AnalysisResult;
  generationResult?: ImageGenerationResult;
}

// Event types
export type ImagePipelineEvent =
  | { type: 'UPLOAD'; image: Blob | string }
  | { type: 'GENERATE'; prompt: string }
  | { type: 'EDIT'; prompt: string }
  | { type: 'RESET' }
  | { type: 'RETRY' }
  | { type: 'ANALYSIS_COMPLETE'; result: AnalysisResult }
  | { type: 'GENERATION_COMPLETE'; result: ImageGenerationResult }
  | { type: 'EDIT_COMPLETE'; result: ImageGenerationResult }
  | { type: 'ERROR'; error: string };

// Helper to convert Blob to data URL for serialization
async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read blob as data URL'));
    reader.readAsDataURL(blob);
  });
}

// Convert image input to string if it's a Blob
async function prepareImageForRemote(image: Blob | string): Promise<string> {
  if (typeof image === 'string') return image;
  return await blobToDataUrl(image);
}

// Services that call remote functions
const uploadImageService = fromPromise(async ({ input }: { input: { image?: Blob | string } }) => {
  // In a real implementation, this would upload the image to a server
  // For now, just return the image as is
  return input.image;
});

const generateImageService = fromPromise(async ({ input }: { input: { prompt: string } }) => {
  const result = await generateImage(input.prompt);
  return result;
});

const analyzeImageService = fromPromise(async ({ input }: { input: { image: Blob | string } }) => {
  const imageForRemote = await prepareImageForRemote(input.image);
  const result = await analyzeImage(imageForRemote);
  return result;
});

const editImageService = fromPromise(async ({ input }: { input: { sourceImage: Blob | string; prompt: string } }) => {
  console.log('Editing image with prompt:', input.prompt);
  const sourceImageForRemote = await prepareImageForRemote(input.sourceImage);
  const result = await editImage({ sourceImage: sourceImageForRemote, prompt: input.prompt });
  return result;
});

// State machine
export const imagePipelineMachine = createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QEsC2BDGAFZAHMANsgHZgB0yEBYAxAKpYAyA8gIIAiA2gAwC6ioXAHtYyAC7IhxASAAeiAIzduAZjIBOFQHYAbACYtelXpPqArABoQAT0QqFOsgBY96rdzNb13JSqdaAXwCrNEwwHHwiUgoqWgBxAFEAOQSAJVYAFQSefiQQYVEJKRl5BCVVDW19Q2NTSxtEMw8yFRUdZQAOFR9DMwUnIJCMbDxCEnIAV1wCIXQIEigaCClyEgA3IQBrVeHw0ajJ6dn54igEdaEAY3Qi4hycmQLxSWk80oUm9TJ3Vo6+rx0HUBVlsCCMXxUmhMCk0Hy0HSBgxAoRGkXGZCmMzmCxoYAATnihHiyNMbgAzImoCi7CJjaKY44Lc7EDbXW73PiPETPYpvRTKNSaXQGIwmVz1UEmNT+HRmIEdLQqBHqBR6JEovZo6IwUh4m445bRC7balhWkHMg6-H607M1n6qQc3KCbm3EqKT7fVRK-7qQHAhoIFwdMiucw6JRaJzcPQ6dQDYLImn7dFWvUSU64glEkkEcmU02ounkNM2s4XNkvJ1cwovd1lAWVYU1MXmEGIJyqlodPRdJxOSEGBQqdXJrXkdDEdAEawALwNKwoLK2OzNKeik+nc6ZFYddz4DzyTzdfLKnp+PoUAPl7YQfq+-Tl2ivhncCaGa-HZE3M-nmfxhLEqSYgUniVIaua6I-tutq7uyB6ckerp1qeHwKAoZDcP4HxYf0PhmBKiAdBhTTKAYnaeMRmijp+xZkLAExQDAsAZosCTsAAkhkh4urWvKgKUegxi03gRn6Hh6FeKiEQgHQ+M4LjuLKHR+n0aqJhB67kAxTFwKxNCyCxNwTmSYj4gAFOU3AAJQ0JpX46cxrE8fkyH8XIiBCXoIncGJ7RmJJioyVoZiCopShODosqhR0NFFhakDPJm7FcS5x4oQJHZNGQHQDlGLj6HJca3j2ThkA46h6NGfTdCp6hxZqdGJfpqQJAAygk3GIbxPKvJlQbZbl2j9rGva+eot6mJhZjqJV6FdEY3DURpY50bghKXHAoinAA+s1SyLsaq7xei61XFtCx7fMYh2lce7VkhfF9R5A3cDleUjYV423n0jg+GGTgIhGM3qR+J3RGdm2wNtUBXeIWaAbm+ZgYWjUWpDF27c1t2Vo6CHOq5T31k4AXlQqnxOG4w5mDoTi3oqGGSRGuhmAO6F9A1kHRHiYBrMgYAAO40ClXUE+l7mCcJkK+TC-mBdJt6yloGgqXKCjEYqQIKJzWlkDzfOCzQrUdaLNa9fWXk+X5ElSTJfxkE+0mAnKtOBCttEWvr-NC61GSpAAmmlbnPZL3nS9bAW27ekJmKG+izTCautFGQSJsQQgQHAMj2cWZsnv1AC0Oi3kXOtfpQ1B5xlL19mQOhKp2xi1R4HS3uhf0zSqlX2JJkLvkmHvogy2KnFXEuKH4se09wPYKv4ooqJN2h1zCPaqj8WiGGXdGlqxY8hxPJN19Gs9Ri2i+BgVDuxtwm+zX4srmNvFrQX+UD7-W6v6N8TRVUJbShQmoGKqysopuD9MRVQOh3BuzBmjdEjk9ILA-qeFw9N645SvHGVoBgAqzWfuiZqyDHrm1PE3d6w1uirz0H0empN4wGFaLfew94CEQw2pjWGzUUH9TkmoFSvkaaCJUkCH6klviqxVFGPwA5QYD3BuQL2gseEvQIlbdWbQpQ0zbuI6Ss0hL-RjLfBMQQgA */
  id: 'imagePipeline',
  initial: 'idle',
  types: {} as {
    context: ImagePipelineContext;
    events: ImagePipelineEvent;
  },
  context: {
    originalImage: undefined,
    currentImage: undefined,
    history: [],
    lastError: undefined,
    currentPrompt: undefined,
    analysisResult: undefined,
    generationResult: undefined,
  },
  states: {
    idle: {
      entry: ['logStateEntry'],
      on: {
        UPLOAD: {
          target: 'uploading',
          actions: [
            assign({
              originalImage: ({ event }) => event.image,
              currentImage: ({ event }) => event.image,
            }),
            'logTransition',
          ],
        },
        GENERATE: {
          target: 'generating',
          actions: [
            assign({
              currentPrompt: ({ event }) => event.prompt,
            }),
            'logTransition',
          ],
        },
      },
    },
    uploading: {
      entry: ['logStateEntry'],
      invoke: {
        src: uploadImageService,
        input: ({ context }) => ({ image: context.originalImage }),
        onDone: {
          target: 'analyzing',
          actions: [
            assign({
              currentImage: ({ event }) => event.output,
            }),
            'logTransition',
          ],
        },
        onError: {
          target: 'idle',
          actions: [
            assign({
              lastError: ({ event }) => (event.error as Error).message,
            }),
            'logTransition',
          ],
        },
      },
    },
    generating: {
      entry: ['logStateEntry'],
      invoke: {
        src: generateImageService,
        input: ({ context }) => ({ prompt: context.currentPrompt || '' }),
        onDone: {
          target: 'analyzing',
          actions: [
            assign({
              currentImage: ({ event }) => event.output.imageUrl,
              generationResult: ({ event }) => event.output,
            }),
            'logTransition',
          ],
        },
        onError: {
          target: 'idle',
          actions: [
            assign({
              lastError: ({ event }) => (event.error as Error).message,
            }),
            'logTransition',
          ],
        },
      },
    },
    analyzing: {
      entry: ['logStateEntry'],
      invoke: {
        src: analyzeImageService,
        input: ({ context }) => ({ image: context.currentImage }),
        onDone: {
          target: 'suggesting',
          actions: [
            assign({
              analysisResult: ({ event }) => event.output,
            }),
            'logTransition',
          ],
        },
        onError: {
          target: 'idle',
          actions: [
            assign({
              lastError: ({ event }) => (event.error as Error).message,
            }),
            'logTransition',
          ],
        },
      },
    },
    suggesting: {
      entry: ['logStateEntry'],
      // This state could show suggestions to the user
      // For now, auto‑transition to editing after a short delay
      after: {
        1000: 'editing',
      },
      on: {
        EDIT: {
          target: 'editing',
          actions: [
            assign({
              currentPrompt: ({ event }) => event.prompt,
            }),
            'logTransition',
          ],
        },
      },
    },
    editing: {
      entry: ['logStateEntry'],
      // Wait for user to confirm edit or provide a new prompt
      on: {
        EDIT: {
          target: 'processing_edit',
          actions: [
            assign({
              currentPrompt: ({ event }) => event.prompt,
            }),
            'logTransition',
          ],
        },
        RESET: {
          target: 'idle',
          actions: [
            assign({
              originalImage: undefined,
              currentImage: undefined,
              history: [],
              lastError: undefined,
              currentPrompt: undefined,
              analysisResult: undefined,
              generationResult: undefined,
            }),
            'logTransition',
          ],
        },
      },
    },
    processing_edit: {
      entry: ['logStateEntry'],
      invoke: {
        src: editImageService,
        input: ({ context }) => ({
          sourceImage: context.currentImage,
          prompt: context.currentPrompt || ''
        }),
        onDone: {
          target: 'review',
          actions: [
            assign({
              currentImage: ({ event }) => event.output.imageUrl,
              generationResult: ({ event }) => event.output,
            }),
            'logTransition',
          ],
        },
        onError: {
          target: 'editing',
          actions: [
            assign({
              lastError: ({ event }) => (event.error as Error).message,
            }),
            'logTransition',
          ],
        },
      },
    },
    review: {
      entry: ['logStateEntry'],
      // User can decide to keep editing or finish
      on: {
        EDIT: {
          target: 'editing',
          actions: [
            assign({
              currentPrompt: ({ event }) => event.prompt,
            }),
            'logTransition',
          ],
        },
        RESET: {
          target: 'idle',
          actions: [
            assign({
              originalImage: undefined,
              currentImage: undefined,
              history: [],
              lastError: undefined,
              currentPrompt: undefined,
              analysisResult: undefined,
              generationResult: undefined,
            }),
            'logTransition',
          ],
        },
        RETRY: {
          target: 'processing_edit',
          actions: ['logTransition'],
        },
      },
    },
  },
}).provide({
  actions: {
    logTransition: ({ context, event }) => {
      console.log('[State Machine] Transition:', event.type, 'context:', {
        currentImage: context.currentImage ? 'present' : 'absent',
        currentPrompt: context.currentPrompt,
        state: '???'
      });
    },
    logStateEntry: ({ context }) => {
      console.log('[State Machine] Entering state, context:', {
        currentImage: context.currentImage ? 'present' : 'absent',
        currentPrompt: context.currentPrompt,
      });
    },
  },
});
