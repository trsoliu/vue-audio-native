# ADR 0002: Use TypeScript 6 until the lint and declaration toolchain supports 7

- Status: accepted
- Date: 2026-07-29
- Decider: trsoliu

## Context

TypeScript 7.0.2 is available, but `typescript-eslint@8.65.0` declares support
only through TypeScript 6.0, and current declaration generators need a separate
TypeScript 6 Compiler API package when the project compiler is TypeScript 7.
The resulting peer warning and dual compiler graph conflict with the stability
goal of this release.

## Decision

Pin workspace compilation to TypeScript 6.0.2. Upgrade to TypeScript 7 only
after `typescript-eslint`, Vue type checking, declaration generation, and both
framework consumer fixtures pass without unsupported-version warnings.

## Consequences

- All source and supported configuration remain strictly typed.
- The dependency graph contains a single TypeScript compiler.
- TypeScript 7-only syntax is excluded from the 1.0 source baseline.
