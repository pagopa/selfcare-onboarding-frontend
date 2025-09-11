import { Page, expect } from '@playwright/test';

// eslint-disable-next-line functional/no-let
// let copiedText: string;
// eslint-disable-next-line functional/no-let
let partyName: string = '';

export const BASE_URL_ONBOARDING = 'http://dev.selfcare.pagopa.it/onboarding';

export const FILE_MOCK_CSV_AGGREGATOR = {
  IO: '../src/lib/__mocks__/mockedFileAggregator.csv',
  SEND: '../src/lib/__mocks__/mockedFileAggregatorSend.csv',
};

export const stepInstitutionType = async (page: Page, institutionType: string) => {
  await page.getByRole('radio', { name: institutionType }).click();
  await page.getByRole('button', { name: 'Continua' }).waitFor({ timeout: 1000 });
  await page.getByRole('button', { name: 'Continua' }).click();
};

export const stepSelectParty = async (page: Page, aggregator?: boolean, party?: string) => {
  await page.click('#Parties');
  await page.fill('#Parties', party ? party : 'Senato della Repubblica');
  await page.click('.MuiBox-root:nth-child(1) > .MuiBox-root > .MuiBox-root');
  partyName = (await page.locator('div[aria-label] p.MuiTypography-root').innerText()) as string;
  console.log('Nome del party', partyName);
  if (aggregator) {
    await page.click('[name="aggregator-party"]');
    await page.click('[aria-label="Continua"]');
    await page.getByRole('button', { name: 'Continua' }).click();
  } else {
    await page.click('[aria-label="Continua"]');
  }
};

export const stepSelectPartyByCF = async (page: Page, cfParty: string) => {
  await page.click('#Parties');
  await page.fill('#Parties', cfParty, { timeout: 2000 });
  await page.click('.MuiBox-root:nth-child(1) > .MuiBox-root > .MuiBox-root');
  await page.click('[aria-label="Continua"]');
};

export const stepSelectPartyByCF4PrivateMerchant = async (page: Page, cfParty: string) => {
  await page.click('#Parties');
  await page.fill('#Parties', cfParty);

  await page.waitForSelector('.loading-spinner', { state: 'hidden', timeout: 30000 });

  const businessTaxIdSelector = `[businesstaxid="${cfParty}"]`;

  try {
    await page.waitForSelector(businessTaxIdSelector, { state: 'visible', timeout: 30000 });
  } catch (e) {
    console.error(`Party con CF ${cfParty} non trovato entro il timeout`);
    throw e;
  }

  await page.click(`${businessTaxIdSelector} [role="button"]`);
  await page.click('[aria-label="Continua"]');
};

/* export const stepFormDataWithIpaResearch4SDICode = async (
  page: Page,
  context: any,
  product: string
) => {
  await page.getByLabel('La Partita IVA coincide con il Codice Fiscale').click();
  if (product !== PRODUCT_IDS_TEST_E2E.INTEROP) {
    page.on('dialog', async (dialog) => {
      console.log(`Dialogo rilevato: ${dialog.message()}`);
      await dialog.accept();
    });

    // Opening a new page for IPA sources
    const newPagePromise = context.waitForEvent('page');
    await page.evaluate(() => {
      window.open(
        'https://indicepa.gov.it/ipa-portale/consultazione/indirizzo-sede/ricerca-ente',
        '_blank'
      );
    });
    const newPage = await newPagePromise;
    await newPage.waitForLoadState();

    await researchOnIpa(newPage, partyName);
    await page.waitForTimeout(500);
    await page.click('#recipientCode');
    await page.fill('#recipientCode', copiedText, { timeout: 500 });
  }
  if (product === PRODUCT_IDS_TEST_E2E.IO_SIGN) {
    await page.click('#supportEmail');
    await page.fill('#supportEmail', 'test@test.it', { timeout: 500 });
  }
  await page.getByRole('radio', { name: 'Nazionale' }).waitFor({ timeout: 500 });
  await page.getByRole('radio', { name: 'Nazionale' }).click();
  await page.getByRole('button', { name: 'Continua' }).waitFor({ timeout: 500 });
  await page.getByRole('button', { name: 'Continua' }).click();
}; */

