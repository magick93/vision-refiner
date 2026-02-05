// vision-refiner-web/src/lib/components/ui/ImageDisplay.spec.ts
import { render, screen } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import ImageDisplay from './ImageDisplay.svelte';

describe('ImageDisplay', () => {
  it('should show placeholder when no image is provided', () => {
    render(ImageDisplay);
    
    expect(screen.getByText('No image generated yet.')).toBeInTheDocument();
  });

  it('should show loading state when loading is true', () => {
    render(ImageDisplay, { loading: true });
    
    expect(screen.getByText('Generating image...')).toBeInTheDocument();
    
    // Check for spinner (has role="status")
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should show error state when error is provided', () => {
    const errorMessage = 'API error occurred';
    render(ImageDisplay, { error: errorMessage });
    
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should display image when imageUrl is provided', () => {
    const testImageUrl = 'https://example.com/test-image.jpg';
    render(ImageDisplay, { imageUrl: testImageUrl });
    
    const image = screen.getByAltText('Generated image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', testImageUrl);
    
    expect(screen.getByText('Generated image')).toBeInTheDocument();
  });

  it('should use custom alt text when provided', () => {
    const testImageUrl = 'https://example.com/test-image.jpg';
    const customAlt = 'Custom alt text';
    render(ImageDisplay, { imageUrl: testImageUrl, altText: customAlt });
    
    const image = screen.getByAltText(customAlt);
    expect(image).toBeInTheDocument();
  });
});