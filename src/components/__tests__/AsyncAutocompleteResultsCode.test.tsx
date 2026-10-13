import { render } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import '../../locale';
import AsyncAutocompleteResultsCode from '../autocomplete/components/asyncAutocomplete/components/AsyncAutocompleteResultsCode';

test('Test: renders nothing when the result for the current search type is missing', () => {
  const { container } = render(
    <AsyncAutocompleteResultsCode
      setSelected={vi.fn()}
      setCfResult={vi.fn()}
      getOptionLabel={vi.fn()}
      getOptionKey={vi.fn()}
      cfResult={undefined}
      aooResult={{ denominazioneAoo: 'stale aoo' }}
      selections={{
        businessName: false,
        taxCode: true,
        aooCode: false,
        uoCode: false,
        ivassCode: false,
        reaCode: false,
        personalTaxCode: false,
      }}
    />
  );

  expect(container.innerHTML).toBe('');
});
