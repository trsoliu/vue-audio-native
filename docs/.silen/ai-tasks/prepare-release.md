---
id: prepare-release
title: Prepare an Audio Native release
contractVersion: 1
mode: write
requiresExplicitAuthorization: true
references:
  - cli:build
  - cli:ai
  - artifact:silen-manifest
  - artifact:llms
  - mcp:read
---

# Prepare an Audio Native release

## Goal

Prepare a reviewable prerelease or stable release without bypassing ownership, registry or the
documented stable-evidence decision.

## Steps

1. Confirm the requested version and whether it is beta or stable.
2. Read the release and device-smoke pages and inspect every required gate.
3. Run the repository release chain and the Silen build/audit/eval chain.
4. Verify npm ownership and publish core before adapters.
5. Install registry artifacts in clean consumers and record exact evidence.

## Verification

1. Run the complete repository quality, package, docs and browser gates.
2. Query the public registry and install the exact prerelease artifacts in clean consumers.
3. For a stable release, verify either dated evidence for every required device row or a complete,
   exact-version maintainer assessment with explicit remaining-risk acceptance.

## Stop conditions

Stop on missing npm authority, failed CI, the absence of both valid stable-evidence paths, or any
mismatch between package metadata and intended dist-tag. Never rename the existing Vue package as
a workaround and never represent an unexecuted device test as passed.
