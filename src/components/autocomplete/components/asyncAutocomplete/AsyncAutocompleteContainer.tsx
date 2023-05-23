import { AxiosError, AxiosResponse } from 'axios';
import debounce from 'lodash/debounce';
import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Grid, Theme, Typography } from '@mui/material';
import { Box } from '@mui/system';

import { Endpoint, Product } from '../../../../../types';
import { ReactComponent as PartyIcon } from '../../../../assets/onboarding_party_icon.svg';
import { fetchWithLogs } from '../../../../lib/api-utils';
import { UserContext } from '../../../../lib/context';
import { getFetchOutcome } from '../../../../lib/error-utils';
import { AooData } from '../../../../model/AooData';
import { InstitutionResource } from '../../../../model/InstitutionResource';
import { UoData } from '../../../../model/UoModel';
import { ENV } from '../../../../utils/env';
import AsyncAutocompleteResultsBusinessName from './components/AsyncAutocompleteResultsBusinessName';
import AsyncAutocompleteResultsCode from './components/AsyncAutocompleteResultsCode';
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
  setCfResult: React.Dispatch<React.SetStateAction<InstitutionResource | undefined>>;
  cfResult?: InstitutionResource;
  product?: Product | null;
  isAooCodeSelected: boolean;
  isUoCodeSelected: boolean;
  setAooResult: React.Dispatch<React.SetStateAction<AooData | undefined>>;
  setUoResult: React.Dispatch<React.SetStateAction<UoData | undefined>>;
  aooResult?: AooData;
  uoResult?: UoData;
};

// TODO: handle cognitive-complexity
// eslint-disable-next-line sonarjs/cognitive-complexity, complexity
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
  setCfResult,
  cfResult,
  product,
  isAooCodeSelected,
  isUoCodeSelected,
  setAooResult,
  setUoResult,
  aooResult,
  uoResult,
}: Props) {
  const { setRequiredLogin } = useContext(UserContext);
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const getOptionKey: (option: any) => string =
    optionKey !== undefined ? (o) => o[optionKey] : (o) => o.label ?? o;

  const getOptionLabel: (option: any) => string =
    optionLabel !== undefined ? (o) => o[optionLabel] : (o) => o.label ?? o;

  const showBusinessNameElement = input !== undefined && input.length >= 3;
  const prodPn = product?.id === 'prod-pn';
  const handleSearchByBusinessName = async (query: string) => {
    setIsLoading(true);

    const searchResponse = await fetchWithLogs(
      endpoint,
      {
        method: 'GET',
        params: {
          limit: ENV.MAX_INSTITUTIONS_FETCH,
          page: 1,
          search: query,
          ...(prodPn && { categories: 'L6,L4,L45' }),
        },
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

    const searchResponse = await fetchWithLogs(
      { endpoint: 'ONBOARDING_GET_PARTY_FROM_CF', endpointParams: { id: query } },
      {
        method: 'GET',
        params: { ...(prodPn && { categories: 'L6,L4,L45', origin: 'IPA' }) },
      },
      () => setRequiredLogin(true)
    );

    const outcome = getFetchOutcome(searchResponse);

    if (outcome === 'success') {
      setCfResult((searchResponse as AxiosResponse).data);
    } else if ((searchResponse as AxiosError).response?.status === 404) {
      setCfResult(undefined);
    }

    setIsLoading(false);
  };

  const handleSearchByCode = async (
    query: string,
    isAooCodeSelected: boolean,
    isUoCodeSelected: boolean
  ) => {
    setIsLoading(true);

    if (isAooCodeSelected && query.length === 7) {
      const searchResponse = await fetchWithLogs(
        { endpoint: 'ONBOARDING_GET_AOO_CODE_INFO', endpointParams: { codiceUniAoo: query } },
        {
          method: 'GET',
        },
        () => setRequiredLogin(true)
      );

      const outcome = getFetchOutcome(searchResponse);
      if (outcome === 'success') {
        setAooResult((searchResponse as AxiosResponse).data);
      }
    } else if (isUoCodeSelected && query.length === 6) {
      const searchResponse = await fetchWithLogs(
        { endpoint: 'ONBOARDING_GET_UO_CODE_INFO', endpointParams: { codiceUniUo: query } },
        {
          method: 'GET',
        },
        () => setRequiredLogin(true)
      );

      const outcome = getFetchOutcome(searchResponse);
      if (outcome === 'success') {
        setUoResult((searchResponse as AxiosResponse).data);
      }
    }
    setIsLoading(false);
  };

  const handleChange = (event: any) => {
    const value = event.target.value as string;
    setInput(value);
    if (value !== '') {
      setSelected(null);
      if (value.length >= 3 && isBusinessNameSelected && !isTaxCodeSelected) {
        void debounce(handleSearchByBusinessName, 100)(value);
      } else if (isTaxCodeSelected && value.length === 11) {
        void handleSearchByTaxCode(value);
      } else {
        void handleSearchByCode(value, isAooCodeSelected, isUoCodeSelected);
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
        pb={input.length === 0 || selected ? 4 : 0}
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
        sx={{ height: showBusinessNameElement && options.length > 0 ? '232px' : undefined }}
      >
        {isBusinessNameSelected ? (
          <>
            {options && showBusinessNameElement && options.length > 0 ? (
              <AsyncAutocompleteResultsBusinessName
                setSelected={setSelected}
                options={options}
                setOptions={setOptions}
                isLoading={isLoading}
                getOptionLabel={getOptionLabel}
                getOptionKey={getOptionKey}
              />
            ) : input.length >= 1 && input.length < 3 ? (
              <Box display="flex" sx={{ jusifyContent: 'start' }} width="100%" mx={4}>
                <Typography py={3} sx={{ fontSize: '18px', fontWeight: 'fontWeightBold' }}>
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
          </>
        ) : (
          <>
            {input !== undefined && input.length > 6 ? (
              <AsyncAutocompleteResultsCode
                setSelected={setSelected}
                cfResult={cfResult}
                setCfResult={setCfResult}
                isLoading={isLoading}
                getOptionLabel={getOptionLabel}
                getOptionKey={getOptionKey}
                aooResult={aooResult}
                uoResult={uoResult}
                isTaxCodeSelected={isTaxCodeSelected}
                isAooCodeSelected={isAooCodeSelected}
                isUoCodeSelected={isUoCodeSelected}
              />
            ) : (
              input.length >= 1 &&
              options.length === 0 &&
              !selected && (
                <Box display="flex" sx={{ jusifyContent: 'start' }} width="100%" mx={4}>
                  <Typography py={3} sx={{ fontSize: '18px', fontWeight: 'fontWeightBold' }}>
                    {t('asyncAutocomplete.noResultsLabel')}
                  </Typography>
                </Box>
              )
            )}
          </>
        )}
      </Grid>
    </>
  );
}
