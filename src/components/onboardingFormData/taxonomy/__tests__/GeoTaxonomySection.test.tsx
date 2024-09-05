import { fireEvent, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { nationalValue } from '../../../../model/GeographicTaxonomies';
import { renderComponentWithProviders } from '../../../../utils/test-utils';
import GeoTaxonomySection from '../GeoTaxonomySection';
import { mockedGeoTaxonomy } from '../../../../lib/__mocks__/mockApiRequests';
import { fetchWithLogs } from '../../../../lib/api-utils';

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
})

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
      setGeographicTaxonomies={jest.fn()}
      formik={undefined}
    />
  );

  const chooseNationalArea = await screen.findByText('INDICA L’AREA GEOGRAFICA');
  expect(chooseNationalArea).toBeInTheDocument();
});

test('should render GeoTaxonomySection with mocked retrievedTaxonomies and click on local radio button for changing the value of autocomplete', async () => {

  global.fetch = jest.fn().mockResolvedValueOnce({
    json: () => Promise.resolve(mockedGeoTaxonomy),
  });
  
  renderComponentWithProviders(
    <GeoTaxonomySection
      retrievedTaxonomies={mockedGeoTaxonomy}
      setGeographicTaxonomies={jest.fn()}
      formik={undefined}
    />
  );

  const radioLocal = screen.getByLabelText('Locale');
  fireEvent.click(radioLocal);
  expect(radioLocal).toBeChecked();
  const selectArea = screen.getAllByLabelText('Comune, Provincia o Regione') as HTMLSelectElement[];
  const clearButton = screen.getByLabelText('Clear');

  await waitFor(() => {
    

    fireEvent.click(selectArea[0]);
    fireEvent.change(selectArea[0], { target: { value: 'Mil' } });
    fireEvent.click(screen.getByText('Milano (MI) comune'));
    expect(selectArea[0].value).toBe('Milano (MI)');

    fireEvent.click(clearButton);

    const addButton = screen.getByText('Aggiungi area');
    fireEvent.click(addButton);
  });

  await waitFor(() => {
    fireEvent.click(selectArea[0]);
    fireEvent.change(selectArea[0], { target: { value: 'Mil' } });
    fireEvent.click(screen.getByText('Milano e provincia'));
    expect(selectArea[0].value).toBe('Milano e provincia');
    fireEvent.click(clearButton);
  });

  await waitFor(() => {
    fireEvent.click(selectArea[0]);
    fireEvent.change(selectArea[0], { target: { value: 'Mil' } });
    fireEvent.click(screen.getByText('Milano e provincia'));
    expect(selectArea[0].value).toBe('Milano e provincia');
    fireEvent.click(clearButton);
  });

  await waitFor(() => {
    fireEvent.click(selectArea[0]);
    fireEvent.change(selectArea[0], { target: { value: "l'A" } });
    fireEvent.click(screen.getByText("l'Aquila (AQ) comune"));
    expect(selectArea[0].value).toBe("l'Aquila (AQ)");
  });
});

test('should render GeoTaxonomySection with mocked retrievedTaxonomies and click on national radio button', async () => {
  renderComponentWithProviders(
    <GeoTaxonomySection
      retrievedTaxonomies={mockedGeoTaxonomy}
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
