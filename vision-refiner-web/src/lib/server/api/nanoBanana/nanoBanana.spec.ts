// vision-refiner-web/src/lib/server/api/nanoBanana/nanoBanana.spec.ts
import { describe, it, expect, vi } from 'vitest';
import { NanoBananaProvider } from './nanoBanana';
import { env } from '$env/dynamic/private';

describe('NanoBananaProvider', () => {
  it('should return an error if API key is not configured', async () => {
    // Temporarily unset the environment variable for this test
    const originalApiKey = env.NANO_BANANA_API_KEY;
    env.NANO_BANANA_API_KEY = '';

    const provider = new NanoBananaProvider();
    const prompt = 'a cat with a hat';
    const result = await provider.generateImage(prompt);

    expect(result.success).toBe(false);
    expect(result.error).toBe('API key is not configured.');

    // Restore the environment variable
    env.NANO_BANANA_API_KEY = originalApiKey;
  });

  it('should generate an image successfully', async () => {
    env.NANO_BANANA_API_KEY = 'test-api-key';
    const provider = new NanoBananaProvider();
    const prompt = 'a cat with a hat';
    const result = await provider.generateImage(prompt);

    expect(result.success).toBe(true);
    expect(result.imageUrl).toBe('https://example.com/generated-cat-image.png');
  });

  it('should handle API errors', async () => {
    env.NANO_BANANA_API_KEY = 'test-api-key';
    const provider = new NanoBananaProvider();
    const prompt = 'an invalid prompt';
    const result = await provider.generateImage(prompt);

    expect(result.success).toBe(false);
    expect(result.error).toBe('API_ERROR: Something went wrong');
  });

  it('should handle other invalid prompts', async () => {
    env.NANO_BANANA_API_KEY = 'test-api-key';
    const provider = new NanoBananaProvider();
    const prompt = 'some other prompt';
    const result = await provider.generateImage(prompt);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid prompt');
  });
});