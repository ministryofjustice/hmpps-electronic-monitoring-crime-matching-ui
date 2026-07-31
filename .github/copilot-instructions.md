# Copilot instructions for hmpps-electronic-monitoring-crime-matching-ui

These notes capture architectural decisions specific to this service so that
future Copilot-assisted changes don't drift back to older HMPPS patterns.
This is not a claim that the service is fully aligned with the latest
`hmpps-template-typescript` - check current template state before assuming so.

## Outbound HTTP clients

- All calls to the Crime Matching API go through `server/data/crimeMatchingClient.ts`,
  which extends `RestClient` from `@ministryofjustice/hmpps-rest-client`. Add new
  endpoints as methods on this class using the methods exposed by `RestClient`,
  not by constructing `superagent` requests or `http(s).Agent` instances
  directly.
- Do not use `superagent` directly for outbound application requests. Existing
  imports used only for error types should remain type-only imports.
- `agentkeepalive` currently satisfies `@ministryofjustice/hmpps-monitoring`'s
  peer dependency as well as being used internally by `hmpps-rest-client`. Run
  `npm explain agentkeepalive` before removing or downgrading it to confirm
  nothing still requires it.
- `server/config.ts` imports `AgentConfig` from `@ministryofjustice/hmpps-rest-client`
  rather than declaring its own. When adding a new `apis.*` entry, reuse
  `new AgentConfig(timeoutMs)` for the `agent` field - don't reintroduce a local
  agent config type.
- Proxy configuration (`NODE_USE_ENV_PROXY`, `HTTP_PROXY`/`HTTPS_PROXY`/`NO_PROXY`)
  must never be added to Helm values referencing a namespace secret
  (e.g. `hmpps-envoy-https-proxy-env`) until that secret has actually been
  provisioned in the target Cloud Platform namespace. Referencing an
  unprovisioned secret will fail deployment - verify provisioning first.

## Auth

- Token acquisition, verification and storage go through
  `@ministryofjustice/hmpps-auth-clients` (`AuthenticationClient`,
  `VerificationClient`, `InMemoryTokenStore`/`RedisTokenStore` - see
  `server/data/index.ts` and `server/middleware/setUpAuthentication.ts`). Do not
  hand-roll a token store, token verification call, or OAuth token exchange -
  extend the existing wiring instead.
- Authenticated calls to the Crime Matching API must pass an explicit
  `AuthOptions` via `asSystem(username)` or `asUser(...)` from
  `@ministryofjustice/hmpps-rest-client` (see `server/services/*Service.ts`).
- `config.apis.hmppsAuth` uses `authClientId`/`authClientSecret`/`systemClientId`/
  `systemClientSecret` - these are the current field names expected by
  `hmpps-auth-clients`. Do not reintroduce older names like `apiClientId`.
- The current user's identity (`username`, `userId`, `authSource`, roles, etc.)
  comes from the JWT via `HmppsUser`/`BaseUser` in
  `server/interfaces/hmppsUser.ts`, populated in `setUpAuthentication.ts`. There
  is no separate "get current user" API client in this repo - before adding one
  to fetch user display data, check whether it's already available on
  `req.user`/`res.locals.user`.

## Config

- `config.ingressUrl` (not `domain`) is the canonical base URL for this service,
  used for OAuth callback/redirect construction in `setUpAuthentication.ts`.
- Every entry under `config.apis` should have `url`, `healthPath`, `timeout:
  {response, deadline}` and `agent: new AgentConfig(...)` so it can be passed to
  both a `RestClient` subclass and `endpointHealthComponent` in
  `setUpHealthChecks.ts` - `probationApi` is the one exception (health-check only,
  no outbound `RestClient` calls), so don't treat it as the template for a new
  entry that needs a REST client.

## Redis

- `server/data/redisClient.ts`'s `createRedisClient()` is shared between the
  Express session store (`connect-redis`) and `RedisTokenStore`. If you change
  Redis connection options, both consumers are affected.

## Health checks / monitoring / telemetry

- Health checks are wired through `@ministryofjustice/hmpps-monitoring`
  (`endpointHealthComponent`, `monitoringMiddleware` in
  `server/middleware/setUpHealthChecks.ts`), derived automatically from
  `Object.entries(config.apis)`. Adding a new `config.apis.*` entry with a
  `healthPath` is enough to get it health-checked - don't write a bespoke health
  check route.
- Telemetry (`server/utils/azureAppInsights.ts`) is initialised via
  `@ministryofjustice/hmpps-azure-telemetry` and is imported in `server.ts`
  **before** `logger`. Preserve this ordering because telemetry must be
  initialised before modules that create or use the logger.

For ongoing template maintenance, use the `sync-typescript-template` skill
rather than re-deriving these patterns from scratch.
