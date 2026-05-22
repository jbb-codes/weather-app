# ADR 001: API Key Handling

**Date:** 2026-05-22
**Status:** Accepted

## Context

The OpenWeatherMap API key was hardcoded directly in `script.js`. This is a client-side-only project with no build step or backend. Three options were evaluated:

1. Add a build step (e.g. Vite) to inject the key from an env var at build time
2. Introduce a server-side proxy so the key never reaches the browser
3. Accept client-side exposure and rely on OWM free-tier rate limiting and key restriction settings

## Decision

**Option 3 — accept exposure.**

This is a learning/portfolio project using OWM's free tier. The key is restricted to the project domain in the OWM dashboard, and the free tier's rate limits cap any abuse. Adding a build step or backend would impose unnecessary complexity for no meaningful security gain at this scale.

The key is moved from `script.js` into a gitignored `config.js` file, keeping it out of source control while the app still works client-side.

## Consequences

- The API key is visible to anyone who views page source — accepted.
- `config.js` is gitignored; contributors must create it from `config.example.js`.
- If the project scales or moves to a production domain, revisit Option 2 (proxy).
