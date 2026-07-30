# ADR 0004: Allow an explicit maintainer assessment for stable publication

- Status: accepted
- Date: 2026-07-30
- Decider: trsoliu
- Owner: trsoliu

## Context

The original 1.0 release plan required dated smoke evidence from iOS WKWebView, Android WebView,
HarmonyOS WebView and HarmonyOS NEXT ArkWeb before stable publication. The beta packages have since
passed the complete code, documentation, package and Playwright browser matrix, and clean registry
consumers have built successfully with Vite, Nuxt, React and Next. The project uses capability
detection, native-control fallback and a protocol-neutral Bridge, but those automated checks cannot
fully reproduce host lifecycle or system audio routing on physical devices.

On 2026-07-30, the maintainer explicitly decided that a reviewed automated assessment is sufficient
for the 1.0.0 stable release and accepted the remaining real-device risk. The repository must record
that decision without misrepresenting unexecuted device tests as passed.

## Decision

The stable release gate accepts either:

1. all required real-device rows marked exactly `通过` with their evidence; or
2. all required device rows retained with their honest execution status, plus a structured
   maintainer assessment containing the maintainer identity, ISO decision date, exact stable
   version coverage, an automated assessment marked `通过` and remaining device risk marked `已接受`.

For the second path, the gate verifies that every publishable manifest is a stable version and
matches either one shared assessment version or its entry in a complete `package@version` mapping.
This preserves exact authorization when independently versioned packages drift. The 1.0.0 decision
is recorded in `docs/device-smoke.md`. Every release still runs the full security, lint, type,
coverage, build, Silen, package and browser gates and publishes only through GitHub OIDC Trusted
Publishing with provenance.

## Consequences

- The stable release can proceed without acquiring physical-device or device-cloud access.
- Public documentation remains honest about which environments were not executed.
- Host lifecycle, system audio routes and vendor-specific Bridge behavior retain a non-zero risk;
  issues discovered after release must be captured with environment evidence and fixed in a patch.
- The assessment is version-bound and cannot silently authorize later stable versions.
- Future maintainers may still choose the real-device evidence path without changing the workflow.

## Alternatives considered

### Keep 1.0 in beta until every device is available

This minimizes host-specific uncertainty but conflicts with the maintainer's explicit release
decision after the automated and clean-consumer evaluation passed.

### Mark unexecuted device rows as passed

Rejected because it would create false evidence. The assessment path records the accepted risk
separately and leaves device execution status accurate.
