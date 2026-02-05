<!-- vision-refiner-web/src/lib/components/ui/EditControls.svelte -->
<script lang="ts">
  import { cn } from '$lib/utils';

  const {
    value = '',
    disabled = false,
    loading = false,
    placeholder = 'Describe the edit you want to apply...',
    buttonLabel = 'Apply Edit',
    onedit,
    oninput,
  } = $props<{
    value?: string;
    disabled?: boolean;
    loading?: boolean;
    placeholder?: string;
    buttonLabel?: string;
    onedit?: (event: { prompt: string }) => void;
    oninput?: (event: { value: string }) => void;
  }>();

  let inputElement: HTMLInputElement | undefined;

  function handleSubmit(event: Event) {
    event.preventDefault();
    const trimmed = value.trim();
    if (trimmed && !disabled && !loading) {
      onedit?.({ prompt: trimmed });
    }
  }

  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    oninput?.({ value: target.value });
  }

  // Expose a method to set value from parent (e.g., when suggestion clicked)
  export function setPrompt(prompt: string) {
    oninput?.({ value: prompt });
  }
</script>

<form onsubmit={handleSubmit} class="space-y-4">
  <div class="space-y-2">
    <label for="edit-prompt-input" class="text-sm font-medium">Edit Prompt</label>
    <div class="relative">
      <input
        bind:this={inputElement}
        type="text"
        id="edit-prompt-input"
        name="prompt"
        aria-label="Edit prompt"
        value={value}
        {disabled}
        {placeholder}
        oninput={handleInput}
        class={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
          'ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium',
          'placeholder:text-muted-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50'
        )}
      />
      {#if loading}
        <div class="absolute right-3 top-1/2 -translate-y-1/2">
          <div class="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
        </div>
      {/if}
    </div>
    <p class="text-xs text-muted-foreground">
      Describe the changes you want to make to the image (e.g., "make it sunset", "add a dog").
    </p>
  </div>

  <div class="flex items-center justify-between">
    <button
      type="submit"
      aria-label={buttonLabel}
      {disabled}
      class={cn(
        'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium',
        'ring-offset-background transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        loading
          ? 'bg-primary/80 cursor-wait'
          : 'bg-primary text-primary-foreground hover:bg-primary/90'
      )}
    >
      {#if loading}
        <div class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
        Processing...
      {:else}
        {buttonLabel}
      {/if}
    </button>

    <!-- Optional reset button -->
    <button
      type="button"
      onclick={() => {
        oninput?.({ value: '' });
      }}
      class="text-sm text-muted-foreground hover:text-foreground"
      {disabled}
    >
      Clear
    </button>
  </div>
</form>