import { Grid, Theme } from '@mui/material';
import { Box } from '@mui/system';
import debounce from 'lodash/debounce';
import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  ApiEndpointKey,
  Endpoint,
  InstitutionType,
  PartyData,
  Product,
} from '../../../../../types';
import OnboardingPartyIcon from '../../../../assets/onboarding_party_icon.svg';
import { UserContext } from '../../../../lib/context';
import { AooData } from '../../../../model/AooData';
import { AutocompleteOption } from '../../../../model/AutocompleteOption';
import { FilterCategories } from '../../../../model/FilterCategoriesResponse';
import { PDNDBusinessResource } from '../../../../model/PDNDBusinessResource';
import { SelectionsState } from '../../../../model/Selection';
import { UoData } from '../../../../model/UoModel';
import {
  contractingInsuranceFromTaxId,
  fetchInstitutionByTaxCode,
  fetchInstitutionsByName,
  handleSearchByAooCode,
  handleSearchByReaCode,
  handleSearchByUoCode,
  InstitutionSearchParams,
} from '../../../../services/institutionServices';
import { buildUrlLogo } from '../../../../utils/constants';
import { ENV } from '../../../../utils/env';
import {
  isContractingAuthority,
  isIdpayMerchantProduct,
  isInsuranceCompany,
  isPrivateInstitution,
  isPublicServiceCompany,
} from '../../../../utils/institutionTypeUtils';
import AsyncAutocompleteResultsBusinessName from './components/AsyncAutocompleteResultsBusinessName';
import AsyncAutocompleteResultsCode from './components/AsyncAutocompleteResultsCode';
import AsyncAutocompleteSearch from './components/AsyncAutocompleteSearch';
import AsyncAutocompleteStatusMessage from './components/AsyncAutocompleteStatusMessage';

type Props = {
  selections: SelectionsState;
  optionKey?: string;
  optionLabel?: string;
  input: string;
  endpoint: Endpoint;
  setOptions: Dispatch<SetStateAction<ReadonlyArray<AutocompleteOption>>>;
  transformFn: (data: never) => ReadonlyArray<AutocompleteOption>;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  setSelected: React.Dispatch<React.SetStateAction<PartyData | null>>;
  selected: PartyData | null;
  theme: Theme;
  options: ReadonlyArray<AutocompleteOption>;
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
  filterCategories?: FilterCategories;
  setMerchantSearchResult?: (value?: PDNDBusinessResource) => void;
  setApiLoading?: Dispatch<SetStateAction<boolean>>;
  apiLoading?: boolean;
  disabledStatusCompany?: boolean;
};

const removeSpecialCharacters = (input: string): string => {
  const specialCharacters = `[$%&'()§#!£{}*+/:;<>@=?^|~]`;

  return input
    .split('')
    .map((char) => (specialCharacters.includes(char) ? '' : char))
    .join('')
    .replace(/''|""|--|__|,,|\.\./g, (match) => match[0]);
};

const formatReaCode = (input: string): string => {
  const letters = input
    .replace(/[^A-Za-z]/g, '')
    .slice(0, 2)
    .toUpperCase();
  const numbers = input.replace(/[^0-9]/g, '').slice(0, 6);
  return letters.length < 2 || !numbers ? letters : `${letters}-${numbers}`;
};

const buildOptionGetter =
  (key?: string) =>
  (option: unknown): string =>
    key !== undefined
      ? String((option as Record<string, unknown>)[key] ?? '')
      : String((option as { label?: unknown } | null)?.label ?? option);

const isBusinessNameSearch = (selections: SelectionsState, value: string): boolean =>
  value.length >= 3 && selections.businessName && !selections.taxCode;

const isTaxIdSearch = (selections: SelectionsState, value: string): boolean =>
  (selections.taxCode && value.length === 11) ||
  (selections.ivassCode && value.length === 5) ||
  (selections.personalTaxCode && value.length === 16);

const isCodeSelection = (selections: SelectionsState): boolean =>
  selections.taxCode ||
  selections.aooCode ||
  selections.uoCode ||
  selections.ivassCode ||
  selections.reaCode ||
  selections.personalTaxCode;

const getTaxIdSearchEndpoint = (
  addUser: boolean,
  institutionType: InstitutionType | undefined,
  productId: string | undefined,
  selections: SelectionsState
): ApiEndpointKey => {
  if (addUser) {
    return 'ONBOARDING_GET_INSTITUTIONS';
  }
  if (isContractingAuthority(institutionType)) {
    return 'ONBOARDING_GET_SA_PARTY_FROM_FC';
  }
  if (isInsuranceCompany(institutionType)) {
    return 'ONBOARDING_GET_INSURANCE_COMPANIES_FROM_IVASSCODE';
  }
  if (isIdpayMerchantProduct(productId)) {
    return selections.taxCode || selections.personalTaxCode
      ? 'ONBOARDING_GET_VISURA_INFOCAMERE_BY_CF'
      : 'ONBOARDING_GET_PARTY_FROM_CF';
  }
  if (isPrivateInstitution(institutionType) || isPublicServiceCompany(institutionType)) {
    return 'ONBOARDING_GET_PARTY_BY_CF_FROM_INFOCAMERE';
  }
  return 'ONBOARDING_GET_PARTY_FROM_CF';
};

