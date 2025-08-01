import { Grid, MenuItem, Paper, TextField, Typography } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import Checkbox from '@mui/material/Checkbox';
import { Box, styled } from '@mui/system';
import { theme } from '@pagopa/mui-italia';
import { AxiosResponse } from 'axios';
import { Dispatch, SetStateAction, useContext, useEffect, useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import {
  InstitutionType,
  PaymentServiceProviderDto,
  StepperStepComponentProps,
} from '../../../types';
import { fetchWithLogs } from '../../lib/api-utils';
import { UserContext } from '../../lib/context';
import { getFetchOutcome } from '../../lib/error-utils';
import { InstitutionLocationData } from '../../model/InstitutionLocationData';
import { OnboardingFormData } from '../../model/OnboardingFormData';
import { formatCity } from '../../utils/formatting-utils';
import { StepBillingDataHistoryState } from '../steps/StepOnboardingFormData';
import { ENV } from '../../utils/env';
import { CountryResource } from '../../model/CountryResource';
import { PRODUCT_IDS, requiredError } from '../../utils/constants';
import { mockedCountries } from '../../lib/__mocks__/mockApiRequests';
import { AssistanceContacts } from '../../model/AssistanceContacts';
import NumberDecimalFormat from './NumberDecimalFormat';

interface CustomTextFieldNochedProps {
  paddingValue?: string;
}

const CustomTextField = styled(TextField)({
  '.MuiInputLabel-asterisk': {
    display: 'none',
  },
});

const CustomTextFieldNotched = styled(TextField)<CustomTextFieldNochedProps>(
  ({ paddingValue }) => ({
    '.MuiInputLabel-asterisk': {
      display: 'none',
    },
    '& .MuiOutlinedInput-notchedOutline legend': {
      paddingRight: '0',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline legend': {
      paddingRight: paddingValue ?? '0',
    },
    '& .MuiInputLabel-shrink + .MuiInputBase-root .MuiOutlinedInput-notchedOutline legend': {
      paddingRight: paddingValue ?? '0',
    },
  })
);

const CustomNumberField = styled(TextField)({
  'input::-webkit-inner-spin-button': {
    WebkitAppearance: 'none',
    margin: 0,
  },
  '.MuiInputLabel-asterisk': {
    display: 'none',
  },
});

type Props = StepperStepComponentProps & {
  institutionType: InstitutionType;
  baseTextFieldProps: any;
  origin?: string;
  stepHistoryState: StepBillingDataHistoryState;
  setStepHistoryState: React.Dispatch<React.SetStateAction<StepBillingDataHistoryState>>;
  formik: any;
  isDisabled: boolean;
  isPremium: boolean;
  onboardingFormData?: OnboardingFormData;
  isInformationCompany: boolean;
  institutionAvoidGeotax: boolean;
  productId?: string;
  retrievedIstat?: string;
  isCityEditable?: boolean;
  isInvoiceable: boolean;
  isForeignInsurance?: boolean;
  isPdndPrivate: boolean;
  isPrivateMerchant: boolean;
  setInvalidTaxCodeInvoicing: React.Dispatch<React.SetStateAction<boolean>>;
  recipientCodeStatus?: string;
  getCountriesFromGeotaxonomies: (
    query: string,
    setCountries: Dispatch<SetStateAction<Array<InstitutionLocationData> | undefined>>
  ) => Promise<void>;
  countries: Array<InstitutionLocationData> | undefined;
  setCountries: Dispatch<SetStateAction<Array<InstitutionLocationData> | undefined>>;
};

// eslint-disable-next-line sonarjs/cognitive-complexity, complexity
export default function PersonalAndBillingDataSection({
  institutionType,
  baseTextFieldProps,
  origin,
  stepHistoryState,
  setStepHistoryState,
  formik,
  isDisabled,
  isPremium,
  isInformationCompany,
  onboardingFormData,
  institutionAvoidGeotax,
  retrievedIstat,
  isCityEditable,
  isInvoiceable,
  isForeignInsurance,
  productId,
  isPdndPrivate,
  isPrivateMerchant,
  setInvalidTaxCodeInvoicing,
  recipientCodeStatus,
  getCountriesFromGeotaxonomies,
  countries,
  setCountries,
}: Props) {
  const { t } = useTranslation();
  const { setRequiredLogin } = useContext(UserContext);

  const [shrinkRea, setShrinkRea] = useState<boolean>(false);
  const [shrinkVatNumber, setShrinkVatNumber] = useState<boolean>(false);
  const [shrinkCity, setShrinkCity] = useState<boolean>(false);
  const [institutionLocationData, setInstitutionLocationData] = useState<InstitutionLocationData>();
  const [isCitySelected, setIsCitySelected] = useState<boolean>(false);
  const [nationalCountries, setNationalCountries] = useState<Array<CountryResource>>();
  const [input, setInput] = useState<string>();
  const [disableTaxCodeInvoicing, setDisableTaxCodeInvoicing] = useState<boolean>(false);
  const [taxCodeInvoicingVisible, setTaxCodeInvoicingVisible] = useState<boolean>(false);
  const [assistanceContacts, setAssistanceContacts] = useState<AssistanceContacts>();
  const [pspData, setPspData] = useState<PaymentServiceProviderDto>();

  useEffect(() => {
    const shareCapitalIsNan = isNaN(formik.values.shareCapital);
    if (shareCapitalIsNan) {
      formik.setFieldValue('shareCapital', undefined);
    }
    if (formik.values.shareCapital) {
      setShrinkRea(true);
    } else {
      setShrinkRea(false);
    }
  }, [formik.values.shareCapital]);

  useEffect(() => {
    if (assistanceContacts?.supportEmail) {
      formik.setFieldValue('supportEmail', assistanceContacts.supportEmail);
    }
  }, [assistanceContacts]);

  useEffect(() => {
    if (pspData) {
      formik.setFieldValue('commercialRegisterNumber', pspData.businessRegisterNumber);
      formik.setFieldValue(
        'registrationInRegister',
        pspData.legalRegisterName === 'N/A' ? '' : pspData.legalRegisterName
      );
      formik.setFieldValue(
        'registerNumber',
        pspData.legalRegisterNumber === 'N/A' ? '' : pspData.legalRegisterNumber
      );
      formik.setFieldValue('abiCode', pspData.abiCode);
      formik.setFieldValue('vatNumberGroup', pspData.vatNumberGroup);
    }
  }, [pspData]);

  useEffect(() => {
    if (institutionLocationData?.city) {
      formik.setFieldValue('country', institutionLocationData.country);
      formik.setFieldValue('county', institutionLocationData.county);
      formik.setFieldValue('city', institutionLocationData.city);
    }
  }, [institutionLocationData]);

  useEffect(() => {
    if (isPremium) {
      setAssistanceContacts({
        supportEmail: formik.values.supportEmail,
      });
      setPspData({
        businessRegisterNumber: formik.values.businessRegisterNumber,
        legalRegisterName: formik.values.legalRegisterName,
        legalRegisterNumber: formik.values.legalRegisterNumber,
        vatNumberGroup: formik.values.vatNumberGroup,
        abiCode: formik.values.abiCode,
      });
      setInstitutionLocationData({
        country: formik.values.country,
        county: formik.values.county,
        city: formik.values.city,
      });
    }
  }, [isPremium]);

  const isFromIPA = origin === 'IPA';
  const isPaymentServiceProvider = institutionType === 'PSP';
  const isContractingAuthority = institutionType === 'SA';
  const isInsuranceCompany = institutionType === 'AS';
  const isAooUo = !!(onboardingFormData?.uoUniqueCode ?? onboardingFormData?.aooUniqueCode);

  useEffect(() => {
    if (!isPremium && (isFromIPA || isAooUo)) {
      const istatCode = onboardingFormData?.istatCode ?? retrievedIstat;
      void getLocationFromIstatCode(istatCode);
    }
  }, [isPremium, isFromIPA, isAooUo]);

  useEffect(() => {
    if (isForeignInsurance) {
      formik.setFieldValue('isForeignInsurance', true);
      formik.setFieldValue('zipCode', undefined);
      formik.setFieldValue('city', undefined);
      formik.setFieldValue('county', undefined);
      formik.setFieldValue('country', undefined);
    } else {
      formik.setFieldValue('isForeignInsurance', false);
      formik.setFieldValue('hasVatnumber', true);
    }
  }, [isForeignInsurance]);

  useEffect(() => {
    if (onboardingFormData?.aooUniqueCode) {
      formik.setFieldValue('recipientCode', undefined);
    }
  }, [onboardingFormData?.aooUniqueCode]);

  useEffect(() => {
    if (formik.values.recipientCode?.length >= 6 && recipientCodeStatus === 'ACCEPTED') {
      void getUoInfoFromRecipientCode(formik.values.recipientCode);
      setTaxCodeInvoicingVisible(true);
    } else {
      formik.setFieldValue('taxCodeInovoicing', undefined);
      setDisableTaxCodeInvoicing(false);
      setTaxCodeInvoicingVisible(false);
    }
  }, [formik.values.recipientCode, recipientCodeStatus]);

  useEffect(() => {
    if (stepHistoryState.isTaxCodeEquals2PIVA) {
      formik.setFieldValue('vatNumber', formik.values.taxCode);
    } else {
      formik.setFieldValue('vatNumber', '');
    }
  }, [stepHistoryState.isTaxCodeEquals2PIVA]);

  const baseNumericFieldProps = (
    field: keyof OnboardingFormData,
    label: string,
    fontWeight: string | number = 'fontWeightMedium',
    fontSize: number = 18,
    color: string = isDisabled ? theme.palette.text.disabled : theme.palette.text.primary
  ) => {
    const isError = !!formik.errors[field] && formik.errors[field] !== requiredError;
    return {
      id: field,
      type: 'tel',
      value: formik.values[field],
      label,
      error: isError,
      helperText: isError ? formik.errors[field] : undefined,
      required: true,
      variant: 'outlined' as const,
      onChange: formik.handleChange,
      sx: { width: '100%' },
      InputProps: {
        style: {
          fontSize,
          fontWeight,
          lineHeight: '24px',
          color,
          textAlign: 'start' as const,
          paddingLeft: '16px',
          borderRadius: '4px',
        },
      },
    };
  };

  const getNationalCountries = async (_query: string) => {
    if (process.env.REACT_APP_MOCK_API === 'true') {
      const countriesWithoutIta = mockedCountries.filter(
        (cm: CountryResource) => cm.alpha_2 !== 'IT'
      );
      setNationalCountries(countriesWithoutIta);
    } else {
      try {
        const response = await fetch(ENV.JSON_URL.COUNTRIES);
        const nationalCountriesResponse = await response.json();
        const countriesWithoutIta = nationalCountriesResponse.filter(
          (cm: CountryResource) => cm.alpha_2 !== 'IT'
        );
        setNationalCountries(countriesWithoutIta);
      } catch (reason) {
        console.error(reason);
      }
    }
  };

  const getLocationFromIstatCode = async (istatCode?: string) => {
    const getLocation = await fetchWithLogs(
      {
        endpoint: 'ONBOARDING_GET_LOCATION_BY_ISTAT_CODE',
        endpointParams: {
          geoTaxId: istatCode,
        },
      },
      { method: 'GET' },
      () => setRequiredLogin(true)
    );
    const outcome = getFetchOutcome(getLocation);

    if (outcome === 'success') {
      const result = (getLocation as AxiosResponse).data;
      if (result) {
        const institutionLocation = {
          code: result.code,
          country: result.country_abbreviation,
          county: result.province_abbreviation,
          city: formatCity(result.desc),
        };
        setInstitutionLocationData(institutionLocation);
      }
    }
  };

  const verifyTaxCodeInvoicing = async (taxCodeInvoicing: string) => {
    const getUoList = await fetchWithLogs(
      {
        endpoint: 'ONBOARDING_GET_UO_LIST',
      },
      {
        method: 'GET',
        params: {
          taxCodeInvoicing,
        },
      },
      () => setRequiredLogin(true)
    );

    const outcome = getFetchOutcome(getUoList);

    if (outcome === 'success') {
      const uoList = (getUoList as AxiosResponse).data.items;
      const match = uoList.find((uo: any) => uo.codiceFiscaleEnte === formik.values.taxCode);
      if (match) {
        setInvalidTaxCodeInvoicing(false);
      } else {
        setInvalidTaxCodeInvoicing(true);
      }
    }
  };

  const getUoInfoFromRecipientCode = async (recipientCode: string) => {
    const searchResponse = await fetchWithLogs(
      { endpoint: 'ONBOARDING_GET_UO_CODE_INFO', endpointParams: { codiceUniUo: recipientCode } },
      {
        method: 'GET',
        params: undefined,
      },
      () => setRequiredLogin(true)
    );

    const outcome = getFetchOutcome(searchResponse);

    if (outcome === 'success') {
      formik.setFieldValue(
        'taxCodeInvoicing',
        (searchResponse as AxiosResponse).data?.codiceFiscaleSfe
      );
      setDisableTaxCodeInvoicing(true);
    } else {
      setDisableTaxCodeInvoicing(false);
    }
  };

  return (
    <Paper elevation={8} sx={{ borderRadius: theme.spacing(2), p: 4, width: '704px' }}>
      <Grid item container spacing={3}>
        {isAooUo && (
          <Box px={4} pt={2} width="100%">
            <Typography sx={{ fontSize: 'fontSize' }}>
              {t('onboardingFormData.billingDataSection.centralPartyLabel')}
            </Typography>
            <Typography sx={{ fontWeight: 'fontWeightMedium', fontSize: 'fontSize' }}>
              {onboardingFormData?.businessName}
            </Typography>
          </Box>
        )}
        {onboardingFormData?.uoUniqueCode ? (
          <>
            <Grid item xs={8}>
              <CustomTextField
                {...baseTextFieldProps(
                  'uoName',
                  t('onboardingFormData.billingDataSection.uoName'),
                  600,
                  isDisabled ? theme.palette.text.disabled : theme.palette.text.primary
                )}
                disabled={isDisabled}
              />
            </Grid>
            <Grid item xs={4}>
              <CustomTextField
                {...baseTextFieldProps(
                  'uoUniqueCode',
                  t('onboardingFormData.billingDataSection.uoUniqueCode'),
                  600,
                  isDisabled ? theme.palette.text.disabled : theme.palette.text.primary
                )}
                disabled={isDisabled}
              />
            </Grid>
          </>
        ) : onboardingFormData?.aooUniqueCode ? (
          <>
            <Grid item xs={8}>
              <CustomTextField
                {...baseTextFieldProps(
                  'aooName',
                  t('onboardingFormData.billingDataSection.aooName'),
                  600,
                  isDisabled ? theme.palette.text.disabled : theme.palette.text.primary
                )}
                disabled={isDisabled}
              />
            </Grid>
            <Grid item xs={4}>
              <CustomTextField
                {...baseTextFieldProps(
                  'aooUniqueCode',
                  t('onboardingFormData.billingDataSection.aooUniqueCode'),
                  600,
                  isDisabled ? theme.palette.text.disabled : theme.palette.text.primary
                )}
                disabled={isDisabled}
              />
            </Grid>
          </>
        ) : (
          <Grid item xs={12}>
            <CustomTextField
              {...baseTextFieldProps(
                'businessName',
                t('onboardingFormData.billingDataSection.businessName'),
                600,
                isDisabled || isContractingAuthority || isInsuranceCompany
                  ? theme.palette.text.disabled
                  : theme.palette.text.primary
              )}
              disabled={
                isDisabled ||
                isContractingAuthority ||
                isInsuranceCompany ||
                (isInformationCompany && onboardingFormData?.businessName) ||
                (institutionType === 'PRV' && productId !== PRODUCT_IDS.PAGOPA)
              }
            />
          </Grid>
        )}
        <Grid container spacing={2} pl={3} pt={3}>
          <Grid item xs={isForeignInsurance ? 12 : 7}>
            <CustomTextFieldNotched
              paddingValue="20px"
              {...baseTextFieldProps(
                'registeredOffice',
                t('onboardingFormData.billingDataSection.fullLegalAddress'),
                600,
                !isAooUo && isDisabled && !isInsuranceCompany
                  ? theme.palette.text.disabled
                  : theme.palette.text.primary
              )}
              disabled={!isAooUo && isDisabled && !isInsuranceCompany}
            />
          </Grid>
          {!isForeignInsurance && (
            <Grid item xs={5}>
              <CustomNumberField
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                {...baseNumericFieldProps(
                  'zipCode',
                  t('onboardingFormData.billingDataSection.zipCode'),
                  600,
                  16,
                  !isAooUo && isDisabled && !isInsuranceCompany
                    ? theme.palette.text.disabled
                    : theme.palette.text.primary
                )}
                disabled={!isAooUo && isDisabled && !isInsuranceCompany}
              />
            </Grid>
          )}
        </Grid>
        <Grid container spacing={2} pl={3} pt={3}>
          <Grid item xs={7}>
            {isInsuranceCompany && isForeignInsurance ? (
              <CustomTextField
                {...baseTextFieldProps(
                  'city',
                  t('onboardingFormData.billingDataSection.city'),
                  600,
                  isDisabled ? theme.palette.text.disabled : theme.palette.text.primary
                )}
                disabled={isDisabled}
              />
            ) : (
              <Autocomplete
                data-testid="city-autocomplete"
                id="city-select"
                onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const value = e.target.value;
                  formik.setFieldValue('city', value);
                  if (value.length >= 3) {
                    void getCountriesFromGeotaxonomies(value, setCountries);
                  } else {
                    setCountries(undefined);
                  }
                }}
                inputValue={formik.values.city || ''}
                onChange={(_e: any, selected: any) => {
                  formik.setFieldValue('city', selected?.city || '');
                  formik.setFieldValue('county', selected?.city || '');
                  formik.setFieldValue('istatCode', !isFromIPA ? selected?.istat_code : undefined);
                  if (selected) {
                    setInstitutionLocationData(selected);
                    setIsCitySelected(true);
                  } else {
                    setIsCitySelected(false);
                  }
                }}
                onBlur={() => {
                  if (!isCitySelected) {
                    setCountries(undefined);
                    setInstitutionLocationData(undefined);
                  }
                }}
                getOptionLabel={(o) => o.city}
                options={countries ?? []}
                noOptionsText={t('onboardingFormData.billingDataSection.noResult')}
                clearOnBlur={true}
                forcePopupIcon={!(isFromIPA || !isCityEditable)}
                disabled={isPremium || isFromIPA || isAooUo}
                ListboxProps={{
                  style: {
                    overflow: 'visible',
                  },
                }}
                componentsProps={{
                  paper: {
                    sx: {
                      '&::-webkit-scrollbar': {
                        width: 4,
                      },
                      '&::-webkit-scrollbar-track': {
                        boxShadow: `inset 10px 10px  #E6E9F2`,
                        marginY: '3px',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        backgroundColor: '#0073E6',
                        borderRadius: '16px',
                      },
                      overflowY: 'auto',
                      maxHeight: '200px',
                      boxShadow:
                        '0px 6px 30px 5px rgba(0, 43, 85, 0.10), 0px 16px 24px 2px rgba(0, 43, 85, 0.05), 0px 8px 10px -5px rgba(0, 43, 85, 0.10)',
                    },
                  },
                }}
                renderOption={(props, option: InstitutionLocationData) => (
                  <MenuItem id={option.code} {...props} sx={{ height: '44px' }}>
                    {option?.city}
                  </MenuItem>
                )}
                renderInput={(params: any) => (
                  <TextField
                    {...params}
                    inputProps={{
                      ...params.inputProps,
                      value:
                        !isCityEditable || isFromIPA || isAooUo
                          ? formik.values.city
                          : params.inputProps.value,
                    }}
                    id="city-field"
                    label={t('onboardingFormData.billingDataSection.city')}
                    InputLabelProps={{
                      shrink: (formik.values.city && formik.values.city !== '') || shrinkCity,
                    }}
                    sx={{
                      '& .MuiOutlinedInput-input.MuiInputBase-input': {
                        marginLeft: '15px',
                        fontSize: 'fontSize',
                        fontWeight: 'fontWeightMedium',
                        textTransform: 'capitalize',
                        color: isDisabled
                          ? theme.palette.text.disabled
                          : theme.palette.text.primary,
                      },
                      '& .MuiInputBase-root': {
                        height: '56px',
                      },
                    }}
                    onClick={() => setShrinkCity(true)}
                    onBlur={() => setShrinkCity(false)}
                    disabled={isDisabled}
                  />
                )}
              />
            )}
          </Grid>
          <Grid item xs={5}>
            {isInsuranceCompany && isForeignInsurance ? (
              <Autocomplete
                id="country-select"
                onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const value = e.target.value;
                  setInput(value);
                  if (value.length >= 3) {
                    void getNationalCountries(value);
                  } else {
                    setNationalCountries(undefined);
                  }
                }}
                inputValue={formik.values.extendedCountry ?? input}
                onChange={(_e: any, selected: any) => {
                  if (selected) {
                    formik.setFieldValue('country', selected.alpha_2);
                    formik.setFieldValue('extendedCountry', selected.name);
                    setInstitutionLocationData({ ...selected, country: selected.alpha_2 });
                  } else {
                    formik.setFieldValue('country', undefined);
                    formik.setFieldValue('extendedCountry', undefined);
                    setInstitutionLocationData({ ...selected, country: undefined });
                  }
                }}
                getOptionLabel={(o) => o.name}
                options={nationalCountries ?? []}
                noOptionsText={t('onboardingFormData.billingDataSection.noResult')}
                clearOnBlur={true}
                ListboxProps={{
                  style: {
                    overflow: 'visible',
                  },
                }}
                componentsProps={{
                  paper: {
                    sx: {
                      '&::-webkit-scrollbar': {
                        width: 4,
                      },
                      '&::-webkit-scrollbar-track': {
                        boxShadow: `inset 10px 10px  #E6E9F2`,
                        marginY: '3px',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        backgroundColor: '#0073E6',
                        borderRadius: '16px',
                      },
                      overflowY: 'auto',
                      maxHeight: '200px',
                      boxShadow:
                        '0px 6px 30px 5px rgba(0, 43, 85, 0.10), 0px 16px 24px 2px rgba(0, 43, 85, 0.05), 0px 8px 10px -5px rgba(0, 43, 85, 0.10)',
                    },
                  },
                }}
                renderOption={(props, option) => (
                  <MenuItem id={option.country_code} {...props} sx={{ height: '44px' }}>
                    {option.name}
                  </MenuItem>
                )}
                renderInput={(params: any) => (
                  <TextField
                    {...params}
                    inputProps={{
                      ...params.inputProps,
                      value: params.inputProps.value,
                    }}
                    label={t('onboardingFormData.billingDataSection.country')}
                    sx={{
                      '& .MuiOutlinedInput-input.MuiInputBase-input': {
                        marginLeft: '15px',
                        fontWeight: 'fontWeightMedium',
                        textTransform: 'capitalize',
                        color: theme.palette.text.primary,
                      },
                    }}
                  />
                )}
              />
            ) : (
              <CustomTextField
                {...baseTextFieldProps(
                  'county',
                  t('onboardingFormData.billingDataSection.county'),
                  600,
                  theme.palette.text.disabled
                )}
                disabled={true}
              />
            )}
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            {...baseTextFieldProps(
              'digitalAddress',
              t('onboardingFormData.billingDataSection.digitalAddress'),
              600,
              isDisabled || isContractingAuthority || isInsuranceCompany
                ? theme.palette.text.disabled
                : theme.palette.text.primary
            )}
            disabled={
              isDisabled ||
              isContractingAuthority ||
              isInsuranceCompany ||
              (isInformationCompany && onboardingFormData?.digitalAddress) ||
              (institutionType === 'PRV' && productId !== PRODUCT_IDS.PAGOPA)
            }
          />
        </Grid>
        {(!isInsuranceCompany ||
          (onboardingFormData?.taxCode && onboardingFormData?.taxCode !== '')) && (
          <Grid item xs={12}>
            <CustomTextField
              {...baseTextFieldProps(
                'taxCode',
                isAooUo
                  ? t('onboardingFormData.billingDataSection.taxCodeCentralParty')
                  : t('onboardingFormData.billingDataSection.taxCode'),
                600,
                isDisabled || isContractingAuthority || isInsuranceCompany
                  ? theme.palette.text.disabled
                  : theme.palette.text.primary
              )}
              disabled={
                isDisabled ||
                isContractingAuthority ||
                isInsuranceCompany ||
                (isInformationCompany && onboardingFormData?.taxCode) ||
                (institutionType === 'PRV' && productId !== PRODUCT_IDS.PAGOPA)
              }
              inputProps={{
                maxLength: 11,
              }}
              value={formik.values.taxCode || ''}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                if (value.length <= 11) {
                  formik.setFieldValue('taxCode', value);
                }
              }}
            />
          </Grid>
        )}

        {!isForeignInsurance && (
          <Grid
            container
            item
            spacing={3}
            xs={12}
            pl={3}
            pt={
              !isForeignInsurance ||
              (formik.values.hasVatnumber && onboardingFormData?.taxCode !== '')
                ? 3
                : 0
            }
            mb={!formik.values.hasVatnumber && isInvoiceable && isInsuranceCompany ? -3 : 0}
          >
            {formik.values.hasVatnumber &&
              (!isInsuranceCompany ||
                (onboardingFormData?.taxCode && onboardingFormData?.taxCode !== '')) &&
              !isPrivateMerchant && (
                <Grid item>
                  <Box display="flex" alignItems="center">
                    <Checkbox
                      id="taxCodeEquals2VatNumber"
                      checked={stepHistoryState.isTaxCodeEquals2PIVA}
                      disabled={isPremium || formik.values.taxCode.length !== 11}
                      inputProps={{
                        'aria-label': t(
                          'onboardingFormData.billingDataSection.taxCodeEquals2PIVAdescription'
                        ),
                      }}
                      onChange={(e) => {
                        setStepHistoryState({
                          ...stepHistoryState,
                          isTaxCodeEquals2PIVA: e.target.checked,
                        });
                      }}
                    />
                    <Typography component={'span'}>
                      {t('onboardingFormData.billingDataSection.taxCodeEquals2PIVAdescription')}
                    </Typography>
                  </Box>
                </Grid>
              )}
            {productId !== PRODUCT_IDS.FD &&
              productId !== PRODUCT_IDS.FD_GARANTITO &&
              !isPrivateMerchant && (
                <Grid item>
                  <Box
                    display="flex"
                    alignItems="center"
                    marginBottom={!formik.values.hasVatnumber && isInvoiceable ? -2 : 0}
                  >
                    <Checkbox
                      id="party_without_vatnumber"
                      inputProps={{
                        'aria-label': t(
                          'onboardingFormData.billingDataSection.partyWithoutVatNumber'
                        ),
                      }}
                      onChange={(e) => {
                        formik.setFieldValue('hasVatnumber', !e.target.checked);
                        setStepHistoryState({
                          ...stepHistoryState,
                          isTaxCodeEquals2PIVA: false,
                        });
                      }}
                    />
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography component={'span'}>
                        {t('onboardingFormData.billingDataSection.partyWithoutVatNumber')}
                      </Typography>
                      <Typography variant={'caption'} sx={{ fontWeight: '400', color: '#5C6F82' }}>
                        <Trans
                          i18nKey="onboardingFormData.billingDataSection.partyWIthoutVatNumberSubtitle"
                          components={{ 1: <br /> }}
                        >
                          {`Indica solo il Codice Fiscale se il tuo ente non agisce nell'esercizio d'impresa,
                arte o professione <1 />(cfr. art. 21, comma 2, lett. f, DPR n. 633/1972)`}
                        </Trans>
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              )}
          </Grid>
        )}

        <Grid item xs={12}>
          <Typography component={'span'}>
            {formik.values.hasVatnumber && !isForeignInsurance && (
              <CustomTextField
                {...baseTextFieldProps(
                  'vatNumber',
                  t('onboardingFormData.billingDataSection.vatNumber'),
                  600,
                  stepHistoryState.isTaxCodeEquals2PIVA || isPremium
                    ? theme.palette.text.disabled
                    : theme.palette.text.primary
                )}
                value={formik.values.vatNumber}
                disabled={stepHistoryState.isTaxCodeEquals2PIVA || isPremium || isPrivateMerchant}
                onClick={() => setShrinkVatNumber(true)}
                onBlur={() => setShrinkVatNumber(false)}
                InputLabelProps={{
                  shrink:
                    shrinkVatNumber ||
                    stepHistoryState.isTaxCodeEquals2PIVA ||
                    formik.values.vatNumber,
                }}
              />
            )}
            {isPaymentServiceProvider && formik.values.hasVatnumber && (
              <Box display="flex" alignItems="center" mt="2px">
                {/* Checkbox la aprtita IVA è di gruppo */}
                <Checkbox
                  id={'vatNumberGroup'}
                  name="vatNumberGroup"
                  inputProps={{
                    'aria-label': t('onboardingFormData.billingDataSection.vatNumberGroup'),
                  }}
                  checked={formik.values.vatNumberGroup}
                  onChange={(_, checked: boolean) =>
                    formik.setFieldValue('vatNumberGroup', checked, true)
                  }
                  value={formik.values.vatNumberGroup}
                  disabled={isPremium && !!pspData?.vatNumberGroup}
                />
                <Typography component={'span'}>
                  {t('onboardingFormData.billingDataSection.vatNumberGroup')}
                </Typography>
              </Box>
            )}
            {isInvoiceable && (
              <Grid item xs={12} mt={3}>
                <CustomTextFieldNotched
                  paddingValue={institutionType === 'PA' || isAooUo ? '8px' : '0'}
                  {...baseTextFieldProps(
                    'recipientCode',
                    institutionType === 'PA' || isAooUo
                      ? t('onboardingFormData.billingDataSection.sdiCodePaAooUo')
                      : t('onboardingFormData.billingDataSection.sdiCode'),
                    600,
                    theme.palette.text.primary
                  )}
                  inputProps={{
                    maxLength: 7,
                    style: { textTransform: 'uppercase' },
                    onInput: (event) => {
                      const input = event.target as HTMLInputElement;
                      const cleanedValue = input.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                      // eslint-disable-next-line functional/immutable-data
                      input.value = cleanedValue;
                    },
                  }}
                  disabled={
                    isPremium &&
                    formik.values.recipientCode.length >= 6 &&
                    formik.initialValues.recipientCode.length >= 6 &&
                    !formik.errors.recipientCode
                  }
                  helperText={
                    formik.errors.recipientCode === 'Required'
                      ? undefined
                      : formik.errors.recipientCode
                  }
                  error={
                    formik.errors.recipientCode === 'Required'
                      ? false
                      : !!formik.errors.recipientCode
                  }
                />
                <Typography
                  component={'span'}
                  sx={{
                    fontSize: '12px!important',
                    fontWeight: 'fontWeightMedium',
                    color: theme.palette.text.secondary,
                  }}
                >
                  {institutionType === 'PA' || isAooUo
                    ? t('onboardingFormData.billingDataSection.sdiCodePaAooUoDescription')
                    : t('onboardingFormData.billingDataSection.recipientCodeDescription')}
                </Typography>
              </Grid>
            )}
            {(onboardingFormData?.uoUniqueCode || institutionType === 'PA') &&
              isInvoiceable &&
              taxCodeInvoicingVisible && (
                <Grid item xs={12} mt={3}>
                  <CustomTextField
                    {...baseTextFieldProps(
                      'taxCodeInvoicing',
                      t('onboardingFormData.billingDataSection.taxCodeInvoicing'),
                      600,
                      theme.palette.text.primary
                    )}
                    onChange={(e) => {
                      formik.setFieldValue('taxCodeInvoicing', e.target.value);
                      if (e.target.value.length === 11) {
                        void verifyTaxCodeInvoicing(e.target.value);
                      } else {
                        setInvalidTaxCodeInvoicing(false);
                      }
                    }}
                    inputProps={{
                      maxLength: 11,
                    }}
                    disabled={disableTaxCodeInvoicing}
                  />
                </Grid>
              )}
          </Typography>
        </Grid>
        {isInsuranceCompany && (
          <Grid item xs={12} marginTop={isForeignInsurance ? -3 : 0}>
            <CustomTextField
              {...baseTextFieldProps(
                'originId',
                t('onboardingFormData.billingDataSection.originId'),
                600,
                theme.palette.text.disabled
              )}
              value={formik.values.originId}
              disabled={true}
            />
          </Grid>
        )}
        {(isInformationCompany ||
          isContractingAuthority ||
          ((productId === PRODUCT_IDS.INTEROP ||
            productId === PRODUCT_IDS.PAGOPA ||
            productId === PRODUCT_IDS.IDPAY_MERCHANT) &&
            (institutionType === 'SCP' ||
              institutionType === 'PRV' ||
              institutionType === 'GPU'))) && (
          <>
            <Grid item xs={12}>
              {/* Luogo di iscrizione al Registro delle Imprese facoltativo per institution Type !== 'PA' e 'PSP */}
              <CustomTextFieldNotched
                paddingValue={isContractingAuthority ? '20px' : '24px'}
                {...baseTextFieldProps(
                  'businessRegisterPlace',
                  isContractingAuthority || isPdndPrivate || isPrivateMerchant
                    ? t(
                        'onboardingFormData.billingDataSection.informationCompanies.requiredCommercialRegisterNumber'
                      )
                    : t(
                        'onboardingFormData.billingDataSection.informationCompanies.commercialRegisterNumber'
                      ),
                  600,
                  theme.palette.text.primary
                )}
              />
            </Grid>
            <Grid item xs={6}>
              <CustomTextField
                placeholder={'RM-123456'}
                {...baseTextFieldProps(
                  'rea',
                  institutionType === 'PRV' && productId === PRODUCT_IDS.PAGOPA
                    ? t('onboardingFormData.billingDataSection.informationCompanies.rea')
                    : t('onboardingFormData.billingDataSection.informationCompanies.requiredRea'),
                  600,
                  theme.palette.text.primary
                )}
              />
            </Grid>
            <Grid item xs={6}>
              {/* capitale sociale facoltativo per institution Type !== 'PA' e 'PSP */}
              <CustomTextField
                name={'shareCapital'}
                {...baseTextFieldProps(
                  'shareCapital',
                  isContractingAuthority || isPdndPrivate
                    ? t(
                        'onboardingFormData.billingDataSection.informationCompanies.requiredShareCapital'
                      )
                    : t('onboardingFormData.billingDataSection.informationCompanies.shareCapital'),
                  600,
                  theme.palette.text.primary
                )}
                onClick={() => setShrinkRea(true)}
                onBlur={() => {
                  if (!formik.values.shareCapital) {
                    setShrinkRea(false);
                  }
                }}
                InputLabelProps={{ shrink: shrinkRea }}
                InputProps={{
                  inputComponent: NumberDecimalFormat,
                }}
              />
            </Grid>
          </>
        )}
        {isPaymentServiceProvider && (
          <>
            <Grid item xs={12}>
              {/* n. Iscrizione al Registro delle Imprese */}
              <CustomTextField
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                {...baseTextFieldProps(
                  'commercialRegisterNumber',
                  t(
                    'onboardingFormData.billingDataSection.pspDataSection.commercialRegisterNumber'
                  ),
                  600,
                  theme.palette.text.primary
                )}
                disabled={
                  isDisabled &&
                  !!pspData?.businessRegisterNumber &&
                  !formik.errors.commercialRegisterNumber
                }
              />
            </Grid>
            <Grid item xs={12}>
              {/* Iscrizione all’Albo */}
              <CustomTextField
                {...baseTextFieldProps(
                  'registrationInRegister',
                  t('onboardingFormData.billingDataSection.pspDataSection.registrationInRegister'),
                  600,
                  theme.palette.text.primary
                )}
                disabled={
                  isDisabled &&
                  !!pspData?.legalRegisterName &&
                  formik.values.legalRegisterNumber !== 'N/A'
                }
              />
            </Grid>
            <Grid item xs={6}>
              {/* Numero dell’Albo */}
              <CustomTextField
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                {...baseTextFieldProps(
                  'registerNumber',
                  t('onboardingFormData.billingDataSection.pspDataSection.registerNumber'),
                  600,
                  theme.palette.text.primary
                )}
                disabled={
                  isDisabled &&
                  !!pspData?.legalRegisterNumber &&
                  !formik.errors.legalRegisterNumber &&
                  formik.values.legalRegisterNumber !== 'N/A'
                }
              />
            </Grid>
            <Grid item xs={6}>
              {/* ABI code */}
              <CustomTextField
                {...baseTextFieldProps(
                  'abiCode',
                  t('onboardingFormData.billingDataSection.pspDataSection.abiCode'),
                  600,
                  theme.palette.text.primary
                )}
                value={formik.values.abiCode}
                InputLabelProps={{
                  shrink: formik.values.abiCode?.length > 0,
                }}
                disabled={isDisabled && !!pspData?.abiCode && !formik.errors.abiCode}
              />
            </Grid>
          </>
        )}
        {/* indirizzo mail di supporto */}
        {!institutionAvoidGeotax && !isPrivateMerchant && (
          <Grid item xs={12}>
            <CustomTextFieldNotched
              paddingValue={productId === PRODUCT_IDS.IO_SIGN ? '14px' : '20px'}
              {...baseTextFieldProps(
                'supportEmail',
                t(
                  productId === PRODUCT_IDS.IO_SIGN
                    ? 'onboardingFormData.billingDataSection.assistanceContact.supportEmail'
                    : 'onboardingFormData.billingDataSection.assistanceContact.supportEmailOptional'
                ),
                600,
                theme.palette.text.primary
              )}
              disabled={isDisabled && !!assistanceContacts?.supportEmail}
            />
            {/* descrizione indirizzo mail di supporto */}
            <Typography
              component={'span'}
              sx={{
                fontSize: '12px!important',
                fontWeight: 'fontWeightMedium',
                color: theme.palette.text.secondary,
              }}
            >
              {t('onboardingFormData.billingDataSection.assistanceContact.supportEmailDescriprion')}
            </Typography>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
}
