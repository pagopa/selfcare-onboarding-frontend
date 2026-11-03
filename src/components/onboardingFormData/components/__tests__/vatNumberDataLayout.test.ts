import { describe, expect, it } from 'vitest';
import { OnboardingControllers } from '../../../../hooks/useOnboardingControllers';
import { PRODUCT_IDS } from '../../../../utils/constants';
import { getVatNumberLayout, VatNumberLayoutParams } from '../vatNumberDataLayout';

const controllers: OnboardingControllers = {
  isPremium: false,
  isDisabled: false,
  isInvoiceable: true,
  isForeignInsurance: false,
  isFromIPA: false,
  isAooUo: false,
};

const layoutOf = (overrides: Partial<VatNumberLayoutParams> = {}) =>
  getVatNumberLayout({
    controllers,
    values: { hasVatnumber: true, taxCode: '12345678901' },
    institutionType: 'PA',
    productId: PRODUCT_IDS.SEND,
    isTaxCodeEquals2PIVA: false,
    ...overrides,
  });

describe('getVatNumberLayout', () => {
  it('shows checkboxes and vat number for a default party', () => {
    expect(layoutOf()).toEqual({
      showCheckboxes: true,
      checkboxesMarginBottom: 0,
      showTaxCodeEquals2PIVA: true,
      isTaxCodeEquals2PIVADisabled: false,
      showPartyWithoutVatNumber: true,
      partyWithoutVatNumberMarginBottom: 0,
      showVatNumber: true,
      isVatNumberLocked: false,
      isVatNumberDisabled: false,
      showVatNumberGroup: false,
      isVatNumberGroupDisabled: false,
    });
  });

  it('hides checkboxes and vat number for a foreign insurance', () => {
    const layout = layoutOf({
      institutionType: 'AS',
      controllers: { ...controllers, isForeignInsurance: true },
    });
    expect(layout.showCheckboxes).toBe(false);
    expect(layout.showVatNumber).toBe(false);
  });

  it('pulls up the checkboxes of an invoiceable insurance without vat number', () => {
    const layout = layoutOf({
      institutionType: 'AS',
      values: { hasVatnumber: false },
    });
    expect(layout.checkboxesMarginBottom).toBe(-3);
    expect(layout.partyWithoutVatNumberMarginBottom).toBe(-2);
    expect(layout.showTaxCodeEquals2PIVA).toBe(false);
    expect(layout.showVatNumber).toBe(false);
  });

  it.each([
    ['', false],
    ['12345678901', true],
  ])('shows tax code equals vat number for insurance with tax code "%s": %s', (taxCode, shown) => {
    const layout = layoutOf({ institutionType: 'AS', onboardingFormData: { taxCode } });
    expect(layout.showTaxCodeEquals2PIVA).toBe(shown);
  });

  it.each([PRODUCT_IDS.FD, PRODUCT_IDS.FD_GARANTITO])(
    'hides party without vat number for %s',
    (productId) => {
      expect(layoutOf({ productId }).showPartyWithoutVatNumber).toBe(false);
    }
  );

  it('locks the vat number for a private merchant', () => {
    const layout = layoutOf({ institutionType: 'PRV', productId: PRODUCT_IDS.IDPAY_MERCHANT });
    expect(layout.showTaxCodeEquals2PIVA).toBe(false);
    expect(layout.showPartyWithoutVatNumber).toBe(false);
    expect(layout.isVatNumberLocked).toBe(false);
    expect(layout.isVatNumberDisabled).toBe(true);
  });

  it('disables tax code equals vat number when the tax code is not 11 chars long', () => {
    expect(
      layoutOf({ values: { hasVatnumber: true, taxCode: '123' } }).isTaxCodeEquals2PIVADisabled
    ).toBe(true);
  });

  it.each([
    ['premium', { controllers: { ...controllers, isPremium: true } }],
    ['tax code equals vat number', { isTaxCodeEquals2PIVA: true }],
  ])('locks and disables the vat number when %s', (_label, overrides) => {
    const layout = layoutOf(overrides);
    expect(layout.isVatNumberLocked).toBe(true);
    expect(layout.isVatNumberDisabled).toBe(true);
  });

  it('shows the group vat number for PSP and disables it when premium with registry data', () => {
    expect(layoutOf({ institutionType: 'PSP' }).showVatNumberGroup).toBe(true);
    expect(
      layoutOf({
        institutionType: 'PSP',
        controllers: { ...controllers, isPremium: true },
        pspData: {
          businessRegisterNumber: '',
          legalRegisterName: '',
          legalRegisterNumber: '',
          abiCode: '',
          vatNumberGroup: true,
        },
      }).isVatNumberGroupDisabled
    ).toBe(true);
  });
});
