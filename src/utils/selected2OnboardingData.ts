import { InstitutionType, PartyData } from '../../types';
import { OnboardingFormData } from '../model/OnboardingFormData';
import {
  shouldUseBusinessTaxIdAsOriginId,
  shouldUsePdndInfocamereFallback,
  shouldIncludeLegalForm,
  isMockEnvironment,
} from './institutionTypeUtils';

const getOriginId = (
  selectedParty: PartyData | null,
  institutionType?: InstitutionType,
  productId?: string
): string | undefined => {
  if (shouldUseBusinessTaxIdAsOriginId(institutionType, productId)) {
    return selectedParty?.businessTaxId;
  }
  return selectedParty?.codiceUniUo ?? selectedParty?.codiceUniAoo ?? selectedParty?.originId;
};

const getOrigin = (
  selectedParty: PartyData | null,
  institutionType?: InstitutionType,
  productId?: string
): string | undefined => {
  if (shouldUsePdndInfocamereFallback(institutionType, productId)) {
    return selectedParty?.origin ?? 'PDND_INFOCAMERE';
  }
  return selectedParty?.origin;
};

const getRea = (selectedParty: PartyData | null): string | undefined => {
  const hasCameraCommerceData = selectedParty?.cciaa && selectedParty?.nRea;

  if (!hasCameraCommerceData) {
    return undefined;
  }

  if (isMockEnvironment()) {
    return selectedParty?.nRea;
  }

  return `${selectedParty?.cciaa}-${selectedParty?.nRea}`;
};

const getBusinessName = (party: Partial<PartyData>): string =>
  party.description ?? party.businessName ?? party.denominazioneEnte ?? '';

const getDigitalAddress = (selectedParty: PartyData | null): string =>
  selectedParty?.tipoMail1 === 'Pec' ? selectedParty.mail1 : (selectedParty?.digitalAddress ?? '');

const getRegisteredOffice = (party: Partial<PartyData>): string =>
  party.registeredOffice ?? party.indirizzo ?? party.address ?? '';

const getTaxCode = (party: Partial<PartyData>): string =>
  party.codiceFiscaleEnte ?? party.taxCode ?? party.businessTaxId ?? '';

export const selected2OnboardingData = (
  selectedParty: PartyData | null,
  isAggregator?: boolean,
  institutionType?: InstitutionType,
  productId?: string
): OnboardingFormData => {
  const party: Partial<PartyData> = selectedParty ?? {};
  return {
    businessName: getBusinessName(party),
    aooName: party.denominazioneAoo,
    legalForm: shouldIncludeLegalForm(institutionType, productId) ? party.legalForm : undefined,
    uoName: party.descrizioneUo,
    aooUniqueCode: party.codiceUniAoo,
    uoUniqueCode: party.codiceUniUo,
    digitalAddress: getDigitalAddress(selectedParty),
    recipientCode: party.codiceUniAoo ?? party.codiceUniUo,
    registeredOffice: getRegisteredOffice(party),
    taxCode: getTaxCode(party),
    vatNumber: party.vatNumber ?? '',
    taxCodeInvoicing: party.codiceFiscaleSfe,
    zipCode: party.cap ?? party.zipCode,
    geographicTaxonomies: [],
    originIdEc: party.originId,
    originId: getOriginId(selectedParty, institutionType, productId),
    origin: getOrigin(selectedParty, institutionType, productId),
    rea: getRea(selectedParty),
    city: party.city,
    county: party.county,
    isAggregator,
    externalId: party.businessTaxId ?? party.id ?? '',
    istatCode: party.codiceComuneISTAT ?? party.istatCode,
    registerType: party.registerType,
    institutionType: party.institutionType,
  };
};
