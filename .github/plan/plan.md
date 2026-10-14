# SELC-9345 – Refactor OnboardingProduct: stato centralizzato in reducer + transizioni per step

## Problema
`src/views/onboardingProduct/OnboardingProduct.tsx` gestisce il wizard con ~20 `useState`, 3 `useRef`
e 2 `useEffect` concatenati (`pendingForward`). `forwardFunctions.ts` / `backFunctions.ts` ricevono
~25 setter e navigano con aritmetica sugli indici (`activeStep ± 1/2/3/4`): il flusso è leggibile
solo conoscendo a memoria l'ordine dell'array `steps`. `forwardFunctions` non ha test unitari.

## Approccio (confermato)
- `useReducer` puro + **step con nome** + **tabella di transizioni pure** (macchina a stati "leggera",
  nessuna nuova dipendenza).
- Nel reducer finisce **tutto** lo stato: dati wizard, step, loading, categorie, outcome,
  upload-documents context, exit modal.
- **Nessun cambio di comportamento**: ogni transizione attuale riprodotta 1:1 e blindata da test.
- Rimozione di `desiredOriginRef` (scritto ma mai letto).

## Strategia di branching e PR
- **Branch di integrazione**: `feat/SELC-9345`, creato da `main`. Raccoglie tutte le storie e alla fine
  confluisce su `main`.
- **Branch di storia**: `feat/US-<n>` (es. `feat/US-1`, `feat/US-2`, …).
- **Target delle PR**
  | Storia | Branch | Parte da | PR verso |
  |---|---|---|---|
  | US-1 | `feat/US-1` | `main` | `main` |
  | US-2 … US-7 | `feat/US-<n>` | `feat/SELC-9345` (aggiornato) | `feat/SELC-9345` |
  | US-8 | `feat/US-8` | `feat/SELC-9345` | `feat/SELC-9345`, poi PR finale `feat/SELC-9345` → `main` |
- **Sincronizzazione**: dopo il merge di US-1 su `main`, si fa merge di `main` in `feat/SELC-9345`
  (le storie successive usano i test di caratterizzazione). Ogni nuova storia parte da
  `feat/SELC-9345` aggiornato con le storie da cui dipende già mergiate.
- **Ordine di merge** (dipendenze): US-1 → (US-2 ∥ US-3) ; US-3 → US-4 → US-5 ; (US-3, US-5) → US-6 ;
  (US-2, US-6) → US-7 → US-8 → PR finale.

## Export e versionamento del piano
- Prima azione dopo l'approvazione: creare `feat/SELC-9345` da `main` e copiare questo piano in
  `.github/plan/plan.md`.
- Commit diretto su `feat/SELC-9345`:
  `[SELC-9345] Docs: add implementation plan for wizard state refactor`.
- Ogni revisione successiva del piano viene riesportata in `.github/plan/plan.md` e committata su
  `feat/SELC-9345`. Il file confluisce su `main` con la PR finale.

## Convenzioni di commit
- **Un commit per ogni sottotask di sviluppo** (ST-x.1 … ST-x.n). Mai un unico commit per storia.
  Non producono commit solo i sottotask di creazione branch (ST-x.0), apertura PR e merge/sync.
- Prima di ogni commit: lint e test dei file toccati nel sottotask (`yarn vitest run <file>`); il
  branch deve restare compilabile e verde a ogni commit.
- Formato del messaggio (in linea con lo storico `[SELC-xxxx] Feat: …`):
  `[SELC-9345][US-<n>] <Feat|Test|Refactor|Chore|Docs>: ST-<n.m> <descrizione breve>`
  es. `[SELC-9345][US-3] Feat: ST-3.3 add forward transitions for selection steps`.
- Trailer obbligatorio: `Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>`.

