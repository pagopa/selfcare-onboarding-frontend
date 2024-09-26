export type OnboardedParty = {
  id: string;
  description: string;
  productId: string;
  institutionType: string;
  taxCode: string;
  parentDescription?: string;
  origin?: string;
  originId?: string;
  subunitCode?: string;
};
