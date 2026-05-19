import { fireEvent, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { InstitutionType } from '../../../types';
import {
  mockedPartiesFromInfoCamere,
  mockedPdndVisuraInfomacere,
  mockPartyRegistry,
} from '../../lib/__mocks__/mockApiRequests';
import {
  isCedProduct,
  isContractingAuthority,
  isGlobalServiceProvider,
  isInsuranceCompany,
  isInteropProduct,
  isIoProduct,
  isIoSignProduct,
  isPaymentServiceProvider,
  isPrivateInstitution,
  isPublicAdministration,
  isTechPartner,
} from './../institutionTypeUtils';

export type Source =
  | 'IPA'
  | 'NO_IPA'
  | 'ANAC'
  | 'IVASS'
  | 'INFOCAMERE'
  | 'PDND_INFOCAMERE'
  | 'SELC';

export type Search =
  | 'businessName'
  | 'taxCode'
  | 'aooCode'
  | 'uoCode'
  | 'ivassCode'
  | 'reaCode'
  | 'personalTaxCode';

export type BillingFieldIds = {
  businessName: string;
  registeredOffice: string;
  mailPEC: string;
  zipCode: string;
  taxCode: string;
  vatNumber: string;
  recipientCode: string;
  holder?: string;
  iban?: string;
  confirmIban?: string;
  supportEmail?: string;
  rea?: string;
  city?: string;
  county?: string;
  country?: string;
};

export type BillingFormContext = {
  productId: string;
  from: Source;
  institutionType?: string;
  isAoo?: boolean;
  isForeignInsurance: boolean;
  haveTaxCode: boolean;
  typeOfSearch?: Search;
};

export const fillCityAutocomplete = async (
  autocompleteId: string,
  input: string,
  expectedOption: string
) => {
  const autocomplete = document.getElementById(autocompleteId) as HTMLElement;
  await userEvent.type(autocomplete, input);
  const option = await screen.findByText(expectedOption, {}, { timeout: 8000 });
  expect(option).toBeInTheDocument();
  fireEvent.click(option);
};

// Scenario: non-IPA, non-INFOCAMERE sources (NO_IPA, ANAC, IVASS, SELC, ...)
export const fillNoIpaScenario = async (ids: BillingFieldIds, ctx: BillingFormContext) => {
  if (
    !isContractingAuthority(ctx.institutionType as InstitutionType) &&
    !isInsuranceCompany(ctx.institutionType as InstitutionType)
  ) {
    fireEvent.change(document.getElementById(ids.businessName) as HTMLElement, {
      target: { value: 'businessNameInput' },
    });
    fireEvent.change(document.getElementById(ids.mailPEC) as HTMLElement, {
      target: { value: 'a@a.it' },
    });

    const taxCodeElement = document.getElementById(ids.taxCode) as HTMLElement;
    if (ctx.haveTaxCode) {
      fireEvent.change(taxCodeElement, { target: { value: '00000000000' } });
    } else {
      expect(taxCodeElement).not.toBeInTheDocument();
    }
  }

  fireEvent.change(document.getElementById(ids.registeredOffice) as HTMLElement, {
    target: { value: 'registeredOfficeInput' },
  });

  if (ctx.isForeignInsurance) {
    await fillCityAutocomplete(ids.country as string, 'Spa', 'Spagna');
    fireEvent.change(document.getElementById('city') as HTMLElement, {
      target: { value: 'Valencia' },
    });
  } else {
    await fillCityAutocomplete(ids.city as string, 'Mil', 'Milano');
    fireEvent.change(document.getElementById(ids.zipCode) as HTMLElement, {
      target: { value: '09010' },
    });
    expect(document.getElementById(ids.county ?? '') as HTMLElement).toHaveValue('MI');
  }

  if (
    !isTechPartner(ctx.institutionType as InstitutionType) &&
    !isInsuranceCompany(ctx.institutionType as InstitutionType) &&
    !isPaymentServiceProvider(ctx.institutionType as InstitutionType)
  ) {
    fireEvent.change(document.getElementById(ids.rea ?? '') as HTMLInputElement, {
      target: { value: 'MO-123456' },
    });
  }
};

// Scenario: IPA source + private institution + PagoPa product
export const fillPagoPaPrivateScenario = async (ids: BillingFieldIds, ctx: BillingFormContext) => {
  fireEvent.change(document.getElementById(ids.businessName) as HTMLElement, {
    target: { value: mockPartyRegistry.items[0].description },
  });
  fireEvent.change(document.getElementById(ids.mailPEC) as HTMLElement, {
    target: { value: mockPartyRegistry.items[0].digitalAddress },
  });
  fireEvent.change(document.getElementById(ids.zipCode) as HTMLElement, {
    target: { value: mockPartyRegistry.items[0].zipCode },
  });

  await fillCityAutocomplete(
    (ctx.isForeignInsurance ? ids.country : ids.city) as string,
    'Mil',
    'Milano'
  );
  expect(document.getElementById(ids.county ?? '') as HTMLElement).toHaveValue('MI');

  fireEvent.change(document.getElementById('registeredOffice') as HTMLInputElement, {
    target: { value: mockPartyRegistry.items[0].address },
  });
  fireEvent.change(document.getElementById(ids.taxCode) as HTMLElement, {
    target: { value: mockPartyRegistry.items[0].taxCode },
  });
  fireEvent.change(document.getElementById(ids.recipientCode) as HTMLElement, {
    target: { value: 'A1B2C3D' },
  });
  fireEvent.change(document.getElementById('businessRegisterPlace') as HTMLElement, {
    target: { value: '01234567891' },
  });
};

// Scenario: private merchant (IDPAY product)
export const fillPrivateMerchantScenario = async (
  ids: BillingFieldIds,
  ctx: BillingFormContext
) => {
  const personalIndex = ctx.typeOfSearch === 'personalTaxCode' ? 5 : 0;
  const visura = mockedPdndVisuraInfomacere[personalIndex];

  fireEvent.change(document.getElementById('businessRegisterPlace') as HTMLElement, {
    target: { value: 'Comune' },
  });
  fireEvent.change(document.getElementById(ids.rea ?? '') as HTMLInputElement, {
    target: { value: visura.nRea },
  });
  fireEvent.change(document.getElementById(ids.businessName) as HTMLElement, {
    target: { value: visura.businessName },
  });
  fireEvent.change(document.getElementById(ids.mailPEC) as HTMLElement, {
    target: { value: visura.digitalAddress },
  });
  fireEvent.change(document.getElementById(ids.taxCode) as HTMLElement, {
    target: { value: visura.businessTaxId },
  });
  fireEvent.change(document.getElementById(ids.registeredOffice) as HTMLElement, {
    target: { value: mockedPartiesFromInfoCamere[0].address },
  });
  fireEvent.change(document.getElementById(ids.zipCode) as HTMLElement, {
    target: { value: mockedPartiesFromInfoCamere[0].zipCode },
  });

  await fillCityAutocomplete(ids.city as string, 'Mil', 'Milano');
  expect(document.getElementById(ids.county ?? '') as HTMLElement).toHaveValue('MI');

  fireEvent.change(document.getElementById('businessRegisterPlace') as HTMLElement, {
    target: { value: '01234567891' },
  });
  fireEvent.change(document.getElementById(ids.rea ?? '') as HTMLInputElement, {
    target: { value: visura.nRea },
  });
  fireEvent.change(document.getElementById(ids.holder ?? '') as HTMLInputElement, {
    target: { value: 'holder' },
  });
  fireEvent.change(document.getElementById(ids.iban ?? '') as HTMLInputElement, {
    target: { value: 'IT60X0542811101000000123456' },
  });
  fireEvent.change(document.getElementById(ids.confirmIban ?? '') as HTMLInputElement, {
    target: { value: 'IT60X0542811101000000123456' },
  });
};

// Scenario: public service company or private institution from INFOCAMERE/PDND_INFOCAMERE
export const fillInfocamereScenario = async (ids: BillingFieldIds, ctx: BillingFormContext) => {
  fireEvent.change(document.getElementById(ids.businessName) as HTMLElement, {
    target: { value: mockedPartiesFromInfoCamere[0].businessName },
  });
  fireEvent.change(document.getElementById(ids.mailPEC) as HTMLElement, {
    target: { value: mockedPartiesFromInfoCamere[0].digitalAddress },
  });
  fireEvent.change(document.getElementById(ids.taxCode) as HTMLElement, {
    target: { value: mockedPartiesFromInfoCamere[0].businessTaxId },
  });
  fireEvent.change(document.getElementById(ids.registeredOffice) as HTMLElement, {
    target: { value: mockedPartiesFromInfoCamere[0].address },
  });
  fireEvent.change(document.getElementById(ids.zipCode) as HTMLElement, {
    target: { value: mockedPartiesFromInfoCamere[0].zipCode },
  });

  await fillCityAutocomplete(ids.city as string, 'Mod', 'Modena');
  expect(document.getElementById(ids.county ?? '') as HTMLElement).toHaveValue('MO');

  fireEvent.change(document.getElementById(ids.rea ?? '') as HTMLInputElement, {
    target: {
      value: mockedPartiesFromInfoCamere[0].cciaa.concat('-', mockedPartiesFromInfoCamere[0].nRea),
    },
  });

  if (
    isPrivateInstitution(ctx.institutionType as InstitutionType) &&
    isInteropProduct(ctx.productId)
  ) {
    fireEvent.change(document.getElementById('businessRegisterPlace') as HTMLElement, {
      target: { value: '01234567891' },
    });
  }
};

export const fillVatNumberField = (
  vatNumberId: string,
  isPrivateMerchant: boolean,
  from: Source,
  isForeignInsurance: boolean
) => {
  if (isPrivateMerchant) {
    fireEvent.change(document.getElementById(vatNumberId) as HTMLElement, {
      target: { value: mockedPdndVisuraInfomacere[0].vatNumber },
    });
  } else if (from !== 'IVASS' || !isForeignInsurance) {
    fireEvent.change(document.getElementById(vatNumberId) as HTMLElement, {
      target: { value: '00000000000' },
    });
  }
};

export const fillPspSpecificSection = async () => {
  const vatNumberGroup = document.getElementById('vatNumberGroup') as HTMLElement;
  const commercialRegisterNumber = document.getElementById(
    'commercialRegisterNumber'
  ) as HTMLElement;
  const abiCode = document.getElementById('abiCode') as HTMLElement;

  expect(document.getElementById('dpo-data-section')).toBeInTheDocument();
  expect(vatNumberGroup).toBeInTheDocument();
  fireEvent.click(vatNumberGroup);

  fireEvent.change(document.getElementById('address') as HTMLInputElement, {
    target: { value: 'Via milano 5' },
  });
  fireEvent.change(document.getElementById('pec') as HTMLInputElement, {
    target: { value: 'dpopec@mailtest.com' },
  });
  fireEvent.change(document.getElementById('email') as HTMLInputElement, {
    target: { value: 'dpomail@mailtest.com' },
  });

  fireEvent.change(commercialRegisterNumber as HTMLInputElement, {
    target: { value: '1234455566' },
  });
  await waitFor(() =>
    expect(document.getElementById('commercialRegisterNumber-helper-text')?.textContent).toBe(
      'Il n. Iscrizione al Registro delle Imprese non è valido'
    )
  );
  fireEvent.change(commercialRegisterNumber as HTMLInputElement, {
    target: { value: '12344555667' },
  });
  await waitFor(() =>
    expect(
      document.getElementById('commercialRegisterNumber-helper-text')?.textContent
    ).toBeUndefined()
  );

  fireEvent.change(document.getElementById('registrationInRegister') as HTMLInputElement, {
    target: { value: '123' },
  });
  fireEvent.change(document.getElementById('registerNumber') as HTMLInputElement, {
    target: { value: '24' },
  });

  fireEvent.change(abiCode as HTMLInputElement, { target: { value: '4' } });
  await waitFor(() =>
    expect(document.getElementById('abiCode-helper-text')?.textContent).toBe(
      'Il Codice ABI non è valido'
    )
  );
  fireEvent.change(abiCode as HTMLInputElement, { target: { value: '23321' } });
  await waitFor(() =>
    expect(document.getElementById('abiCode-helper-text')?.textContent).toBeUndefined()
  );
};

export const verifyPspFieldsAbsent = () => {
  expect(document.getElementById('vatNumberGroup')).not.toBeInTheDocument();
  expect(document.getElementById('commercialRegisterNumber')).not.toBeInTheDocument();
  expect(document.getElementById('registrationInRegister')).not.toBeInTheDocument();
  expect(document.getElementById('registerNumber')).not.toBeInTheDocument();
  expect(document.getElementById('abiCode')).not.toBeInTheDocument();
  expect(document.getElementById('dpo-data-section')).not.toBeInTheDocument();
};

export const clickTaxCodeEqualsVatNumberIfApplicable = (
  isPrivateMerchant: boolean,
  isFromIpaOrInfocamere: boolean
) => {
  if (!isPrivateMerchant && isFromIpaOrInfocamere) {
    const taxCodeEquals2PIVA = document.getElementById('taxCodeEquals2VatNumber') as HTMLElement;
    if (taxCodeEquals2PIVA) {
      fireEvent.click(taxCodeEquals2PIVA);
      expect((document.getElementById('vatNumber') as HTMLInputElement).value).toBe(
        (document.getElementById('taxCode') as HTMLInputElement).value
      );
    }
  }
};

export const fillRecipientCodeSection = (
  recipientCode: string,
  supportEmail: string | undefined,
  productId: string,
  isPrivateMerchant: boolean,
  institutionType: string | undefined,
  isAoo: boolean | undefined
) => {
  const shouldFill =
    !isPrivateMerchant &&
    !isIoProduct(productId) &&
    !isCedProduct(productId) &&
    ((isPublicAdministration(institutionType as InstitutionType) && !isAoo) ||
      isGlobalServiceProvider(institutionType as InstitutionType) ||
      isPaymentServiceProvider(institutionType as InstitutionType));

  if (!shouldFill) {
    return;
  }

  fireEvent.change(document.getElementById(recipientCode) as HTMLElement, {
    target: { value: 'A1B2C3D' },
  });

  if (supportEmail && isIoSignProduct(productId)) {
    fireEvent.change(document.getElementById(supportEmail) as HTMLInputElement, {
      target: { value: 'a@a.it' },
    });
  }
};
