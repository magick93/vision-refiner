<!-- vision-refiner-web/src/lib/components/ui/AnalysisPanel.svelte -->
<script lang="ts">
  import { cn } from '$lib/utils';
  import type { AnalysisResult } from '$lib/server/api/imageProvider';

  const {
    analysis = null,
    loading = false,
    error = null,
    onsuggestionClick,
  } = $props<{
    analysis?: AnalysisResult | null;
    loading?: boolean;
    error?: string | null;
    onsuggestionClick?: (event: { prompt: string }) => void;
  }>();

  // Mock data for demonstration when no analysis provided
  const mockAnalysis: AnalysisResult = {
    description: 'A scenic landscape with mountains, a lake, and a clear sky.',
    detectedObjects: ['mountain', 'lake', 'sky', 'tree', 'cloud'],
    suggestedEdits: [
      'Add a sunset',
      'Make it winter',
      'Add a cabin by the lake',
      'Increase saturation',
      'Convert to black and white',
    ],
    success: true,
  };

  const displayAnalysis = $derived(analysis ?? mockAnalysis);

  function handleSuggestionClick(prompt: string) {
    onsuggestionClick?.({ prompt });
  }
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <h2 class="text-xl font-semibold">Analysis Results</h2>
    {#if loading}
      <div class="inline-flex items-center gap-2 text-sm text-muted-foreground">
        <div class="h-2 w-2 animate-ping rounded-full bg-primary"></div>
        Analyzing...
      </div>
    {/if}
  </div>

  <!-- Error state -->
  {#if error}
    <div class="rounded-lg border border-destructive/20 bg-destructive/10 p-4">
      <p class="text-destructive font-medium">Analysis failed</p>
      <p class="text-sm text-destructive/80">{error}</p>
    </div>
  {:else if !displayAnalysis.success}
    <div class="rounded-lg border border-destructive/20 bg-destructive/10 p-4">
      <p class="text-destructive font-medium">Analysis unsuccessful</p>
      <p class="text-sm text-destructive/80">{displayAnalysis.error || 'Unknown error'}</p>
    </div>
  {:else}
    <!-- What the AI sees -->
    <section class="space-y-3">
      <h3 class="font-medium text-foreground/80">What the AI sees</h3>
      <div class="rounded-lg border bg-card p-4">
        <p class="text-sm">{displayAnalysis.description}</p>
      </div>
    </section>

    <!-- Detected objects -->
    <section class="space-y-3">
      <h3 class="font-medium text-foreground/80">Detected objects</h3>
      <div class="flex flex-wrap gap-2">
        {#each displayAnalysis.detectedObjects as object}
          <span
            class="inline-flex items-center rounded-full border bg-muted px-3 py-1 text-xs font-medium"
          >
            {object}
          </span>
        {/each}
      </div>
    </section>

    <!-- Suggested edits -->
    <section class="space-y-3">
      <div class="flex items-center justify-between">
        <h3 class="font-medium text-foreground/80">Suggested edits</h3>
        <p class="text-xs text-muted-foreground">Click to apply</p>
      </div>
      <div class="flex flex-wrap gap-2">
        {#each displayAnalysis.suggestedEdits as suggestion}
          <button
            type="button"
            onclick={() => handleSuggestionClick(suggestion)}
            class={cn(
              'inline-flex items-center rounded-lg border bg-background px-3 py-2 text-sm font-medium',
              'transition-colors hover:bg-accent hover:text-accent-foreground',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
            )}
            aria-label={`Apply edit: ${suggestion}`}
          >
            {suggestion}
          </button>
        {/each}
      </div>
    </section>
  {/if}
</div>