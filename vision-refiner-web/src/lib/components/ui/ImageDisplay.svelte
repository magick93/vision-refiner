<!-- vision-refiner-web/src/lib/components/ui/ImageDisplay.svelte -->
<script lang="ts">
  const {
    imageUrl = null,
    originalImageUrl = null,
    loading = false,
    error = null,
    altText = 'Generated image',
    showComparison = false,
    optimisticUpdate = false,
  } = $props<{
    imageUrl?: string | null;
    originalImageUrl?: string | null;
    loading?: boolean;
    error?: string | null;
    altText?: string;
    showComparison?: boolean;
    optimisticUpdate?: boolean;
  }>();

  // If imageUrl is not provided but originalImageUrl is, use that for single view
  const displayImage = $derived(imageUrl ?? originalImageUrl);
</script>

<div class="image-display">
  {#if loading}
    <div class="loading-state" role="status" aria-label="Loading image">
      <div class="spinner"></div>
      <p>
        {#if optimisticUpdate}
          Applying edit...
        {:else}
          Generating image...
        {/if}
      </p>
    </div>
  {:else if error}
    <div class="error-state" role="alert">
      <p class="error-message">{error}</p>
      <p>Please try again with a different prompt.</p>
    </div>
  {:else if showComparison && originalImageUrl && imageUrl}
    <!-- Comparison view: side-by-side -->
    <div class="comparison-view">
      <h3 class="comparison-title">Comparison</h3>
      <div class="comparison-grid">
        <div class="comparison-item">
          <img src={originalImageUrl} alt="Original image" />
          <p class="image-caption">Original</p>
        </div>
        <div class="comparison-item">
          <img src={imageUrl} alt="Edited image" />
          <p class="image-caption">Edited</p>
        </div>
      </div>
    </div>
  {:else if displayImage}
    <!-- Single image view -->
    <div class="image-container">
      <img src={displayImage} alt={altText} />
      <p class="image-caption">
        {#if optimisticUpdate}
          Preview (edit in progress)
        {:else if originalImageUrl && !imageUrl}
          Uploaded image
        {:else}
          Generated image
        {/if}
      </p>
    </div>
  {:else}
    <div class="placeholder-state">
      <p>No image generated yet.</p>
      <p>Enter a prompt and click "Generate" to create an image.</p>
    </div>
  {/if}
</div>

<style>
  .image-display {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    border: 2px dashed #ccc;
    border-radius: 8px;
    padding: 2rem;
    margin: 1rem 0;
    background-color: #f9f9f9;
  }

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .spinner {
    width: 50px;
    height: 50px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #007bff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .error-state {
    text-align: center;
    color: #dc3545;
  }

  .error-message {
    font-weight: bold;
    margin-bottom: 0.5rem;
  }

  .image-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    max-width: 100%;
  }

  .comparison-view {
    width: 100%;
  }

  .comparison-title {
    text-align: center;
    margin-bottom: 1.5rem;
    font-weight: 600;
    color: #333;
  }

  .comparison-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    width: 100%;
  }

  .comparison-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
  }

  img {
    max-width: 100%;
    max-height: 400px;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .image-caption {
    font-style: italic;
    color: #666;
  }

  .placeholder-state {
    text-align: center;
    color: #666;
  }

  p {
    margin: 0.5rem 0;
  }
</style>