import { Grid, Theme, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { AxiosError, AxiosResponse } from 'axios';
import debounce from 'lodash/debounce';
import { Dispatch, SetStateAction, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import OnboardingPartyIcon from '../../../../assets/onboarding_party_icon.svg';
import {
  ApiEndpointKey,
  Endpoint,
  InstitutionType,
  PartyData,
  Product,
} from '../../../../../types';
import { fetchWithLogs } from '../../../../lib/api-utils';
import { UserContext } from '../../../../lib/context';
import { getFetchOutcome } from '../../../../lib/error-utils';
import { AooData } from '../../../../model/AooData';
import { UoData } from '../../../../model/UoModel';
import { ENV } from '../../../../utils/env';
import { buildUrlLogo, noMandatoryIpaProducts } from '../../../../utils/constants';
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
  setCfResult: React.Dispatch<React.SetStateAction<PartyData | undefined>>;
  cfResult?: PartyData;
  product?: Product | null;
  isAooCodeSelected: boolean;
  isUoCodeSelected: boolean;
  setAooResult: Dispatch<SetStateAction<AooData | undefined>>;
  setUoResult: Dispatch<SetStateAction<UoData | undefined>>;
  setUoResultHistory: (t: UoData | undefined) => void;
  setAooResultHistory: (t: AooData | undefined) => void;
  aooResult?: AooData;
  uoResult?: UoData;
  isIvassCodeSelected: boolean;
  externalInstitutionId: string;
  institutionType?: InstitutionType;
  setDisabled: Dispatch<SetStateAction<boolean>>;
  addUser: boolean;
  selectedProduct?: Product;
  filterCategories?: string;
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
  isIvassCodeSelected,
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
  setDisabled,
  addUser,
  selectedProduct,
  filterCategories,
}: Props) {
  const { setRequiredLogin } = useContext(UserContext);
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [partyLogo, setPartyLogo] = useState<string>(
    selected ? buildUrlLogo(selected.id) : OnboardingPartyIcon
  );

  const getOptionKey: (option: any) => string =
    optionKey !== undefined ? (o) => o[optionKey] : (o) => o.label ?? o;

  const getOptionLabel: (option: any) => string =
    optionLabel !== undefined ? (o) => o[optionLabel] : (o) => o.label ?? o;

  const showBusinessNameElement = input !== undefined && input.length >= 3;

  const disabledButton =
    institutionType === 'GSP' && noMandatoryIpaProducts(product?.id)
      ? isBusinessNameSelected
        ? input.length < 3
        : isTaxCodeSelected
        ? input.length < 11
        : isAooCodeSelected
        ? !!aooResult
        : !!uoResult
      : !selected;

  useEffect(() => {
    if (input) {
      setDisabled(disabledButton);
    } else {
      setDisabled(!selected);
    }
  }, [input, selected]);

  useEffect(() => {
    if (selected) {
      const logoUrl = buildUrlLogo(selected.id);
      setPartyLogo(logoUrl);
    } else {
      setPartyLogo(OnboardingPartyIcon);
    }
  }, [selected]);

  const handleSearchByName = async (
    query: string,
    endpoint: Endpoint,
    limit?: number,
    categories?: string
  ) => {
    setIsLoading(true);
    const searchResponse = await fetchWithLogs(
      endpoint,
      {
        method: 'GET',
        params: {
          limit,
          page: 1,
          search: query,
          categories,
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

  const handleSearchByTaxCode = async (
    addUser: boolean,
    endpoint: ApiEndpointKey,
    params: any,
    query: string
  ) => {
    setIsLoading(true);

    const updatedParams = {
      ...params,
      taxCode: undefined,
      categories:
        product?.id === 'prod-interop' && (institutionType === 'SCP' || institutionType === 'PRV')
          ? undefined
          : filterCategories,
    };

    const searchResponse = await fetchWithLogs(
      { endpoint, endpointParams: addUser ? undefined : { id: query } },
      {
        method: 'GET',
        params: updatedParams,
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

  const handleSearchByAooCode = async (
    addUser: boolean,
    endpoint: ApiEndpointKey,
    params: any,
    query: string
  ) => {
    setIsLoading(true);

    const updatedParams = addUser
      ? params
      : {
          origin: 'IPA',
          categories: filterCategories,
        };

    const searchResponse = await fetchWithLogs(
      { endpoint, endpointParams: addUser ? undefined : { codiceUniAoo: query } },
      {
        method: 'GET',
        params: updatedParams,
      },
      () => setRequiredLogin(true)
    );

    const outcome = getFetchOutcome(searchResponse);

    if (outcome === 'success') {
      const response = addUser
        ? (searchResponse as AxiosResponse).data[0] ?? (searchResponse as AxiosResponse).data
        : (searchResponse as AxiosResponse).data;
      setAooResult(response);
      setAooResultHistory(response);
    } else if ((searchResponse as AxiosError).response?.status === 404) {
      setAooResult(undefined);
    }

    setIsLoading(false);
  };

  const handleSearchByUoCode = async (
    addUser: boolean,
    endpoint: ApiEndpointKey,
    params: any,
    query: string
  ) => {
    setIsLoading(true);

    const updatedParams = addUser
      ? params
      : {
          origin: 'IPA',
          categories: filterCategories,
        };

    const searchResponse = await fetchWithLogs(
      { endpoint, endpointParams: addUser ? undefined : { codiceUniUo: query } },
      {
        method: 'GET',
        params: updatedParams,
      },
      () => setRequiredLogin(true)
    );

    const outcome = getFetchOutcome(searchResponse);

    if (outcome === 'success') {
      const response = addUser
        ? (searchResponse as AxiosResponse).data[0] ?? (searchResponse as AxiosResponse).data
        : (searchResponse as AxiosResponse).data;
      setUoResult(response);
      setUoResultHistory(response);
    } else if ((searchResponse as AxiosError).response?.status === 404) {
      setUoResult(undefined);
    }

    setIsLoading(false);
  };

  const contractingInsuranceFromTaxId = async (
    addUser: boolean,
    endpoint: ApiEndpointKey,
    params: any,
    query: string
  ) => {
    setIsLoading(true);

    const searchResponse = await fetchWithLogs(
      {
        endpoint,
        endpointParams: addUser
          ? undefined
          : institutionType === 'SA' || institutionType === 'AS'
          ? { taxId: query }
          : { code: query },
      },
      {
        method: 'GET',
        params: addUser ? params : undefined,
      },
      () => setRequiredLogin(true)
    );

    const outcome = getFetchOutcome(searchResponse);
    if (outcome === 'success') {
      const response = addUser
        ? (searchResponse as AxiosResponse).data[0] ?? (searchResponse as AxiosResponse).data
        : (searchResponse as AxiosResponse).data;
      setCfResult(response);
    } else if ((searchResponse as AxiosError).response?.status === 404) {
      setCfResult(undefined);
    }

    setIsLoading(false);
  };

  const searchByInstitutionType = async (value: string, institutionType?: string) => {
    switch (institutionType) {
      case 'AS':
        void debounce(handleSearchByName, 100)(value, {
          endpoint: 'ONBOARDING_GET_INSURANCE_COMPANIES_FROM_BUSINESSNAME',
        });
        break;
      case 'SA':
        void debounce(handleSearchByName, 100)(value, {
          endpoint: 'ONBOARDING_GET_SA_PARTIES_NAME',
        });
        break;
      default:
        void debounce(handleSearchByName, 100)(
          value,
          endpoint,
          ENV.MAX_INSTITUTIONS_FETCH,
          filterCategories
        );
    }
  };

  // eslint-disable-next-line complexity
  const handleChange = (
    event: any
    // eslint-disable-next-line sonarjs/cognitive-complexity
  ) => {
    const typedInput = event.target.value as string;
    const params = {
      productId: selectedProduct?.id,
      taxCode: isTaxCodeSelected ? typedInput : undefined,
      subunitCode: isAooCodeSelected || isUoCodeSelected ? typedInput : undefined,
    };

    const removeSpecialCharacters = (typedInput: string) => {
      const specialCharacters = '[$%&’()§#!£{}*+/:;<>@=?^|~]';

      return typedInput
        .split('')
        .map((char) => (specialCharacters.includes(char) ? '' : char))
        .join('')
        .replace("''", "'")
        .replace('""', '"')
        .replace('--', '-')
        .replace('__', '_')
        .replace(',,', ',')
        .replace('..', '.');
    };

    const value = removeSpecialCharacters(typedInput);
    setInput(value);

    if (value !== '') {
      setSelected(null);
      if (value.length >= 3 && isBusinessNameSelected && !isTaxCodeSelected) {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        searchByInstitutionType(value, institutionType);
      } else if (
        (isTaxCodeSelected && value.length === 11) ||
        (isIvassCodeSelected && value.length === 5)
      ) {
        if (institutionType === 'SA' || institutionType === 'AS') {
          const endpoint = addUser
            ? 'ONBOARDING_GET_INSTITUTIONS'
            : institutionType === 'SA'
            ? 'ONBOARDING_GET_SA_PARTY_FROM_FC'
            : 'ONBOARDING_GET_INSURANCE_COMPANIES_FROM_IVASSCODE';

          void contractingInsuranceFromTaxId(addUser, endpoint, params, value);
        } else {
          const endpoint = addUser
            ? 'ONBOARDING_GET_INSTITUTIONS'
            : product?.id === 'prod-interop' &&
              (institutionType === 'SCP' || institutionType === 'PRV')
            ? 'ONBOARDING_GET_PARTY_BY_CF_FROM_INFOCAMERE'
            : 'ONBOARDING_GET_PARTY_FROM_CF';
          void handleSearchByTaxCode(addUser, endpoint, params, value);
        }
      } else if (isAooCodeSelected && !isUoCodeSelected && value.length === 7) {
        const endpoint = addUser ? 'ONBOARDING_GET_INSTITUTIONS' : 'ONBOARDING_GET_AOO_CODE_INFO';
        void handleSearchByAooCode(addUser, endpoint, params, value);
      } else if (isUoCodeSelected && !isAooCodeSelected && value.length === 6) {
        const endpoint = addUser ? 'ONBOARDING_GET_INSTITUTIONS' : 'ONBOARDING_GET_UO_CODE_INFO';
        void handleSearchByUoCode(addUser, endpoint, params, value);
      }
    } else {
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
        pt={selected ? 4 : 3}
        pb={input?.length === 0 || selected ? 4 : 0}
      >
        {selected && (
          <Box display="flex" alignItems="center">
            <img
              style={{ height: 50, width: 50 }}
              onError={() => setPartyLogo(OnboardingPartyIcon)}
              src={partyLogo}
            />
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
          isIvassCodeSelected={isIvassCodeSelected}
          isBusinessNameSelected={isBusinessNameSelected}
          setCfResult={setCfResult}
          setAooResult={setAooResult}
          setUoResult={setUoResult}
          externalInstitutionId={externalInstitutionId}
          addUser={addUser}
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
            {(isTaxCodeSelected || isAooCodeSelected || isUoCodeSelected || isIvassCodeSelected) &&
            !isBusinessNameSelected &&
            input !== undefined &&
            input?.length >= 5 &&
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
                isIvassCodeSelected={isIvassCodeSelected}
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
