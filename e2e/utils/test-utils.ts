/* eslint-disable functional/no-let */
import path from 'path';
import { Page, expect } from '@playwright/test';

import { getOnboardingIdByTaxCode } from './api-utils';
import { isLocalMode } from './global.setup';
import { trackOnboardingId } from './onboarding-tracker';

// eslint-disable-next-line functional/no-let
// let copiedText: string;
// eslint-disable-next-line functional/no-let

export const BASE_URL_ONBOARDING = isLocalMode
  ? 'http://localhost:3000/onboarding'
  : 'http://dev.selfcare.pagopa.it/onboarding';

export const BASE_URL_ONBOARDING_TO_APPROVE = isLocalMode
  ? 'http://localhost:3000/dashboard/admin/onboarding'
  : 'http://dev.selfcare.pagopa.it/dashboard/admin/onboarding';

export const FILE_MOCK_CSV_AGGREGATOR = {
  IO: path.join(__dirname, '..', '..', 'src', 'lib', '__mocks__', 'mockedFileAggregator.csv'),
  SEND: path.join(__dirname, '..', '..', 'src', 'lib', '__mocks__', 'mockedFileAggregatorSend.csv'),
};

export const FILE_MOCK_PDF_CONTRACT = {
  PA: path.join(__dirname, 'mocks', 'mockedContract.pdf'),
};

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

export const TAX_CODES_BY_INSTITUTION_TYPE = {
  PRV: '19734628500',
  GPU: '10203040506',
  PSP: '11223344556',
  PT: '99887766554',
};

export type InstitutionType =
  | 'PA'
  | 'GSP'
  | 'SCP'
  | 'PT'
  | 'PSP'
  | 'SA'
  | 'AS'
  | 'PRV'
  | 'PRV_PF'
  | 'GPU'
  | 'SCEC';

export const isInteropProductE2E = (productId?: string): boolean =>
  productId === PRODUCT_IDS_TEST_E2E.INTEROP;

export const isIdpayMerchantProductE2E = (productId?: string): boolean =>
  productId === PRODUCT_IDS_TEST_E2E.IDPAY_MERCHANT;

export const isInteropOrIdpayMerchantProductE2E = (productId?: string): boolean =>
  productId === PRODUCT_IDS_TEST_E2E.INTEROP || productId === PRODUCT_IDS_TEST_E2E.IDPAY_MERCHANT;

export const isPagoPaProductE2E = (productId?: string): boolean =>
  productId === PRODUCT_IDS_TEST_E2E.PAGOPA;

export const isIoProductE2E = (productId?: string): boolean =>
  productId === PRODUCT_IDS_TEST_E2E.IO;

export const isIoSignProductE2E = (productId?: string): boolean =>
  productId === PRODUCT_IDS_TEST_E2E.IO_SIGN;

export const isSendProductE2E = (productId?: string): boolean =>
  productId === PRODUCT_IDS_TEST_E2E.SEND;

export const isPagoPaInsightsE2E = (productId?: string): boolean =>
  productId === PRODUCT_IDS_TEST_E2E.DASHBOARD_PSP;
export const isFideiussioniProductE2E = (productId?: string): boolean =>
  productId?.startsWith(PRODUCT_IDS_TEST_E2E.FD) ?? false;

export const isPrivateInstitutionE2E = (institutionType?: InstitutionType): boolean =>
  institutionType === 'PRV';

export const isPrivatePersonInstitutionE2E = (institutionType?: InstitutionType): boolean =>
  institutionType === 'PRV_PF';

export const isPrivateOrPersonInstitutionE2E = (institutionType?: InstitutionType): boolean =>
  institutionType === 'PRV' || institutionType === 'PRV_PF';

export const isPublicServiceCompanyE2E = (institutionType?: InstitutionType): boolean =>
  institutionType === 'SCP';

export const isPublicAdministrationE2E = (institutionType?: InstitutionType): boolean =>
  institutionType === 'PA';

