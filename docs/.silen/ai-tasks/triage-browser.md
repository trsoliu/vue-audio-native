---
id: triage-browser
title: Triage a browser or WebView playback issue
contractVersion: 1
mode: read
references:
  - mcp:search
  - mcp:read
  - mcp:backlinks
  - mcp:citations
  - artifact:ai-index
---

# Triage a browser or WebView playback issue

## Goal

Identify the failing capability, media event, source, host lifecycle or adapter boundary without
changing code or relying on User-Agent guesses.

## Steps

1. Read the browser/WebView, compatibility and architecture pages.
2. Record engine, host shell, source MIME types, gesture context and structured player error.
3. Map the observed event sequence to the shared audio-core state contract.
4. Check sibling browser, Vue, React and headless paths for the same root cause.
5. Report the smallest reproducible case and the evidence still missing.

## Stop conditions

Do not edit code, change a device-smoke status or recommend stable release without explicit user
authorization and dated evidence.
