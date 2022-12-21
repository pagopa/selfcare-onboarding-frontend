import { GeographicTaxonomy } from './GeographicTaxonomies';

export type OnboardingFormData = {
  // Ragione sociale
  businessName: string;
  // Sede legale
  registeredOffice: string;
  // Codice di avviamento postale
  zipCode: string;
  // Indirizzo PEC
  digitalAddress: string;
  // Codice fiscale
  taxCode: string;
  // Partita iva
  vatNumber: string;
  // Codice destinatario
  recipientCode: string;
  // servizi pubblici
  publicServices?: boolean;
  // n. iscrizione al Registro delle Imprese
  commercialRegisterNumber?: string;
  // iscrizione all'Albo
  registrationInRegister?: string;
  // numero iscrizione albo
  registerNumber?: string;
  // codice ABI
  abiCode?: string;
  // La partita IVA è di gruppo
  vatNumberGroup?: boolean;
  // Indirizzo DPO
  dpoAddress?: string;
  // Indirizzo PEC DPO
  dpoPecAddress?: string;
  // Indirizzo Email DPO
  dopEmailAddress?: string;
  // tassonomia geografica
  geographicTaxonomies: Array<GeographicTaxonomy>;
};
