# AI Meme Generator – Developer's Guide (v1.11.0)

Comprehensive technical reference for developers contributing to the AI Meme Generator.

## Control component bindings

`MemeEditorComponent` currently binds the layer controls with `[selectedLayerIndex]`. The layer-controls component aliases that input to its internal `selectedIndex` and derives the active layer from the `layers` array. The optional `[selectedLayer]` input can still be supplied by other callers. Filter controls accept the template's `[currentFilter]` and `(selectFilter)` names; if no explicit filters array is supplied, all `ImageFilter` enum values are shown.

When renaming component inputs or outputs, update both the parent template and the child `@Input`/`@Output` aliases together. Angular's strict template checker catches unknown binding names during `npm run build`.

## Audit verification

See [Code audit fixes](CODE_AUDIT.md) for backend validation limits, proxy restrictions, editor-state behavior, and the tests/builds still required before merging.
