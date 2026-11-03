import { PartyData } from '../../../types';
import { selected2OnboardingData } from '../selected2OnboardingData';

const toParty = (party: Record<string, unknown>) => party as unknown as PartyData;

it('test selected2OnboardingData maps a missing party to empty defaults', () => {
  expect(selected2OnboardingData(null)).toEqual({
    businessName: '',
    aooName: undefined,
    legalForm: undefined,
    uoName: undefined,
    aooUniqueCode: undefined,
    uoUniqueCode: undefined,
    digitalAddress: '',
    recipientCode: undefined,
    registeredOffice: '',
    taxCode: '',
    vatNumber: '',
    taxCodeInvoicing: undefined,
    zipCode: undefined,
    geographicTaxonomies: [],
    originIdEc: undefined,
    originId: undefined,
    origin: undefined,
    rea: undefined,
    city: undefined,
    county: undefined,
    isAggregator: undefined,
    externalId: '',
    istatCode: undefined,
    registerType: undefined,
    institutionType: undefined,
  });
});

it('test selected2OnboardingData maps an IPA UO party preferring IPA fields', () => {
  const party = toParty({
    denominazioneEnte: 'Comune',
    descrizioneUo: 'Ufficio',
    codiceUniUo: 'UO1',
    codiceUniAoo: 'AOO1',
    tipoMail1: 'Pec',
    mail1: 'pec@comune.it',
    digitalAddress: 'other@comune.it',
    indirizzo: 'Via Roma 1',
    codiceFiscaleEnte: '00000000001',
    codiceFiscaleSfe: '00000000002',
    cap: '00100',
    codiceComuneISTAT: '058091',
    originId: 'ipa-1',
    origin: 'IPA',
    id: 'party-id',
  });

  expect(selected2OnboardingData(party, true)).toEqual(
    expect.objectContaining({
      businessName: 'Comune',
      uoName: 'Ufficio',
      digitalAddress: 'pec@comune.it',
      recipientCode: 'AOO1',
      registeredOffice: 'Via Roma 1',
      taxCode: '00000000001',
      taxCodeInvoicing: '00000000002',
      zipCode: '00100',
      originIdEc: 'ipa-1',
      originId: 'UO1',
      origin: 'IPA',
      isAggregator: true,
      externalId: 'party-id',
      istatCode: '058091',
    })
  );
});

it('test selected2OnboardingData maps a registry party using generic fields', () => {
  const party = toParty({
    description: 'ACME',
    businessName: 'ACME spa',
    digitalAddress: 'acme@pec.it',
    address: 'Via Milano 2',
    taxCode: '00000000003',
    businessTaxId: '00000000004',
    vatNumber: 'IT00000000003',
    zipCode: '20100',
    istatCode: '015146',
    city: 'Milano',
    county: 'MI',
    registerType: 'REG',
    institutionType: 'PRV',
  });

  expect(selected2OnboardingData(party)).toEqual(
    expect.objectContaining({
      businessName: 'ACME',
      digitalAddress: 'acme@pec.it',
      registeredOffice: 'Via Milano 2',
      taxCode: '00000000003',
      vatNumber: 'IT00000000003',
      zipCode: '20100',
      externalId: '00000000004',
      istatCode: '015146',
      city: 'Milano',
      county: 'MI',
      registerType: 'REG',
      institutionType: 'PRV',
    })
  );
});
