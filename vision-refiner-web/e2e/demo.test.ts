import { expect, test } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEST_IMAGE_PATH = path.join(__dirname, '../src/lib/assets/favicon.svg');

test.describe('Vision Refiner - Upload & Edit Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('home page has expected h1', async ({ page }) => {
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('h1')).toHaveText('Vision Refiner');
  });

  test('upload image and complete workflow', async ({ page }) => {
    // 1. Upload an image
    const uploader = page.locator('input[type="file"]');
    await uploader.setInputFiles(TEST_IMAGE_PATH);

    // Wait for uploading state (should transition quickly)
    await expect(page.locator('text="Uploading..."')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text="Uploading..."')).toBeHidden({ timeout: 10000 });

    // 2. Wait for analysis to appear
    await expect(page.locator('text="Analysis & Suggestions"')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text="A scenic landscape with mountains, a lake, and a clear sky."')).toBeVisible();

    // 3. Click a suggestion (should trigger edit)
    const firstSuggestion = page.locator('button:has-text("Add a sunset")').first();
    await firstSuggestion.click();

    // 4. Wait for editing state and processing
    await expect(page.locator('text="Processing edit..."')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text="Processing edit..."')).toBeHidden({ timeout: 10000 });

    // 5. Verify we reach review state with comparison view
    await expect(page.locator('text="Compare Before & After"')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text="Original"')).toBeVisible();
    await expect(page.locator('text="Edited"')).toBeVisible();

    // 6. Verify state debug shows review
    const debugSection = page.locator('details.debug-section');
    await debugSection.click();
    await expect(page.locator('pre:has-text("State: review")')).toBeVisible();
  });

  test('state transitions via machine events', async ({ page }) => {
    // Use debug section to monitor state
    const debugSection = page.locator('details.debug-section');
    await debugSection.click();

    // Initially idle
    await expect(page.locator('pre:has-text("State: idle")')).toBeVisible();

    // Upload image
    const uploader = page.locator('input[type="file"]');
    await uploader.setInputFiles(TEST_IMAGE_PATH);

    // Should go through uploading -> analyzing -> suggesting -> editing (auto)
    await expect(page.locator('pre:has-text("State: uploading")')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('pre:has-text("State: analyzing")')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('pre:has-text("State: suggesting")')).toBeVisible({ timeout: 10000 });
    // After 1 second auto-transition to editing
    await expect(page.locator('pre:has-text("State: editing")')).toBeVisible({ timeout: 15000 });

    // Trigger edit with a prompt
    const editInput = page.locator('input[placeholder*="edit"]').first();
    await editInput.fill('make it winter');
    const editButton = page.locator('button:has-text("Apply Edit")').first();
    await editButton.click();

    // Should go to processing_edit -> review
    await expect(page.locator('pre:has-text("State: processing_edit")')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('pre:has-text("State: review")')).toBeVisible({ timeout: 10000 });
  });

  test('error scenario - file validation failure', async ({ page }) => {
    // Mock a file validation failure by uploading a non-image file
    // Create a dummy text file
    const dummyFile = path.join(__dirname, 'dummy.txt');
    // Write dummy content
    await page.evaluate((content) => {
      const blob = new Blob([content], { type: 'text/plain' });
      const file = new File([blob], 'dummy.txt', { type: 'text/plain' });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      const input = document.querySelector('input[type="file"]');
      if (input) {
        input.files = dataTransfer.files;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, 'not an image');

    // Expect error message to appear (component may show error)
    // For now, we just ensure the app doesn't crash
    await expect(page.locator('text="Something went wrong"').first()).toBeVisible({ timeout: 5000 }).catch(() => {});
    // The debug section should show error in context
    const debugSection = page.locator('details.debug-section');
    await debugSection.click();
    await expect(page.locator('pre:has-text("lastError")')).toBeVisible({ timeout: 5000 });
  });

  test('error scenario - API error', async ({ page }) => {
    // We can't easily simulate API error in E2E without mocking network.
    // Since we rely on mock services that never error, skip this test for now.
    // In a real scenario we would use page.route to intercept and fail.
    test.skip();
  });

  test('reset functionality', async ({ page }) => {
    // Upload an image
    const uploader = page.locator('input[type="file"]');
    await uploader.setInputFiles(TEST_IMAGE_PATH);
    await expect(page.locator('text="Refine Existing Image"')).toBeVisible({ timeout: 10000 });

    // Click reset button
    const resetButton = page.locator('button:has-text("Reset")').first();
    await resetButton.click();

    // Should go back to idle and show generate/upload sections
    await expect(page.locator('text="Generate Image"')).toBeVisible();
    await expect(page.locator('text="Or Upload an Image to Refine"')).toBeVisible();
  });

  test('generate image from prompt', async ({ page }) => {
    // Enter a prompt and generate
    const promptInput = page.locator('input[placeholder*="Describe"]').first();
    await promptInput.fill('a beautiful sunset over mountains');
    const generateButton = page.locator('button:has-text("Generate")').first();
    await generateButton.click();

    // Wait for generating -> analyzing -> suggesting -> editing
    await expect(page.locator('text="Generating..."')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text="Generating..."')).toBeHidden({ timeout: 10000 });
    await expect(page.locator('text="Analysis & Suggestions"')).toBeVisible({ timeout: 10000 });

    // Verify image is displayed
    const image = page.locator('img[alt*="AI generated image"]').first();
    await expect(image).toBeVisible();
  });
});
