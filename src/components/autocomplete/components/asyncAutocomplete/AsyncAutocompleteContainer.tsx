import { Theme, Grid, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { useContext, useState } from 'react';
import { AxiosError, AxiosResponse } from 'axios';
import debounce from 'lodash/debounce';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../../../../lib/context';
import { fetchWithLogs } from '../../../../lib/api-utils';
import { getFetchOutcome } from '../../../../lib/error-utils';
import { Endpoint } from '../../../../../types';
import { ENV } from '../../../../utils/env';
import { ReactComponent as PartyIcon } from '../../../../assets/onboarding_party_icon.svg';
import AsyncAutocompleteResults from './components/AsyncAutocompleteResults';
import AsyncAutocompleteSearch from './components/AsyncAutocompleteSearch';

type Props = {
  optionKey?: string;
  optionLabel?: string;
  input: string;
  endpoint: Endpoint;
  setOptions: React.Dispatch<React.SetStateAction<Array<any>>>;
  transformFn: any;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  setSelected: React.Dispatch<React.SetStateAction<any>>;
  isBusinessNameSelected?: boolean;
  setIsBusinessNameSelected: React.Dispatch<React.SetStateAction<boolean>>;
  isTaxCodeSelected?: boolean;
  setIsTaxCodeSelected: React.Dispatch<React.SetStateAction<boolean | undefined>>;
  selected: any;
  theme: Theme;
  options: Array<any>;
  isSearchFieldSelected: boolean;
};

export default function AsyncAutocompleteContainer({
  optionKey,
  optionLabel,
  input,
  endpoint,
  setOptions,
  transformFn,
  setInput,
  setSelected,
  isBusinessNameSelected,
  isTaxCodeSelected,
  selected,
  theme,
  options,
  isSearchFieldSelected,
}: Props) {
  const { setRequiredLogin } = useContext(UserContext);
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const getOptionKey: (option: any) => string =
    optionKey !== undefined ? (o) => o[optionKey] : (o) => o.label ?? o;

  const getOptionLabel: (option: any) => string =
    optionLabel !== undefined ? (o) => o[optionLabel] : (o) => o.label ?? o;

  const showElement = input !== undefined && input.length >= 3;

  const handleSearch = async (query: string) => {
    setIsLoading(true);

    const searchResponse = await fetchWithLogs(
      endpoint,
      {
        method: 'GET',
        params: { limit: ENV.MAX_INSTITUTIONS_FETCH, page: 1, search: query },
      },
      () => setRequiredLogin(true)
    );

    const outcome = getFetchOutcome(searchResponse);

    if (outcome === 'success') {
      setOptions(transformFn((searchResponse as AxiosResponse).data));
    } else if ((searchResponse as AxiosError).response?.status === 404) {
      setOptions([]);
    }

    setIsLoading(false);
  };
  const handleChange = (event: any) => {
    const value = event.target.value as string;
    setInput(value);
    if (value !== '') {
      setSelected(null);
      if (value.length >= 3 && isBusinessNameSelected) {
        void debounce(handleSearch, 100)(value);
      } else if (isTaxCodeSelected && value.length === 11) {
        void handleSearch(value);
        // TODO add fetch for ipa code search
      }
    }
    if (value === '') {
      setSelected(null);
    }
    if (selected) {
      setInput(getOptionLabel(selected));
    }
  };
  return (
    <>
      <Grid
        item
        xs={12}
        display="flex"
        justifyContent="center"
        width="100%"
        pt={selected ? 4 : 2}
        pb={showElement && !selected ? 0 : 4}
      >
        {selected && (
          <Box display="flex" alignItems="center">
            <PartyIcon width={50} />
          </Box>
        )}

        <AsyncAutocompleteSearch
          theme={theme}
          selected={selected}
          setSelected={setSelected}
          setInput={setInput}
          input={input}
          handleChange={handleChange}
          isSearchFieldSelected={isSearchFieldSelected}
        />
      </Grid>
      <Grid
        item
        xs={12}
        display="flex"
        justifyContent="center"
        sx={{ height: showElement && options.length > 0 ? '232px' : undefined }}
      >
        {showElement && options.length > 0 ? (
          <AsyncAutocompleteResults
            setSelected={setSelected}
            options={options}
            setOptions={setOptions}
            isLoading={isLoading}
            getOptionLabel={getOptionLabel}
            getOptionKey={getOptionKey}
          />
        ) : input.length >= 1 && input.length < 3 ? (
          <Box display="flex" sx={{ jusifyContent: 'start' }} width="100%" mx={4}>
            <Typography pb={3} sx={{ fontSize: '18px', fontWeight: 'fontWeightBold' }}>
              {t('asyncAutocomplete.lessThen3CharacterLabel')}
            </Typography>
          </Box>
        ) : (
          input.length >= 3 &&
          options.length === 0 &&
          !selected && (
            <Box display="flex" sx={{ jusifyContent: 'start' }} width="100%" mx={4}>
              <Typography py={3} sx={{ fontSize: '18px', fontWeight: 'fontWeightBold' }}>
                {t('asyncAutocomplete.noResultsLabel')}
              </Typography>
            </Box>
          )
        )}
      </Grid>
    </>
  );
}
