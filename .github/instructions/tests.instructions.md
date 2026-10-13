---
applyTo: "**/*.test.ts,**/*.test.tsx,src/setupTests.ts,src/**/__mocks__/**"
---

# Unit test conventions

- Vitest (globals enabled) + React Testing Library + `@testing-library/user-event`; environment is jsdom.
- Tests sit in a `__tests__` folder next to the code under test, named `<Subject>.test.ts(x)`.
- `src/setupTests.ts` already initializes i18n (default language `it`), mocks `./api/OnboardingApiClient` and `./api/PartyRegistryProxyApiClient` (implementations in `src/api/__mocks__`), and silences `console.error`/`console.warn`. Do not re-mock them without reason; extend the existing mocks instead.
- Assert on visible text via translations (`it` locale) or roles/labels; prefer `getByRole`/`getByLabelText` over test ids.
- Service tests (`src/services/__tests__`) mock the API client and assert on calls plus the `setRequiredLogin` / `setOutcomeContentState` style callbacks.
- Keep tests deterministic: no real timers/network, use `vi.useFakeTimers()` when needed and restore mocks.
- Suites are CPU-heavy (timeouts 30s); avoid redundant full-flow renders.
- Run a single file with `yarn vitest run <path>`.
