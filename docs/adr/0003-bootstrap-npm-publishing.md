# ADR 0003: Bootstrap new npm packages with a short-lived token before OIDC

- Status: accepted; bootstrap completed; token retained until expiry
- Date: 2026-07-30
- Decider: trsoliu
- Owner: trsoliu

## Context

The existing `vue-audio-native` package can be administered on npm, but the new
`@trsoliu/audio-core` and `react-audio-native` package records do not exist yet. npm Trusted
Publishing is configured from an existing package's settings, so those new packages cannot use the
repository's long-term OIDC workflow for their first publication. Local npm web authentication also
did not return a usable CLI session on this workstation.

The beta must still be published core → Vue → React, preserve provenance, keep credentials out of
the repositories and avoid weakening the stable-release device gate.

## Decision

Use a bounded npm Granular Access Token only for the first beta publications. The operator selected
a 90-day expiry ceiling on 2026-07-30 and, after verifying the OIDC cutover, elected to retain the
disconnected token until its 2026-10-28 expiry. Store it as the
`NPM_BOOTSTRAP_TOKEN` secret in each repository's protected `npm` GitHub Environment and expose it
only to manual bootstrap publishing steps on the default branch.

The Vue bootstrap workflow runs the complete release gates, publishes core before Vue with the
`next` tag and is safe to rerun after a partial publication. Exact registry version endpoints and a
bounded propagation retry prevent a successful first publish from being mistaken for a failure.
npm requires a `latest` tag while a package has no stable version, so a brand-new package can expose
the same first beta through both `latest` and the authoritative prerelease channel, `next`. The
stable release will move `latest` to `1.0.0`; existing `vue-audio-native` keeps `latest` on 0.1.41.
The React repository uses the same bootstrap pattern only after installing the public core beta.
After all three betas and clean registry consumers pass, a separate confirmed workflow mode sets
`vue-audio-native@0.1.41` to `legacy`.

Immediately afterward, configure each package to trust its repository's `release.yml` workflow and
delete both GitHub secrets. The retained npm-account token must not be restored to a repository,
workflow or local npm configuration. Stable releases use OIDC Trusted Publishing and provenance
only.

The temporary workflow is removed from the default branch after the beta and `legacy` sequence;
its immutable Actions runs and Git history retain the audit trail.

## Alternatives considered

### Local interactive npm login

This is the smallest mechanism, but the browser flow repeatedly returned to a legacy username
prompt without establishing CLI authentication. It also makes the release harder to reproduce and
audit.

### Direct OIDC or staged publishing for the first version

Both require an existing npm package record with a configured trust relationship or publish access.
They cannot create the two new package records without an initial authenticated publish.

### GitHub Packages

GitHub Packages can create new artifacts with GitHub credentials, but it does not satisfy the
required npm package names, dist-tags or clean npm consumer verification.

## Tradeoffs and consequences

### Positive

- The token never enters local npm configuration, source control, artifacts or logs.
- GitHub Environment scoping, a default-branch condition, manual confirmation and complete gates
  constrain when publication can occur.
- GitHub OIDC remains available for provenance during the token-authenticated bootstrap.
- Idempotent exact-version checks allow recovery if core succeeds and an adapter publication fails.

### Negative

- The temporary token must initially cover all user packages so it can create both scoped and
  unscoped names.
- Two repository secrets must be created and then removed manually.
- The token has bypass-2FA capability until it is revoked, with 2026-10-28 as its configured expiry
  backstop, creating a short but non-zero bootstrap exposure window.

### Risk mitigation

- Keep organization permissions at `No access` and remove repository secrets immediately after the
  bootstrap. The owner accepts the residual risk of retaining the disconnected token until expiry.
- Restrict workflow execution to the default branch and the `npm` Environment.
- Keep `next` as the documented prerelease channel. Accept npm's required `latest` alias only while
  a new package has no stable version, then move `latest` to `1.0.0` at stable release.
- Do not use or reintroduce the retained token; manually revoke it if the accepted risk changes.
- Never use this workflow for stable versions; stable remains blocked by device-smoke evidence.

## Follow-up actions

- [x] Publish the core, Vue and React `1.0.0-beta.1` versions.
- [x] Publish `vue-audio-native@1.0.0-beta.2` with the strict declaration-consumer fix.
- [x] Complete clean Vite, Nuxt, React and Next registry-consumer verification.
- [x] Set the Vue 2 `legacy` tag only after the beta verification succeeds.
- [x] Configure Trusted Publishers for all three packages.
- [x] Delete both GitHub bootstrap secrets and retire the temporary workflow.
- [x] Record the owner's decision to retain the disconnected token until 2026-10-28 and confirm it
  is absent from both GitHub Environments and all release workflows.

## References

- [npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers/)
- [npm access tokens](https://docs.npmjs.com/about-access-tokens/)
- [Publishing scoped public packages](https://docs.npmjs.com/creating-and-publishing-scoped-public-packages/)
