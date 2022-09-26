import React, { useContext, useEffect, useState } from 'react';
import debounce from 'lodash/debounce';
import { AxiosError, AxiosResponse } from 'axios';
import { Theme, Grid, Typography, Paper } from '@mui/material';
import { Box } from '@mui/system';
import { useTranslation } from 'react-i18next';
import { Endpoint, IPACatalogParty } from '../../../types';
import { fetchWithLogs } from '../../lib/api-utils';
import { getFetchOutcome } from '../../lib/error-utils';
import { ENV } from '../../utils/env';
import { UserContext } from '../../lib/context';
import { ReactComponent as PartyIcon } from '../../assets/onboarding_party_icon.svg';
import AsyncAutocompleteResults from './components/AsyncAutocompleteResults';
import AsyncAutocompleteSearch from './components/AsyncAutocompleteSearch';

type AutocompleteProps = {
  searchByTaxCode: boolean;
  confirmAction?: boolean;
  setConfirmAction: any;
  selected: any;
  setSelected: React.Dispatch<React.SetStateAction<IPACatalogParty | null>>;
  endpoint: Endpoint;
  transformFn: any;
  optionKey?: string;
  optionLabel?: string;
  theme: Theme;
};

export function AsyncAutocompleteV2({
  searchByTaxCode,
  selected,
  setConfirmAction,
  confirmAction,
  setSelected,
  endpoint,
  transformFn,
  optionKey,
  optionLabel,
  theme,
}: AutocompleteProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState<string>('');
  const [options, setOptions] = useState<Array<any>>([]);
  const { setRequiredLogin } = useContext(UserContext);
  const { t } = useTranslation();

  /* TODO SELC-1533 This API will return to its original state as soon as we have
   the new API from the BE that calls the data of "infocamere". 
   this logic will then be moved to the new 
   API as it becomes available */
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
      if (searchByTaxCode) {
        const matchedParty = (searchResponse as AxiosResponse).data.items.find(
          (p: any) => p.taxCode === query
        );
        if (matchedParty) {
          setSelected(matchedParty);
        } else {
          // TODO SELC-1560 Put here the management of errors
        }
      }
    } else if ((searchResponse as AxiosError).response?.status === 404) {
      setOptions([]);
    }

    setIsLoading(false);
  };

  const getOptionKey: (option: any) => string =
    optionKey !== undefined ? (o) => o[optionKey] : (o) => o.label ?? o;

  const getOptionLabel: (option: any) => string =
    optionLabel !== undefined ? (o) => o[optionLabel] : (o) => o.label ?? o;

  const showElement = input !== undefined && input.length >= 3;

  const handleChange = (event?: any) => {
    const value = event?.target.value as string;
    setInput(value);
    if (value !== '') {
      setSelected(null);
      if (!searchByTaxCode && value.length >= 3) {
        void debounce(handleSearch, 100)(value);
      }
    }
    if (value === '') {
      setSelected(null);
    }
    if (selected) {
      setInput(getOptionLabel(selected));
    }
  };

  console.log(input);
  useEffect(() => {
    if (confirmAction && input) {
      void handleSearch(input);
      setConfirmAction(false);
    }
  }, [confirmAction, input]);

  return (
    <Paper
      elevation={8}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '104px',
        maxHeight: '100%',
        minWidth: '480px',
        borderRadius: theme.spacing(2),
      }}
    >
      <Grid container>
        <Grid
          item
          xs={12}
          display="flex"
          justifyContent="center"
          width="100%"
          pt={4}
          pb={showElement && !selected && !searchByTaxCode ? 0 : 4}
        >
          {selected && (
            <Box display="flex" alignItems="center">
              <PartyIcon width={50} />
            </Box>
          )}

          <AsyncAutocompleteSearch
            theme={theme}
            searchByTaxCode={searchByTaxCode}
            selected={selected}
            setSelected={setSelected}
            setInput={setInput}
            input={input}
            handleChange={handleChange}
          />
        </Grid>
        {searchByTaxCode ? (
          <> </>
        ) : (
          <Grid item xs={12} display="flex" justifyContent="center">
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
              <Typography pb={3}> {t('asyncAutocomplete.lessThen3CharacterLabel')}</Typography>
            ) : (
              input.length >= 3 &&
              options.length === 0 &&
              !selected && <Typography pb={3}> {t('asyncAutocomplete.noResultsLabel')} </Typography>
            )}
          </Grid>
        )}
      </Grid>
    </Paper>
  );
}
