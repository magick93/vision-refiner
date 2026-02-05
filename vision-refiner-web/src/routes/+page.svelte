<script lang="ts">
  import { useMachine } from '@xstate/svelte';
  import { imagePipelineMachine } from '$lib/machines/imagePipelineMachine';
  import NanoBananaInput from '$lib/components/ui/NanoBananaInput.svelte';
  import ImageDisplay from '$lib/components/ui/ImageDisplay.svelte';
  import ImageUploader from '$lib/components/ui/ImageUploader.svelte';
  import AnalysisPanel from '$lib/components/ui/AnalysisPanel.svelte';
  import EditControls from '$lib/components/ui/EditControls.svelte';
  import ModeSelector from '$lib/components/ui/ModeSelector.svelte';
  import ComparisonView from '$lib/components/ui/ComparisonView.svelte';
  import type { ImageGenerationResult, AnalysisResult } from '$lib/server/api/imageProvider';

  // Use the XState machine
  const { snapshot, send } = useMachine(imagePipelineMachine);

  // Derived state for UI
  const currentState = $derived($snapshot.value);
  const context = $derived($snapshot.context);
  const isLoading = $derived(
    currentState === 'uploading' ||
    currentState === 'generating' ||
    currentState === 'analyzing' ||
    currentState === 'processing_edit'
  );
  const isError = $derived(context.lastError);
  const analysisLoading = $derived(currentState === 'analyzing');
  const editLoading = $derived(currentState === 'processing_edit');

  // Object URL management
  let currentImageUrl = $state<string | null>(null);
  let originalImageUrl = $state<string | null>(null);

  let editPrompt = $state<string | null>(null);

  // Track previous blobs to avoid recreating object URLs unnecessarily
  let currentImageBlob = $state<Blob | null>(null);
  let originalImageBlob = $state<Blob | null>(null);

  $effect(() => {
    console.log('$effect running', {
      currentImage: context.currentImage?.constructor?.name,
      originalImage: context.originalImage?.constructor?.name,
      currentImageUrl,
      originalImageUrl
    });

    // Handle currentImage
    if (context.currentImage === undefined || context.currentImage === null) {
      if (currentImageUrl && currentImageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(currentImageUrl);
      }
      currentImageUrl = null;
      currentImageBlob = null;
    } else if (typeof context.currentImage === 'string') {
      // It's a data URL, no need for object URL
      if (currentImageUrl && currentImageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(currentImageUrl);
      }
      currentImageUrl = context.currentImage;
      currentImageBlob = null;
    } else {
      // It's a Blob
      const blob = context.currentImage as Blob;
      if (blob !== currentImageBlob) {
        if (currentImageUrl && currentImageUrl.startsWith('blob:')) {
          URL.revokeObjectURL(currentImageUrl);
        }
        currentImageUrl = URL.createObjectURL(blob);
        currentImageBlob = blob;
      }
      // else keep existing URL
    }

    // Handle originalImage
    if (context.originalImage === undefined || context.originalImage === null) {
      if (originalImageUrl && originalImageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(originalImageUrl);
      }
      originalImageUrl = null;
      originalImageBlob = null;
    } else if (typeof context.originalImage === 'string') {
      if (originalImageUrl && originalImageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(originalImageUrl);
      }
      originalImageUrl = context.originalImage;
      originalImageBlob = null;
    } else {
      const blob = context.originalImage as Blob;
      if (blob !== originalImageBlob) {
        if (originalImageUrl && originalImageUrl.startsWith('blob:')) {
          URL.revokeObjectURL(originalImageUrl);
        }
        originalImageUrl = URL.createObjectURL(blob);
        originalImageBlob = blob;
      }
    }

    console.log('Updated URLs:', { currentImageUrl, originalImageUrl });
  });

  // Event handlers
  function handleUpload({ image }: { image: Blob | string }) {
    send({ type: 'UPLOAD', image });
  }

  function handleGenerate({ prompt }: { prompt: string }) {
    send({ type: 'GENERATE', prompt });
  }

  function handleEdit({ prompt }: { prompt: string }) {
    console.log('[+page.svelte] handleEdit called with prompt:', prompt, 'currentState:', currentState);
    send({ type: 'EDIT', prompt });
  }

  function handleSuggestionClick({ prompt }: { prompt: string }) {
    send({ type: 'EDIT', prompt });
  }

  function handleReset() {
    send({ type: 'RESET' });
  }

  function handleRetry() {
    send({ type: 'RETRY' });
  }
</script>

