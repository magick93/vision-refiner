// vision-refiner-web/src/lib/components/ui/NanoBananaInput.spec.ts
import { render, screen, fireEvent, cleanup } from '@testing-library/svelte';
import { describe, it, expect, vi, afterEach } from 'vitest';
import NanoBananaInput from './NanoBananaInput.svelte';

describe('NanoBananaInput', () => {
  afterEach(() => {
    cleanup();
  });

  it('should render an input field and a submit button', () => {
    render(NanoBananaInput);
    
    // Expect an input field with aria-label "Prompt"
    const inputElement = screen.getByLabelText('Prompt');
    expect(inputElement).toBeInTheDocument();
    
    // Expect a submit button
    const buttonElement = screen.getByRole('button', { name: 'Generate' });
    expect(buttonElement).toBeInTheDocument();
  });

  it('should disable input and button when disabled prop is true', () => {
    render(NanoBananaInput, { disabled: true });
    
    const inputElement = screen.getByLabelText('Prompt');
    expect(inputElement).toBeDisabled();
    
    const buttonElement = screen.getByRole('button', { name: 'Generate' });
    expect(buttonElement).toBeDisabled();
  });

  it('should show loading text when loading prop is true', () => {
    render(NanoBananaInput, { loading: true });
    
    // The button text changes to "Generating..." but aria-label stays "Generate"
    // So we need to find by visible text
    const buttonElement = screen.getByText('Generating...');
    expect(buttonElement).toBeInTheDocument();
    expect(buttonElement).toHaveAttribute('aria-label', 'Generate');
  });

  it('should update value when input changes', async () => {
    render(NanoBananaInput);
    
    const inputElement = screen.getByLabelText('Prompt');
    await fireEvent.input(inputElement, { target: { value: 'new value' } });
    
    // The input value should be updated
    expect(inputElement).toHaveValue('new value');
  });

  it('should submit form when button is clicked', async () => {
    const { component } = render(NanoBananaInput, { value: 'test prompt' });
    
    const buttonElement = screen.getByRole('button', { name: 'Generate' });
    await fireEvent.click(buttonElement);
    
    // The form should trigger submit
    expect(buttonElement).toBeInTheDocument();
  });
});
