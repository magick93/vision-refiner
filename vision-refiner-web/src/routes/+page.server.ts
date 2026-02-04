// vision-refiner-web/src/routes/+page.server.ts
import type { PageLoad } from './$types';
import { NanoBananaProvider } from '$lib/server/api/nanoBanana/nanoBanana';

export const load: PageLoad = async () => {
  console.log('--- Manual Verification: Calling NanoBananaProvider ---');
  const provider = new NanoBananaProvider();
  const prompt = 'a cat with a hat'; // Using a prompt that triggers a mocked successful response
  const result = await provider.generateImage(prompt);
  console.log('NanoBananaProvider Result:', result);
  console.log('----------------------------------------------------');

  return {}; // No data needs to be passed to the client for this verification
};