<main>
  <h1>Vision Refiner</h1>
  <p class="subtitle">Generate images with AI and get suggestions for refinements</p>

  <div class="container">
    <!-- Mode selector -->
    <section class="mode-section">
      <ModeSelector
        selected={currentState === 'idle' ? 'create' : context.originalImage ? 'refine' : 'create'}
        onselect={({ mode }) => {
          // If switching to refine but no image, maybe show uploader
          // For now, just log
          console.log('Mode selected:', mode);
        }}
      />
    </section>

    <!-- Input section based on mode -->
    {#if !context.originalImage}
      <section class="input-section">
        <h2>Generate Image</h2>
        <p>Enter a prompt below to generate an image using Google Nano Banana AI.</p>
        
        <NanoBananaInput
          value={context.currentPrompt || ''}
          disabled={isLoading}
          loading={currentState === 'generating'}
          onsubmit={handleGenerate}
          oninput={({ value }) => { /* optional */ }}
        />
      </section>

      <section class="upload-section">
        <h2>Or Upload an Image to Refine</h2>
        <p>Upload an existing image to get AI analysis and editing suggestions.</p>
        <ImageUploader
          disabled={isLoading}
          loading={currentState === 'uploading'}
          onUpload={handleUpload}
          onError={({ message }) => console.error('Upload error:', message)}
        />
      </section>
    {:else}
      <section class="refine-section">
        <h2>Refine Existing Image</h2>
        <p>You can edit the uploaded image or generate a new one.</p>
        <div class="flex gap-4">
          <ImageUploader
            disabled={isLoading}
            loading={currentState === 'uploading'}
            onUpload={handleUpload}
          />
          <button onclick={handleReset} class="secondary-button">Reset</button>
        </div>
      </section>
    {/if}

    <!-- Image display -->
    <section class="output-section">
      <h2>Image</h2>
      <ImageDisplay
        imageUrl={currentImageUrl}
        originalImageUrl={originalImageUrl}
        loading={isLoading}
        error={isError}
        altText={`AI generated image for: ${context.currentPrompt || 'uploaded image'}`}
        showComparison={currentState === 'review'}
        optimisticUpdate={currentState === 'processing_edit'}
      />
    </section>

    <!-- Analysis panel when in suggesting/editing states -->
    {#if currentState === 'suggesting' || currentState === 'editing' || currentState === 'review'}
      <section class="analysis-section">
        <h2>Analysis & Suggestions</h2>
        <AnalysisPanel
          analysis={context.analysisResult}
          loading={analysisLoading}
          error={context.lastError}
          onsuggestionClick={handleSuggestionClick}
        />
      </section>
    {/if}

    <!-- Edit controls when in editing states -->
    {#if currentState === 'editing' || currentState === 'suggesting' || currentState === 'review'}
      <section class="edit-section">
        <h2>Edit Image</h2>
        <EditControls
          bind:value={editPrompt}
          disabled={isLoading}
          loading={editLoading}
          onedit={handleEdit}
          oninput={({ value }) => { /* optional */ }}
        />
      </section>
    {/if}

    <!-- Comparison view when in review state -->
    {#if currentState === 'review' && originalImageUrl && currentImageUrl}
      <section class="comparison-section">
        <h2>Compare Before & After</h2>
        <ComparisonView
          beforeImage={originalImageUrl}
          afterImage={currentImageUrl}
          beforeLabel="Original"
          afterLabel="Edited"
        />
      </section>
    {/if}

    <!-- State debug (optional) -->
    <details class="debug-section">
      <summary>Debug: Machine State</summary>
      <pre>
        State: {currentState}
        Context: {JSON.stringify(context, null, 2)}
      </pre>
    </details>
  </div>
</main>

<style>
  main {
    max-width: 1000px;
    margin: 0 auto;
    padding: 2rem;
    font-family: system-ui, -apple-system, sans-serif;
  }

  h1 {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
    color: #333;
  }

  .subtitle {
    font-size: 1.1rem;
    color: #666;
    margin-bottom: 2rem;
  }

  .container {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  section {
    background: white;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  h2 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: #444;
  }

  .mode-section {
    background-color: #f8f9fa;
    border-left: 4px solid #6c757d;
  }

  .input-section p,
  .upload-section p,
  .refine-section p {
    margin-bottom: 1rem;
    color: #555;
  }

  .secondary-button {
    padding: 0.5rem 1rem;
    background-color: #6c757d;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .secondary-button:hover {
    background-color: #5a6268;
  }

  .debug-section {
    font-size: 0.875rem;
    color: #666;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 0.5rem;
  }

  pre {
    white-space: pre-wrap;
    word-wrap: break-word;
  }
</style>
