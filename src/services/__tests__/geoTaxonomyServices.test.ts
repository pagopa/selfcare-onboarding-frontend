import { it, expect, vi, beforeEach } from 'vitest';
import { OnboardingApi } from '../../api/OnboardingApiClient';
import { PartyRegistryProxyApi } from '../../api/PartyRegistryProxyApiClient';
import {
  getCountriesFromGeotaxonomies,
  getPreviousGeotaxononomies,
  getLocationFromIstatCode,
  handleSearch,
} from '../geoTaxonomyServices';

vi.mock('../../api/OnboardingApiClient', () => ({
  OnboardingApi: {
    getPreviousGeotaxonomy: vi.fn(),
  },
}));

vi.mock('../../api/PartyRegistryProxyApiClient', () => ({
  PartyRegistryProxyApi: {
    getTaxonomiesByQuery: vi.fn(),
    getLocationByCode: vi.fn(),
  },
}));

const setCountries = vi.fn();
const setRequiredLogin = vi.fn();
const setPreviousGeotaxononomies = vi.fn();
const setInstitutionLocationData = vi.fn();
const setOptions = vi.fn();
const findError = vi.fn();
const deleteError = vi.fn();
const setIsAddNewAutocompleteEnabled = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
});

it('test getCountriesFromGeotaxonomies maps and filters - COMUNE entries', async () => {
  vi.mocked(PartyRegistryProxyApi.getTaxonomiesByQuery).mockResolvedValue([
    {
      code: 'c1',
      country_abbreviation: 'IT',
      province_abbreviation: 'MI',
      desc: 'MILANO - COMUNE',
      istat_code: '1',
    },
    {
      code: 'c2',
      country_abbreviation: 'IT',
      province_abbreviation: 'RM',
      desc: 'ROMA - PROVINCIA',
      istat_code: '2',
    },
  ] as any);

  await getCountriesFromGeotaxonomies('Mil', setCountries, setRequiredLogin);

  expect(setCountries).toHaveBeenCalledWith([
    expect.objectContaining({ code: 'c1', country: 'IT', city: expect.any(String) }),
  ]);
});

it('test getCountriesFromGeotaxonomies on error does nothing', async () => {
  vi.mocked(PartyRegistryProxyApi.getTaxonomiesByQuery).mockRejectedValue(new Error('boom'));
  await getCountriesFromGeotaxonomies('Mil', setCountries, setRequiredLogin);
  expect(setCountries).not.toHaveBeenCalled();
});

it('test getPreviousGeotaxononomies success', async () => {
  vi.mocked(OnboardingApi.getPreviousGeotaxonomy).mockResolvedValue([{ code: '1' }] as any);
  await getPreviousGeotaxononomies(
    'tax-1',
    undefined,
    undefined,
    setPreviousGeotaxononomies,
    setRequiredLogin
  );
  expect(OnboardingApi.getPreviousGeotaxonomy).toHaveBeenCalledWith('tax-1', undefined);
  expect(setPreviousGeotaxononomies).toHaveBeenCalled();
});

it('test getPreviousGeotaxononomies passes aoo subunitCode when aooSelected', async () => {
  vi.mocked(OnboardingApi.getPreviousGeotaxonomy).mockResolvedValue([] as any);
  await getPreviousGeotaxononomies(
    'tax-1',
    { codiceUniAoo: 'AOO1' } as any,
    undefined,
    setPreviousGeotaxononomies,
    setRequiredLogin
  );
  expect(OnboardingApi.getPreviousGeotaxonomy).toHaveBeenCalledWith('tax-1', 'AOO1');
});

it('test getLocationFromIstatCode maps result fields', async () => {
  vi.mocked(PartyRegistryProxyApi.getLocationByCode).mockResolvedValue({
    code: 'c1',
    country_abbreviation: 'IT',
    province_abbreviation: 'MI',
    desc: 'MILANO',
  } as any);

  await getLocationFromIstatCode(setInstitutionLocationData, setRequiredLogin, '12345');

  expect(setInstitutionLocationData).toHaveBeenCalledWith(
    expect.objectContaining({ code: 'c1', country: 'IT', county: 'MI' })
  );
});

it('test getLocationFromIstatCode skips when istatCode missing', async () => {
  await getLocationFromIstatCode(setInstitutionLocationData, setRequiredLogin, undefined);
  expect(PartyRegistryProxyApi.getLocationByCode).not.toHaveBeenCalled();
});

it('test handleSearch sets options and clears error when matches found', async () => {
  vi.mocked(PartyRegistryProxyApi.getTaxonomiesByQuery).mockResolvedValue([
    { code: 'c1', desc: 'MILANO' },
  ] as any);

  await handleSearch(
    'Mil',
    0,
    setRequiredLogin,
    [],
    setOptions,
    findError,
    deleteError,
    setIsAddNewAutocompleteEnabled
  );

  expect(setOptions).toHaveBeenCalled();
  expect(deleteError).toHaveBeenCalledWith(0);
});

it('test handleSearch on 404 sets empty options', async () => {
  const err404 = Object.assign(new Error('not found'), { httpStatus: 404 });
  vi.mocked(PartyRegistryProxyApi.getTaxonomiesByQuery).mockRejectedValue(err404);

  await handleSearch(
    'xx',
    0,
    setRequiredLogin,
    [],
    setOptions,
    findError,
    deleteError,
    setIsAddNewAutocompleteEnabled
  );

  expect(setOptions).toHaveBeenCalledWith([]);
});

it('test handleSearch on other errors does nothing', async () => {
  const err500 = Object.assign(new Error('boom'), { httpStatus: 500 });
  vi.mocked(PartyRegistryProxyApi.getTaxonomiesByQuery).mockRejectedValue(err500);

  await handleSearch(
    'xx',
    0,
    setRequiredLogin,
    [],
    setOptions,
    findError,
    deleteError,
    setIsAddNewAutocompleteEnabled
  );

  expect(setOptions).not.toHaveBeenCalled();
});
