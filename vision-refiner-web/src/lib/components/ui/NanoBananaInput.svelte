<!-- vision-refiner-web/src/lib/components/ui/NanoBananaInput.svelte -->
<script lang="ts">
  const {
    value = '',
    disabled = false,
    loading = false,
    onsubmit,
    oninput,
  } = $props<{
    value?: string;
    disabled?: boolean;
    loading?: boolean;
    onsubmit?: (event: { prompt: string }) => void;
    oninput?: (event: { value: string }) => void;
  }>();

  function handleSubmit(event: Event) {
    event.preventDefault();
    if (value.trim() && !disabled && !loading) {
      onsubmit?.({ prompt: value.trim() });
    }
  }

  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    oninput?.({ value: target.value });
  }
</script>

<form onsubmit={handleSubmit}>
  <label for="prompt-input">Prompt:</label>
  <input
    type="text"
    id="prompt-input"
    name="prompt"
    aria-label="Prompt"
    value={value}
    {disabled}
    oninput={handleInput}
    placeholder="Enter a prompt for image generation..."
  />
  <button type="submit" aria-label="Generate" {disabled}>
    {#if loading}
      Generating...
    {:else}
      Generate
    {/if}
  </button>
</form>

<style>
  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 500px;
    margin: 0 auto;
  }

  label {
    font-weight: bold;
    margin-bottom: 0.5rem;
  }

  input {
    padding: 0.75rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
  }

  input:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }

  button {
    padding: 0.75rem 1.5rem;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  button:hover:not(:disabled) {
    background-color: #0056b3;
  }

  button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
</style>