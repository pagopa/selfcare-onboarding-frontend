import React, { useContext, useEffect, useRef, useState } from 'react';
import debounce from 'lodash/debounce';
import { AxiosError, AxiosResponse } from 'axios';
import { Theme, Grid, Typography, Paper } from '@mui/material';
import { Box } from '@mui/system';
import { useTranslation, Trans } from 'react-i18next';
import SessionModal from '@pagopa/selfcare-common-frontend/components/SessionModal';
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
  setInput: React.Dispatch<React.SetStateAction<string>>;
  error: boolean;
  setError: React.Dispatch<React.SetStateAction<boolean>>;
  input: string;
  endpoint: Endpoint;
  transformFn: any;
  optionKey?: string;
  optionLabel?: string;
  theme: Theme;
};

// eslint-disable-next-line sonarjs/cognitive-complexity
export function AsyncAutocompleteV2({
  searchByTaxCode,
  selected,
  setConfirmAction,
  confirmAction,
  setSelected,
  setInput,
  input,
  error,
  setError,
  endpoint,
  transformFn,
  optionKey,
  optionLabel,
  theme,
}: AutocompleteProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [openErrorModal, setOpenErrorModal] = useState<boolean>(false);
  const [options, setOptions] = useState<Array<any>>([]);
  /* TODO: Probably, for technical limits of Infocamere API/probably unattainable case, we couldn't manage
  multiples match cases. If this is confirmed, this code will be deleted else we will restore it. */
  // const [moreMatches, setMoreMatches] = useState<Array<IPACatalogParty>>([]);
  const { setRequiredLogin } = useContext(UserContext);
  const currentInput = useRef<string>('');
  const { t } = useTranslation();

  const handleSearchByBusinessName = async (query: string) => {
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

  const handleSearchByTaxCode = async (query: string) => {
    setIsLoading(true);
    const searchResponse: any = await fetchWithLogs(
      {
        endpoint: 'ONBOARDING_GET_PARTY',
        endpointParams: { externalInstitutionId: query },
      },
      { method: 'GET', params: { origin: 'INFOCAMERE' } },
      () => setRequiredLogin(true)
    );

    const outcome = getFetchOutcome(searchResponse);
    const foundParty = (searchResponse as AxiosResponse).data;
    if (outcome === 'success' && foundParty?.taxCode === query) {
      setSelected(foundParty);
    } else {
      /* 
      TODO: Probably, for technical limits of Infocamere API/probably unattainable case, we couldn't manage
      multiples match cases. If this is confirmed, this code will be deleted else we will restore it.

      else if (matchedParty.length > 1) {
        setMoreMatches(matchedParty); 
      */
      setOpenErrorModal(true);
      // eslint-disable-next-line functional/immutable-data
      currentInput.current = query;
      setError(true);
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
        void debounce(handleSearchByBusinessName, 100)(value);
      }
    }
    if (value === '') {
      setSelected(null);
    }
    if (selected) {
      setInput(getOptionLabel(selected));
    }
  };

  const handleCloseErrorModal = () => {
    setOpenErrorModal(false);
  };

  useEffect(() => {
    if (confirmAction && input) {
      void handleSearchByTaxCode(input);
      setConfirmAction(false);
    }
  }, [confirmAction]);

  useEffect(() => {
    if (input) {
      setError(currentInput.current === input);
    }
  }, [currentInput.current, input]);

  return (
    <Paper
      elevation={8}
      sx={{
        display: 'flex',
        flexDirection: 'row',
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
          sx={{ flexDirection: 'row', alignItems: 'center' }}
          pt={4}
          pb={showElement && !selected && !searchByTaxCode ? 0 : 4}
        >
          {!searchByTaxCode && selected && (
            <Box display="flex" alignItems="center">
              <PartyIcon width={50} />
            </Box>
          )}
          <SessionModal
            handleClose={handleCloseErrorModal}
            open={openErrorModal}
            title={t('stepSearchPartyFromTaxCode.notMatchTaxCodeModal.title')}
            message={
              <Trans i18nKey="stepSearchPartyFromTaxCode.notMatchTaxCodeModal.message">
                Non è stato trovato nessun ente con il Codice Fiscale/Partita IVA
                <strong> {{ taxCode: input }}</strong>. Verifica che sia corretto e inseriscilo di
                nuovo.
              </Trans>
            }
            onCloseLabel={t('stepSearchPartyFromTaxCode.notMatchTaxCodeModal.retry')}
          />
          {/* {!confirmAction && moreMatches.length === 0 && ( */}
          {!confirmAction && (
            <AsyncAutocompleteSearch
              theme={theme}
              searchByTaxCode={searchByTaxCode}
              selected={selected}
              setSelected={setSelected}
              setInput={setInput}
              error={error}
              input={input}
              handleChange={handleChange}
            />
          )}
          {/* TODO: Probably, for technical limits of Infocamere/probably unattainable case, we couldn't manage
  multiples match cases. If this is confirmed, this code will be deleted else we will restore it. */
          /* : (
            <Stack spacing={2} sx={{ display: 'flex', px: 4, width: '100%' }}>
              {moreMatches.map((m) => (
                <Box key={m.id}>
                  <Grid aria-label={m.description}>
                    <PartyAccountItemButton
                      aria-label={m.description}
                      partyName={m.description}
                      action={() => setSelected(m)}
                      selectedItem={selected?.id === m.id}
                      maxCharactersNumberMultiLine={20}
                    />
                  </Grid>
                </Box>
              ))}
            </Stack>
          )}
          */}
        </Grid>
        {searchByTaxCode ? (
          <></>
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
