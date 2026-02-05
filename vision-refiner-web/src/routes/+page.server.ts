// vision-refiner-web/src/routes/+page.server.ts
import type { PageServerLoad, Actions } from './$types';
import { NanoBananaProvider } from '$lib/server/api/nanoBanana/nanoBanana';
import type { ImageGenerationResult } from '$lib/server/api/imageProvider';

export const load: PageServerLoad = async () => {
  console.log('--- Manual Verification: Calling NanoBananaProvider ---');
  const provider = new NanoBananaProvider();
  const prompt = 'a cat with a hat'; // Using a prompt that triggers a mocked successful response
  const result = await provider.generateImage(prompt);
  console.log('NanoBananaProvider Result:', result);
  console.log('----------------------------------------------------');

  return {}; // No data needs to be passed to the client for this verification
};

export const actions: Actions = {
  generate: async ({ request }) => {
    const formData = await request.formData();
    const prompt = formData.get('prompt') as string;

    if (!prompt || prompt.trim() === '') {
      return {
        success: false,
        error: 'Prompt is required',
        imageUrl: ''
      };
    }

    const provider = new NanoBananaProvider();
    const result: ImageGenerationResult = await provider.generateImage(prompt.trim());

    return {
      success: result.success,
      imageUrl: result.imageUrl,
      error: result.error
    };
  }
};
