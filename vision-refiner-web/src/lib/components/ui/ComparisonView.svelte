<!-- vision-refiner-web/src/lib/components/ui/ComparisonView.svelte -->
<script lang="ts">
  const {
    beforeImage,
    afterImage,
    beforeLabel = 'Before',
    afterLabel = 'After',
    showSlider = true,
  } = $props<{
    beforeImage: string;
    afterImage: string;
    beforeLabel?: string;
    afterLabel?: string;
    showSlider?: boolean;
  }>();

  let container: HTMLElement;
  let isDragging = $state(false);
  let sliderPosition = $state(50); // percentage

  function handleMouseDown(event: MouseEvent) {
    if (!showSlider) return;
    isDragging = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    updateSliderPosition(event);
  }

  function handleMouseMove(event: MouseEvent) {
    if (!isDragging) return;
    updateSliderPosition(event);
  }

  function handleMouseUp() {
    isDragging = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }

  function updateSliderPosition(event: MouseEvent) {
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = Math.max(0, Math.min(event.clientX - rect.left, rect.width));
    sliderPosition = (x / rect.width) * 100;
  }

  function handleTouchStart(event: TouchEvent) {
    if (!showSlider) return;
    isDragging = true;
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
    updateSliderPositionTouch(event);
    event.preventDefault();
  }

  function handleTouchMove(event: TouchEvent) {
    if (!isDragging) return;
    updateSliderPositionTouch(event);
    event.preventDefault();
  }

  function handleTouchEnd() {
    isDragging = false;
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
  }

  function updateSliderPositionTouch(event: TouchEvent) {
    if (!container || !event.touches.length) return;
    const rect = container.getBoundingClientRect();
    const x = Math.max(0, Math.min(event.touches[0].clientX - rect.left, rect.width));
    sliderPosition = (x / rect.width) * 100;
  }

  // Cleanup event listeners on component destruction
  $effect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  });
</script>

<div class="space-y-4">
  <div class="flex items-center justify-between">
    <h3 class="text-lg font-semibold">Comparison</h3>
    {#if showSlider}
      <div class="text-sm text-muted-foreground">
        Drag the slider to compare
      </div>
    {/if}
  </div>

  <div
    bind:this={container}
    class="relative w-full h-96 rounded-lg overflow-hidden border bg-muted"
    onmousedown={handleMouseDown}
    ontouchstart={handleTouchStart}
    style="cursor: {showSlider ? 'col-resize' : 'default'};"
  >
    <!-- Before image (full) -->
    <img
      src={beforeImage}
      alt={beforeLabel}
      class="absolute inset-0 w-full h-full object-contain"
    />

    <!-- After image (clipped) -->
    <div
      class="absolute inset-0 overflow-hidden"
      style="clip-path: inset(0 0 0 {sliderPosition}%);"
    >
      <img
        src={afterImage}
        alt={afterLabel}
        class="w-full h-full object-contain"
      />
    </div>

    <!-- Slider line and handle -->
    {#if showSlider}
      <div
        class="absolute top-0 bottom-0 w-1 bg-primary/80 pointer-events-none"
        style="left: {sliderPosition}%;"
      >
        <div class="absolute -left-3 -top-3 w-6 h-6 rounded-full bg-primary border-2 border-background shadow-md pointer-events-none">
          <div class="absolute inset-0 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="text-background"
            >
              <path d="M8 3v18" />
              <path d="M16 3v18" />
              <path d="M3 8h18" />
              <path d="M3 16h18" />
            </svg>
          </div>
        </div>
      </div>
    {/if}

    <!-- Labels -->
    <div class="absolute top-4 left-4 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-md text-sm font-medium">
      {beforeLabel}
    </div>
    <div class="absolute top-4 right-4 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-md text-sm font-medium">
      {afterLabel}
    </div>
  </div>

  <!-- Slider position indicator -->
  {#if showSlider}
    <div class="flex items-center justify-between text-sm text-muted-foreground">
      <span>{beforeLabel}</span>
      <span>{sliderPosition.toFixed(0)}%</span>
      <span>{afterLabel}</span>
    </div>
  {/if}
</div>