<!-- vision-refiner-web/src/lib/components/ui/ImageUploader.svelte -->
<script lang="ts">
  import { cn } from '$lib/utils';

  const {
    disabled = false,
    loading = false,
    maxSizeMB = 5,
    acceptedFormats = ['image/jpeg', 'image/png', 'image/webp'],
    maxWidth = 1024,
    maxHeight = 1024,
    onUpload,
    onError,
  } = $props<{
    disabled?: boolean;
    loading?: boolean;
    maxSizeMB?: number;
    acceptedFormats?: string[];
    maxWidth?: number;
    maxHeight?: number;
    onUpload?: (event: { image: Blob | string }) => void;
    onError?: (event: { message: string }) => void;
  }>();

  let dragActive = $state(false);
  let previewUrl = $state<string | null>(null);
  let errorMessage = $state<string | null>(null);
  let fileInput = $state<HTMLInputElement | null>(null);
  let processing = $state(false);

  // Validate file
  function validateFile(file: File): string | null {
    if (!acceptedFormats.includes(file.type)) {
      return `File type ${file.type} not supported. Please upload JPEG, PNG, or WebP.`;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File size exceeds ${maxSizeMB}MB.`;
    }
    return null;
  }

  // Resize image using canvas
  async function resizeImage(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl); // Clean up object URL after image loads
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        // Calculate new dimensions preserving aspect ratio
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Failed to create blob'));
          },
          file.type,
          0.9
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl); // Clean up on error too
        reject(new Error('Failed to load image'));
      };
      img.src = objectUrl;
    });
  }

  // Process file
  async function processFile(file: File) {
    console.log('processFile called', { file, processing, previewUrl });
    // Prevent concurrent processing
    if (processing) {
      console.warn('processFile already in progress, skipping');
      return;
    }
    
    processing = true;
    errorMessage = null;
    
    try {
      const validationError = validateFile(file);
      if (validationError) {
        errorMessage = validationError;
        onError?.({ message: validationError });
        return;
      }

      // Resize if needed
      console.log('resizing image...');
      const blob = await resizeImage(file);
      console.log('resized blob size:', blob.size, 'type:', blob.type);
      // Create preview URL
      // if (previewUrl) URL.revokeObjectURL(previewUrl);
      // previewUrl = URL.createObjectURL(blob);
      // Emit upload event with the blob
      console.log('calling onUpload with blob');
      onUpload?.({ image: blob });
    } catch (err) {
      console.error('processFile error:', err);
      errorMessage = err instanceof Error ? err.message : 'Unknown error';
      onError?.({ message: errorMessage });
    } finally {
      console.log('processFile completed, setting processing = false');
      processing = false;
    }
  }

  // Handle file selection
  function handleFileSelect(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;
    processFile(file);
    // Reset input to allow re-upload of same file
    target.value = '';
  }

  // Drag and drop handlers
  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    if (disabled || loading) return;
    dragActive = true;
  }

  function handleDragLeave(event: DragEvent) {
    event.preventDefault();
    dragActive = false;
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    dragActive = false;
    if (disabled || loading) return;

    const file = event.dataTransfer?.files?.[0];
    if (!file) {
      errorMessage = 'No file dropped';
      return;
    }
    processFile(file);
  }

  // Trigger file input click
  function triggerFileInput() {
    fileInput?.click();
  }

  // Clean up URLs on destroy
  $effect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  });
</script>

<div class="space-y-4">
  <!-- Drag-and-drop zone -->
  <div
    class={cn(
      'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
      dragActive ? 'border-primary bg-primary/5' : 'border-border',
      disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-muted/50'
    )}
    ondragover={handleDragOver}
    ondragleave={handleDragLeave}
    ondrop={handleDrop}
    onclick={triggerFileInput}
    role="button"
    aria-label="Upload image via drag‑and‑drop or click"
    tabindex="0"
    onkeydown={(e) => e.key === 'Enter' && triggerFileInput()}
  >
    <div class="flex flex-col items-center gap-3">
      <div class="rounded-full bg-muted p-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="text-muted-foreground"
        >
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7" />
          <line x1="16" y1="5" x2="22" y2="5" />
          <line x1="19" y1="2" x2="19" y2="8" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
      </div>
      <div>
        <p class="font-medium">Drop your image here, or <span class="text-primary">browse</span></p>
        <p class="text-sm text-muted-foreground mt-1">
          Supports JPEG, PNG, WebP up to {maxSizeMB}MB
        </p>
      </div>
    </div>
  </div>

  <!-- Hidden file input -->
  <input
    bind:this={fileInput}
    type="file"
    accept={acceptedFormats.join(',')}
    onchange={handleFileSelect}
    class="hidden"
    {disabled}
    aria-label="Select image file"
  />

  <!-- Error message -->
  {#if errorMessage}
    <div class="rounded-md bg-destructive/10 border border-destructive/20 p-3">
      <p class="text-sm text-destructive font-medium">{errorMessage}</p>
    </div>
  {/if}

  <!-- Preview -->
  {#if previewUrl}
    <div class="rounded-lg border overflow-hidden">
      <div class="p-4 border-b bg-muted/30">
        <h3 class="font-medium">Preview</h3>
      </div>
      <div class="p-4 flex justify-center">
        <img
          src={previewUrl}
          alt="Uploaded image preview"
          class="max-w-full max-h-64 rounded object-contain"
        />
      </div>
    </div>
  {/if}
</div>