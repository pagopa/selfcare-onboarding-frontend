import { InstitutionType } from '../../types';
import { PRODUCT_IDS } from './constants';

// ============================================
// Institution Type Checks
// ============================================

export const isPrivateInstitution = (institutionType?: InstitutionType): boolean =>
  institutionType === 'PRV';

export const isPrivatePersonInstitution = (institutionType?: InstitutionType): boolean =>
  institutionType === 'PRV_PF';

export const isPrivateOrPersonInstitution = (institutionType?: InstitutionType): boolean =>
  institutionType === 'PRV' || institutionType === 'PRV_PF';

export const isPublicServiceCompany = (institutionType?: InstitutionType): boolean =>
  institutionType === 'SCP';

export const isPublicAdministration = (institutionType?: InstitutionType): boolean =>
  institutionType === 'PA';

export const isPaymentServiceProvider = (institutionType?: InstitutionType): boolean =>
  institutionType === 'PSP';

export const isContractingAuthority = (institutionType?: InstitutionType): boolean =>
  institutionType === 'SA';

export const isInsuranceCompany = (institutionType?: InstitutionType): boolean =>
  institutionType === 'AS';

export const isGlobalServiceProvider = (institutionType?: InstitutionType): boolean =>
  institutionType === 'GSP';

export const isTechPartner = (institutionType?: InstitutionType): boolean =>
  institutionType === 'PT';

export const isGpuInstitution = (institutionType?: InstitutionType): boolean =>
  institutionType === 'GPU';

export const isConsolidatedEconomicAccountCompany = (institutionType?: InstitutionType): boolean =>
  institutionType === 'SCEC';
// ============================================
// Product Checks
// ============================================

export const isInteropProduct = (productId?: string): boolean => productId === PRODUCT_IDS.INTEROP;

export const isIdpayMerchantProduct = (productId?: string): boolean =>
  productId === PRODUCT_IDS.IDPAY_MERCHANT;

export const isInteropOrIdpayMerchantProduct = (productId?: string): boolean =>
  productId === PRODUCT_IDS.INTEROP || productId === PRODUCT_IDS.IDPAY_MERCHANT;

export const isPagoPaProduct = (productId?: string): boolean => productId === PRODUCT_IDS.PAGOPA;

export const isIoProduct = (productId?: string): boolean => productId === PRODUCT_IDS.IO;

export const isIoSignProduct = (productId?: string): boolean => productId === PRODUCT_IDS.IO_SIGN;

export const isSendProduct = (productId?: string): boolean => productId === PRODUCT_IDS.SEND;

export const isPagoPaInsights = (productId?: string): boolean =>
  productId === PRODUCT_IDS.DASHBOARD_PSP;

export const isIdPayProduct = (productId?: string): boolean => productId === PRODUCT_IDS.IDPAY;

export const isFideiussioniProduct = (productId?: string): boolean =>
  productId?.startsWith(PRODUCT_IDS.FD) ?? false;

export const isFideiussioniGuaranteeProduct = (productId?: string): boolean =>
  productId === PRODUCT_IDS.FD_GARANTITO;

// ============================================
// Combined Business Logic Checks
// ============================================

/**
 * PRV + INTEROP
 * Used for PDND private institutions
 */
export const isPdndPrivate = (institutionType?: InstitutionType, productId?: string): boolean =>
  isPrivateInstitution(institutionType) && isInteropProduct(productId);

/**
 * (PRV | PRV_PF) + IDPAY_MERCHANT
 * Used for private merchants in IDPay
 */
export const isPrivateMerchantInstitution = (
  institutionType?: InstitutionType,
  productId?: string
): boolean => isPrivateOrPersonInstitution(institutionType) && isIdpayMerchantProduct(productId);

/**
 * Determines if businessTaxId should be used as originId
 * Applies to: PRV + (INTEROP | IDPAY_MERCHANT) or SCP
 */
export const shouldUseBusinessTaxIdAsOriginId = (
  institutionType?: InstitutionType,
  productId?: string
): boolean =>
  (isPrivateInstitution(institutionType) && isInteropOrIdpayMerchantProduct(productId)) ||
  isPublicServiceCompany(institutionType);

/**
 * Determines if PDND_INFOCAMERE fallback should be used for origin
 * Applies to: (PRV | PRV_PF) + (INTEROP | IDPAY_MERCHANT) or SCP
 */
export const shouldUsePdndInfocamereFallback = (
  institutionType?: InstitutionType,
  productId?: string
): boolean =>
  (isPrivateOrPersonInstitution(institutionType) && isInteropOrIdpayMerchantProduct(productId)) ||
  isPublicServiceCompany(institutionType);

/**
 * Determines if legal form should be included
 * Applies to: (PRV | PRV_PF) + IDPAY_MERCHANT
 */
export const shouldIncludeLegalForm = (
  institutionType?: InstitutionType,
  productId?: string
): boolean => isPrivateOrPersonInstitution(institutionType) && isIdpayMerchantProduct(productId);

/**
 * Determines if categories filter should be skipped in API calls
 * Applies to: (INTEROP | IDPAY_MERCHANT) + (SCP | PRV)
 */
export const shouldSkipCategoriesFilter = (
  institutionType?: InstitutionType,
  productId?: string
): boolean =>
  isInteropOrIdpayMerchantProduct(productId) &&
  (isPublicServiceCompany(institutionType) || isPrivateInstitution(institutionType));

/**
 * Checks if the institution is an information company (GSP or SCP not from IPA)
 * Used to show additional fields in the form
 */
export const isInformationCompany = (
  origin?: string,
  institutionType?: InstitutionType,
  productId?: string
): boolean =>
  origin !== 'IPA' &&
  !isPrivateOrPersonInstitution(institutionType) &&
  (isGlobalServiceProvider(institutionType) || isPublicServiceCompany(institutionType)) &&
  (isIoProduct(productId) ||
    isIoSignProduct(productId) ||
    isPagoPaProduct(productId) ||
    isInteropProduct(productId));

// ============================================
// Environment Checks
// ============================================

export const isMockEnvironment = (): boolean => process.env.REACT_APP_MOCK_API === 'true';
