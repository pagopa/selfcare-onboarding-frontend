import { describe, expect, it } from 'vitest';
import { PaymentServiceProviderDto } from '../../../../../types';
import { PRODUCT_IDS } from '../../../../utils/constants';
import {
  CommercialRegisterLayoutParams,
  getCommercialRegisterLayout,
  getPspFieldsDisabled,
} from '../commercialRegisterDataLayout';

const layoutOf = (overrides: Partial<CommercialRegisterLayoutParams> = {}) =>
  getCommercialRegisterLayout({
    isInfoCompany: false,
    institutionType: 'PA',
    productId: PRODUCT_IDS.SEND,
    isDisabled: false,
    errors: {},
    ...overrides,
  });

const registryPspData: PaymentServiceProviderDto = {
  businessRegisterNumber: '12345678901',
  legalRegisterName: 'Albo',
  legalRegisterNumber: '123',
  abiCode: '12345',
  vatNumberGroup: false,
};

const allDisabled = {
  commercialRegisterNumber: true,
  registrationInRegister: true,
  registerNumber: true,
  abiCode: true,
};

const allEnabled = {
  commercialRegisterNumber: false,
  registrationInRegister: false,
  registerNumber: false,
  abiCode: false,
};

describe('getCommercialRegisterLayout', () => {
  it('shows neither the commercial register nor the PSP fields for PA + prod-pn', () => {
    const layout = layoutOf();
    expect(layout.showCommercialRegister).toBe(false);
    expect(layout.showPspFields).toBe(false);
  });

  it('requires every commercial register field for SA', () => {
    expect(layoutOf({ institutionType: 'SA' })).toMatchObject({
      showCommercialRegister: true,
      isContractingAuthority: true,
      isRegisterPlaceRequired: true,
      isReaRequired: true,
      isShareCapitalRequired: true,
      showShareCapitalHelper: false,
    });
  });

  it.each([
    [
      PRODUCT_IDS.INTEROP,
      {
        isRegisterPlaceRequired: true,
        isReaRequired: true,
        isShareCapitalRequired: true,
        showShareCapitalHelper: false,
      },
    ],
    [
      PRODUCT_IDS.IDPAY_MERCHANT,
      {
        isRegisterPlaceRequired: true,
        isReaRequired: true,
        isShareCapitalRequired: false,
        showShareCapitalHelper: true,
      },
    ],
    [
      PRODUCT_IDS.PAGOPA,
      {
        isRegisterPlaceRequired: false,
        isReaRequired: false,
        isShareCapitalRequired: false,
        showShareCapitalHelper: false,
      },
    ],
    [
      PRODUCT_IDS.CED,
      {
        isRegisterPlaceRequired: false,
        isReaRequired: true,
        isShareCapitalRequired: false,
        showShareCapitalHelper: false,
      },
    ],
  ])('PRV on %s', (productId, expected) => {
    expect(layoutOf({ institutionType: 'PRV', productId })).toMatchObject({
      showCommercialRegister: true,
      isContractingAuthority: false,
      ...expected,
    });
  });

  it('shows the PSP fields for PSP', () => {
    expect(layoutOf({ institutionType: 'PSP' }).showPspFields).toBe(true);
  });
});

describe('getPspFieldsDisabled', () => {
  it('locks the fields that come from the registry', () => {
    expect(getPspFieldsDisabled(true, {}, registryPspData)).toEqual(allDisabled);
  });

  it('keeps every field enabled when not disabled or without registry data', () => {
    expect(getPspFieldsDisabled(false, {}, registryPspData)).toEqual(allEnabled);
    expect(getPspFieldsDisabled(true, {}, undefined)).toEqual(allEnabled);
  });

  it('keeps the register fields enabled when the registry returns N/A', () => {
    expect(
      getPspFieldsDisabled(
        true,
        {},
        { ...registryPspData, legalRegisterName: 'N/A', legalRegisterNumber: 'N/A' }
      )
    ).toEqual({ ...allDisabled, registrationInRegister: false, registerNumber: false });
  });

  it('keeps the fields with a validation error enabled', () => {
    expect(
      getPspFieldsDisabled(
        true,
        { commercialRegisterNumber: 'err', registerNumber: 'err', abiCode: 'err' },
        registryPspData
      )
    ).toEqual({ ...allEnabled, registrationInRegister: true });
  });
});
