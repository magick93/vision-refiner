// vision-refiner-web/src/lib/components/ui/ImageUploader.spec.ts
import { render, screen, fireEvent, cleanup } from '@testing-library/svelte';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import ImageUploader from './ImageUploader.svelte';

// Mock URL.createObjectURL to return a fake URL
const mockCreateObjectURL = vi.fn(() => 'blob:fake-url');
const mockRevokeObjectURL = vi.fn();

beforeEach(() => {
  global.URL.createObjectURL = mockCreateObjectURL;
  global.URL.revokeObjectURL = mockRevokeObjectURL;

  // Mock HTMLCanvasElement prototype methods to ensure canvas.getContext works
  const mockDrawImage = vi.fn();
  const mockGetContext = vi.fn(() => ({
    drawImage: mockDrawImage,
    // Add minimal required properties to satisfy CanvasRenderingContext2D type
    canvas: null as any,
    globalAlpha: 1,
    globalCompositeOperation: 'source-over',
    beginPath: vi.fn(),
    closePath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    rect: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    // ... other methods as needed
  })) as any; // Cast to any to avoid TypeScript errors
  const mockToBlob = vi.fn((callback) => {
    const blob = new Blob(['fake-image-data'], { type: 'image/jpeg' });
    callback(blob);
  });

  // Store original methods for restoration
  const originalGetContext = HTMLCanvasElement.prototype.getContext;
  const originalToBlob = HTMLCanvasElement.prototype.toBlob;

  HTMLCanvasElement.prototype.getContext = mockGetContext;
  HTMLCanvasElement.prototype.toBlob = mockToBlob;

  // Ensure width/height can be set
  Object.defineProperty(HTMLCanvasElement.prototype, 'width', {
    writable: true,
    value: 0,
  });
  Object.defineProperty(HTMLCanvasElement.prototype, 'height', {
    writable: true,
    value: 0,
  });

  // Mock Image to immediately call onload
  vi.stubGlobal('Image', class {
    onload = vi.fn();
    onerror = vi.fn();
    src = '';
    width = 800;
    height = 600;
    constructor() {
      setTimeout(() => this.onload(), 0);
    }
  });

  // Store references for cleanup
  (global as any).__originalGetContext = originalGetContext;
  (global as any).__originalToBlob = originalToBlob;
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  // Restore original prototype methods
  if ((global as any).__originalGetContext) {
    HTMLCanvasElement.prototype.getContext = (global as any).__originalGetContext;
  }
  if ((global as any).__originalToBlob) {
    HTMLCanvasElement.prototype.toBlob = (global as any).__originalToBlob;
  }
  // Remove stored references
  delete (global as any).__originalGetContext;
  delete (global as any).__originalToBlob;
});

describe('ImageUploader', () => {
  it('should render drag-and-drop zone', () => {
    render(ImageUploader);
    expect(screen.getByText(/Drop your image here/i)).toBeInTheDocument();
    expect(screen.getByText(/Supports JPEG, PNG, WebP up to 5MB/i)).toBeInTheDocument();
  });

  it('should show error when invalid file is selected', async () => {
    render(ImageUploader);
    const file = new File([''], 'test.pdf', { type: 'application/pdf' });
    const inputs = screen.getAllByLabelText('Select image file');
    const input = inputs[0] as HTMLInputElement;

    await fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getByText(/File type application\/pdf not supported/i)).toBeInTheDocument();
  });

  it('should show preview when valid image is selected', async () => {
    render(ImageUploader);
    const file = new File(['fake-image-data'], 'test.jpg', { type: 'image/jpeg' });
    const inputs = screen.getAllByLabelText('Select image file');
    const input = inputs[0] as HTMLInputElement;

    await fireEvent.change(input, { target: { files: [file] } });

    // Wait for preview to appear (async resize)
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(screen.getByAltText('Uploaded image preview')).toBeInTheDocument();
    expect(mockCreateObjectURL).toHaveBeenCalled();
  });

  it('should be disabled when disabled prop is true', () => {
    render(ImageUploader, { disabled: true });
    const inputs = screen.getAllByLabelText('Select image file');
    const input = inputs[0] as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it('should show loading state when loading prop is true', () => {
    render(ImageUploader, { loading: true });
    const zones = screen.getAllByRole('button', { name: /upload image/i });
    const zone = zones[0];
    expect(zone).toHaveClass('opacity-50');
    expect(zone).toHaveClass('cursor-not-allowed');
  });
});