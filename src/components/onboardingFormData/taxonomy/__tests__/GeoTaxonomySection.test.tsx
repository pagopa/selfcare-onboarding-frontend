import { fireEvent, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { nationalValue } from '../../../../model/GeographicTaxonomies';
import { renderComponentWithProviders } from '../../../../utils/test-utils';
import GeoTaxonomySection from '../GeoTaxonomySection';

const oldWindowLocation = global.window.location;
const initialLocation = {
  assign: jest.fn(),
  pathname: '',
  origin: 'MOCKED_ORIGIN',
  search: '?pricingPlan=FA',
  hash: '',
  state: undefined,
};
const mockedLocation = Object.assign({}, initialLocation);

beforeAll(() => {
  Object.defineProperty(window, 'location', { value: mockedLocation });
});
afterAll(() => {
  Object.defineProperty(window, 'location', { value: oldWindowLocation });
});

beforeEach(() => Object.assign(mockedLocation, initialLocation));

jest.mock('react-router-dom', () => ({
  useHistory: () => ({
    location: mockedLocation,
    replace: (nextLocation) => Object.assign(mockedLocation, nextLocation),
  }),
}));

const mockedNationalGeoTaxonomy = [
  {
    code: nationalValue,
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
    code: '015146',
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
  {
    code: '015456',
    desc: 'Napoli - Comune',
    region: '08',
    province: '018',
    provinceAbbreviation: 'NA',
    country: '100',
    countryAbbreviation: 'IT',
    startDate: '1861-03-18',
    endDate: null,
    enable: true,
  },
  {
    code: '015456',
    desc: 'Milazzo - Comune',
    region: '08',
    province: '016',
    provinceAbbreviation: 'GE',
    country: '100',
    countryAbbreviation: 'IT',
    startDate: '1861-03-18',
    endDate: null,
    enable: true,
  },
];

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
    code: '015146',
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
  {
    code: '015456',
    desc: 'Napoli - Comune',
    region: '08',
    province: '018',
    provinceAbbreviation: 'NA',
    country: '100',
    countryAbbreviation: 'IT',
    startDate: '1861-03-18',
    endDate: null,
    enable: true,
  },
  {
    code: '015456',
    desc: 'Milazzo - Comune',
    region: '08',
    province: '016',
    provinceAbbreviation: 'GE',
    country: '100',
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
      setGeographicTaxonomies={jest.fn()}
      formik={undefined}
    />
  );

  const chooseNationalArea = await screen.findByText('INDICA L’AREA GEOGRAFICA');
  expect(chooseNationalArea).toBeInTheDocument();
});

test('should render GeoTaxonomySection with mocked retrievedTaxonomies and click on local radio button', async () => {
  renderComponentWithProviders(
    <GeoTaxonomySection
      retrievedTaxonomies={mockedNationalGeoTaxonomy}
      setGeographicTaxonomies={jest.fn()}
      formik={undefined}
    />
  );

  // Find the radio button and choose local
  const radioLocal = screen.getByLabelText('Locale');

  // Simulate a click on the radio button
  fireEvent.click(radioLocal);

  expect(radioLocal).toBeChecked();

  const selectArea = (await screen.findAllByLabelText(
    'Comune, Provincia o Regione'
  )) as HTMLSelectElement[];

  expect(selectArea.length).toBe(1);

  fireEvent.change(selectArea[0], {
    target: {
      value: 'Milano - Comune',
    },
  });

  await waitFor(() => {
    expect(selectArea[0].value).toBe('Milano - Comune');
  });

  // Get the button element by its aria-label attribute
  const clearButton = screen.getByLabelText('Clear');

  fireEvent.click(clearButton);

  await waitFor(() => {
    expect(selectArea[0].value).toBe('');
  });

  const addButton = screen.getByText('Aggiungi area') as HTMLButtonElement;

  console.log(addButton.disabled);

  fireEvent.click(addButton);
});

test('should render GeoTaxonomySection with mocked retrievedTaxonomies and click on national radio button', async () => {
  renderComponentWithProviders(
    <GeoTaxonomySection
      retrievedTaxonomies={mockedNationalGeoTaxonomy}
      setGeographicTaxonomies={jest.fn()}
      formik={undefined}
    />
  );

  // Find the radio button and choose local
  const radioNational = screen.getByLabelText('Nazionale');

  // Simulate a click on the radio button
  fireEvent.click(radioNational);

  expect(radioNational).toBeChecked();
});

test('should render GeoTaxonomySection with mocked retrievedTaxonomies and code !== ITA', async () => {
  renderComponentWithProviders(
    <GeoTaxonomySection
      retrievedTaxonomies={mockedNonNationalGeoTaxonomy}
      setGeographicTaxonomies={jest.fn()}
      formik={undefined}
    />
  );
});
