import { fireEvent, render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import '../../locale';
import { PartyData } from '../../../types';
import { AooData } from '../../model/AooData';
import { SelectionsState } from '../../model/Selection';
import AsyncAutocompleteResultsCode from '../autocomplete/components/asyncAutocomplete/components/AsyncAutocompleteResultsCode';

const noSelections: SelectionsState = {
  businessName: false,
  taxCode: false,
  aooCode: false,
  uoCode: false,
  ivassCode: false,
  reaCode: false,
  personalTaxCode: false,
};

const renderResults = (props: Partial<Parameters<typeof AsyncAutocompleteResultsCode>[0]>) => {
  const setSelected = vi.fn();
  const setCfResult = vi.fn();
  const view = render(
    <AsyncAutocompleteResultsCode
      setSelected={setSelected}
      setCfResult={setCfResult}
      getOptionLabel={vi.fn()}
      getOptionKey={vi.fn()}
      {...props}
    />
  );
  return { ...view, setSelected, setCfResult };
};

test('Test: renders nothing when the result for the current search type is missing', () => {
  const { container } = renderResults({
    cfResult: undefined,
    aooResult: { denominazioneAoo: 'stale aoo' } as AooData,
    selections: { ...noSelections, taxCode: true },
  });

  expect(container.innerHTML).toBe('');
});

test('Test: shows and selects the first party of the add-user list result', () => {
  const first = { id: 'first', description: 'Comune di Milano' } as PartyData;
  const second = { id: 'second', description: 'Comune di Roma' } as PartyData;
  // The add-user search stores the raw list returned by the API in cfResult
  const cfResult = [first, second] as unknown as PartyData;

  const { setSelected, setCfResult } = renderResults({
    cfResult,
    selections: { ...noSelections, taxCode: true },
  });

  expect(screen.getByText('comune di milano')).toBeInTheDocument();
  expect(screen.queryByText('comune di roma')).not.toBeInTheDocument();

  fireEvent.keyDown(screen.getByRole('listitem'), { key: 'Enter' });

  expect(setSelected).toHaveBeenCalledWith(first);
  expect(setCfResult).toHaveBeenCalledWith(undefined);
});

test('Test: shows the AOO with its parent institution as role', () => {
  const aooResult = {
    denominazioneAoo: 'Protocollo generale',
    denominazioneEnte: 'Comune di Milano',
  } as AooData;

  const { setSelected } = renderResults({
    aooResult,
    selections: { ...noSelections, aooCode: true },
  });

  expect(screen.getByText('protocollo generale')).toBeInTheDocument();
  expect(screen.getByText('Comune di Milano')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button'));

  expect(setSelected).toHaveBeenCalledWith(aooResult);
});
