# Spec: Provider-Agnostic XState Image Pipeline

## Requirements
1.  **State Management:** Use an XState machine to handle transitions: `idle` -> `generating` -> `analyzing` -> `suggesting` -> `editing`.
2.  **Model Abstraction:** Define a `BaseImageModel` class. Implement `NanoBananaProvider` and `GenericStableDiffusionProvider`.
3.  **Parallel Execution:** The pipeline must support a `compare` flag to trigger two providers simultaneously.
4.  **Prompt Summarization:** Every 3 turns, or upon significant change, the `PromptSummaryActor` calls Gemini 3 Flash to update the `uiTitle`.
5.  **History Log:** Maintain an array of `Interaction` objects:
    ```ts
    type Interaction = {
      userPrompt: string;
      summarizedTitle: string;
      results: { provider: string; imageUrl: string; signature?: string }[];
    }
    ```