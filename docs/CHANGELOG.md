# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Security

- Hardened the template image proxy with HTTPS and exact-host validation, redirect blocking, request timeouts, raster MIME filtering, and a 10 MiB response limit.
- Added strict caption request validation and size limits; upstream Gemini error details are no longer returned to clients.

### Fixed

- Canvas exports now render the text alignment, font weight, rotation, and maximum-width options defined by text layers.
- Canvas rendering now handles unavailable contexts and invalid image dimensions without throwing.

### Documentation

- Added `docs/CODE_AUDIT.md` describing API validation limits, proxy security controls, and verification guidance.

### Planned

- Batch meme generation (create multiple variations at once)
- Template marketplace for community-created templates
- Advanced image editing tools (crop, rotate, skew)
