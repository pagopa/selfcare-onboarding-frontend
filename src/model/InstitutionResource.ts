export type InstitutionResource = {
    id:string;
    originId:string;
    o?:string;
    ou?:string;
    aoo?:string;
    taxCode:string;
    category?:string;
    description:string;
    digitalAddress:string;
    address:string;
    zipCode:string;
    origin:Origin;
  };

export enum Origin {
    'MOCK' = 'static',
    'IPA' = 'IPA',
    'INFOCAMERE' = 'INFOCAMERE'
}