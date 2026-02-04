# Tech Stack: BananaSplit (Refined)

* **Language:** TypeScript (Strict Mode), SvelteKit for user interface
* **Orchestration:** **XState v5** (Actor Model) for managing the generation, analysis, and refinement states.
* **Provider Layer:** Abstracted `ImageProvider` interface. 
    * Primary: **Nano Banana** (Google GenAI)
    * Comparison: **Imagen 3** or **DALL-E 3**
* **Title/History Logic:** **Gemini 3 Flash** as a "Context Manager" to summarize prompt history into a single-line title for the UI.
* **State Persistence:** Local storage/JSON for "Rolling History" of inputs and image result IDs.

* **SvelteKit Remote Functions** Use SvelteKit remote functions so that any calls to remote APIs is kept on the server side, and interaction between server and client is typesafe.