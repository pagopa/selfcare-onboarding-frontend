/* eslint-disable functional/no-let */
import path from 'path';
import { Page, expect } from '@playwright/test';

import { getOnboardingIdByTaxCode, isLocalMode } from './api-utils';

// eslint-disable-next-line functional/no-let
// let copiedText: string;
// eslint-disable-next-line functional/no-let

export const BASE_URL_ONBOARDING = isLocalMode
  ? 'http://localhost:3000/onboarding'
  : 'https://dev.selfcare.pagopa.it/onboarding';

export const BASE_URL_ONBOARDING_TO_APPROVE = isLocalMode
  ? 'http://localhost:3000/dashboard/admin/onboarding'
  : 'https://dev.selfcare.pagopa.it/dashboard/admin/onboarding';

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
  CED: 'prod-ced',
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

export const isCedProductE2E = (productId?: string): boolean =>
  productId === PRODUCT_IDS_TEST_E2E.CED;

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

// Mirrors isRequiredDocumentsFlow in OnboardingProduct: prod-pagopa + GSP, but only for a party
// that is not on IPA.
export const isUploadDocumentsGSP_NO_IPA_flow = (
  productId?: string,
  institutionType?: InstitutionType,
  notOnIpa?: boolean
): boolean => !!notOnIpa && productId === PRODUCT_IDS_TEST_E2E.PAGOPA && institutionType === 'GSP';

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
    ((isPagoPaProductE2E(product) || isCedProductE2E(product)) &&
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
    ((isPagoPaProductE2E(product) || isCedProductE2E(product)) &&
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
    // The form no longer exposes this checkbox through that accessible name - it now sits next to
    // a separate "Partita IVA" field and a "senza partita IVA" one. The id is what the rest of
    // this file already uses, and it survived the redesign.
    await page.click('#taxCodeEquals2VatNumber');
  }

  if (
    isFromIpa &&
    !isInteropProductE2E(product) &&
    !isPrivateInstitutionE2E(actualInstitutionType as InstitutionType) &&
    !isPublicServiceCompanyE2E(actualInstitutionType as InstitutionType) &&
    !isIoProductE2E(product) &&
    !isCedProductE2E(product)
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
    (!isFromIpa && !isTechPartner(actualInstitutionType as InstitutionType)) ||
    (isFromIpa &&
      isPagoPaProductE2E(product) &&
      isPrivateInstitutionE2E(actualInstitutionType as InstitutionType))
  ) {
    await page.click('#recipientCode');
    await page.fill('#recipientCode', 'A1B2C3');
  }

  if (isFromIpa && isIoSignProductE2E(product)) {
    await page.click('#supportEmail');
    await page.fill('#supportEmail', 'test@test.it', { timeout: 500 });
  }

  // SCP on interop now asks for REA and share capital too, like AS does
  const isPublicServiceCompanyOnInterop =
    isPublicServiceCompanyE2E(actualInstitutionType as InstitutionType) &&
    isInteropProductE2E(product);

  if (
    isInsuranceCompanyE2E(actualInstitutionType as InstitutionType) ||
    isGpuInstitutionE2E(actualInstitutionType as InstitutionType) ||
    isPublicServiceCompanyOnInterop ||
    (isGlobalServiceProviderE2E(actualInstitutionType as InstitutionType) && !isFromIpa)
  ) {
    await page.click('#rea');
    await page.fill('#rea', 'RM-123456');
  }

  if (
    isInsuranceCompanyE2E(actualInstitutionType as InstitutionType) ||
    isPublicServiceCompanyOnInterop ||
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
    ? (!isContractingAuthorityE2E(actualInstitutionType as InstitutionType) &&
        !isInsuranceCompanyE2E(actualInstitutionType as InstitutionType)) ||
      (isPrivateInstitutionE2E(actualInstitutionType as InstitutionType) &&
        isInteropProductE2E(product))
    : !isTechPartner(actualInstitutionType as InstitutionType);
  if (shouldShowNazionale) {
    await page.getByRole('radio', { name: 'Nazionale' }).click();
  }

  await page.getByRole('button', { name: 'Continua' }).waitFor({ timeout: 5000 });
  await page.getByRole('button', { name: 'Continua' }).click();

  // isVisible() does not wait, so it used to miss the dialog whenever it rendered a beat late
  const geoDialog = page.getByText('Stai modificando l’area geografica del tuo ente');
  const geoDialogShown = await geoDialog
    .waitFor({ state: 'visible', timeout: 3000 })
    .then(() => true)
    .catch(() => false);
  if (geoDialogShown) {
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

/** Email used whenever a step toggles "Aggiungi me come ..." and fills the logged user in. */
const AUTH_USER_EMAIL = 'cleopatra@test.it';

export const stepAddManager = async (page: Page, product?: string) => {
  if (isCedProductE2E(product)) {
    // getByLabel matches both the Switch's span and its inner checkbox - the testid is the only
    // unambiguous handle.
    await page.getByTestId('authUserSwitch-test').click();
  } else {
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
  }
  await page.getByRole('textbox', { name: 'Email Istituzionale' }).click();
  // On CED both switches put the logged user in both roles, and the same person with two different
  // emails is an 'email-conflict' (allowsDuplicates in PlatformUserForm), so the manager has to
  // reuse the address stepAddAdmin fills in.
  await page.fill(
    '#manager-initial-email',
    isCedProductE2E(product) ? AUTH_USER_EMAIL : 's.freud@test.it',
    { timeout: 1000 }
  );
  await page.click('[aria-label="Continua"]');
};

type StepAddAdminOptions = {
  aggregator?: boolean;
  institutionType?: InstitutionType;
  isAddApplicantEmail?: boolean;
  productId?: string;
  /** The party was entered through the "no IPA" link instead of being picked from the registry. */
  notOnIpa?: boolean;
};

export const stepAddAdmin = async (page: Page, options: StepAddAdminOptions = {}) => {
  const { aggregator, institutionType, isAddApplicantEmail, productId, notOnIpa } = options;

  // Whether the admin is somebody other than the logged user. It drives which form we fill here
  // and, further down, whether the app asks for confirmation before submitting.
  const isDelegateOtherThanLoggedUser = isLocalMode || isAddApplicantEmail;

  if (isDelegateOtherThanLoggedUser) {
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
    await page.fill('#delegate-initial-email', AUTH_USER_EMAIL, {
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

  // GSP non-IPA: the app skips the confirmation modal here (isRequiredDocumentsFlow in
  // StepAddAdmin) and hands over to the document upload flow. Both the "Conferma" and the
  // "Richiesta di adesione inviata" assertion belong to stepUploadGspNoIpaDocuments, which
  // asserts the handover on its first line.
  if (isUploadDocumentsGSP_NO_IPA_flow(productId, institutionType, notOnIpa)) {
    return;
  }

  // Every other flow goes through the "Confermi la richiesta di invio?" modal, which StepAddAdmin
  // skips for tech partners and for isAddApplicationEmail.
  if (!isDelegateOtherThanLoggedUser && !isTechPartner(institutionType)) {
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
  /* const requiresApproval =
    isPagoPaProductE2E(productId) &&
    (isPrivateInstitutionE2E(institutionType as InstitutionType) ||
      isGpuInstitutionE2E(institutionType as InstitutionType) ||
      isPaymentServiceProviderE2E(institutionType as InstitutionType) ||
      isTechPartner(institutionType as InstitutionType)); */

  const onboardingId = await getOnboardingIdByTaxCode(
    page,
    taxCode,
    productId,
    /* requiresApproval || notOnIpa ? 'TOBEVALIDATED' : */ 'PENDING'
  );

  // getOnboardingIdByTaxCode throws with the reason if it cannot find it. This used to be
  // `if (onboardingId.length > 0)`, which turned "not found" into a silent pass.

  /* if (requiresApproval || notOnIpa) {
    await redirectToApprove(page, onboardingId);

    if (!isTechPartner(institutionType)) {
      await page.waitForTimeout(2000);

      onboardingId = await getOnboardingIdByTaxCode(page, taxCode, productId, 'PENDING');
    }
  } */

  if (!isTechPartner(institutionType) && !notOnIpa) {
    await page.goto(`${BASE_URL_ONBOARDING}/confirm?jwt=${onboardingId}`, {
      timeout: 10000,
    });

    await page.click('[data-testid="DownloadIcon"]', { timeout: 2000 });

    await page.waitForTimeout(2000);
    await page.click('[data-testid="ArrowForwardIcon"]', { timeout: 2000 });

    const uploadContract = async () => {
      await page.waitForSelector('#file-uploader', {
        state: 'attached',
        timeout: 10000,
      });

      await page.waitForTimeout(500);

      await page.setInputFiles('#file-uploader', filePdf);

      await page.waitForTimeout(1000);

      await page.getByRole('button', { name: 'Continua' }).click();
    };

    // CED gets its own wording on the outcome page: outcomeContent.success.product.titleCed
    const successTitle = page.getByText(
      isCedProductE2E(productId) ? 'Accordo caricato correttamente' : 'Adesione completata!'
    );
    // "Carica di nuovo" is the button on the upload failure page (CompleteRequestFailPage): it
    // clears the uploaded file and puts the uploader back, so the upload can be retried in place.
    const uploadAgain = page.getByRole('button', { name: 'Carica di nuovo' });

    await uploadContract();

    // Waiting on either outcome instead of on success alone, so a failed upload is caught as soon
    // as its page renders rather than after the success assertion has timed out.
    await successTitle.or(uploadAgain).first().waitFor({ state: 'visible', timeout: 20000 });

    if (await uploadAgain.isVisible()) {
      await uploadAgain.click();
      await uploadContract();
    }

    await expect(successTitle).toBeInViewport({
      timeout: 20000,
    });
  }
};

// The uploader is a react-dropzone box: the visible "carica il file" is a button that opens the
// native picker, and the file goes to its hidden input - same as the contract upload in
// stepCompleteOnboarding, which is why the file is set on the input while it is only attached.
const uploadRequiredDocument = async (page: Page, filePdf: string) => {
  const fileInput = page.locator('input[type="file"]');
  await fileInput.waitFor({ state: 'attached', timeout: 10000 });

  await page.waitForTimeout(500);

  await fileInput.setInputFiles(filePdf);

  await page.waitForTimeout(1000);

  await page.getByRole('button', { name: 'Continua' }).click();
};

export const stepUploadGspNoIpaDocuments = async (page: Page, filePdf: string) => {
  await expect(page.getByText('Inserisci i documenti')).toBeInViewport({
    timeout: 10000,
  });

  // Natura giuridica
  await uploadRequiredDocument(page, filePdf);

  // Visura
  await uploadRequiredDocument(page, filePdf);

  // Attestazione GSP: this one accepts more than one document, so it also asks for a title
  await page.getByRole('textbox', { name: 'Titolo del documento' }).fill('test');
  await uploadRequiredDocument(page, filePdf);

  // toBeVisible, not toBeInViewport: after the three uploads the page is scrolled past this title,
  // so it is rendered but outside the viewport.
  await expect(page.getByText('Riepilogo documenti caricati')).toBeVisible({
    timeout: 10000,
  });

  await page.getByRole('button', { name: 'Continua' }).click();
  await page.getByRole('button', { name: 'Conferma' }).click();
  

  await expect(page.getByText('Richiesta di adesione inviata')).toBeInViewport({
    timeout: 15000,
  });
};
