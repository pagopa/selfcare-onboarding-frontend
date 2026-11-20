import { fireEvent, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { expect, test } from 'vitest';
import '../../locale';
import { PartyData } from '../../../types';
import { SelectionsState } from '../../model/Selection';
import { PRODUCT_IDS } from '../../utils/constants';
import { buildProduct } from '../../utils/test/builders';
import { renderComponentWithProviders } from '../../utils/test/test-utils';
import { Autocomplete } from '../autocomplete/Autocomplete';
// Imported after the component: importing it first triggers the constants/views import cycle
import { OnboardingApi } from '../../api/OnboardingApiClient';

const noSelections: SelectionsState = {
  businessName: false,
  taxCode: false,
  aooCode: false,
  uoCode: false,
  ivassCode: false,
  reaCode: false,
  personalTaxCode: false,
};

const RtpPspAutocomplete = () => {
  const [selected, setSelected] = useState<PartyData | null>(null);
  const [selections, setSelections] = useState<SelectionsState>(noSelections);
  const [isSearchFieldSelected, setIsSearchFieldSelected] = useState(true);

  return (
    <Autocomplete
      selected={selected}
      setSelected={setSelected}
      endpoint={{ endpoint: 'ONBOARDING_GET_SEARCH_PARTIES' }}
      transformFn={() => []}
      optionKey="id"
      optionLabel="description"
      isSearchFieldSelected={isSearchFieldSelected}
      setIsSearchFieldSelected={setIsSearchFieldSelected}
      product={buildProduct({ id: PRODUCT_IDS.RTP })}
      setAooResult={() => undefined}
      setUoResult={() => undefined}
      externalInstitutionId=""
      institutionType="PSP"
      setDisabled={() => undefined}
      selections={selections}
      setSelections={setSelections}
      addUser={false}
    />
  );
};

test('Test: on RTP the PSP tax code search uses the institutions search and shows the onboarded PSP', async () => {
  renderComponentWithProviders(<RtpPspAutocomplete />, PRODUCT_IDS.RTP);

  fireEvent.change(document.getElementById('Parties') as HTMLElement, {
    target: { value: '25301208621' },
  });

  await waitFor(() => screen.getByText('antico credito arcorese'));
  expect(OnboardingApi.searchInstitution).toHaveBeenCalledWith('25301208621');
  expect(OnboardingApi.searchInstitutionIpaByTaxCode).not.toHaveBeenCalled();
});
