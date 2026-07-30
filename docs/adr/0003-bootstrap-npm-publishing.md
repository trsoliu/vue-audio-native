# ADR 0003: Bootstrap new npm packages with a short-lived token before OIDC

- Status: accepted
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

Use a one-day npm Granular Access Token only for the first beta publications. Store it as the
`NPM_BOOTSTRAP_TOKEN` secret in each repository's protected `npm` GitHub Environment and expose it
only to manual bootstrap publishing steps on the default branch.

The Vue bootstrap workflow runs the complete release gates, publishes core before Vue with the
`next` tag and is safe to rerun after a partial publication. Exact registry version endpoints and a
bounded propagation retry prevent a successful first publish from being mistaken for a failure.
For a new package, the workflow removes `latest` only when npm automatically points it at the beta.
The React repository uses the same pattern only after installing the public core beta. After all
three betas and clean registry consumers pass, a separate confirmed workflow mode sets
`vue-audio-native@0.1.41` to `legacy`.

Immediately afterward, configure each package to trust its repository's `release.yml` workflow,
delete both GitHub secrets and revoke the token. Stable releases use OIDC Trusted Publishing and
provenance only.

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
- The token has bypass-2FA capability for at most one day, creating a short but non-zero exposure
  window.

### Risk mitigation

- Keep the expiry at one day and organization permissions at `No access`.
- Restrict workflow execution to the default branch and the `npm` Environment.
- Keep prereleases on `next`; do not leave a new package's automatically created `latest` tag on a
  beta version.
- Revoke the token only after React beta, registry consumers and `legacy` finalization complete.
- Never use this workflow for stable versions; stable remains blocked by device-smoke evidence.

## Follow-up actions

- [ ] Publish the core, Vue and React `1.0.0-beta.1` versions.
- [ ] Complete clean Vite, Nuxt, React and Next registry-consumer verification.
- [ ] Set the Vue 2 `legacy` tag only after the beta verification succeeds.
- [ ] Configure Trusted Publishers for all three packages.
- [ ] Delete the GitHub secrets and revoke the bootstrap token.

## References

- [npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers/)
- [npm access tokens](https://docs.npmjs.com/about-access-tokens/)
- [Publishing scoped public packages](https://docs.npmjs.com/creating-and-publishing-scoped-public-packages/)
