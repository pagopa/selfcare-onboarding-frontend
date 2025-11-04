import { Grid, Theme, Typography } from '@mui/material';
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
import { SelectionsState } from '../../../../model/Selection';
import { UoData } from '../../../../model/UoModel';
import {
  contractingInsuranceFromTaxId,
  fetchInstitutionByTaxCode,
  fetchInstitutionsByName,
  handleSearchByAooCode,
  handleSearchByReaCode,
  handleSearchByUoCode,
} from '../../../../services/institutionServices';
import {
  buildUrlLogo,
  /* noMandatoryIpaProducts, */ PRODUCT_IDS,
} from '../../../../utils/constants';
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
  filterCategories?: string | { atecoCodes: string; allowedInstitutions: string };
  setIsPresentInAtecoWhiteList?: Dispatch<SetStateAction<boolean>>;
  setMerchantSearchResult?: Dispatch<SetStateAction<PartyData | undefined>>;
  setApiLoading?: Dispatch<SetStateAction<boolean>>;
  apiLoading?: boolean;
  disabledStatusCompany?: boolean;
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
  disabledStatusCompany,
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
  const canSearchByBusinessName =
    input.length >= 3 && selections.businessName && !selections.taxCode;
  const canSearch4Others =
    (selections.taxCode && input.length === 11) ||
    (selections.ivassCode && input.length === 5) ||
    (selections.personalTaxCode && input.length === 16) ||
    (selections.aooCode && input.length === 7) ||
    (selections.uoCode && input.length === 6) ||
    (selections.reaCode && input.length >= 4);

  useEffect(() => setDisabled(!selected), [selected]);

  useEffect(() => {
    if (selected) {
      const logoUrl = buildUrlLogo(selected.id);
      setPartyLogo(logoUrl);
    } else {
      setPartyLogo(OnboardingPartyIcon);
    }
  }, [selected]);

  useEffect(() => {
    if (!input || input.length === 0 || selected) {
      return;
    }

    const params = {
      productId: selectedProduct?.id,
      taxCode: selections.taxCode || selections.personalTaxCode ? input : undefined,
      subunitCode: selections.aooCode || selections.uoCode ? input : undefined,
    };

    if (canSearchByBusinessName || canSearch4Others) {
      void executeSearch(input, selections, params, addUser, institutionType, product);
    }
  }, [input]);

  useEffect(() => {
    if (!input || (input.length === 0 && product?.id === PRODUCT_IDS.IDPAY_MERCHANT)) {
      setIsPresentInAtecoWhiteList?.(true);
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

  // Esegue il cancel solo quando il componente si smonta o quando debouncedSearchByName cambia
  // eslint-disable-next-line arrow-body-style
  useEffect(() => {
    return () => {
      debouncedSearchByName.cancel();
    };
  }, [debouncedSearchByName]);

  const handleSearchByTaxCode = useCallback(
    async (addUser: boolean, endpoint: ApiEndpointKey, params: any, query: string) => {
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
        setIsPresentInAtecoWhiteList,
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
      setIsPresentInAtecoWhiteList,
      setDisabled,
      setRequiredLogin,
    ]
  );
  const searchByBusinessName = (value: string, institutionType?: string) => {
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
        void debouncedSearchByName(value, endpoint, ENV.MAX_INSTITUTIONS_FETCH, filterCategories as string);
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

  const formatReaCode = (input: string): string => {
    const letters = input
      .replace(/[^A-Za-z]/g, '')
      .slice(0, 2)
      .toUpperCase();
    const numbers = input.replace(/[^0-9]/g, '').slice(0, 6);
    return letters.length < 2 || !numbers ? letters : `${letters}-${numbers}`;
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
    if (value.length >= 3 && selections.businessName && !selections.taxCode) {
      return searchByBusinessName(value, institutionType);
    }

    const isValidTaxCode = selections.taxCode && value.length === 11;
    const isValidIvassCode = selections.ivassCode && value.length === 5;
    const isValidPersonalTaxCode = selections.personalTaxCode && value.length === 16;

    if (isValidTaxCode || isValidIvassCode || isValidPersonalTaxCode) {
      if (institutionType === 'SA' || institutionType === 'AS') {
        const endpoint = addUser
          ? 'ONBOARDING_GET_INSTITUTIONS'
          : institutionType === 'SA'
            ? 'ONBOARDING_GET_SA_PARTY_FROM_FC'
            : 'ONBOARDING_GET_INSURANCE_COMPANIES_FROM_IVASSCODE';

        return contractingInsuranceFromTaxId(
          addUser,
          endpoint,
          params,
          value,
          institutionType,
          setApiLoading,
          setCfResult,
          setRequiredLogin
        );
      } else {
        const endpoint = getSearchEndpoint(addUser, institutionType, product, selections);
        return handleSearchByTaxCode(addUser, endpoint, params, value);
      }
    }

    if (selections.aooCode && !selections.uoCode && value.length === 7) {
      const endpoint = addUser ? 'ONBOARDING_GET_INSTITUTIONS' : 'ONBOARDING_GET_AOO_CODE_INFO';
      return handleSearchByAooCode(
        value,
        setAooResult,
        setAooResultHistory,
        setRequiredLogin,
        setApiLoading,
        addUser,
        endpoint,
        params,
        filterCategories as string
      );
    }

    if (selections.uoCode && !selections.aooCode && value.length === 6) {
      const endpoint = addUser ? 'ONBOARDING_GET_INSTITUTIONS' : 'ONBOARDING_GET_UO_CODE_INFO';
      return handleSearchByUoCode(
        value,
        setUoResult,
        setUoResultHistory,
        setRequiredLogin,
        setApiLoading,
        addUser,
        endpoint,
        params,
        filterCategories as string
      );
    }

    if (selections.reaCode && value.length >= 4) {
      const endpoint = addUser
        ? 'ONBOARDING_GET_INSTITUTIONS'
        : 'ONBOARDING_GET_VISURA_INFOCAMERE_BY_REA';
      return handleSearchByReaCode(
        addUser,
        endpoint,
        params,
        value,
        setApiLoading,
        setCfResult,
        setIsPresentInAtecoWhiteList,
        setDisabled,
        setRequiredLogin,
        product,
        filterCategories,
        disabledStatusCompany,
        setMerchantSearchResult
      );
    }

    return null;
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const typedInput = event.target.value;

    const cleanValue = selections.reaCode
      ? formatReaCode(typedInput)
      : removeSpecialCharacters(typedInput);

    setInput(cleanValue);
    setSelected(null);
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
          setIsPresentInAtecoWhiteList={setIsPresentInAtecoWhiteList}
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