## Contenuto delle PR
Ogni PR usa `.github/pull_request_template.md` e mantiene le sue sezioni, compilate così:
- **List of Changes**
  - *Descrizione*: breve sintesi dell'attività della storia (2–4 righe).
  - *Task completati*: elenco dei sottotask ST-x.y, ognuno con hash breve del commit e una riga di descrizione.
  - *Test*: test aggiunti/aggiornati (file + scenari coperti) e comandi eseguiti con esito
    (es. `yarn vitest run src/views/onboardingProduct/state/__tests__/onboardingTransitions.test.ts` → passed, N test).
- **Motivation and Context**: riferimento a SELC-9345, alla storia US-<n> e al problema risolto.
- **Screenshots**: "N/A – nessuna modifica visiva".
- **Checklist**: spuntata in base all'effettivo aggiornamento della documentazione.

### PR finale `feat/SELC-9345` → `main`
Oltre al template, la sezione *List of Changes* contiene il **changelog completo**:
- per ciascuna storia US-1 … US-8: link alla PR, descrizione, elenco di tutti i sottotask con hash
  dei commit, file principali aggiunti/modificati/rimossi;
- elenco complessivo dei test aggiunti/aggiornati e dei comandi di validazione finali con esito;
- comportamenti preservati (sezione sotto) e conferma di nessun cambio funzionale;
- codice rimosso (`pendingForward`, 2 effect, `desiredOriginRef`, navigazione a indici).

## Comportamenti da preservare esplicitamente
1. **GSP senza IPA, `ENV.GSP.NO_IPA=false`**: ricerca → `onboardingData` (pass-through invisibile:
   `StepOnboardingData` chiama subito `forward`) → billing. Visivamente si atterra sul billing.
2. **GSP senza IPA, `NO_IPA=true`**: ricerca → `contractsSummary` → billing; back dal billing → `contractsSummary`.
3. **Party senza `externalId`**: il wizard non avanza (guard `externalId && institutionType`), oggi
   implicita nell'effect `pendingForward`, domani esplicita in `PARTY_SELECTED`.
4. **Memo dello step corrente** su `[activeStep, selectedProduct]`: evita il remount dello step e la
   perdita dello stato interno dei form. Va mantenuto identico.
