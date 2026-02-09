<script lang="ts">
  import { cn } from '$lib/utils';
  import { Palette, User, Mountain, Building } from '@lucide/svelte';
  import { fade, fly } from 'svelte/transition';

  type Category = {
    id: string;
    label: string;
    icon: typeof Palette;
    suggestions: string[];
  };

  const categories: Category[] = [
    {
      id: 'logo',
      label: 'Logo and Graphic Design',
      icon: Palette,
      suggestions: ['Remove Background', 'Vectorize', 'Color Palette']
    },
    {
      id: 'portrait',
      label: 'Portrait',
      icon: User,
      suggestions: ['Retouch', 'Face Enhance', 'Background Blur']
    },
    {
      id: 'landscape',
      label: 'Landscape',
      icon: Mountain,
      suggestions: ['HDR Tone', 'Sky Replacement', 'Color Grade']
    },
    {
      id: 'architecture',
      label: 'Architecture',
      icon: Building,
      suggestions: ['Perspective Correction', 'Straighten', 'Sharpen']
    }
  ];

  let selectedCategory = $state<Category | null>(null);

  function selectCategory(category: Category) {
    selectedCategory = category;
  }

  function goBack() {
    selectedCategory = null;
  }
</script>

<div class="w-full max-w-6xl mx-auto p-6">
  {#if !selectedCategory}
    <!-- Category Selection Grid -->
    <div class="space-y-8">
      <header class="text-center">
        <h1 class="text-3xl font-bold tracking-tight text-foreground">
          Choose an Image Category
        </h1>
        <p class="text-muted-foreground mt-2">
          Select a category to get tailored editing suggestions.
        </p>
      </header>

      <div
        class="grid grid-cols-1 md:grid-cols-2 gap-6"
        in:fade={{ duration: 300 }}
        out:fade={{ duration: 200 }}
      >
        {#each categories as category (category.id)}
          <button
            type="button"
            class={cn(
              'group relative flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-border bg-card',
              'hover:border-primary hover:bg-primary/5 transition-all duration-300',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
              'active:scale-[0.98]'
            )}
            onclick={() => selectCategory(category)}
            aria-label={`Select ${category.label}`}
          >
            <div class="mb-4 p-4 rounded-full bg-primary/10 text-primary">
              <svelte:component this={category.icon} size={48} stroke-width={1.5} />
            </div>
            <h2 class="text-xl font-semibold text-foreground mb-2">
              {category.label}
            </h2>
            <p class="text-sm text-muted-foreground text-center">
              Click to see editing suggestions
            </p>
            <div
              class="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary/30 transition-colors"
              aria-hidden="true"
            ></div>
          </button>
        {/each}
      </div>
    </div>
  {:else}
    <!-- Suggestions View -->
    <div in:fly={{ y: 20, duration: 300 }} out:fade={{ duration: 200 }}>
      <div class="space-y-8">
        <header class="flex items-center justify-between">
          <div>
            <button
              type="button"
              class="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              onclick={goBack}
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
                <path d="m15 18-6-6 6-6" />
              </svg>
              Back to categories
            </button>
            <h1 class="text-3xl font-bold tracking-tight text-foreground mt-2">
              Editing Suggestions for <span class="text-primary">{selectedCategory.label}</span>
            </h1>
            <p class="text-muted-foreground mt-1">
              Based on your selection, here are recommended edits.
            </p>
          </div>
          <div class="flex items-center gap-2">
            <div class="p-3 rounded-full bg-primary/10">
              <svelte:component this={selectedCategory.icon} size={32} class="text-primary" />
            </div>
          </div>
        </header>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          {#each selectedCategory.suggestions as suggestion, index (suggestion)}
            <div
              class="rounded-xl border bg-card p-6 hover:border-primary/50 hover:shadow-md transition-all"
              in:fly={{ y: 10, duration: 300, delay: 100 * index }}
            >
              <div class="flex items-start justify-between">
                <div>
                  <h3 class="font-semibold text-lg text-foreground">{suggestion}</h3>
                  <p class="text-sm text-muted-foreground mt-2">
                    {#if selectedCategory.id === 'logo'}
                      Optimize for logos and vector graphics.
                    {:else if selectedCategory.id === 'portrait'}
                      Enhance portrait photography.
                    {:else if selectedCategory.id === 'landscape'}
                      Improve landscape photo quality.
                    {:else}
                      Refine architectural details.
                    {/if}
                  </p>
                </div>
                <div class="text-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          {/each}
        </div>

        <div class="flex flex-col sm:flex-row gap-4 pt-8 border-t">
          <button
            type="button"
            class="px-6 py-3 rounded-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors font-medium"
            onclick={goBack}
          >
            Change Category
          </button>
          <button
            type="button"
            class="px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
          >
            Apply These Suggestions
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>