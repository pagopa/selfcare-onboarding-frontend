# Refactor `any` e complessità – Fase 2

Seguito di SELC-9344 (PR #1547, fase 1). Il piano precedente (SELC-9345) resta nello storico git
di questo file.

## Problema
Su `main` (5b3eaa2) `yarn lint` riporta 126 warning `no-explicit-any`. Ignorando le direttive inline
(`npx eslint src --no-inline-config`) emergono anche 36 violazioni di `complexity` /
`sonarjs/cognitive-complexity` nascoste da `eslint-disable`, più 55 `functional/immutable-data` e
7 `functional/no-let`.

## Approccio
- Una PR per area, ciascuna da `main`, con commit piccoli (un file o un concetto per commit).
- Nessun cambio funzionale voluto; le eccezioni vanno dichiarate nella PR.
- Si tolgono gli `eslint-disable` di complessità estraendo helper puri e piccoli componenti; gli
  `any` diventano tipi derivati da API/model. `as` solo ai confini di sistema, con commento.
- Validazione per ogni commit: `yarn tsc --noEmit`, `npx eslint <file>` (anche con
  `--no-inline-config`), `yarn vitest run <test toccati>`.

## Aree
| Area | Branch | File |
|---|---|---|
| A – Autocomplete | `refactor/any-complexity-autocomplete` | `AsyncAutocompleteContainer`, `AsyncAutocompleteResultsCode`, `AsyncAutocompleteSearch`, `PartyAdvancedSelect`, `SearchPartySubtitle` |
| B – Submit | `refactor/any-complexity-submit` | `onboardingSubmitServices`, `selected2OnboardingData` |
| C – API client e servizi | `refactor/any-complexity-api` | `PartyRegistryProxyApiClient`, `api/__mocks__/*`, `lib/__mocks__/mockApiRequests`, `managerServices`, `onboardingServices`, `aggregatesServices`, `subProductServices`, `tokenServices` |

## Fuori ambito (fase 3)
- `functional/immutable-data` e `functional/no-let` (DOM, analytics, GeoTaxonomy, GPU).
- `any` in componenti e view (`FileUploader`, `PlatformUserForm`, `NumberDecimalFormat`,
  `ConfirmRegistrationStep1`, premium/product forward, reducer, `StepUploadAggregates`).
- Complessità in `validateFields`, `handleGeotaxonomies`, `requestStatusServices`,
  `CompleteRequest`, `FileUploadedPreview`, form data components e helper di test.

## Stato
- [x] A – Autocomplete
- [ ] B – Submit
- [ ] C – API client e servizi
