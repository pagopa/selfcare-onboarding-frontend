# Copilot instructions

SelfCare onboarding flow (PagoPA): React 18 + TypeScript SPA built with Vite, MUI v5 and `@pagopa/mui-italia`. Node >= 24, yarn 1 (classic).

## Commands

- `yarn start` – dev server
- `yarn build` – runs `generate`, `tsc`, then `vite build`
- `yarn generate` – regenerates API clients into `src/api/generated/*` from `openApi/*.json` (do not edit generated files; adjust `openApi/scripts/*` fix scripts instead)
- `yarn test` – Vitest (jsdom); single file: `yarn vitest run src/path/to/file.test.tsx`
- `yarn test:coverage`, `yarn test:e2e:local` (Playwright in `e2e/`)
- `yarn lint` / `yarn lint-autofix`, `yarn prettify`

## Architecture

- `src/api` – Axios clients (`OnboardingApiClient`, `PartyRegistryProxyApiClient`) wrapping generated io-ts clients; `__mocks__` for tests.
- `src/services` – one module per domain call group (institution, billing, documents, onboarding submit…) used by views/hooks.
- `src/views/onboarding{Product,Premium,Request,User}` – top-level flows; `src/components` – shared UI (steps, forms, modals, layout).
- `src/redux` – Redux Toolkit store; `src/hooks`, `src/lib` (context, error/api utils), `src/utils` (constants, validation, formatting), `src/model` (types).
- `src/locale` – i18next translations (`it`, `en`, `fr`, `de`, `sl`); every user-facing string must go through `t()` and be added to all locales.
- Shared auth/session/error handling comes from `@pagopa/selfcare-common-frontend`.

## Onboarding flow and routing

- Routes are declared in `ROUTES` (`src/utils/constants.ts`) as `{ PATH, EXACT, COMPONENT }` and rendered by `src/components/layout/Main.tsx` (React Router v5 `Switch`). Flows: `ONBOARDING_PRODUCT`, `ONBOARDING_PREMIUM`, `ONBOARDING_USER`, `ONBOARDING_REQUEST`.
- Each flow is a sequence of steps; shared steps live in `src/components/steps` (`StepInstitutionType`, `StepSearchParty`, `StepOnboardingFormData`, `StepAddManager`, `StepOnboardingData`). Flow state is carried through history state (`useHistoryState`) and `UserContext` (`src/lib/context.ts`).
- Product IDs are in `PRODUCT_IDS`; institution-type logic is in `src/utils/institutionTypeUtils.ts`.

## Environment and mocks

- Config comes from `.env`, `.env.development.local` and `.env.test.local`, read via `import.meta.env` (typed in `src/vite-env.d.ts`) and exposed through `ENV` in `src/utils/env.ts`. Add new `VITE_*` variables to `vite-env.d.ts` and `.env`.
- `VITE_MOCK_API=true` enables mock behavior (`isMockEnvironment()`); API mocks for tests are in `src/api/__mocks__` and `src/lib/__mocks__`.
- `yarn generate` must be run before type-check/tests; generated clients are gitignored.

## Conventions

- Prettier: 100 cols, semicolons, single quotes, trailing commas `es5`.
- ESLint flat config (`eslint.config.mjs`) includes sonarjs, functional and react-hooks rules; keep lint clean.
- Functional components with hooks; Formik for forms; fp-ts/io-ts for decoding API responses.
- Tests live in `__tests__` folders next to the code, using Vitest + React Testing Library; globals are enabled and setup is in `src/setupTests.ts`. Tests are CPU-heavy, so keep them deterministic and avoid unnecessary long flows.
- Environment config is in `.env*` files and `src/utils/env.ts`; never commit secrets.