// eslint-disable-next-line complexity
export const stepFormData = async (
  page: Page,
  productOrInstitutionType: string,
  institutionType?: string
  // eslint-disable-next-line sonarjs/cognitive-complexity
) => {
  const isFromIpa = institutionType !== undefined;
  const product = isFromIpa ? productOrInstitutionType : '';
  const actualInstitutionType = isFromIpa ? institutionType : productOrInstitutionType;
  if (
    !isFromIpa ||
    (product === PRODUCT_IDS_TEST_E2E.PAGOPA &&
      (institutionType === 'PRV' || institutionType === 'GPU'))
  ) {
    await page.click('#businessName');
    await page.fill('#businessName', 'test');

    await page.click('#digitalAddress');
    await page.fill('#digitalAddress', 'test@test.it');

    await page.click('#taxCode');
    await page.fill('#taxCode', '10293847565');

    await page.click('#taxCodeEquals2VatNumber');
  }

  if (
    (product === PRODUCT_IDS_TEST_E2E.PAGOPA && actualInstitutionType === 'GSP') ||
    (product === PRODUCT_IDS_TEST_E2E.INTEROP && actualInstitutionType === 'PRV')
  ) {
    await page.click('#taxCodeEquals2VatNumber');
  }

  if (
    (product === PRODUCT_IDS_TEST_E2E.INTEROP &&
      (actualInstitutionType === 'SA' || actualInstitutionType === 'AS')) ||
    !isFromIpa ||
    (product === PRODUCT_IDS_TEST_E2E.PAGOPA &&
      (institutionType === 'PRV' || institutionType === 'GPU'))
  ) {
    await page.click('#registeredOffice');
    await page.fill('#registeredOffice', isFromIpa ? 'Via test 1' : 'via test 1');

    await page.click('#zipCode');
    await page.fill('#zipCode', isFromIpa ? '20000' : '20900');

    await page.click('#city-select');
    await page.fill('#city-select', isFromIpa ? 'Milano' : 'milano');
    await page.click('#city-select-option-0');
  }

  if (
    isFromIpa &&
    product !== PRODUCT_IDS_TEST_E2E.PAGOPA &&
    institutionType !== 'PRV' &&
    institutionType !== 'GPU'
  ) {
    await page.getByLabel('La Partita IVA coincide con il Codice Fiscale').click();
  }

  if (
    isFromIpa &&
    product !== PRODUCT_IDS_TEST_E2E.INTEROP &&
    product !== PRODUCT_IDS_TEST_E2E.IDPAY_MERCHANT &&
    actualInstitutionType !== 'SCP'
  ) {
    await page.click('#recipientCode');
    await page.fill('#recipientCode', product === PRODUCT_IDS_TEST_E2E.SEND ? 'UFBM8M' : '14CB0I', {
      timeout: 500,
    });
  } else if (!isFromIpa && actualInstitutionType !== 'PT') {
    await page.click('#recipientCode');
    await page.fill('#recipientCode', 'A1B2C3');

    if (actualInstitutionType === 'GSP' || actualInstitutionType === 'SCP') {
      await page.click('#recipientCode');
      await page.fill('#recipientCode', 'A1B2C3');
    }
  }

  if (isFromIpa && product === PRODUCT_IDS_TEST_E2E.IO_SIGN) {
    await page.click('#supportEmail');
    await page.fill('#supportEmail', 'test@test.it', { timeout: 500 });
  }

  if (
    actualInstitutionType === 'AS' ||
    actualInstitutionType === 'GPU' ||
    (actualInstitutionType === 'GSP' && !isFromIpa)
  ) {
    await page.click('#rea');
    await page.fill('#rea', 'RM-123456');
  }

  if (
    actualInstitutionType === 'AS' ||
    (product === PRODUCT_IDS_TEST_E2E.INTEROP && actualInstitutionType === 'PRV')
  ) {
    await page.click('#businessRegisterPlace');
    await page.fill('#businessRegisterPlace', 'Comune di Milano');

    await page.click('#shareCapital');
    await page.fill('#shareCapital', '€ 1.5000');
  }

  if (!isFromIpa && actualInstitutionType === 'PSP') {
    await page.click('#commercialRegisterNumber');
    await page.fill('#commercialRegisterNumber', '19191919191');

    await page.click('#registrationInRegister');
    await page.fill('#registrationInRegister', 'tes');

    await page.click('#registerNumber');
    await page.fill('#registerNumber', '1');

    await page.click('#abiCode');
    await page.fill('#abiCode', '18276');

    await page.click('#address');
    await page.fill('#address', 'via test 1');

    await page.click('#pec');
    await page.fill('#pec', 'test@test.it');

    await page.click('#email');
    await page.fill('#email', 'test@test.it');
  }

  if (actualInstitutionType === 'PRV' && product === PRODUCT_IDS_TEST_E2E.IDPAY_MERCHANT) {
    await page.click('#businessRegisterPlace');
    await page.fill('#businessRegisterPlace', 'Tecnologie Innovative S.p.A.');

    await page.click('#holder');
    await page.fill('#holder', 'Mario Rossi');

    await page.click('#iban');
    await page.fill('#iban', 'IT60X0542811101000000123456');

    await page.click('#confirmIban');
    await page.fill('#confirmIban', 'IT60X0542811101000000123456');
  }

  const shouldShowNazionale = isFromIpa
    ? actualInstitutionType !== 'SCP' &&
      actualInstitutionType !== 'SA' &&
      actualInstitutionType !== 'AS' &&
      (actualInstitutionType !== 'PRV' || product !== PRODUCT_IDS_TEST_E2E.INTEROP)
    : actualInstitutionType !== 'PT';

  if (shouldShowNazionale) {
    if (isFromIpa) {
      await page.getByRole('radio', { name: 'Nazionale' }).waitFor({ timeout: 500 });
    }
    await page.getByRole('radio', { name: 'Nazionale' }).click();
  }

  await page.getByRole('button', { name: 'Continua' }).waitFor({ timeout: 500 });
  await page.getByRole('button', { name: 'Continua' }).click();
};

