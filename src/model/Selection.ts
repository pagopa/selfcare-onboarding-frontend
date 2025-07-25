export enum SelectionEnum {
  businessName = 'businessName',
  aooCode = 'aooCode',
  uoCode = 'uoCode',
  reaCode = 'reaCode',
  personalTaxCode = 'personalTaxCode',
  taxCode = 'taxCode',
  ivassCode = 'ivassCode',
}

export type SelectionsState = {
  businessName: boolean;
  aooCode: boolean;
  uoCode: boolean;
  reaCode: boolean;
  personalTaxCode: boolean;
  taxCode: boolean;
  ivassCode: boolean;
};
