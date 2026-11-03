import { describe, expect, it } from 'vitest';
import { OnboardingControllers } from '../../../../hooks/useOnboardingControllers';
import { OnboardingFormData } from '../../../../model/OnboardingFormData';
import { PRODUCT_IDS } from '../../../../utils/constants';
import { getInvoiceLayout, InvoiceLayoutParams } from '../invoiceDataLayout';

const controllers: OnboardingControllers = {
  isPremium: false,
  isDisabled: false,
  isInvoiceable: true,
  isForeignInsurance: false,
  isFromIPA: false,
  isAooUo: false,
};

const formValues = (recipientCode?: string): OnboardingFormData => ({
  businessName: '',
  registeredOffice: '',
  digitalAddress: '',
  geographicTaxonomies: [],
  recipientCode,
});

const layoutOf = (overrides: Partial<InvoiceLayoutParams> = {}) =>
  getInvoiceLayout({
    controllers,
    productId: PRODUCT_IDS.SEND,
    institutionType: 'PA',
    taxCodeInvoicingVisible: true,
    formik: { values: formValues(), initialValues: formValues(), errors: {} },
    ...overrides,
  });

const premiumWithRecipientCode = (errors: { recipientCode?: string } = {}) =>
  layoutOf({
    controllers: { ...controllers, isPremium: true },
    formik: { values: formValues('ABC123'), initialValues: formValues('ABC123'), errors },
  });

describe('getInvoiceLayout', () => {
  it('shows SDI code and tax code SFE for an invoiceable PA', () => {
    expect(layoutOf()).toEqual({
      showRecipientCode: true,
      isPaOrAooUo: true,
      isRecipientCodeDisabled: false,
      recipientCodeError: undefined,
      showTaxCodeInvoicing: true,
      showOriginId: false,
      originIdMarginTop: 0,
    });
  });

  it('hides SDI code and tax code SFE when not invoiceable', () => {
    const layout = layoutOf({ controllers: { ...controllers, isInvoiceable: false } });
    expect(layout.showRecipientCode).toBe(false);
    expect(layout.showTaxCodeInvoicing).toBe(false);
  });

  it.each([
    [undefined, false],
    [PRODUCT_IDS.IO_PREMIUM, true],
  ])('on prod-io with sub product %s shows SDI code: %s', (subProductId, shown) => {
    expect(layoutOf({ productId: PRODUCT_IDS.IO, subProductId }).showRecipientCode).toBe(shown);
  });

  it('treats AOO/UO like a PA and shows tax code SFE for UO', () => {
    const layout = layoutOf({
      institutionType: 'GSP',
      controllers: { ...controllers, isAooUo: true },
      onboardingFormData: { uoUniqueCode: 'UO1' },
    });
    expect(layout.isPaOrAooUo).toBe(true);
    expect(layout.showTaxCodeInvoicing).toBe(true);
  });

  it('hides tax code SFE for non PA, non UO parties or when not visible', () => {
    expect(layoutOf({ institutionType: 'GSP' }).showTaxCodeInvoicing).toBe(false);
    expect(layoutOf({ taxCodeInvoicingVisible: false }).showTaxCodeInvoicing).toBe(false);
  });

  it('disables SDI code for premium with a valid recipient code already set', () => {
    expect(premiumWithRecipientCode().isRecipientCodeDisabled).toBe(true);
  });

  it('keeps SDI code enabled for premium when the recipient code has an error', () => {
    const layout = premiumWithRecipientCode({ recipientCode: 'Invalid' });
    expect(layout.isRecipientCodeDisabled).toBe(false);
    expect(layout.recipientCodeError).toBe('Invalid');
  });

  it('does not expose the "Required" error', () => {
    expect(premiumWithRecipientCode({ recipientCode: 'Required' }).recipientCodeError).toBe(
      undefined
    );
  });

  it('shows origin id for insurance companies, pulled up when foreign', () => {
    const layout = layoutOf({
      institutionType: 'AS',
      controllers: { ...controllers, isForeignInsurance: true },
    });
    expect(layout.showOriginId).toBe(true);
    expect(layout.originIdMarginTop).toBe(-3);
  });
});