export const stepAdditionalInformation = async (page: Page) => {
  await page.click('#isEstabilishedRegulatoryProvision-yes');
  await page.click('#fromBelongsRegulatedMarket-no');
  await page.click('#isConcessionaireOfPublicService-yes');
  await page.getByRole('button', { name: 'Continua' }).click();
};

export const stepAdditionalGPUInformation = async (page: Page) => {
  await page.click('.MuiFormControlLabel-root:nth-child(1) [name="isPartyRegistered"]');

  await page.click('#businessRegisterNumber');
  await page.fill('#businessRegisterNumber', 'Registro test');

  await page.click('#legalRegisterNumber');
  await page.fill('#legalRegisterNumber', '15243');

  await page.click('.MuiFormControlLabel-root:nth-child(2) [name="isPartyProvidingAService"]');
  await page.click('.MuiFormControlLabel-root:nth-child(2) [name="longTermPayments"]');

  await page.click('#manager');
  await page.click('#managerAuthorized');

  await page.click('#managerEligible');

  await page.click('#managerProsecution');

  await page.click('#institutionCourtMeasures');

  await page.getByRole('button', { name: 'Continua' }).click();
};

export const stepAddManager = async (page: Page) => {
  await page.click('#manager-initial-name');
  await page.fill('#manager-initial-name', 'Sigmund', {
    timeout: 1000,
  });
  await page.getByRole('textbox', { name: 'Cognome' }).click();
  await page.fill('#manager-initial-surname', 'Freud', {
    timeout: 1000,
  });
  await page.getByRole('textbox', { name: 'Codice Fiscale' }).click();
  await page.fill('#manager-initial-taxCode', 'FRDSMN80A01F205Z', {
    timeout: 1000,
  });
  await page.getByRole('textbox', { name: 'Email Istituzionale' }).click();
  await page.fill('#manager-initial-email', 's.freud@test.it', {
    timeout: 1000,
  });
  await page.click('[aria-label="Continua"]');
};

export const stepAddAdmin = async (page: Page, aggregator?: boolean, institutionType?: string) => {
  await page.getByLabel('Aggiungi me come Amministratore').click();
  await page.getByRole('textbox', { name: 'Email Istituzionale' }).click();
  await page.fill('#delegate-initial-email', 'a.sartori@test.it', {
    timeout: 500,
  });
  await page.click('[aria-label="Continua"]');
  if (!aggregator && institutionType !== 'PT') {
    await page.getByRole('button', { name: 'Conferma' }).click();
    await expect(page.getByText('Richiesta di adesione inviata')).toBeInViewport({
      timeout: 10000,
    });
  }
};

