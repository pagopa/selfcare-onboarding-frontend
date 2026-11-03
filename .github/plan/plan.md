# Refactor `any` e complessità – Fase 3 (azzeramento)

Seguito di SELC-9344 (fase 1 #1547, fase 2 #1550/#1551/#1552). Il piano della fase 2 resta nello
storico git di questo file.

## Problema
Su `main` (ba8040c6) `yarn lint` è verde ma:
- **18 warning `no-explicit-any`** in produzione (9 file + `utils/test/test-utils.tsx`), più `Stripe: any`
  in `src/vite-env.d.ts` (escluso dal lint) e 4 `as unknown as` (`aggregatesServices`, `geoTaxonomyServices`,
  `formikMock`).
- **15 `eslint-disable`** di `complexity` / `sonarjs/cognitive-complexity`; con `--no-inline-config`
  emergono 17 funzioni oltre soglia (complexity > 20, cognitive > 15):
  - produzione (9): `VatNumberData` 35, `PartyGeneralData` 28, `InvoiceData` 27,
    `CommercialRegisterData` 27, `validateFields` 23/16, `handleGeotaxonomies` 28,
    `onboardingContractUpload` (requestStatusServices) 27, `CompleteRequest` 26, `FileUploadedPreview` 19;
  - helper di test (8): `test-utils` ×2, `verifySubmitHelpers-test` ×3, `billingDataResolvers-test` ×3.
- `__tests__/**` è escluso dal lint: lì ci sono **159 `any`** (95 in `services/__tests__`) e 2 funzioni
  oltre soglia in `views/onboardingProduct/__tests__/shared/stepHelpers.tsx` (righe 147, 433).
- `e2e/` (pacchetto separato, non lintato dalla root): 4 `any`.

## Obiettivo (definition of done finale)
1. `npx eslint src --no-inline-config` → 0 violazioni `complexity`/`cognitive-complexity`, 0 `eslint-disable` per queste regole.
2. 0 `any` / `as any` / `as unknown as` nel codice di produzione (`src` esclusi i test); `no-explicit-any`
   portato a `error` sul codice di produzione.
3. Test: complessità azzerata anche in helper e `__tests__`; tipizzati solo dove il tipo porta valore
   (vedi "Strategia sui test").
4. Nessuna regressione: suite completa verde, `yarn build` verde.

## Strategia sui test
I test non si tipizzano come il codice: costerebbe molto (159 `any`) con poco valore. Si tipizza dove il
tipo intercetta errori reali:
- **Helper condivisi** (`utils/test/*`, `__tests__/shared/*`): tipizzazione completa, perché un fix vale per tutti i test.
- **Risposte API mockate** (`mockResolvedValue({...} as any)` sui client generati): tipizzate con builder
  basati sui tipi generati, così un cambio di contratto BFF (`sync_bff_openapi.yml`) rompe il test invece di passare in silenzio.
- **Cast inutili** su valori già validi (es. `'PA' as any` per `InstitutionType`): rimossi.
- **Cast intenzionali** che testano input non validi (es. `'GSP' as any`, `{ extra: 'dropped' } as any`):
  restano, con un commento che ne spiega lo scopo.
- Il resto dei test di view resta com'è, salvo quanto si risolve gratis con gli helper tipizzati.

## Regole di lavoro
- **Un branch per area, sempre da `main` aggiornato**, una PR per branch (template `.github/PULL_REQUEST_TEMPLATE.md`).
  Naming: `refactor/any-complexity-<area>`. Commit: `[SELC-9344] Refactor: <cosa>`.
- **Commit piccoli**: un file o un concetto per commit (indicativamente < 150 righe di diff), ognuno compila e passa i test.
- **Test prima del refactor**: se il file non ha test, il primo commit del branch aggiunge test di
  caratterizzazione che fissano il comportamento attuale; il refactor non deve modificarli.
- Nessun cambio funzionale; eventuali eccezioni vanno dichiarate nella PR.
- Complessità: estrarre helper **puri** (con unit test) e sotto-componenti con `type Props`; niente
  `useMemo`/`useCallback` senza motivo; restano validi i vincoli su `PRODUCT_IDS`/`ROUTES` (no lettura top-level per cicli di import).
- Tipi: derivarli da `src/api/generated/*`, `src/model`, `types.ts` o dalle librerie (`react-dropzone`,
  `react-number-format`, `history`). `as` solo ai confini di sistema e con commento; mai `as any` in produzione.
- Validazione **per commit**: `yarn tsc --noEmit`; `npx eslint <file toccati> --no-inline-config`;
  `yarn vitest run <test del file/area>` (solo i test legati al file toccato, per tenere ogni commit veloce).
  Validazione **per PR**, prima di aprirla: `yarn lint` e **suite completa `yarn test`** (una sola volta per PR).
- **Helper di test condivisi riservati ad H**: nelle aree D–G i test nuovi stanno nel `__tests__` del file e
  non modificano `utils/test/*` né `views/onboardingProduct/__tests__/shared/*`; se serve un helper lo si
  crea locale al file di test. Così H non va mai in conflitto con D–G.

## Esecuzione (sessioni)
Cinque sessioni Copilot CLI **in sequenza**, nella stessa cartella di lavoro (nessuna worktree: non lavorano
mai in parallelo). Al massimo due aree per sessione, per non perdere contesto. Le sessioni sono numerate per
non confonderle con le lettere delle aree.

| Sessione | Aree (in ordine) | Parte quando |
|---|---|---|
| 1 | F → D | subito (dopo il merge di `plan.md` su `main`) |
| 2 | E → G | l'utente comunica il merge delle PR della sessione 1 |
| 3 | H | l'utente comunica il merge delle PR della sessione 2 (D–G su `main`) |
| 4 | I → J | l'utente comunica il merge della PR della sessione 3 |
| 5 | K | l'utente comunica il merge delle PR della sessione 4 (D–J su `main`) |

**Nessun rebase**: ogni sessione parte solo quando tutto ciò che la precede è su `main`, quindi ogni branch
nasce già allineato. Dentro una sessione le due aree toccano file diversi e partono entrambe da `main`.

Regole git per ogni sessione e ogni area:
- Prima di iniziare un'area: cartella di lavoro pulita (`git status` vuoto), poi `git checkout main; git pull`,
  poi `git checkout -b <branch dell'area>`. Mai creare un branch da quello dell'area precedente.
- Un'area si chiude con commit e push del branch e la PR aperta; solo dopo si passa all'area successiva.
- All'inizio di ogni area rileggere questo piano.
- **`plan.md`**: va su `main` prima della sessione 1 con una mini-PR `docs/` dedicata. Le PR di refactor non
  lo modificano; lo `Stato` si aggiorna a fine fase in una PR `docs/` separata.
- Le sessioni 2–5 restano ferme finché l'utente non dà il via; al via ripartono da `main` aggiornato.

## Aree e branch
Le aree D–G sono indipendenti tra loro (file diversi). H parte dopo D–G per includere e sistemare anche i test
aggiunti lì, e prima di I/J (crea i builder tipizzati). K richiede D–J su `main` (porta `no-explicit-any` a
`error` e attiva la complessità sui test).

### D – Form dati ente · `refactor/any-complexity-form-data`
File: `VatNumberData`, `InvoiceData`, `CommercialRegisterData`, `PartyGeneralData`, `utils/validateFields.ts`.
Test esistenti: `*Data.test.tsx`, `validateFields.test.ts` (+ flow `StepOnboardingFormData`).
1. Per ogni componente: estrarre le condizioni JSX in funzioni pure di visibilità/layout
   (es. `getVatNumberVisibility(controllers, values, institutionType, productId, onboardingFormData)`)
   in un modulo accanto, con unit test.
2. Spezzare i blocchi JSX ripetuti in sotto-componenti tipizzati (checkbox P.IVA, campi PSP, ecc.).
3. `validateFields`: estrarre i validatori condizionali rimasti (`rea`, `shareCapital`, sezioni PSP/fatturazione)
   in funzioni pure; valutare un oggetto `ValidationContext` al posto dei 17 parametri posizionali.
4. Rimuovere i 5 `eslint-disable`.
Commit: 1 per componente (helper + test), 1 per sotto-componenti, 2 per `validateFields`.

### E – Upload documenti e contratto · `refactor/any-complexity-upload`
File: `FileUploadedPreview`, `FileUploader`, `services/requestStatusServices.ts`,
`views/onboardingRequest/complete/CompleteRequest.tsx`, `StepUploadAggregates`, `services/aggregatesServices.ts`.
1. Test di caratterizzazione per `FileUploader`/`FileUploadedPreview` e `StepUploadAggregates` (oggi assenti).
2. `deleteUploadedFiles` tipizzato con l'evento reale (`React.MouseEvent<HTMLElement>` o firma senza evento);
   `dropzoneRootProps.onClick` tramite `DropzoneRootProps` di `react-dropzone`.
3. `FileUploadedPreview`: estrarre nome/size/stato in helper puri o sotto-componente.
4. `onboardingContractUpload`: estrarre `uploadByKind`, `getSuccessEvent`, `nextFileErrorAttempt` (puro),
   `handleUploadError`; raggruppare i 13 parametri in un oggetto `UploadContext` (aggiornando i chiamanti).
5. `CompleteRequest`: spostare la logica di stato/upload in un hook o helper puri (`getRequestPageState`, ecc.).
6. `StepUploadAggregates`: tipizzare `replacer` e le righe CSV con `RowError`; `aggregatesServices`:
   sostituire `as unknown as` con un mapper esplicito dai tipi generati.
Test: `requestStatusServices.test.ts`, `CompleteRequest*.test.tsx`, `documents/__tests__/*`, nuovi test.

### F – Tassonomie geografiche · `refactor/any-complexity-geotaxonomies`
File: `utils/handleGeotaxonomies.ts`, `services/geoTaxonomyServices.ts`.
1. Test di caratterizzazione a tabella per tutti i rami di `handleGeotaxonomies` (oggi assenti).
2. Estrarre la decisione pura `resolveGeotaxonomyAction(previous, current) => 'forward' | { add, edit }`
   (elimina anche i 2 `let`); `handleGeotaxonomies` resta un adattatore.
3. `geoTaxonomyServices`: mapper tipizzato al posto di `as unknown as Array<GeographicTaxonomy>`.

### G – `any` in componenti e view · `refactor/any-components`
File: `PlatformUserForm` (evento input), `NumberDecimalFormat` (`NumericFormatProps` + `forwardRef` tipizzato),
`ConfirmRegistrationStep1` (props `{ loading }` / `{ uploadedFiles, setUploadedFiles }`),
`onboardingPremium/.../forwardFunctions.ts` (`formData` → tipo del form manager),
`SubProductStepSubmit` (`catch` con `unknown` + `getErrorStatus`), `OnboardingProduct.tsx` 170/466/470
(type guard o tipo unione corretto per `data`/`formData` con `users`), `vite-env.d.ts` (`Stripe` tipizzato o rimosso se inutilizzato).
Un commit per file. Test: flow `OnboardingProduct.*`, `onboardingPremium/__tests__`, test mirati nuovi
per `ConfirmRegistrationStep1`/`PlatformUserForm` se il comportamento non è già coperto.

### H – Helper di test · `refactor/any-complexity-test-helpers`
File: `utils/test/test-utils.tsx` (2 complessità + 3 `any`), `verifySubmitHelpers-test.ts` (3),
`billingDataResolvers-test.ts` (3), `views/onboardingProduct/__tests__/shared/stepHelpers.tsx` (2),
`utils/test/formikMock.ts`.
1. Spezzare le funzioni in step/assert più piccoli e tabelle di dati per prodotto/tipo ente.
2. Tipizzare `history` (`MemoryHistory`), `mockedLocation` (`Location`), il ritorno di `searchUserFormFromRemoveBtn`.
3. Creare builder tipizzati riusabili (es. `utils/test/builders.ts`: `buildProduct`, `buildUser`,
   `buildParty`, `mockFetchWithLogs` tipizzato con `MockInstance<typeof fetchWithLogs>`) per I e J.
Validazione: **suite completa** `yarn test` (helper usati ovunque), come per ogni PR.

### I – Mock API tipizzati nei test dei servizi · `refactor/any-tests-services` (dopo H)
`src/services/__tests__/*` (12 file), perimetro ridotto:
- risposte dei client generati: `vi.mocked(...).mockResolvedValue(build...())` con builder tipizzati;
- cast inutili su valori validi (`'PA' as any` → `'PA'`);
- cast intenzionali su input non validi: restano, con commento.
Un commit per file di test.

### J – Test di view ed e2e · `refactor/any-tests-views` (dopo H, perimetro minimo)
- Adottare negli `OnboardingProduct.*.test.tsx` gli helper tipizzati di H (`mockedLocation`, spy
  `fetchWithLogs`) dove sostituiscono codice duplicato; il resto degli `as any` nei test di view resta.
- `e2e/utils/*` (4 `any`): tipizzare le risposte API e i `catch` (`unknown`), validando con `tsc` del pacchetto `e2e`.
Se dopo H il beneficio residuo è minimo, J si accorpa a I.

### K – Blindatura lint · `chore/lint-enforce-any-complexity` (ultima)
1. `@typescript-eslint/no-explicit-any` → `error`; `reportUnusedDisableDirectives` → `error`.
2. Togliere `**/__tests__/**` da `globalIgnores` e aggiungere un blocco dedicato ai test che attiva **solo**
   `complexity` e `sonarjs/cognitive-complexity` (`no-explicit-any` e `functional/*` restano spente nei test).
3. Aggiornare `AGENTS.md` / `.github/copilot-instructions.md` (nessun `any`, niente `eslint-disable` di complessità).
Validazione: `yarn lint`, `npx eslint src --no-inline-config` (solo regole di complessità a 0), `yarn test`, `yarn build`.

## Rischi
- Test lenti: i flow `OnboardingProduct.*.test.tsx` renderizzano l'intero wizard (jsdom + MUI) passo per passo
  e sono CPU-intensivi, con timeout di 30 s. Per questo ogni commit lancia solo i test del file toccato e la
  suite completa si lancia una volta prima di aprire la PR.
- Regressioni nel layout condizionale dei form (D): i test devono verificare presenza/assenza dei campi
  per tipo ente e prodotto prima di estrarre gli helper.
- Cambio firma di `onboardingContractUpload` (E): aggiornare tutti i chiamanti nello stesso commit.

## Stato
Sessione 1
- [ ] F – Tassonomie geografiche
- [ ] D – Form dati ente

Sessione 2
- [ ] E – Upload documenti e contratto
- [ ] G – `any` in componenti e view

Sessione 3
- [ ] H – Helper di test

Sessione 4
- [ ] I – Mock API tipizzati nei test dei servizi
- [ ] J – Test di view ed e2e (perimetro minimo)

Sessione 5
- [ ] K – Blindatura lint
