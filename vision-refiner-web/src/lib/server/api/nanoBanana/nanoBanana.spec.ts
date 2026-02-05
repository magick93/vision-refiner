// vision-refiner-web/src/lib/server/api/nanoBanana/nanoBanana.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NanoBananaProvider } from './nanoBanana';
import { env } from '$env/dynamic/private';

// Create a proper class mock
const mockGenerateContent = vi.fn();

// Mock the module with a proper class
vi.mock('@google/genai', () => {
  // Return a class constructor
  const MockGoogleGenAI = class {
    constructor(options: any) {
      // Store options if needed
    }
    
    models = {
      generateContent: mockGenerateContent,
    };
  };
  
  return {
    GoogleGenAI: MockGoogleGenAI,
  };
});

describe('NanoBananaProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGenerateContent.mockReset();
  });

  it('should throw an error if API key is not configured', () => {
    const originalApiKey = env.NANO_BANANA_API_KEY;
    env.NANO_BANANA_API_KEY = '';

    expect(() => new NanoBananaProvider()).toThrow(
      'NANO_BANANA_API_KEY environment variable is not set'
    );

    env.NANO_BANANA_API_KEY = originalApiKey;
  });

  it('should create provider with API key', () => {
    env.NANO_BANANA_API_KEY = 'test-api-key';
    expect(() => new NanoBananaProvider()).not.toThrow();
  });

  it('should accept custom options', () => {
    env.NANO_BANANA_API_KEY = 'test-api-key';
    const provider = new NanoBananaProvider({
      model: 'gemini-3-pro-image-preview',
      aspectRatio: '16:9',
    });
    expect(provider).toBeInstanceOf(NanoBananaProvider);
  });
});