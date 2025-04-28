import { storageTokenOps } from '@pagopa/selfcare-common-frontend/lib/utils/storage';
import { Page, expect } from '@playwright/test';

// eslint-disable-next-line functional/no-let
let copiedText: string;
// eslint-disable-next-line functional/no-let
let partyName: string;

export const FILE_MOCK_CSV_AGGREGATOR = {
  IO: './src/lib/__mocks__/mockedFileAggregator.csv',
  SEND: './src/lib/__mocks__/mockedFileAggregatorSend.csv',
};

export const login = async (page: Page, username: string, password: string, product: string) => {
  await page.goto(`https://dev.selfcare.pagopa.it/auth/login?onSuccess=%2Fonboarding%2F${product}`);
  await page.getByRole('button', { name: 'Accetta tutti' }).click();
  await page.getByRole('button', { name: 'Entra con SPID' }).click();
  await page.getByLabel('test').click();
  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Username').press('Tab');
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Invia' }).click();
  await page.getByRole('button', { name: 'Invia' }).click();
};

export const updatedLogin = async (page: Page, product: string) => {
  await page.goto(`https://dev.selfcare.pagopa.it/onboarding/${product}`);
  storageTokenOps.write(
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJmaXNjYWxfbnVtYmVyIjoiU1JUTkxNMDlUMDZHNjM1UyIsIm5hbWUiOiJBbnNlbG1vIiwiZmFtaWx5X25hbWUiOiJTYXJ0b3JpIiwidWlkIjoiNTA5NmU0YzYtMjVhMS00NWQ1LTliZGYtMmZiOTc0YTdjMWM4Iiwic3BpZF9sZXZlbCI6Imh0dHBzOi8vd3d3LnNwaWQuZ292Lml0L1NwaWRMMiIsImlzcyI6IlNQSUQiLCJhdWQiOiJhcGkuZGV2LnNlbGZjYXJlLnBhZ29wYS5pdCIsImlhdCI6MTc0NDcyOTIxOCwiZXhwIjoxNzQ0NzYxNjE4LCJqdGkiOiI0OTA1MWNkYy1kMDEzLTQ4NDMtYjc3Mi1mNWFkODgzOGMyMDkifQ.jJAc5dV8_vLu3jiyXP2Le9bGAffuSUsvzhd-Jk17IXNCo1T922sVAq_Vug0pJtI6rpvG-50NvyWgBJmFc5GM89IH8Ouc-2HD27RIIztue0V8cIOog0dQTNiStHLPds5U0-HSKmwR7VN5bIWVMkIMb8HvFgdhaKmVKeYlQeqWZuTBsaB3UfuStGw52E1U5pUeZxn2yLeZDk62lVi7OS4_jNmCpWpfXXQ_kcWgMKWzcAnU4dXw5MQwFdtcsPZQtNXtIK0W81vKRzUqrga32ygYH-3kqdQvzsQBpX5q4WdXWyp8Ai7udflhyPdtHoo7GEPs6f3ygF4ylydHwzuk4_xc0A'
  );
  await page.goto(`https://dev.selfcare.pagopa.it/onboarding/${product}`);
};

export const stepInstitutionType = async (page: Page, institutionType: string) => {
  await page.getByRole('radio', { name: institutionType }).click();
  await page.getByRole('button', { name: 'Continua' }).waitFor({ timeout: 1000 });
  await page.getByRole('button', { name: 'Continua' }).click();
};

