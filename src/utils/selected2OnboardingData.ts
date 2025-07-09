import { InstitutionType, PartyData } from '../../types';
import { OnboardingFormData } from '../model/OnboardingFormData';
import { PRODUCT_IDS } from './constants';

// eslint-disable-next-line complexity
export const selected2OnboardingData = (
  selectedParty: PartyData | null,
  isAggregator?: boolean,
  institutionType?: InstitutionType,
  productId?: string
  // eslint-disable-next-line sonarjs/cognitive-complexity
): OnboardingFormData => ({
  businessName:
    selectedParty?.description ??
    selectedParty?.businessName ??
    selectedParty?.denominazioneEnte ??
    '',
  aooName: selectedParty?.denominazioneAoo,
  uoName: selectedParty?.descrizioneUo,
  aooUniqueCode: selectedParty?.codiceUniAoo,
  uoUniqueCode: selectedParty?.codiceUniUo,
  digitalAddress:
    selectedParty?.tipoMail1 === 'Pec' ? selectedParty?.mail1 : selectedParty?.digitalAddress ?? '',
  recipientCode: selectedParty?.codiceUniAoo ?? selectedParty?.codiceUniUo,
  registeredOffice:
    selectedParty?.registeredOffice ?? selectedParty?.indirizzo ?? selectedParty?.address ?? '',
  taxCode:
    selectedParty?.codiceFiscaleEnte ??
    selectedParty?.taxCode ??
    selectedParty?.businessTaxId ??
    '',
  vatNumber: '',
  taxCodeInvoicing: selectedParty?.codiceFiscaleSfe,
  zipCode: selectedParty?.CAP ?? selectedParty?.zipCode,
  geographicTaxonomies: [],
  originIdEc: selectedParty?.originId,
  originId:
    institutionType === 'PRV' && productId === PRODUCT_IDS.INTEROP || institutionType === 'SCP'
      ? selectedParty?.businessTaxId
      : selectedParty?.codiceUniUo ?? selectedParty?.codiceUniAoo ?? selectedParty?.originId,
  origin:
    institutionType === 'PRV' && productId === PRODUCT_IDS.INTEROP || institutionType === 'SCP'
      ? 'PDND_INFOCAMERE'
      : selectedParty?.origin,
  rea:
    selectedParty?.cciaa && selectedParty?.nRea
      ? `${selectedParty?.cciaa}-${selectedParty?.nRea}`
      : undefined,
  city: selectedParty?.city,
  county: selectedParty?.county,
  isAggregator,
  externalId: selectedParty?.businessTaxId ?? selectedParty?.id ?? '',
  istatCode: selectedParty?.codiceComuneISTAT ?? selectedParty?.istatCode,
  registerType: selectedParty?.registerType,
  institutionType: selectedParty?.institutionType,
});