export const isPaymentServiceProviderE2E = (institutionType?: InstitutionType): boolean =>
  institutionType === 'PSP';

export const isContractingAuthorityE2E = (institutionType?: InstitutionType): boolean =>
  institutionType === 'SA';

export const isInsuranceCompanyE2E = (institutionType?: InstitutionType): boolean =>
  institutionType === 'AS';

export const isGlobalServiceProviderE2E = (institutionType?: InstitutionType): boolean =>
  institutionType === 'GSP';

export const isTechPartner = (institutionType?: InstitutionType): boolean =>
  institutionType === 'PT';

export const isGpuInstitutionE2E = (institutionType?: InstitutionType): boolean =>
  institutionType === 'GPU';

export const isConsolidatedEconomicAccountCompanyE2E = (
  institutionType?: InstitutionType
): boolean => institutionType === 'SCEC';

export const stepInstitutionType = async (page: Page, institutionType: string) => {
  await page.waitForTimeout(1000);
  await page.getByRole('radio', { name: institutionType }).click();
  await page.getByRole('button', { name: 'Continua' }).waitFor({ timeout: 1000 });
  await page.getByRole('button', { name: 'Continua' }).click();
};

export const stepSelectParty = async (
  page: Page,
  aggregator?: boolean,
  party?: string,
  productId?: string
) => {
  await page.click('#Parties');
  await page.fill(
    '#Parties',
    party
      ? party
      : 'Istituto di Formazione Professionale Sandro Pertini Servizi alla Persona e del Legno'
  );

  await page.waitForTimeout(1000);
  await page.waitForSelector(
    `.MuiBox-root:nth-child(${isSendProductE2E(productId) || (isIoProductE2E(productId) && aggregator) ? 2 : 1}) > .MuiBox-root > .MuiBox-root`,
    {
      state: 'visible',
      timeout: 5000,
    }
  );
  await page.click(
    `.MuiBox-root:nth-child(${isSendProductE2E(productId) || (isIoProductE2E(productId) && aggregator) ? 2 : 1}) > .MuiBox-root > .MuiBox-root`
  );
  if (aggregator) {
    await page.click('[name="aggregator-party"]');
    await page.click('[aria-label="Continua"]');
    await page.getByRole('button', { name: 'Continua' }).click();
  } else {
    await page.click('[aria-label="Continua"]');
  }

  await page.waitForLoadState('networkidle', { timeout: 10000 });
};

export const stepSelectPartyByCF = async (
  page: Page,
  cfParty: string,
  isPrivateMerchantInstitution?: boolean,
  isAggregator?: boolean
) => {
  await page.getByTestId('party-type-select').click();
  await page.click('[data-testid="taxCode"]');
  await page.click('#Parties');
  await page.fill('#Parties', cfParty, { timeout: 5000 });

  if (isPrivateMerchantInstitution) {
    const businessTaxIdSelector = `[businesstaxid="${cfParty}"]`;
    await page.waitForSelector(businessTaxIdSelector, { state: 'visible', timeout: 10000 });
    await page.click(`${businessTaxIdSelector} [role="button"]`);
  } else {
    // Wait for autocomplete results to appear
    await page.waitForTimeout(1000);
    await page.waitForSelector('.MuiBox-root:nth-child(1) > .MuiBox-root > .MuiBox-root', {
      state: 'visible',
      timeout: 5000,
    });
    await page.click('.MuiBox-root:nth-child(1) > .MuiBox-root > .MuiBox-root');
  }

  if (isAggregator) {
    await page.click('[name="aggregator-party"]');
    await page.click('[aria-label="Continua"]');
    await page.getByRole('button', { name: 'Continua' }).click();
  } else {
    await page.click('[aria-label="Continua"]');
  }
  await page.waitForLoadState('networkidle', { timeout: 10000 });
};

