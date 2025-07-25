import { Grid, Theme, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { AxiosError, AxiosResponse } from 'axios';
import debounce from 'lodash/debounce';
import { Dispatch, SetStateAction, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ApiEndpointKey,
  Endpoint,
  InstitutionType,
  PartyData,
  Product,
} from '../../../../../types';
import OnboardingPartyIcon from '../../../../assets/onboarding_party_icon.svg';
import { fetchWithLogs } from '../../../../lib/api-utils';
import { UserContext } from '../../../../lib/context';
import { getFetchOutcome } from '../../../../lib/error-utils';
import { AooData } from '../../../../model/AooData';
import { SelectionsState } from '../../../../model/Selection';
import { UoData } from '../../../../model/UoModel';
import { buildUrlLogo, noMandatoryIpaProducts, PRODUCT_IDS } from '../../../../utils/constants';
import { ENV } from '../../../../utils/env';
import AsyncAutocompleteResultsBusinessName from './components/AsyncAutocompleteResultsBusinessName';
import AsyncAutocompleteResultsCode from './components/AsyncAutocompleteResultsCode';
import AsyncAutocompleteSearch from './components/AsyncAutocompleteSearch';

type Props = {
  selections: SelectionsState;
  optionKey?: string;
  optionLabel?: string;
  input: string;
  endpoint: Endpoint;
  setOptions: React.Dispatch<React.SetStateAction<Array<any>>>;
  transformFn: any;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  setSelected: React.Dispatch<React.SetStateAction<any>>;
  selected: any;
  theme: Theme;
  options: Array<any>;
  isSearchFieldSelected: boolean;
  setCfResult: React.Dispatch<React.SetStateAction<PartyData | undefined>>;
  cfResult?: PartyData;
  product?: Product | null;
  setAooResult: Dispatch<SetStateAction<AooData | undefined>>;
  setUoResult: Dispatch<SetStateAction<UoData | undefined>>;
  setUoResultHistory: (t: UoData | undefined) => void;
  setAooResultHistory: (t: AooData | undefined) => void;
  aooResult?: AooData;
  uoResult?: UoData;
  externalInstitutionId: string;
  institutionType?: InstitutionType;
  setDisabled: Dispatch<SetStateAction<boolean>>;
  addUser: boolean;
  selectedProduct?: Product;
  filterCategories?: string;
  setIsPresentInAtecoWhiteList?: Dispatch<SetStateAction<boolean>>;
  setMerchantSearchResult?: Dispatch<SetStateAction<PartyData | undefined>>;
  setApiLoading?: Dispatch<SetStateAction<boolean>>;
  apiLoading?: boolean;
};

// TODO: handle cognitive-complexity
// eslint-disable-next-line sonarjs/cognitive-complexity, complexity
export default function AsyncAutocompleteContainer({
  selections,
  optionKey,
  optionLabel,
  input,
  endpoint,
  setOptions,
  transformFn,
  setInput,
  setSelected,
  selected,
  theme,
  options,
  isSearchFieldSelected,
  setCfResult,
  cfResult,
  product,
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
  setIsPresentInAtecoWhiteList,
  setMerchantSearchResult,
  setApiLoading,
  apiLoading,
}: Props) {
  const { setRequiredLogin } = useContext(UserContext);
  const { t } = useTranslation();
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
      ? selections.businessName
        ? input.length < 3
        : selections.taxCode
          ? input.length < 11
          : selections.aooCode
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
    setApiLoading?.(true);
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

    setApiLoading?.(false);
  };

  const handleSearchByTaxCode = async (
    addUser: boolean,
    endpoint: ApiEndpointKey,
    params: any,
    query: string
    // eslint-disable-next-line sonarjs/cognitive-complexity
  ) => {
    setApiLoading?.(true);
    const updatedParams = {
      ...params,
      taxCode: addUser ? query : undefined,
      categories:
        (product?.id === PRODUCT_IDS.INTEROP || product?.id === PRODUCT_IDS.IDPAY_MERCHANT) &&
        (institutionType === 'SCP' || institutionType === 'PRV')
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
      const response = (searchResponse as AxiosResponse).data;
      setCfResult(response);

      if (product?.id === PRODUCT_IDS.IDPAY_MERCHANT) {
        setMerchantSearchResult?.(response);
        if (filterCategories && response?.atecoCodes && Array.isArray(response.atecoCodes)) {
          const whitelistCodes = filterCategories.split(',');
          const hasMatchingCode = response.atecoCodes.some((code: string) =>
            whitelistCodes.includes(code)
          );
          setIsPresentInAtecoWhiteList?.(hasMatchingCode);
          setDisabled(!hasMatchingCode);
        } else {
          setIsPresentInAtecoWhiteList?.(false);
          setDisabled(true);
        }
      }
    } else if ((searchResponse as AxiosError).response?.status === 404) {
      setCfResult(undefined);
      if (product?.id === PRODUCT_IDS.IDPAY_MERCHANT) {
        setIsPresentInAtecoWhiteList?.(false);
        setMerchantSearchResult?.(undefined);
      }
    }

    setApiLoading?.(false);
  };

  const handleSearchByReaCode = async (
    addUser: boolean,
    endpoint: ApiEndpointKey,
    params: any,
    query: string
    // eslint-disable-next-line sonarjs/cognitive-complexity
  ) => {
    setApiLoading?.(true);

    const reaPattern = /^[A-Za-z]{2}-\d{6}$/;
    if (!reaPattern.test(query)) {
      setApiLoading?.(false);
      setCfResult(undefined);
      setIsPresentInAtecoWhiteList?.(false);
      return;
    }

    const updatedParams = addUser
      ? params
      : {
          rea: query,
        };

    const searchResponse = await fetchWithLogs(
      {
        endpoint,
      },
      {
        method: 'GET',
        params: updatedParams,
      },
      () => setRequiredLogin(true)
    );

    const outcome = getFetchOutcome(searchResponse);

    if (outcome === 'success') {
      const response = (searchResponse as AxiosResponse).data;
      setCfResult(response);

      if (product?.id === PRODUCT_IDS.IDPAY_MERCHANT) {
        setMerchantSearchResult?.(response);
        if (filterCategories && response.atecoCodes && Array.isArray(response.atecoCodes)) {
          const whitelistCodes = filterCategories.split(',');
          const hasMatchingCode = response.atecoCodes.some((code: string) =>
            whitelistCodes.includes(code)
          );
          setIsPresentInAtecoWhiteList?.(hasMatchingCode);
          setDisabled(!hasMatchingCode);
        } else {
          setIsPresentInAtecoWhiteList?.(false);
          setDisabled(true);
        }
      }
    } else if ((searchResponse as AxiosError).response?.status === 404) {
      setCfResult(undefined);
      if (product?.id === PRODUCT_IDS.IDPAY_MERCHANT) {
        setMerchantSearchResult?.(undefined);
        setIsPresentInAtecoWhiteList?.(false);
      }
    }

    setApiLoading?.(false);
  };

  const handleSearchByAooCode = async (
    addUser: boolean,
    endpoint: ApiEndpointKey,
    params: any,
    query: string
  ) => {
    setApiLoading?.(true);

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
        ? ((searchResponse as AxiosResponse).data[0] ?? (searchResponse as AxiosResponse).data)
        : (searchResponse as AxiosResponse).data;
      setAooResult(response);
      setAooResultHistory(response);
    } else if ((searchResponse as AxiosError).response?.status === 404) {
      setAooResult(undefined);
    }

    setApiLoading?.(false);
  };

  const handleSearchByUoCode = async (
    addUser: boolean,
    endpoint: ApiEndpointKey,
    params: any,
    query: string
  ) => {
    setApiLoading?.(true);

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
        ? ((searchResponse as AxiosResponse).data[0] ?? (searchResponse as AxiosResponse).data)
        : (searchResponse as AxiosResponse).data;
      setUoResult(response);
      setUoResultHistory(response);
    } else if ((searchResponse as AxiosError).response?.status === 404) {
      setUoResult(undefined);
    }

    setApiLoading?.(false);
  };

  const contractingInsuranceFromTaxId = async (
    addUser: boolean,
    endpoint: ApiEndpointKey,
    params: any,
    query: string
  ) => {
    setApiLoading?.(true);

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
        ? ((searchResponse as AxiosResponse).data[0] ?? (searchResponse as AxiosResponse).data)
        : (searchResponse as AxiosResponse).data;
      setCfResult(response);
    } else if ((searchResponse as AxiosError).response?.status === 404) {
      setCfResult(undefined);
    }

    setApiLoading?.(false);
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
  const removeSpecialCharacters = (input: string): string => {
    const specialCharacters = `[$%&'()§#!£{}*+/:;<>@=?^|~]`;

    return input
      .split('')
      .map((char) => (specialCharacters.includes(char) ? '' : char))
      .join('')
      .replace(/''|""|--|__|,,|\.\./g, (match) => match[0]);
  };

  const getSearchEndpoint = (
    addUser: boolean,
    institutionType: string | undefined,
    product: any,
    selections: any
  ): ApiEndpointKey => {
    if (addUser) {
      return 'ONBOARDING_GET_INSTITUTIONS';
    }

    if (institutionType === 'SA') {
      return 'ONBOARDING_GET_SA_PARTY_FROM_FC';
    }
    if (institutionType === 'AS') {
      return 'ONBOARDING_GET_INSURANCE_COMPANIES_FROM_IVASSCODE';
    }

    if (
      product?.id === PRODUCT_IDS.INTEROP &&
      (institutionType === 'SCP' || institutionType === 'PRV')
    ) {
      return 'ONBOARDING_GET_PARTY_BY_CF_FROM_INFOCAMERE';
    }

    if (
      product?.id === PRODUCT_IDS.IDPAY_MERCHANT &&
      (selections.taxCode || selections.personalTaxCode)
    ) {
      return 'ONBOARDING_GET_VISURA_INFOCAMERE_BY_CF';
    }

    return 'ONBOARDING_GET_PARTY_FROM_CF';
  };

  // eslint-disable-next-line complexity
  const executeSearch = (
    value: string,
    selections: any,
    params: any,
    addUser: boolean,
    institutionType: string | undefined,
    product: any
    // eslint-disable-next-line sonarjs/cognitive-complexity
  ) => {
    const { length } = value;

    if (length >= 3 && selections.businessName && !selections.taxCode) {
      return searchByInstitutionType(value, institutionType);
    }

    const isValidTaxCode = selections.taxCode && length === 11;
    const isValidIvassCode = selections.ivassCode && length === 5;
    const isValidPersonalTaxCode = selections.personalTaxCode && length === 16;

    if (isValidTaxCode || isValidIvassCode || isValidPersonalTaxCode) {
      if (institutionType === 'SA' || institutionType === 'AS') {
        const endpoint = addUser
          ? 'ONBOARDING_GET_INSTITUTIONS'
          : institutionType === 'SA'
            ? 'ONBOARDING_GET_SA_PARTY_FROM_FC'
            : 'ONBOARDING_GET_INSURANCE_COMPANIES_FROM_IVASSCODE';

        return contractingInsuranceFromTaxId(addUser, endpoint, params, value);
      } else {
        const endpoint = getSearchEndpoint(addUser, institutionType, product, selections);
        return handleSearchByTaxCode(addUser, endpoint, params, value);
      }
    }

    if (selections.aooCode && !selections.uoCode && length === 7) {
      const endpoint = addUser ? 'ONBOARDING_GET_INSTITUTIONS' : 'ONBOARDING_GET_AOO_CODE_INFO';
      return handleSearchByAooCode(addUser, endpoint, params, value);
    }

    if (selections.uoCode && !selections.aooCode && length === 6) {
      const endpoint = addUser ? 'ONBOARDING_GET_INSTITUTIONS' : 'ONBOARDING_GET_UO_CODE_INFO';
      return handleSearchByUoCode(addUser, endpoint, params, value);
    }

    if (selections.reaCode && length > 1) {
      const endpoint = addUser
        ? 'ONBOARDING_GET_INSTITUTIONS'
        : 'ONBOARDING_GET_VISURA_INFOCAMERE_BY_REA';
      return handleSearchByReaCode(addUser, endpoint, params, value);
    }

    return null;
  };

  const handleChange = (event: any) => {
    const typedInput = event.target.value as string;
    const cleanValue = removeSpecialCharacters(typedInput);

    const params = {
      productId: selectedProduct?.id,
      taxCode: selections.taxCode || selections.personalTaxCode ? cleanValue : undefined,
      subunitCode: selections.aooCode || selections.uoCode ? cleanValue : undefined,
    };

    setInput(cleanValue);
    setSelected(null);

    if (cleanValue !== '') {
      void executeSearch(cleanValue, selections, params, addUser, institutionType, product);
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
          selections={selections}
          setCfResult={setCfResult}
          setAooResult={setAooResult}
          setUoResult={setUoResult}
          setMerchantSearchResult={setMerchantSearchResult}
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
        {selections.businessName ? (
          <>
            {options && showBusinessNameElement && options.length > 0 ? (
              <AsyncAutocompleteResultsBusinessName
                setSelected={setSelected}
                options={options}
                setOptions={setOptions}
                apiLoading={apiLoading}
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
            {(selections.taxCode ||
              selections.aooCode ||
              selections.uoCode ||
              selections.ivassCode ||
              selections.reaCode ||
              selections.personalTaxCode) &&
            !selections.businessName &&
            input !== undefined &&
            input?.length >= 5 &&
            !selected &&
            (cfResult || uoResult || aooResult) ? (
              <AsyncAutocompleteResultsCode
                setSelected={setSelected}
                cfResult={cfResult}
                setCfResult={setCfResult}
                apiLoading={apiLoading}
                getOptionLabel={getOptionLabel}
                getOptionKey={getOptionKey}
                aooResult={aooResult}
                uoResult={uoResult}
                selections={selections}
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
