import { Grid, Theme, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { AxiosError, AxiosResponse } from 'axios';
import debounce from 'lodash/debounce';
import { Dispatch, SetStateAction, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ANACParty, Endpoint, InstitutionType, Product } from '../../../../../types';
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
  isTaxCodeSelected?: boolean;
  setIsTaxCodeSelected: React.Dispatch<React.SetStateAction<boolean | undefined>>;
  selected: any;
  theme: Theme;
  options: Array<any>;
  isSearchFieldSelected: boolean;
  setCfResult: React.Dispatch<React.SetStateAction<InstitutionResource | ANACParty | undefined>>;
  cfResult?: InstitutionResource | ANACParty;
  product?: Product | null;
  isAooCodeSelected: boolean;
  isUoCodeSelected: boolean;
  setAooResult: Dispatch<SetStateAction<AooData | undefined>>;
  setUoResult: Dispatch<SetStateAction<UoData | undefined>>;
  setUoResultHistory: (t: UoData | undefined) => void;
  setAooResultHistory: (t: AooData | undefined) => void;
  aooResult?: AooData;
  uoResult?: UoData;
  externalInstitutionId: string;
  institutionType?: InstitutionType;
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
  setUoResultHistory,
  setAooResultHistory,
  externalInstitutionId,
  institutionType,
}: Props) {
  const { setRequiredLogin } = useContext(UserContext);
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const getOptionKey: (option: any) => string =
    optionKey !== undefined ? (o) => o[optionKey] : (o) => o.label ?? o;

  const getOptionLabel: (option: any) => string =
    optionLabel !== undefined ? (o) => o[optionLabel] : (o) => o.label ?? o;

  const showBusinessNameElement = input !== undefined && input.length >= 3;

  const filterByCategory =
    product?.id === 'prod-pn'
      ? 'L6,L4,L45'
      : institutionType === 'GSP'
      ? 'L37,SAG'
      : 'C17,C16,L10,L19,L13,L2,C10,L20,L21,L22,L15,L1,C13,C5,L40,L11,L39,L46,L8,L34,L7,L35,L45,L47,L6,L12,L24,L28,L42,L36,L44,C8,C3,C7,C14,L16,C11,L33,C12,L43,C2,L38,C1,L5,L4,L31,L18,L17,S01,SA';

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
          categories: filterByCategory,
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
        params: {
          origin: 'IPA',
          categories: filterByCategory,
        },
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
  const handleSearchByAooCode = async (query: string) => {
    setIsLoading(true);

    const searchResponse = await fetchWithLogs(
      { endpoint: 'ONBOARDING_GET_AOO_CODE_INFO', endpointParams: { codiceUniAoo: query } },
      {
        method: 'GET',
        params: {
          origin: 'IPA',
          categories: filterByCategory,
        },
      },
      () => setRequiredLogin(true)
    );

    const outcome = getFetchOutcome(searchResponse);

    if (outcome === 'success') {
      setAooResult((searchResponse as AxiosResponse).data);
      setAooResultHistory((searchResponse as AxiosResponse).data);
    } else if ((searchResponse as AxiosError).response?.status === 404) {
      setAooResult(undefined);
    }

    setIsLoading(false);
  };
  const handleSearchByUoCode = async (query: string) => {
    setIsLoading(true);

    const searchResponse = await fetchWithLogs(
      { endpoint: 'ONBOARDING_GET_UO_CODE_INFO', endpointParams: { codiceUniUo: query } },
      {
        method: 'GET',
        params: {
          origin: 'IPA',
          categories: filterByCategory,
        },
      },
      () => setRequiredLogin(true)
    );

    const outcome = getFetchOutcome(searchResponse);

    if (outcome === 'success') {
      setUoResult((searchResponse as AxiosResponse).data);
      setUoResultHistory((searchResponse as AxiosResponse).data);
    } else if ((searchResponse as AxiosError).response?.status === 404) {
      setUoResult(undefined);
    }

    setIsLoading(false);
  };

  const handleSearchSAByBusinessName = async (query: string) => {
    const searchResponse = await fetchWithLogs(
      { endpoint: 'ONBOARDING_GET_SA_PARTIES_NAME' },
      {
        method: 'GET',
        params: {
          limit: ENV.MAX_INSTITUTIONS_FETCH,
          page: 1,
          search: query,
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

  const handleSearchSaByTaxCode = async (query: string) => {
    setIsLoading(true);

    const searchResponse = await fetchWithLogs(
      { endpoint: 'ONBOARDING_GET_SA_PARTY_FROM_FC', endpointParams: { id: query } },
      {
        method: 'GET',
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
  // eslint-disable-next-line sonarjs/cognitive-complexity
  const handleChange = (event: any) => {
    const value = event.target.value as string;
    setInput(value);

    if (value !== '') {
      setSelected(null);
      if (value.length >= 3 && isBusinessNameSelected && !isTaxCodeSelected) {
        if (institutionType !== 'SA') {
          void debounce(handleSearchByBusinessName, 100)(value);
        } else {
          void debounce(handleSearchSAByBusinessName, 100)(value);
        }
      } else if (isTaxCodeSelected && value.length === 11) {
        if (institutionType !== 'SA') {
          void handleSearchByTaxCode(value);
        } else {
          void handleSearchSaByTaxCode(value);
        }
      } else if (isAooCodeSelected && !isUoCodeSelected && value.length === 7) {
        void handleSearchByAooCode(value);
      } else if (isUoCodeSelected && !isAooCodeSelected && value.length === 6) {
        void handleSearchByUoCode(value);
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
        pb={input?.length === 0 || selected ? 4 : 0}
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
          isAooCodeSelected={isAooCodeSelected}
          isUoCodeSelected={isUoCodeSelected}
          isTaxCodeSelected={isTaxCodeSelected}
          isBusinessNameSelected={isBusinessNameSelected}
          setCfResult={setCfResult}
          setAooResult={setAooResult}
          setUoResult={setUoResult}
          externalInstitutionId={externalInstitutionId}
        />
      </Grid>
      <Grid
        item
        xs={12}
        display="flex"
        justifyContent="center"
        sx={{ height: showBusinessNameElement && options?.length > 0 ? '232px' : undefined }}
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
            {(isTaxCodeSelected || isAooCodeSelected || isUoCodeSelected) &&
            !isBusinessNameSelected &&
            input !== undefined &&
            input?.length >= 6 &&
            !selected &&
            (cfResult || uoResult || aooResult) ? (
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
              (!cfResult || !aooResult || !uoResult) &&
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