// eslint-disable-next-line complexity
export const stepFormData = async (
  page: Page,
  productOrInstitutionType: string,
  institutionType?: string,
  isAggregator?: boolean,
  taxCode?: string
  // eslint-disable-next-line sonarjs/cognitive-complexity
) => {
  const isFromIpa = institutionType !== undefined;
  const product = isFromIpa ? productOrInstitutionType : '';
  const actualInstitutionType = isFromIpa ? institutionType : productOrInstitutionType;
  if (
    !isFromIpa ||
    (isPagoPaProductE2E(product) &&
      (isPrivateInstitutionE2E(institutionType as InstitutionType) ||
        isGpuInstitutionE2E(institutionType as InstitutionType)))
  ) {
    await page.click('#businessName');
    await page.fill('#businessName', 'test');

    await page.click('#digitalAddress');
    await page.fill('#digitalAddress', 'test@test.it');

    await page.click('#taxCode');
    await page.fill(
      '#taxCode',
      taxCode ||
        (!isFromIpa
          ? '11779933554'
          : isPrivateInstitutionE2E(institutionType as InstitutionType)
            ? '19734628500'
            : '10203040506')
    );

    await page.click('#taxCodeEquals2VatNumber');
  }

  if (
    isInteropProductE2E(product) &&
    isPrivateInstitutionE2E(actualInstitutionType as InstitutionType)
  ) {
    await page.click('#taxCodeEquals2VatNumber');
  }

  if (
    (isInteropProductE2E(product) &&
      (isContractingAuthorityE2E(actualInstitutionType as InstitutionType) ||
        isInsuranceCompanyE2E(actualInstitutionType as InstitutionType))) ||
    !isFromIpa ||
    (isPagoPaProductE2E(product) &&
      (isPrivateInstitutionE2E(institutionType as InstitutionType) ||
        isGpuInstitutionE2E(institutionType as InstitutionType)))
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
    !isPrivateInstitutionE2E(institutionType as InstitutionType) &&
    !isGpuInstitutionE2E(institutionType as InstitutionType)
  ) {
    await page.getByLabel('La Partita IVA coincide con il Codice Fiscale').click();
  }

  if (
    isFromIpa &&
    !isInteropProductE2E(product) &&
    !isPrivateInstitutionE2E(actualInstitutionType as InstitutionType) &&
    !isPublicServiceCompanyE2E(actualInstitutionType as InstitutionType) &&
    !isIoProductE2E(product)
  ) {
    await page.click('#recipientCode');
    await page.fill(
      '#recipientCode',
      isSendProductE2E(product)
        ? isAggregator
          ? 'UFL4DM'
          : 'UFBM8M'
        : isIoSignProductE2E(product)
          ? 'UF0IGB'
          : 'UFOR71',
      {
        timeout: 2000,
      }
    );
  } else if (
    (!isFromIpa &&
      !isTechPartner(actualInstitutionType as InstitutionType)||
      !isIoProductE2E(product)) ||
    isPublicServiceCompanyE2E(actualInstitutionType as InstitutionType) ||
    (isPagoPaProductE2E(product) &&
      isPrivateInstitutionE2E(actualInstitutionType as InstitutionType))
  ) {
    await page.click('#recipientCode');
    await page.fill('#recipientCode', 'A1B2C3');
  }

  if (isFromIpa && isIoSignProductE2E(product)) {
    await page.click('#supportEmail');
    await page.fill('#supportEmail', 'test@test.it', { timeout: 500 });
  }

  if (
    isInsuranceCompanyE2E(actualInstitutionType as InstitutionType) ||
    isGpuInstitutionE2E(actualInstitutionType as InstitutionType) ||
    (isGlobalServiceProviderE2E(actualInstitutionType as InstitutionType) && !isFromIpa)
  ) {
    await page.click('#rea');
    await page.fill('#rea', 'RM-123456');
  }

  if (
    isInsuranceCompanyE2E(actualInstitutionType as InstitutionType) ||
    (isInteropProductE2E(product) &&
      isPrivateInstitutionE2E(actualInstitutionType as InstitutionType))
  ) {
    await page.click('#businessRegisterPlace');
    await page.fill('#businessRegisterPlace', 'Comune di Milano');

    await page.click('#shareCapital');
    await page.fill('#shareCapital', '€ 1.5000');
  }

  if (!isFromIpa && isPaymentServiceProviderE2E(actualInstitutionType as InstitutionType)) {
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

  if (
    isPrivateInstitutionE2E(actualInstitutionType as InstitutionType) &&
    isIdpayMerchantProductE2E(product)
  ) {
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
    ? (!isPublicServiceCompanyE2E(actualInstitutionType as InstitutionType) &&
        !isContractingAuthorityE2E(actualInstitutionType as InstitutionType) &&
        !isInsuranceCompanyE2E(actualInstitutionType as InstitutionType)) ||
      (isPrivateInstitutionE2E(actualInstitutionType as InstitutionType) &&
        isInteropProductE2E(product))
    : !isTechPartner(actualInstitutionType as InstitutionType);
  if (shouldShowNazionale) {
    await page.getByRole('radio', { name: 'Nazionale' }).click();
  }

  await page.getByRole('button', { name: 'Continua' }).waitFor({ timeout: 5000 });
  await page.getByRole('button', { name: 'Continua' }).click();

  if (await page.getByText('Stai modificando l’area geografica del tuo ente').isVisible()) {
    await page.getByRole('button', { name: 'Continua' }).click();
  }
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

export const stepAddAdmin = async (
  page: Page,
  aggregator?: boolean,
  institutionType?: InstitutionType,
  isAddApplicantEmail?: boolean
) => {
  if (isLocalMode || isAddApplicantEmail) {
    await page.click('#delegate-initial-name');
    await page.fill('#delegate-initial-name', 'Mattia', {
      timeout: 1000,
    });

    await page.getByRole('textbox', { name: 'Cognome' }).click();
    await page.fill('#delegate-initial-surname', 'Sisti', {
      timeout: 1000,
    });
    await page.getByRole('textbox', { name: 'Codice Fiscale' }).click();
    await page.fill('#delegate-initial-taxCode', 'SSTMTT76C23F205T', {
      timeout: 1000,
    });
    await page.getByRole('textbox', { name: 'Email Istituzionale' }).click();
    await page.fill('#delegate-initial-email', 'm.sisti@test.it', {
      timeout: 1000,
    });
    await page.click('[aria-label="Continua"]');
  } else {
    await page.getByLabel('Aggiungi me come Amministratore').click();

    await page.getByRole('textbox', { name: 'Email Istituzionale' }).click();
    await page.fill('#delegate-initial-email', 'cleopatra@test.it', {
      timeout: 500,
    });

    await page.waitForSelector('[aria-label="Continua"]:not([disabled])', {
      timeout: 2000,
    });

    await page.click('[aria-label="Continua"]');
  }

  if (aggregator) {
    return;
  }

  if (!isTechPartner(institutionType)) {
    await page.getByRole('button', { name: 'Conferma' }).waitFor({
      state: 'visible',
      timeout: 2000,
    });

    await page.getByRole('button', { name: 'Conferma' }).click();
  }

  if (!aggregator && !isTechPartner(institutionType)) {
    await expect(page.getByText('Richiesta di adesione inviata')).toBeInViewport({
      timeout: 15000,
    });
  }

  if (isTechPartner(institutionType)) {
    await expect(page.getByText('Richiesta di registrazione inviata')).toBeInViewport({
      timeout: 15000,
    });
  }
};

export const stepUploadAggregatorCsv = async (page: Page, title: string, fileCsv: string) => {
  await expect(page.getByText(title)).toBeInViewport();

  await page.waitForSelector('#file-uploader', {
    state: 'attached',
    timeout: 10000,
  });

  await page.waitForTimeout(500);

  const fileInput = page.locator('#file-uploader');
  await expect(fileInput).toBeAttached();

  await page.setInputFiles('#file-uploader', fileCsv);

  await page.waitForTimeout(1000);

  const continueButton = page.locator('[aria-label="Continua"]');
  await continueButton.waitFor({ state: 'visible' });

  await expect(continueButton).toBeEnabled();

  await continueButton.click();

  await expect(page.getByText('Richiesta di adesione inviata')).toBeInViewport({
    timeout: 10000,
  });
};

export const redirectToApprove = async (page: Page, onboardingId: string) => {
  await page.goto(`${BASE_URL_ONBOARDING_TO_APPROVE}/${onboardingId}`, {
    timeout: 20000,
  });

  await expect(
    page.getByText('Controlla le informazioni inserite dall’ente e approva o rifiuta la richiesta.')
  ).toBeInViewport({
    timeout: 10000,
  });

  await page.getByRole('button', { name: 'Approva' }).click();

  await expect(page.getByText('Adesione approvata')).toBeInViewport({
    timeout: 10000,
  });
};

export const stepCompleteOnboarding = async (
  page: Page,
  taxCode: string,
  filePdf: string,
  productId: string,
  institutionType?: InstitutionType,
  notOnIpa?: boolean
) => {
  const requiresApproval =
    isPagoPaProductE2E(productId) &&
    (isPrivateInstitutionE2E(institutionType as InstitutionType) ||
      isGpuInstitutionE2E(institutionType as InstitutionType) ||
      isPaymentServiceProviderE2E(institutionType as InstitutionType) ||
      isTechPartner(institutionType as InstitutionType));

  let onboardingId = await getOnboardingIdByTaxCode(
    page,
    taxCode,
    productId,
    requiresApproval || notOnIpa ? 'TOBEVALIDATED' : 'PENDING'
  );

  if (onboardingId.length > 0) {
    if (requiresApproval || notOnIpa) {
      await redirectToApprove(page, onboardingId);

      if (!isTechPartner(institutionType)) {
        await page.waitForTimeout(2000);

        onboardingId = await getOnboardingIdByTaxCode(page, taxCode, productId, 'PENDING');
      }
    }

    if (!isTechPartner(institutionType)) {
      await page.goto(`${BASE_URL_ONBOARDING}/confirm?jwt=${onboardingId}`, {
        timeout: 10000,
      });

      await page.click('[data-testid="DownloadIcon"]', { timeout: 2000 });

      await page.waitForTimeout(2000);
      await page.click('[data-testid="ArrowForwardIcon"]', { timeout: 2000 });

      await page.waitForSelector('#file-uploader', {
        state: 'attached',
        timeout: 10000,
      });

      await page.waitForTimeout(500);

      const fileInput = page.locator('#file-uploader');
      await expect(fileInput).toBeAttached();

      await page.setInputFiles('#file-uploader', filePdf);

      await page.waitForTimeout(1000);

      await page.getByRole('button', { name: 'Continua' }).click();

      await expect(page.getByText('Adesione completata!')).toBeInViewport({
        timeout: 10000,
      });
    }

    await trackOnboardingId(onboardingId);
  }
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
  if (isIoSignProductE2E(product)) {
    await page.click('#supportEmail');
    await page.fill('#supportEmail', 'test@test.it', { timeout: 500 });
  }
  await page.getByRole('radio', { name: 'Nazionale' }).waitFor({ timeout: 500 });
  await page.getByRole('radio', { name: 'Nazionale' }).click();
  await page.getByRole('button', { name: 'Continua' }).waitFor({ timeout: 500 });
  await page.getByRole('button', { name: 'Continua' }).click();
}; 

Function that search and find the first row of the IPA table that contains uniqueCode and
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

Function that copy the recipient code from table of IPA
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