type ResultsStatus = 'results' | 'tooShort' | 'noResults' | undefined;

const getBusinessNameResultsStatus = (
  input: string,
  optionsCount: number,
  selected: PartyData | null
): ResultsStatus => {
  if (input.length >= 3 && optionsCount > 0) {
    return 'results';
  }
  if (input.length >= 1 && input.length < 3) {
    return 'tooShort';
  }
  return input.length >= 3 && optionsCount === 0 && !selected ? 'noResults' : undefined;
};

const getCodeResultsStatus = (
  input: string,
  optionsCount: number,
  selected: PartyData | null,
  selections: SelectionsState,
  results: ReadonlyArray<PartyData | AooData | UoData | undefined>
): ResultsStatus => {
  if (selected) {
    return undefined;
  }
  if (isCodeSelection(selections) && input.length >= 5 && results.some(Boolean)) {
    return 'results';
  }
  return input.length >= 1 && optionsCount === 0 && !results.every(Boolean)
    ? 'noResults'
    : undefined;
};

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
  setMerchantSearchResult,
  setApiLoading,
  apiLoading,
  disabledStatusCompany,
}: Props) {
  const { setRequiredLogin } = useContext(UserContext);
  const { t } = useTranslation();
  const [partyLogo, setPartyLogo] = useState<string>(
    selected ? buildUrlLogo(selected.id) : OnboardingPartyIcon
  );
  const getOptionKey = buildOptionGetter(optionKey);
  const getOptionLabel = buildOptionGetter(optionLabel);
  const showBusinessNameElement = input.length >= 3;

  useEffect(() => setDisabled(!selected), [selected]);

  useEffect(() => {
    setPartyLogo(selected ? buildUrlLogo(selected.id) : OnboardingPartyIcon);
  }, [selected]);

  useEffect(() => {
    if (isIdpayMerchantProduct(product?.id) && !selected) {
      setMerchantSearchResult?.(undefined);
      setCfResult(undefined);
    }

    if (!input || selected) {
      return;
    }

    void executeSearch(input, {
      productId: selectedProduct?.id,
      taxCode: selections.taxCode || selections.personalTaxCode ? input : undefined,
      subunitCode: selections.aooCode || selections.uoCode ? input : undefined,
    });
  }, [input]);

  useEffect(() => {
    if (!input) {
      setMerchantSearchResult?.(undefined);
      setDisabled(true);
    }
  }, [input]);

  const handleSearchByName = useCallback(
    async (query: string, endpoint: Endpoint, limit?: number, categories?: string) => {
      setApiLoading?.(true);

      await fetchInstitutionsByName(
        query,
        endpoint,
        setOptions,
        transformFn,
        setRequiredLogin,
        limit,
        categories
      );

      setApiLoading?.(false);
    },
    [setApiLoading, setOptions, transformFn, setRequiredLogin]
  );

  const debouncedSearchByName = useMemo(
    () => debounce(handleSearchByName, 100),
    [handleSearchByName]
  );

  // Cancel the pending search only on unmount or when debouncedSearchByName changes
  useEffect(() => () => debouncedSearchByName.cancel(), [debouncedSearchByName]);

  const handleSearchByTaxCode = useCallback(
    async (
      addUser: boolean,
      endpoint: ApiEndpointKey,
      params: InstitutionSearchParams,
      query: string
    ) => {
      setApiLoading?.(true);

      await fetchInstitutionByTaxCode(
        addUser,
        endpoint,
        params,
        query,
        product?.id,
        institutionType,
        filterCategories,
        disabledStatusCompany,
        setCfResult,
        setMerchantSearchResult,
        setDisabled,
        setRequiredLogin
      );

      setApiLoading?.(false);
    },
    [
      setApiLoading,
      product?.id,
      institutionType,
      filterCategories,
      disabledStatusCompany,
      setCfResult,
      setMerchantSearchResult,
      setDisabled,
      setRequiredLogin,
    ]
  );

  const searchByBusinessName = (value: string) => {
    switch (institutionType) {
      case 'AS':
        void debouncedSearchByName(value, {
          endpoint: 'ONBOARDING_GET_INSURANCE_COMPANIES_FROM_BUSINESSNAME',
        });
        break;
      case 'SA':
        void debouncedSearchByName(value, {
          endpoint: 'ONBOARDING_GET_SA_PARTIES_NAME',
        });
        break;
      default:
        void debouncedSearchByName(
          value,
          endpoint,
          ENV.MAX_INSTITUTIONS_FETCH,
          filterCategories as string
        );
    }
  };

  const searchByTaxId = (value: string, params: InstitutionSearchParams) => {
    const taxIdEndpoint = getTaxIdSearchEndpoint(addUser, institutionType, product?.id, selections);

    if (isContractingAuthority(institutionType) || isInsuranceCompany(institutionType)) {
      return contractingInsuranceFromTaxId(
        addUser,
        taxIdEndpoint,
        params,
        value,
        institutionType,
        setApiLoading,
        setCfResult,
        setRequiredLogin
      );
    }
    return handleSearchByTaxCode(addUser, taxIdEndpoint, params, value);
  };

  const searchByAooCode = (value: string, params: InstitutionSearchParams) =>
    handleSearchByAooCode(
      value,
      setAooResult,
      setAooResultHistory,
      setRequiredLogin,
      setApiLoading,
      addUser,
      addUser ? 'ONBOARDING_GET_INSTITUTIONS' : 'ONBOARDING_GET_AOO_CODE_INFO',
      params,
      filterCategories as string
    );

  const searchByUoCode = (value: string, params: InstitutionSearchParams) =>
    handleSearchByUoCode(
      value,
      setUoResult,
      setUoResultHistory,
      setRequiredLogin,
      setApiLoading,
      addUser,
      addUser ? 'ONBOARDING_GET_INSTITUTIONS' : 'ONBOARDING_GET_UO_CODE_INFO',
      params,
      filterCategories as string
    );

  const searchByReaCode = (value: string, params: InstitutionSearchParams) =>
    handleSearchByReaCode(
      addUser,
      addUser ? 'ONBOARDING_GET_INSTITUTIONS' : 'ONBOARDING_GET_VISURA_INFOCAMERE_BY_REA',
      params,
      value,
      setApiLoading,
      setCfResult,
      setDisabled,
      setRequiredLogin,
      product ?? undefined,
      filterCategories,
      disabledStatusCompany,
      setMerchantSearchResult
    );

  const executeSearch = (value: string, params: InstitutionSearchParams) => {
    if (isBusinessNameSearch(selections, value)) {
      return searchByBusinessName(value);
    }
    if (isTaxIdSearch(selections, value)) {
      return searchByTaxId(value, params);
    }
    if (selections.aooCode && !selections.uoCode && value.length === 7) {
      return searchByAooCode(value, params);
    }
    if (selections.uoCode && !selections.aooCode && value.length === 6) {
      return searchByUoCode(value, params);
    }
    if (selections.reaCode && value.length >= 4) {
      return searchByReaCode(value, params);
    }
    return null;
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const typedInput = event.target.value;

    const cleanValue = selections.reaCode
      ? formatReaCode(typedInput)
      : removeSpecialCharacters(typedInput);

    if (isIdpayMerchantProduct(product?.id)) {
      setMerchantSearchResult?.(undefined);
      setCfResult(undefined);
    }

    setInput(cleanValue);
    setSelected(null);
  };

  const renderBusinessNameResults = () => {
    switch (getBusinessNameResultsStatus(input, options.length, selected)) {
      case 'results':
        return (
          <AsyncAutocompleteResultsBusinessName
            setSelected={setSelected}
            options={options}
            setOptions={setOptions}
            apiLoading={apiLoading}
            getOptionLabel={getOptionLabel}
            getOptionKey={getOptionKey}
          />
        );
      case 'tooShort':
        return (
          <AsyncAutocompleteStatusMessage label={t('asyncAutocomplete.lessThen3CharacterLabel')} />
        );
      case 'noResults':
        return <AsyncAutocompleteStatusMessage label={t('asyncAutocomplete.noResultsLabel')} />;
      default:
        return null;
    }
  };

  const renderCodeResults = () => {
    const status = getCodeResultsStatus(input, options.length, selected, selections, [
      cfResult,
      uoResult,
      aooResult,
    ]);
    if (status === 'results') {
      return (
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
      );
    }
    return status === 'noResults' ? (
      <AsyncAutocompleteStatusMessage label={t('asyncAutocomplete.noResultsLabel')} />
    ) : null;
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
        pb={input.length === 0 || selected ? 4 : 0}
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
          setDisabled={setDisabled}
          externalInstitutionId={externalInstitutionId}
          addUser={addUser}
        />
      </Grid>
      <Grid
        item
        xs={12}
        display="flex"
        justifyContent="center"
        sx={{ height: showBusinessNameElement && options.length > 0 ? '232px' : undefined }}
      >
        {selections.businessName ? renderBusinessNameResults() : renderCodeResults()}
      </Grid>
    </>
  );
}