export const stepSelectParty = async (page: Page, aggregator?: boolean) => {
  await page.click('#Parties');
  await page.fill('#Parties', 'com', { timeout: 2000 });
  await page.click('.MuiBox-root:nth-child(1) > .MuiBox-root > .MuiBox-root');
  partyName = await page.locator('div[aria-label] p.MuiTypography-root').innerText();
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

export const stepFormDataWithIpaResearch4SDICode = async (
  page: Page,
  context: any,
  product: string
) => {
  await page.getByLabel('La Partita IVA coincide con il Codice Fiscale').click();
  if (product !== 'prod-interop') {
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
  if (product === 'prod-io-sign') {
    await page.click('#supportEmail');
    await page.fill('#supportEmail', 'test@test.it', { timeout: 500 });
  }
  await page.getByRole('radio', { name: 'Nazionale' }).waitFor({ timeout: 500 });
  await page.getByRole('radio', { name: 'Nazionale' }).click();
  await page.getByRole('button', { name: 'Continua' }).waitFor({ timeout: 500 });
  await page.getByRole('button', { name: 'Continua' }).click();
};

export const stepFormDataWithoutIpaResearch = async (
  page: Page,
  product: string,
  institutionType?: string
) => {
  await page.getByLabel('La Partita IVA coincide con il Codice Fiscale').click();
  if (product !== 'prod-interop' && institutionType !== 'SCP') {
    await page.click('#recipientCode');
    await page.fill('#recipientCode', 'A1B2C3', { timeout: 500 });
  }
  if (product === 'prod-io-sign') {
    await page.click('#supportEmail');
    await page.fill('#supportEmail', 'test@test.it', { timeout: 500 });
  }
  await page.getByRole('radio', { name: 'Nazionale' }).waitFor({ timeout: 500 });
  await page.getByRole('radio', { name: 'Nazionale' }).click();
  await page.getByRole('button', { name: 'Continua' }).waitFor({ timeout: 500 });
  await page.getByRole('button', { name: 'Continua' }).click();
  if (institutionType === 'GPS' || institutionType === 'SCP') {
    await page.getByRole('button', { name: 'Continua' }).waitFor({ timeout: 500 });
    await page.getByRole('button', { name: 'Continua' }).click();
  }
};

export const stepFormDataPartyNotFromIpa = async (page: Page, institutionType?: string) => {
  await page.click('#businessName');
  await page.fill('#businessName', 'test');

  await page.click('#registeredOffice');
  await page.fill('#registeredOffice', 'via test 1');

  await page.click('#zipCode');
  await page.fill('#zipCode', '20900');

  await page.click('#city-select');
  await page.fill('#city-select', 'milano');
  await page.click('#city-select-option-0');

  await page.click('#digitalAddress');
  await page.fill('#digitalAddress', 'test@test.it');

  await page.click('#taxCode');
  await page.fill('#taxCode', '10293847565');

  await page.click('#taxCodeEquals2VatNumber');

  await page.click('#recipientCode');
  await page.fill('#recipientCode', 'A1B2C3');

  await page.click('#rea');
  await page.fill('#rea', 'mi-12354');

  await page.getByRole('button', { name: 'Continua' }).waitFor({ timeout: 500 });
  await page.getByRole('button', { name: 'Continua' }).click();
  if (institutionType === 'GPS') {
    await page.getByRole('button', { name: 'Continua' }).waitFor({ timeout: 500 });
    await page.getByRole('button', { name: 'Continua' }).click();
  }
};

export const stepAdditionalInformation = async (page: Page) => {
  await page.click('#isEstabilishedRegulatoryProvision-yes');
  await page.click('#fromBelongsRegulatedMarket-no');
  await page.click('#isConcessionaireOfPublicService-yes');
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

export const stepAddAdmin = async (page: Page, aggregator?: boolean) => {
  await page.getByLabel('Aggiungi me come Amministratore').click();
  await page.getByRole('textbox', { name: 'Email Istituzionale' }).click();
  await page.fill('#delegate-initial-email', 'a.sartori@test.it', {
    timeout: 500,
  });
  await page.click('[aria-label="Continua"]');
  if (!aggregator) {
    await page.getByRole('button', { name: 'Conferma' }).click();
    await expect(page.getByText('Richiesta di adesione inviata')).toBeInViewport({ timeout: 1000 });
    // await page.getByRole('button', { name: 'Torna alla home' }).waitFor({ timeout: 1000 });
    // await page.getByRole('button', { name: 'Torna alla home' }).click();
  }
};

// Function that search and find the first row of the IPA table that contains uniqueCode and
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
};

export const stepUploadAggregatorCsv = async (page: Page, title: string, fileCsv: string) => {
  await expect(page.getByText(title)).toBeInViewport({ timeout: 1000 });

  await page.setInputFiles('#file-uploader', fileCsv);
  await page.click('[aria-label="Continua"]');
  await expect(page.getByText('Richiesta di adesione inviata')).toBeInViewport({ timeout: 1000 });
  await page.getByRole('button', { name: 'Torna alla home' }).waitFor({ timeout: 1000 });
  await page.getByRole('button', { name: 'Torna alla home' }).click();
};

// Function that copy the recipient code from table of IPA
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
};