5. Side effect invariati: `trackEvent`, `triggerQualtricsIntercept`, `register/unregisterUnloadEvent`,
   reset `history.location.state`, redirect subunit → dashboard, auto-forward PT da URL,
   `createdOnboardingRef` (no doppio submit tornando indietro dall'upload documenti).
6. **Aggregati → email richiedente**: `forwardFromAggregator` rilascia il loading prima di avanzare
   (fix US-1); la transizione `afterAggregates` del reducer deve mantenere `loading=false`.

## Design (sintesi)
- `src/views/onboardingProduct/state/`
  - `onboardingSteps.ts` – `ONBOARDING_STEPS` (stesso ordine dell'array attuale), `OnboardingStepName`:
    `institutionType | searchParty | contractsSummary | verifyOnboarding | onboardingData | billingData |
    additionalGpuInfo | additionalInfo | manager | admins | aggregates | applicantEmail`.
  - `onboardingTransitions.ts` – funzioni pure `(ctx: FlowContext) => Transition`
    (`{ goTo } | { openExitModal } | { redirect } | { submit }`).
  - `onboardingProductReducer.ts` – stato completo, azioni (discriminated union), `createInitialState`.
  - `flowContext.ts`, `selectFilterCategories.ts`, `normalizeUsers.ts` – derivazioni pure.
- `src/views/onboardingProduct/useOnboardingProductWizard.ts` – `useReducer` + ref + setter compatibili
  `Dispatch<SetStateAction<…>>` (servizi e step non cambiano firma).
- `forwardFunctions.ts` / `backFunctions.ts` – firma `{ state, dispatch, ctx, effects }`, nomi esportati invariati.

---

## Backlog: Epic, User Story e sottotask

**Epic SELC-9345 – Centralizzazione dello stato del wizard di onboarding prodotto**

Definition of Done (per ogni storia):
- `yarn tsc --noEmit` e `yarn lint` verdi, senza nuovi warning;
- test nuovi/aggiornati verdi (`yarn vitest run <file>`); suite esistenti invariate e verdi;
- nessuna modifica a `src/api/generated/**`, alle firme dei servizi o ai locale;
- un commit per ogni sottotask di sviluppo (mai un commit unico per storia), branch verde a ogni commit;
- PR aperta verso il target indicato, con template compilato: descrizione, elenco task con commit, test e comandi con esito.

---

### US-1 – Rete di sicurezza: test di caratterizzazione del wizard
*Come sviluppatore, voglio test d'integrazione che fissino il comportamento attuale della navigazione,
così da poter rifattorizzare senza regressioni.*
**Branch**: `feat/US-1` da `main` → **PR verso `main`**

Criteri di accettazione
- Nuovo `__tests__/OnboardingProduct.navigation.test.tsx` con gli scenari A1–A14 (vedi "Scenari di test").
- Tutti gli scenari passano sul codice **attuale**; nessuna suite esistente modificata.

Sottotask
- ST-1.0 Creare `feat/SELC-9345` da `main`; esportare il piano in `.github/plan/plan.md`, committarlo
  su `feat/SELC-9345` e fare push; creare `feat/US-1` da `main`.
- ST-1.1 Verificare/aggiungere i mock in `src/lib/__mocks__`: prodotto in phase-out, party aggregatore,
  utenti che non includono l'utente loggato.
- ST-1.2 Aggiungere l'helper `executeBack()` in `__tests__/shared/stepHelpers.tsx`.
- ST-1.3 Scenari pagine di esito: A1 phase-out, A2 pricing plan non valido.
- ST-1.4 Scenari di ingresso da URL: A3 `institutionType=PT`, A4 redirect subunit, A13 `partyExternalId`.
- ST-1.5 Scenario exit modal da step 0: A5 (conferma → `goBack`, annulla → chiusura).
- ST-1.6 Scenari back per tipo ente: A6 PA, A7 GPU, A8 GSP no-IPA (`NO_IPA=true`), A10 PT.
- ST-1.7 Scenario GSP no-IPA con `NO_IPA=false`: A9 (ricerca → billing tramite pass-through).
- ST-1.8 Scenari email richiedente e aggregatore: A11, A12 (incluso payload di submit).
- ST-1.8-fix Bug emerso da A12 (fix approvata, commit separato): dopo una verifica aggregati riuscita
  `verifyAggregates` lasciava `loading=true` e il `LoadingOverlay` copriva lo step email richiedente.
  `forwardFromAggregator` ora chiama `setLoading(false)` prima di avanzare (solo nel ramo senza submit).
- ST-1.9 Scenario cambio tipo ente: A14 (reset vs mantenimento `onboardingFormData`).
- ST-1.10 Lint + test dell'intera suite di navigazione, push e PR `feat/US-1` → `main` (descrizione, task con commit, test e comandi con esito).
- ST-1.11 Dopo il merge: merge di `main` in `feat/SELC-9345` e push.

---

### US-2 – Estrazione delle logiche derivate in funzioni pure
*Come sviluppatore, voglio le derivazioni oggi inline nel componente in funzioni pure testate,
così che il componente si limiti a comporre.*
**Branch**: `feat/US-2` da `feat/SELC-9345` → **PR verso `feat/SELC-9345`** (dipende da US-1)

Criteri di accettazione
- `flowContext.ts`, `selectFilterCategories.ts`, `normalizeUsers.ts` in `state/`, ciascuno con test unitari.
- `OnboardingProduct.tsx` li usa; comportamento identico (suite US-1 ed esistenti verdi).

Sottotask
- ST-2.0 Creare `feat/US-2` da `feat/SELC-9345` aggiornato.
- ST-2.1 `flowContext.ts`: `fromDashboard`, `productAvoidStep`, `isRequiredDocumentsFlow`, `partyName`
  (uo → aoo → business), parametri URL (search/hash).
- ST-2.2 `flowContext.test.ts` con le combinazioni di URL, prodotto e institutionType.
- ST-2.3 `selectFilterCategories.ts` (switch prodotto × institutionType).
- ST-2.4 `selectFilterCategories.test.ts` con `it.each` (SEND, IDPAY_MERCHANT, INTEROP × SCEC/PA/GSP/altro,
  default × GSP/PA, risposta assente).
- ST-2.5 `normalizeUsers.ts` (taxCode maiuscolo, email minuscola, rimozione legale per PT).
- ST-2.6 `normalizeUsers.test.ts`.
- ST-2.7 Sostituire le logiche inline in `OnboardingProduct.tsx`.
- ST-2.8 tsc + lint + test di `onboardingProduct` sul branch, push e PR `feat/US-2` → `feat/SELC-9345` (descrizione, task con commit, test e comandi con esito).

---

### US-3 – Modello degli step per nome e tabella di transizioni pure
*Come sviluppatore, voglio che ogni passaggio tra step sia dichiarato per nome in funzioni pure,
così che il flusso per institutionType × prodotto sia leggibile e testabile senza render.*
**Branch**: `feat/US-3` da `feat/SELC-9345` → **PR verso `feat/SELC-9345`** (dipende da US-1)

Criteri di accettazione
- `ONBOARDING_STEPS` mantiene l'ordine attuale dell'array `steps`.
- Ogni ramo di `forwardFunctions`/`backFunctions` ha una transizione equivalente, incluso il
  pass-through `onboardingData` per GSP no-IPA.
- Test tabellari coprono tutte le combinazioni; i casi di `backFunctions.test.ts` sono riportati.

Sottotask
- ST-3.0 Creare `feat/US-3` da `feat/SELC-9345` aggiornato.
- ST-3.1 `onboardingSteps.ts`: tupla `ONBOARDING_STEPS`, tipo `OnboardingStepName`, helper `stepIndex`.
- ST-3.2 Tipi `FlowContext` e `Transition`.
- ST-3.3 Transizioni forward: `afterInstitutionType`, `afterPartySelection`, `afterGspNoIpa`,
  `afterVerifyOnboarding`, `afterOnboardingData`.
- ST-3.4 Transizioni forward: `afterBillingData`, `afterAdditionalInfo`, `afterAdditionalGpuInfo`,
  `afterManager`, `afterAdmins`, `afterAggregates`.
- ST-3.5 Transizioni back: `backFromSearchParty`, `backFromContractsSummary`, `backFromBillingData`,
  `backFromAdditionalGpuInfo`, `backFromAdditionalInfo`.
- ST-3.6 Transizioni back: `backFromManager`, `backFromAdmins`, `backFromAggregates`,
  `backFromApplicantEmail`, `backFromUploadDocuments`.
- ST-3.7 `onboardingTransitions.test.ts` – matrice forward con `it.each` (PA, GSP IPA/no-IPA × `NO_IPA`,
  GPU, PT, PSP, PRV pagoPA/CED, tipi fuori lista, aggregatore, utente loggato presente/assente).
- ST-3.8 `onboardingTransitions.test.ts` – matrice back (fromDashboard, subunit, productAvoidStep,
  pagoPA insights, required documents flow, tutti i tipi ente).
- ST-3.9 tsc + lint + test sul branch, push e PR `feat/US-3` → `feat/SELC-9345` (descrizione, task con commit, test e comandi con esito).

---

### US-4 – Reducer centralizzato dello stato del wizard
*Come sviluppatore, voglio un unico reducer puro che possieda tutto lo stato del flusso,
così da eliminare `useState` sparsi ed effect a catena.*
**Branch**: `feat/US-4` da `feat/SELC-9345` → **PR verso `feat/SELC-9345`** (dipende da US-3)

Criteri di accettazione
- `onboardingProductReducer.ts` contiene stato, azioni (discriminated union) e `createInitialState`.
- `PARTY_SELECTED` aggiorna i dati in un'unica azione e avanza solo se `externalId && institutionType`.
- Il reducer non ha side effect e non muta lo stato precedente.

Sottotask
- ST-4.0 Creare `feat/US-4` da `feat/SELC-9345` aggiornato (con US-3).
- ST-4.1 Tipo `OnboardingProductState` e `createInitialState(productId, url)`.
- ST-4.2 Azioni di selezione: `INSTITUTION_TYPE_SELECTED` (regole di reset/mantenimento di
  `onboardingFormData`), `PARTY_SELECTED` (merge `formData` + guard), `GSP_NO_IPA_SELECTED`.
- ST-4.3 Azioni dati: `ONBOARDING_DATA_LOADED`, `BILLING_DATA_SUBMITTED`, `ADDITIONAL_INFO_SUBMITTED`,
  `ADDITIONAL_GPU_INFO_SUBMITTED`.
- ST-4.4 Azioni utenti: `USERS_SUBMITTED`, `AGGREGATES_SUBMITTED`, `APPLICANT_EMAIL_SUBMITTED`, `GO_TO_STEP`.
- ST-4.5 Azioni UI: `SET_LOADING` (anche con updater funzione), `SET_OUTCOME`, `PRODUCT_LOADED`,
  `CATEGORIES_LOADING/LOADED`, `OPEN/CLOSE_EXIT_MODAL`, `OPEN/CLOSE_UPLOAD_DOCUMENTS`.
- ST-4.6 `onboardingProductReducer.test.ts`: un test per azione.
- ST-4.7 Test di guard (`PARTY_SELECTED` senza `externalId`) e di immutabilità dello stato precedente.
- ST-4.8 tsc + lint + test sul branch, push e PR `feat/US-4` → `feat/SELC-9345` (descrizione, task con commit, test e comandi con esito).

---

### US-5 – Hook `useOnboardingProductWizard`
*Come sviluppatore, voglio un hook che esponga stato, azioni e setter compatibili,
così che servizi e step esistenti non cambino firma.*
**Branch**: `feat/US-5` da `feat/SELC-9345` → **PR verso `feat/SELC-9345`** (dipende da US-4)

Criteri di accettazione
- L'hook incapsula `useReducer`, `requestIdRef`, `createdOnboardingRef`.
- Gli adapter accettano valore o updater come `Dispatch<SetStateAction<…>>`.

Sottotask
- ST-5.0 Creare `feat/US-5` da `feat/SELC-9345` aggiornato (con US-4).
- ST-5.1 Hook con `useReducer` e ref.
- ST-5.2 Adapter stabili: `setLoading`, `setOutcome`, `setOpenExitModal`, `setOnExitAction`,
  `setSelectedProduct`, `setInstitutionType`, `setOrigin`.
- ST-5.3 Test con `renderHook`: adapter con valore e con updater; `onExitAction` memorizzata come funzione.
- ST-5.4 tsc + lint + test sul branch, push e PR `feat/US-5` → `feat/SELC-9345` (descrizione, task con commit, test e comandi con esito).

---

### US-6 – Migrazione di forward/back sulle transizioni
*Come sviluppatore, voglio che `forwardFunctions` e `backFunctions` usino `dispatch` e le transizioni,
così da ridurre i ~25 parametri a pochi oggetti coesi.*
**Branch**: `feat/US-6` da `feat/SELC-9345` → **PR verso `feat/SELC-9345`** (dipende da US-3, US-5)

Criteri di accettazione
- Nomi esportati invariati; firma `{ state, dispatch, ctx, effects }`.
- Side effect invariati (`trackEvent` stessi payload, `onSubmit` stessi argomenti, `history.goBack`).
- `desiredOriginRef` rimosso.

Sottotask
- ST-6.0 Creare `feat/US-6` da `feat/SELC-9345` aggiornato (con US-3 e US-5).
- ST-6.1 Refactor `forwardFunctions.ts` su `dispatch` + transizioni.
- ST-6.2 Rimozione di `desiredOriginRef` da `forwardFunctions.ts`.
- ST-6.3 Refactor `backFunctions.ts` su `dispatch` + transizioni.
- ST-6.4 Aggiornare `backFunctions.test.ts` (stessi scenari, nuova firma).
- ST-6.5 Nuovo `forwardFunctions.test.ts`: payload `trackEvent`, chiamate a `onSubmit` e `dispatch`.
- ST-6.6 Adeguare `OnboardingProduct.tsx` alla nuova firma (tramite l'hook) per mantenerlo compilabile e verde.
  *Esito*: nessun commit dedicato. Poiché forward/back inviano azioni del reducer, il componente è
  passato allo stato dell'hook già in ST-6.1/ST-6.3, per mantenere verde ogni commit.
- ST-6.7 tsc + lint + test di `onboardingProduct` sul branch, push e PR `feat/US-6` → `feat/SELC-9345` (descrizione, task con commit, test e comandi con esito).

---

### US-7 – Migrazione di `OnboardingProduct.tsx` sull'hook
*Come sviluppatore, voglio un componente che si limiti a comporre step e pagine di esito,
così da renderlo leggibile e manutenibile.*
**Branch**: `feat/US-7` da `feat/SELC-9345` → **PR verso `feat/SELC-9345`** (dipende da US-2, US-6)

Criteri di accettazione
- Nessun `useState` di dominio nel componente; rimossi `pendingForward` e i suoi 2 effect.
- Step come `Record<OnboardingStepName, …>`; memo dello step corrente su `[activeStep, selectedProduct]`.
- Back da `UploadDocumentsFlow` → `GO_TO_STEP('admins')` (niente `findIndex` per label).
- Suite US-1 ed esistenti verdi senza modifiche.

Sottotask
- ST-7.0 Creare `feat/US-7` da `feat/SELC-9345` aggiornato (con US-2 e US-6).
- ~~ST-7.1 Sostituire gli `useState` con lo stato dell'hook.~~ Anticipato in US-6 (ST-6.1).
- ST-7.2 Mappa degli step per nome e selezione dello step corrente (memo invariato).
- ~~ST-7.3 Rimuovere `pendingForward` e i 2 effect relativi (sostituiti da `PARTY_SELECTED`).~~ Anticipato in US-6 (ST-6.1).
- ~~ST-7.4 Rimuovere `desiredOriginRef` dal componente.~~ Anticipato in US-6 (ST-6.2).
- ~~ST-7.5 Back di `UploadDocumentsFlow` tramite `GO_TO_STEP('admins')`; `onSuccess` tramite azioni.~~
  Anticipato in US-6 (ST-6.1, con `UPLOAD_DOCUMENTS_BACK` / `UPLOAD_DOCUMENTS_COMPLETED`).
- ST-7.5b Estrarre dal componente le pagine di esito (`outcomeContent`, `notAllowedError`) in un
  modulo dedicato, per ridurne dimensione e complessità.
- ST-7.6 Rimuovere gli `eslint-disable` di complessità, se non più necessari.
- ST-7.7 Eseguire tutte le suite `OnboardingProduct.*.test.tsx` e `documents/__tests__`.
- ST-7.8 tsc + lint sul branch, push e PR `feat/US-7` → `feat/SELC-9345` (descrizione, task con commit, test e comandi con esito).

---

### US-8 – Validazione finale, documentazione e rilascio su main
*Come team, vogliamo verificare la non regressione, documentare il nuovo pattern e portare
`feat/SELC-9345` su `main`.*
**Branch**: `feat/US-8` da `feat/SELC-9345` → **PR verso `feat/SELC-9345`**; poi **PR finale `feat/SELC-9345` → `main`**

Criteri di accettazione
- `yarn tsc --noEmit`, `yarn lint`, `yarn vitest run src/views/onboardingProduct` verdi su `feat/SELC-9345`.
- Copertura dei nuovi moduli in `state/` verificata.
- Nota sul pattern reducer/transizioni in `.github/copilot-instructions.md` (sezione "Onboarding flow and routing").
- PR finale aperta verso `main` con il riepilogo di tutte le storie.

Sottotask
- ST-8.0 Creare `feat/US-8` da `feat/SELC-9345` aggiornato (con US-7).
- ST-8.1 Type-check e lint completi.
- ST-8.2 Esecuzione delle suite `onboardingProduct` e `documents`.
- ST-8.3 Verifica copertura dei nuovi moduli (`yarn test:coverage` mirato).
- ST-8.4 Aggiornare `.github/copilot-instructions.md`.
- ST-8.5 Push e PR `feat/US-8` → `feat/SELC-9345` (descrizione, task con commit, test e comandi con esito).
- ST-8.6 Allineare `feat/SELC-9345` con `main` (merge di eventuali novità, risoluzione conflitti, rerun dei test).
- ST-8.7 Raccogliere il changelog: per ogni PR US-1…US-8 link, descrizione, sottotask con hash dei commit, test e file toccati.
- ST-8.8 Aprire la PR finale `feat/SELC-9345` → `main` con il template e il changelog completo (vedi "Contenuto delle PR").

---

## Scenari di test

### A. Caratterizzazione (US-1, `OnboardingProduct.navigation.test.tsx`)
1. Prodotto in phase-out → pagina phase-out.
2. `pricingPlan` ≠ `FA` → pagina "invalid pricing plan".
3. `?institutionType=PT` su prod-pagopa → atterra sul billing PT (origin SELC).
4. `#subunitType=…` con prodotto non SEND → `location.assign(DASHBOARD)`.
5. Back da step 0 → exit modal → conferma → `history.goBack`; annulla → modal chiusa.
6. PA (io): billing → back → ricerca; manager → back → billing; admins → back → manager.
7. GPU: info aggiuntive GPU → back → billing.
8. GSP no-IPA (`NO_IPA=true`): info aggiuntive → back → billing; billing → back → contracts summary.
9. GSP no-IPA (`NO_IPA=false`): ricerca → billing (pass-through `onboardingData`).
10. PT: admins → back → billing.
11. Utente loggato non tra gli users → email richiedente → submit con `userRequester`; back → admins.
12. Aggregatore con utente loggato non tra gli users → aggregati → email richiedente → submit con aggregati; back → aggregati.
13. `partyExternalId` in query (fromDashboard): billing → back → step 0.
14. Cambio institutionType (PSP → back → altro tipo fuori lista) → billing svuotato; stesso tipo → dati mantenuti.

### B. Unit test puri (US-2 … US-6)
- `flowContext.test.ts`, `selectFilterCategories.test.ts`, `normalizeUsers.test.ts` (US-2).
- `onboardingTransitions.test.ts` – matrici forward/back (US-3).
- `onboardingProductReducer.test.ts` – azioni, guard, immutabilità (US-4).
- `useOnboardingProductWizard.test.ts` – adapter (US-5).
- `forwardFunctions.test.ts` (nuovo) e `backFunctions.test.ts` (aggiornato) (US-6).

### C. Regressione (US-7, US-8)
Tutte le suite esistenti `OnboardingProduct.*.test.tsx` e `documents/__tests__` passano **senza modifiche**.

## Note
- Nessuna stringa UI nuova → nessuna modifica ai locale.
- Le suite d'integrazione sono CPU-heavy: gli scenari A sono brevi; la copertura combinatoria sta nei test puri B.
