<script lang="ts">
  import CategorySelector from '$lib/components/ui/CategorySelector.svelte';
</script>

<div class="min-h-screen bg-background p-8">
  <div class="max-w-7xl mx-auto">
    <h1 class="text-4xl font-bold mb-8 text-foreground">Category Selection Screen Test</h1>
    <p class="text-muted-foreground mb-12">
      This is a test page for the CategorySelector component. Select a category to see editing suggestions.
    </p>
    <CategorySelector />
  </div>
</div>