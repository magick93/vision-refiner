<!-- vision-refiner-web/src/lib/components/ui/ModeSelector.svelte -->
<script lang="ts" context="module">
  export type Mode = 'create' | 'refine';
</script>

<script lang="ts">
  import { cn } from '$lib/utils';

  const {
    selected = 'create',
    disabled = false,
    onselect,
  } = $props<{
    selected?: Mode;
    disabled?: boolean;
    onselect?: (event: { mode: Mode }) => void;
  }>();

  function selectMode(mode: Mode) {
    if (disabled) return;
    // selected = mode; // selected is now a prop, we cannot assign; we rely on parent to update
    onselect?.({ mode });
  }
</script>

<div class="space-y-3">
  <h3 class="text-sm font-medium text-foreground/80">Mode</h3>
  <div class="inline-flex rounded-lg border bg-muted p-1" role="radiogroup" aria-label="Select mode">
    <button
      type="button"
      role="radio"
      aria-checked={selected === 'create'}
      onclick={() => selectMode('create')}
      class={cn(
        'inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        selected === 'create'
          ? 'bg-background text-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground'
      )}
      {disabled}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="mr-2"
      >
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
      Create New (Text)
    </button>
    <button
      type="button"
      role="radio"
      aria-checked={selected === 'refine'}
      onclick={() => selectMode('refine')}
      class={cn(
        'inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        selected === 'refine'
          ? 'bg-background text-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground'
      )}
      {disabled}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="mr-2"
      >
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7" />
        <line x1="16" y1="5" x2="22" y2="5" />
        <line x1="19" y1="2" x2="19" y2="8" />
        <circle cx="9" cy="9" r="2" />
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
      </svg>
      Refine Existing (Upload)
    </button>
  </div>
  <p class="text-xs text-muted-foreground">
    {#if selected === 'create'}
      Generate a new image from a text prompt.
    {:else}
      Upload an existing image to analyze and refine.
    {/if}
  </p>
</div>