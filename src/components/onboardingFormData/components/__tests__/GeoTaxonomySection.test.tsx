import '@testing-library/jest-dom';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { mockedGeoTaxonomy } from '../../../../lib/__mocks__/mockApiRequests';
import { renderComponentWithProviders } from '../../../../utils/test/test-utils';
import GeoTaxonomySection from '../GeoTaxonomySection';

vi.mock('lodash/debounce', () => ({
  default: (fn: any) => {
    const immediate = (...args: any[]) => fn(...args);
    immediate.cancel = vi.fn();
    return immediate;
  },
}));

vi.mock(
  '../../../services/geoTaxonomyServices',
  async () => await vi.importActual('../../../services/geoTaxonomyServices')
);

const originalFetch = global.fetch;

beforeEach(() => {
  vi.stubEnv('VITE_MOCK_API', 'true');
});

afterEach(() => {
  vi.unstubAllEnvs();
  global.fetch = originalFetch;
});

const mockedNonNationalGeoTaxonomy = [
  {
    code: 'not ita',
    desc: 'ITALIA',
    region: '12',
    province: '058',
    provinceAbbreviation: 'RM',
    country: 'ITA',
    countryAbbreviation: 'IT',
    startDate: '1871-01-15',
    endDate: null,
    enable: true,
  },
  {
    code: '015143',
    desc: 'Milano - Comune',
    region: '03',
    province: '015',
    provinceAbbreviation: 'MI',
    country: 'ITA',
    countryAbbreviation: 'IT',
    startDate: '1861-03-18',
    endDate: null,
    enable: true,
  },
];

test('should render GeoTaxonomySection with empty retrievedTaxonomies', async () => {
  renderComponentWithProviders(
    <GeoTaxonomySection
      retrievedTaxonomies={[]}
      setGeographicTaxonomies={vi.fn()}
      formik={undefined}
    />
  );

  const chooseNationalArea = await screen.findByText('INDICA L\u2019AREA GEOGRAFICA');
  expect(chooseNationalArea).toBeInTheDocument();
});

test('should render GeoTaxonomySection with mocked retrievedTaxonomies and click on local radio button for changing the value of autocomplete', async () => {
  renderComponentWithProviders(
    <GeoTaxonomySection
      retrievedTaxonomies={mockedGeoTaxonomy}
      setGeographicTaxonomies={vi.fn()}
      formik={undefined}
    />
  );

  const radioLocal = screen.getByLabelText('Locale');
  fireEvent.click(radioLocal);
  expect(radioLocal).toHaveProperty('checked', true);

  // After clicking Locale the autocomplete area appears synchronously
  const [input] = screen.getAllByLabelText('Comune, Provincia o Regione') as HTMLInputElement[];

  // Select a comune
  fireEvent.click(input);
  fireEvent.change(input, { target: { value: 'Mil' } });
  await waitFor(() => screen.getByText('Milano (MI) comune'), { timeout: 15000 });
  fireEvent.click(screen.getByText('Milano (MI) comune'));
  await waitFor(() => expect(input.value).toBe('Milano (MI)'), { timeout: 15000 });

  // Clear and select a regione (reuse same DOM node — stable because key=index)
  fireEvent.click(screen.getByLabelText('Clear'));
  fireEvent.click(input);
  fireEvent.change(input, { target: { value: 'Emilia' } });
  await waitFor(() => screen.getByText('Emilia - Romagna'), { timeout: 15000 });
  fireEvent.click(screen.getByText('Emilia - Romagna'));
  await waitFor(() => expect(input.value).toBe('Emilia - Romagna'), { timeout: 15000 });
}, 30000);

test('should render GeoTaxonomySection with mocked retrievedTaxonomies and click on national radio button', async () => {
  renderComponentWithProviders(
    <GeoTaxonomySection
      retrievedTaxonomies={mockedGeoTaxonomy}
      setGeographicTaxonomies={vi.fn()}
      formik={undefined}
    />
  );

  // Find the radio button and choose local
  const radioNational = screen.getByLabelText('Nazionale');

  // Simulate a click on the radio button
  fireEvent.click(radioNational);

  expect(radioNational).toHaveProperty('checked', true);
});

test('should render GeoTaxonomySection with mocked retrievedTaxonomies and code !== ITA', async () => {
  renderComponentWithProviders(
    <GeoTaxonomySection
      retrievedTaxonomies={mockedNonNationalGeoTaxonomy}
      setGeographicTaxonomies={vi.fn()}
      formik={undefined}
    />
  );
});
