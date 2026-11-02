export type IpaCategories = Partial<Record<'PA' | 'GSP' | 'SCEC', string>>;

export type MerchantDetails = {
  allowedInstitutions?: string;
  allowedInstitution?: string;
};

export type ProductFilterConfig = {
  ipa?: IpaCategories;
  merchantDetails?: MerchantDetails;
  consumptionPlan?: { pricingPlan?: string };
};

// Shape of the CDN `assets/config.json` (bundled copy in src/utils/config.json).
export type FilterCategoriesResponse = {
  product?: Partial<Record<string, ProductFilterConfig>>;
};

// IPA categories for the party search, or the merchant details for prod-idpay-merchant.
export type FilterCategories = string | MerchantDetails | undefined;