/* Function that search and find the first row of the IPA table that contains uniqueCode and
export const copyUniqueCodeIfSFEIsPresent = async (page: Page) => {
  const tbody = page.locator('tbody').first();
  const rows = await tbody.locator('tr').all();

  for (const row of rows) {
    const cellaCodiceUnivoco = row.locator('td:nth-child(2) div');
    const cellSfe = row.locator('td:nth-child(4)');

    const codiceUnivocoText = (await cellaCodiceUnivoco.innerText()).trim();
    const cellSfeText = (await cellSfe.innerText()).trim();

    if (codiceUnivocoText !== '' && cellSfeText !== '') {
      // save in the costant the value of the unique code
      const uniqueCodeSelector = `xpath=//table/tbody/tr[${Number(rows.indexOf(row)) + 1}]/td[2]`;
      const textToCopy = await page.locator(uniqueCodeSelector).innerText();
      console.log(
        'Trovata riga con codice univoco e altro valore nella quarta cella. Testo della quarta cella:',
        textToCopy
      );
      // eslint-disable-next-line functional/immutable-data
      copiedText = textToCopy;
      // afer we've saved the value in the global "copiedText" we're going to close the page
      await page.close();
    }
  }
  console.log('Nessuna riga trovata con contenuto sia nella seconda che nella quarta cella.');
  return '';
}; */

export const stepUploadAggregatorCsv = async (page: Page, title: string, fileCsv: string) => {
  await expect(page.getByText(title)).toBeInViewport();

  await page.waitForSelector('#file-uploader', {
    state: 'attached',
    timeout: 10000,
  });

  await page.waitForTimeout(500);

  const fileInput = page.locator('#file-uploader');
  await expect(fileInput).toBeAttached();

  try {
    await page.setInputFiles('#file-uploader', fileCsv);
  } catch (error) {
    console.error('Errore durante il caricamento del file:', error);
  }

  await page.waitForTimeout(1000);

  const continueButton = page.locator('[aria-label="Continua"]');
  await continueButton.waitFor({ state: 'visible' });

  await expect(continueButton).toBeEnabled();

  await continueButton.click();

  await expect(page.getByText('Richiesta di adesione inviata')).toBeInViewport({
    timeout: 15000,
  });
};

/* Function that copy the recipient code from table of IPA
export const researchOnIpa = async (newPage: Page, partyName: string) => {
  await newPage.setViewportSize({ width: 1920, height: 953 });
  newPage.on('popup', async (popup) => {
    console.log('Pop-up rilevato!');
    await popup.close();
  });
  newPage.on('dialog', async (dialog) => {
    console.log(`Dialogo rilevato: ${dialog.message()}`);
    await dialog.accept();
  });
  await newPage.click('#denominazione');
  await newPage.fill('#denominazione', partyName, { timeout: 1000 });
  await newPage.click('#bottoneRicerca', { timeout: 1000 });
  await newPage.getByRole('img', { name: 'Elenco Unità Organizzative' }).waitFor({ timeout: 1000 });
  await newPage.getByRole('img', { name: 'Elenco Unità Organizzative' }).click();
  await copyUniqueCodeIfSFEIsPresent(newPage);
}; */

export const PRODUCT_IDS_TEST_E2E = {
  PAGOPA: 'prod-pagopa',
  IO: 'prod-io',
  SEND: 'prod-pn',
  SEND_DEV: 'prod-pn-dev',
  INTEROP: 'prod-interop',
  IDPAY: 'prod-idpay',
  IO_SIGN: 'prod-io-sign',
  FD: 'prod-fd',
  FD_GARANTITO: 'prod-fd-garantito',
  DASHBOARD_PSP: 'prod-dashboard-psp',
  IO_PREMIUM: 'prod-io-premium',
  CIBAN: 'prod-ciban',
  CGN: 'prod-cgn',
  IDPAY_MERCHANT: 'prod-idpay-merchant',
};
