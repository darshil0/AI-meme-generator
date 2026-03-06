# AI Meme Generator - Developer's Guide (v1.7.0)

This guide provides technical deep-dives into the architecture, design patterns, and development workflows of the AI Meme Generator.

---

## 🏗️ v1.7.0 Modular Architecture

To ensure "Demand Elegance," the application follows a strict modular structure.

### Component Decomposition
The `MemeEditorComponent` acts as a clean orchestrator for specialized sub-components:
*   **`TemplateGridComponent`**: Handles template search, selection, and custom template persistence.
*   **`AiCaptionsComponent`**: Manages interactive AI caption generation with tone and context inputs.
*   **`LayerControlsComponent`**: Provides fine-grained control over text layers (reordering, delete, style).
*   **`FilterControlsComponent`**: Dedicated image filter selection.

### Logic Extraction: `CanvasUtils`
All canvas rendering logic is decoupled from Angular components into `src/app/utils/canvas-utils.ts`. 
*   **Benefits**: Testability, separation of concerns, and reusable rendering logic.

---

## 🧪 Technical Mastery

### Frontend Stack
*   **Angular 21 (Zoneless)**: Leveraging Signals for high-performance reactivity.
*   **Tailwind CSS**: Custom "Glassmorphism" UI system.
*   **IndexedDB**: High-capacity state persistence via `idb-keyval`.

### Backend Stack
*   **Node.js/Express**: Secure proxy for Gemini API.
*   **Middleware Infrastructure**:
    *   `logger.ts`: Centralized request logging.
    *   `error.ts`: Centralized error handling for consistent API responses.

---

## 🔧 Common Development Tasks

### Adding a New Image Filter
1.  Update the `ImageFilter` union type in `meme.model.ts`.
2.  Add the new filter to the `filters` array in `MemeEditorComponent`.
3.  Implement the CSS filter mapping in `IMAGE_FILTER_CSS_MAP` within `meme.model.ts`.

### Enhancing AI Prompts
1.  Modify `captions.ts` (backend) to adjust the base prompt.
2.  Update `AiCaptionsComponent` (frontend) if new UI inputs are required for the AI.

---

## 🔒 Security & Best Practices
*   **API Security**: Never expose the `GEMINI_API_KEY` to the frontend. Always proxy through the backend.
*   **Immutability**: Always use Signal updates (`update()`) rather than direct mutations to ensure reactive integrity.
*   **Sanitization**: All AI-generated content is sanitized before rendering.

---

## 📈 Troubleshooting
*   **CORS Issues**: Ensure the external host is whitelisted in `server/src/routes/images.ts`.
*   **Build Errors**: Check for invalid Tailwind classes or template syntax errors in component files.
*   **Storage Limits**: Use `StorageService` to handle larger session states beyond the 5MB LocalStorage limit.

---

*For project initialization and quick-start, refer to the [README.md](../README.md). For version history, see [CHANGELOG.md](CHANGELOG.md).*
