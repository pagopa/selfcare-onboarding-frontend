import { Grid, MenuItem, Paper, TextField, Typography } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import Checkbox from '@mui/material/Checkbox';
import { Box, styled } from '@mui/system';
import { theme } from '@pagopa/mui-italia';
import { AxiosResponse } from 'axios';
import { useContext, useEffect, useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { InstitutionType, Party, StepperStepComponentProps } from '../../../types';
import { fetchWithLogs } from '../../lib/api-utils';
import { UserContext } from '../../lib/context';
import { getFetchOutcome } from '../../lib/error-utils';
import { AooData } from '../../model/AooData';
import { GeographicTaxonomyResource } from '../../model/GeographicTaxonomies';
import { InstitutionLocationData } from '../../model/InstitutionLocationData';
import { OnboardingFormData } from '../../model/OnboardingFormData';
import { UoData } from '../../model/UoModel';
import { formatCity } from '../../utils/formatting-utils';
import { StepBillingDataHistoryState } from '../steps/StepOnboardingFormData';
import { ENV } from '../../utils/env';
import { CountryResource } from '../../model/CountryResource';
import NumberDecimalFormat from './NumberDecimalFormat';

const CustomTextField = styled(TextField)({
  '.MuiInputLabel-asterisk': {
    display: 'none',
  },
});

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
  premiumFlow: boolean;
  isInformationCompany: boolean;
  aooSelected?: AooData;
  uoSelected?: UoData;
  institutionAvoidGeotax: boolean;
  selectedParty?: Party;
  retrievedIstat?: string;
  isCityEditable?: boolean;
  isRecipientCodeVisible: boolean;
  isForeignInsurance?: boolean;
};

// eslint-disable-next-line sonarjs/cognitive-complexity, complexity
export default function PersonalAndBillingDataSection({
  institutionType,
  baseTextFieldProps,
  origin,
  stepHistoryState,
  setStepHistoryState,
  formik,
  premiumFlow,
  isInformationCompany,
  aooSelected,
  uoSelected,
  institutionAvoidGeotax,
  selectedParty,
  retrievedIstat,
  isCityEditable,
  isRecipientCodeVisible,
  isForeignInsurance,
}: Props) {
  const { t } = useTranslation();
  const { setRequiredLogin } = useContext(UserContext);

  const [shrinkRea, setShrinkRea] = useState<boolean>(false);
  const [shrinkVatNumber, setShrinkVatNumber] = useState<boolean>(false);
  const [countries, setCountries] = useState<Array<InstitutionLocationData>>();
  const [institutionLocationData, setInstitutionLocationData] = useState<InstitutionLocationData>();
  const [isCitySelected, setIsCitySelected] = useState<boolean>(false);
  const [nationalCountries, setNationalCountries] = useState<Array<CountryResource>>();
  const [input, setInput] = useState<string>();

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
    if (institutionLocationData && institutionLocationData.city) {
      formik.setFieldValue('country', institutionLocationData.country);
      formik.setFieldValue('county', institutionLocationData.county);
      formik.setFieldValue('city', institutionLocationData.city);
    }
  }, [institutionLocationData]);

  useEffect(() => {
    if (premiumFlow) {
      setInstitutionLocationData({
        country: formik.values.country,
        county: formik.values.county,
        city: formik.values.city,
      });
    }
  }, [premiumFlow]);

  const isFromIPA = origin === 'IPA';
  const isPSP = institutionType === 'PSP';
  const isPA = institutionType === 'PA';
  const isContractingAuthority = institutionType === 'SA';
  const isInsuranceCompany = institutionType === 'AS';
  const isDisabled = premiumFlow || (isFromIPA && !isPA && !isPSP) || isPA;
  /*
  const recipientCodeVisible =
    !isContractingAuthority && !isTechPartner && !isInsuranceCompany && !isProdInterop;
    */
  const requiredError = 'Required';
  const isAooUo = !!(aooSelected || uoSelected);

  useEffect(() => {
    if (!premiumFlow && (isFromIPA || isAooUo)) {
      if (aooSelected?.codiceComuneISTAT) {
        void getLocationFromIstatCode(aooSelected.codiceComuneISTAT);
      } else if (uoSelected?.codiceComuneISTAT) {
        void getLocationFromIstatCode(uoSelected.codiceComuneISTAT);
      } else if (selectedParty?.istatCode) {
        void getLocationFromIstatCode(selectedParty.istatCode);
      } else if (retrievedIstat) {
        void getLocationFromIstatCode(retrievedIstat);
      }
    }
  }, [isFromIPA, selectedParty, aooSelected, uoSelected, retrievedIstat, premiumFlow]);

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

  const baseNumericFieldProps = (
    field: keyof OnboardingFormData,
    label: string,
    fontWeight: number = isDisabled ? 400 : 600,
    fontSize: number = 18,
    color: string = isDisabled ? theme.palette.text.secondary : theme.palette.text.primary
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

  const getCountriesFromGeotaxonomies = async (query: string) => {
    const searchGeotaxonomy = await fetchWithLogs(
      {
        endpoint: 'ONBOARDING_GET_GEOTAXONOMY',
      },
      {
        method: 'GET',
        params: { description: query },
      },
      () => setRequiredLogin(true)
    );
    const outcome = getFetchOutcome(searchGeotaxonomy);

    if (outcome === 'success') {
      const geographicTaxonomies = (searchGeotaxonomy as AxiosResponse).data;

      const mappedResponse = geographicTaxonomies.map((gt: GeographicTaxonomyResource) => ({
        code: gt.code,
        country: gt.country_abbreviation,
        county: gt.province_abbreviation,
        city: gt.desc,
      })) as Array<InstitutionLocationData>;

      const onlyCountries = mappedResponse
        .filter((r) => r.city.includes('- COMUNE'))
        .map((r) => ({
          ...r,
          city: formatCity(r.city),
        }));

      setCountries(onlyCountries);
    }
  };

  const getNationalCountries = async (_query: string) => {
    try {
      const response = await fetch(ENV.JSON_URL.COUNTRIES);
      const countries = await response.json();
      const resource2CountryResource = countries
        .map((c: any) => ({
          country_code: c.country_code,
          name: c.name,
          alpha_2: c.alpha_2,
          alpha_3: c.alpha_3,
          region_code: c.region_code,
          region: c.region,
          sub_region_code: c.sub_region_code,
          sub_region: c.sub_region,
        }))
        .filter((cm: CountryResource) => cm.alpha_2 !== 'IT');
      setNationalCountries(resource2CountryResource);
    } catch (reason) {
      console.error(reason);
    }
  };

  const getLocationFromIstatCode = async (istatCode: string) => {
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
        const mappedObject = {
          code: result.code,
          country: result.country_abbreviation,
          county: result.province_abbreviation,
          city: formatCity(result.desc),
        };
        setInstitutionLocationData(mappedObject);
      }
    }
  };

  return (
    <>
      {/* DATI DI FATTURAZIONE E ANAGRAFICI */}
      <Paper elevation={8} sx={{ borderRadius: theme.spacing(2), p: 4, width: '704px' }}>
        <Grid item container spacing={3}>
          {isAooUo && (
            <Box px={4} pt={2} width="100%">
              <Typography sx={{ fontSize: 'fontSize' }}>
                {t('onboardingFormData.billingDataSection.centralPartyLabel')}
              </Typography>
              <Typography sx={{ fontWeight: 'fontWeightMedium', fontSize: 'fontSize' }}>
                {aooSelected ? aooSelected?.denominazioneEnte : uoSelected?.denominazioneEnte}
              </Typography>
            </Box>
          )}
          {aooSelected ? (
            // ao Description
            <>
              <Grid item xs={8}>
                <CustomTextField
                  {...baseTextFieldProps(
                    'aooName',
                    t('onboardingFormData.billingDataSection.aooName')
                  )}
                  disabled={isDisabled}
                />
              </Grid>
              <Grid item xs={4}>
                <CustomTextField
                  {...baseTextFieldProps(
                    'aooUniqueCode',
                    t('onboardingFormData.billingDataSection.aooUniqueCode')
                  )}
                  disabled={isDisabled}
                />
              </Grid>
            </>
          ) : uoSelected ? (
            // uo Description
            <>
              <Grid item xs={8}>
                <CustomTextField
                  {...baseTextFieldProps(
                    'uoName',
                    t('onboardingFormData.billingDataSection.uoName')
                  )}
                  disabled={isDisabled}
                />
              </Grid>
              <Grid item xs={4}>
                <CustomTextField
                  {...baseTextFieldProps(
                    'uoUniqueCode',
                    t('onboardingFormData.billingDataSection.uoUniqueCode')
                  )}
                  disabled={isDisabled}
                />
              </Grid>
            </>
          ) : (
            // Ragione sociale
            <Grid item xs={12}>
              <CustomTextField
                {...baseTextFieldProps(
                  'businessName',
                  t('onboardingFormData.billingDataSection.businessName')
                )}
                disabled={isDisabled || isContractingAuthority || isInsuranceCompany}
              />
            </Grid>
          )}
          {/* Sede legale */}
          <Grid container spacing={2} pl={3} pt={3}>
            <Grid item xs={isForeignInsurance ? 12 : 7}>
              <CustomTextField
                {...baseTextFieldProps(
                  'registeredOffice',
                  isInsuranceCompany
                    ? t('onboardingFormData.billingDataSection.fullLegalAddress')
                    : t('onboardingFormData.billingDataSection.registeredOffice')
                )}
                disabled={!isAooUo && isDisabled && !isInsuranceCompany}
              />
            </Grid>
            {/* CAP */}
            {!isForeignInsurance && (
              <Grid item xs={5}>
                <CustomNumberField
                  inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                  {...baseNumericFieldProps(
                    'zipCode',
                    t('onboardingFormData.billingDataSection.zipCode')
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
                  {...baseTextFieldProps('city', t('onboardingFormData.billingDataSection.city'))}
                  disabled={isDisabled}
                />
              ) : (
                <Autocomplete
                  id="city-select"
                  onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const value = e.target.value;
                    formik.setFieldValue('city', value);
                    if (value.length >= 3) {
                      void getCountriesFromGeotaxonomies(value);
                    } else {
                      setCountries(undefined);
                    }
                  }}
                  inputValue={formik.values.city || ''}
                  onChange={(_e: any, selected: any) => {
                    formik.setFieldValue('city', selected?.city || '');
                    formik.setFieldValue('county', selected?.city || '');
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
                  forcePopupIcon={isFromIPA || !isCityEditable ? false : true}
                  disabled={premiumFlow && isCityEditable ? false : isFromIPA || isAooUo}
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
                    <MenuItem key={option.code} {...props} sx={{ height: '44px' }}>
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
                      label={t('onboardingFormData.billingDataSection.city')}
                      InputLabelProps={{
                        shrink: formik.values.city && formik.values.city !== '',
                      }}
                      sx={{
                        '& .MuiOutlinedInput-input.MuiInputBase-input': {
                          marginLeft: '15px',
                          fontWeight: isFromIPA ? 'fontWeightRegular' : 'fontWeightMedium',
                          textTransform: 'capitalize',
                          color: isFromIPA
                            ? theme.palette.text.secondary
                            : theme.palette.text.primary,
                        },
                      }}
                      disabled={premiumFlow && isCityEditable ? false : isFromIPA || isAooUo}
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
                    <MenuItem key={option.country_code} {...props} sx={{ height: '44px' }}>
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
                    isFromIPA || institutionLocationData?.county ? 400 : 600,
                    isFromIPA || institutionLocationData?.county
                      ? theme.palette.text.secondary
                      : theme.palette.text.primary
                  )}
                  disabled={true}
                />
              )}
            </Grid>
          </Grid>

          {/* Indirizzo PEC */}
          <Grid item xs={12}>
            <CustomTextField
              {...baseTextFieldProps(
                'digitalAddress',
                t('onboardingFormData.billingDataSection.digitalAddress'),
                isDisabled ? 400 : 600,
                isDisabled ? theme.palette.text.secondary : theme.palette.text.primary
              )}
              disabled={isDisabled || isContractingAuthority || isInsuranceCompany}
            />
          </Grid>
          {(!isInsuranceCompany || (selectedParty?.taxCode !== '' && selectedParty?.taxCode)) && (
            <Grid item xs={12}>
              <CustomTextField
                {...baseTextFieldProps(
                  'taxCode',
                  t('onboardingFormData.billingDataSection.taxCode'),
                  isDisabled ? 400 : 600,
                  isDisabled ? theme.palette.text.secondary : theme.palette.text.primary
                )}
                disabled={(isDisabled && !isAooUo) || isContractingAuthority || isInsuranceCompany}
              />
            </Grid>
          )}

          {!isForeignInsurance && (
            <Grid
              container
              spacing={3}
              xs={12}
              pl={3}
              pt={
                !isForeignInsurance ||
                (formik.values.hasVatnumber &&
                  selectedParty?.taxCode !== '' &&
                  selectedParty?.taxCode)
                  ? 3
                  : 0
              }
              mb={
                !formik.values.hasVatnumber && isRecipientCodeVisible && isInsuranceCompany ? -3 : 0
              }
            >
              {!isForeignInsurance &&
                formik.values.hasVatnumber &&
                selectedParty?.taxCode !== '' &&
                selectedParty?.taxCode && (
                  <Grid item>
                    <Box display="flex" alignItems="center">
                      <Checkbox
                        id="onboardingFormData"
                        checked={stepHistoryState.isTaxCodeEquals2PIVA}
                        disabled={premiumFlow}
                        inputProps={{
                          'aria-label': t(
                            'onboardingFormData.billingDataSection.taxCodeEquals2PIVAdescription'
                          ),
                        }}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setStepHistoryState({
                              ...stepHistoryState,
                              isTaxCodeEquals2PIVA: true,
                            });
                            formik.setFieldValue('vatNumber', formik.values.taxCode);
                          } else {
                            setStepHistoryState({
                              ...stepHistoryState,
                              isTaxCodeEquals2PIVA: false,
                            });
                            formik.setFieldValue('vatNumber', '');
                          }
                        }}
                      />
                      <Typography component={'span'}>
                        {t('onboardingFormData.billingDataSection.taxCodeEquals2PIVAdescription')}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              <Grid item>
                <Box
                  display="flex"
                  alignItems="center"
                  marginBottom={!formik.values.hasVatnumber && isRecipientCodeVisible ? -2 : 0}
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
                    stepHistoryState.isTaxCodeEquals2PIVA
                      ? theme.palette.text.secondary
                      : theme.palette.text.primary
                  )}
                  value={formik.values.vatNumber}
                  disabled={stepHistoryState.isTaxCodeEquals2PIVA || premiumFlow}
                  onClick={() => setShrinkVatNumber(true)}
                  onBlur={() => setShrinkVatNumber(false)}
                  InputLabelProps={{
                    shrink: shrinkVatNumber || stepHistoryState.isTaxCodeEquals2PIVA,
                  }}
                />
              )}
              {isPSP && formik.values.hasVatnumber && (
                <Box display="flex" alignItems="center" mt="2px">
                  {/* Checkbox la aprtita IVA è di gruppo */}
                  <Checkbox
                    inputProps={{
                      'aria-label': t('onboardingFormData.billingDataSection.vatNumberGroup'),
                    }}
                    checked={formik.values.vatNumberGroup}
                    onChange={(_, checked: boolean) =>
                      formik.setFieldValue('vatNumberGroup', checked, true)
                    }
                    value={formik.values.vatNumberGroup}
                  />
                  <Typography component={'span'}>
                    {t('onboardingFormData.billingDataSection.vatNumberGroup')}
                  </Typography>
                </Box>
              )}
              {isRecipientCodeVisible && (
                <Grid item xs={12} mt={3}>
                  <CustomTextField
                    {...baseTextFieldProps(
                      'recipientCode',
                      t('onboardingFormData.billingDataSection.sdiCode'),
                      600,
                      theme.palette.text.primary
                    )}
                    inputProps={{ maxLength: 7, style: { textTransform: 'uppercase' } }}
                  />
                  {/* Description for recipient code */}
                  <Typography
                    component={'span'}
                    sx={{
                      fontSize: '12px!important',
                      fontWeight: 'fontWeightMedium',
                      color: theme.palette.text.secondary,
                    }}
                  >
                    {t('onboardingFormData.billingDataSection.recipientCodeDescription')}
                  </Typography>
                </Grid>
              )}
            </Typography>
          </Grid>
          {isInsuranceCompany && (
            <Grid item xs={12} marginTop={isForeignInsurance ? -3 : 0}>
              <CustomTextField
                {...baseTextFieldProps(
                  'ivassCode',
                  t('onboardingFormData.billingDataSection.ivassCode'),
                  600,
                  theme.palette.text.primary
                )}
                value={formik.values.ivassCode}
                disabled={true}
              />
            </Grid>
          )}
          {/* institutionType !== 'PA' && institutionType !== 'PSP' && productId === 'prod-io'; */}
          {(isInformationCompany || isContractingAuthority) && (
            <>
              <Grid item xs={12}>
                {/* Luogo di iscrizione al Registro delle Imprese facoltativo per institution Type !== 'PA' e 'PSP */}
                <CustomTextField
                  {...baseTextFieldProps(
                    'businessRegisterPlace',
                    isContractingAuthority
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
                {/* REA facoltativo per institution Type !== 'PA' e 'PSP */}
                <CustomTextField
                  placeholder={'RM-123456'}
                  {...baseTextFieldProps(
                    'rea',
                    t('onboardingFormData.billingDataSection.informationCompanies.rea'),
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
                    isContractingAuthority
                      ? t(
                          'onboardingFormData.billingDataSection.informationCompanies.requiredShareCapital'
                        )
                      : t(
                          'onboardingFormData.billingDataSection.informationCompanies.shareCapital'
                        ),
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
          {isPSP && (
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
                />
              </Grid>
              <Grid item xs={12}>
                {/* Iscrizione all’Albo */}
                <CustomTextField
                  {...baseTextFieldProps(
                    'registrationInRegister',
                    t(
                      'onboardingFormData.billingDataSection.pspDataSection.registrationInRegister'
                    ),
                    600,
                    theme.palette.text.primary
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                {/* Numero dell’Albo */}
                <CustomTextField
                  inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                  {...baseTextFieldProps(
                    'registerNumber',
                    t('onboardingFormData.billingDataSection.pspDataSection.registerNumber'),
                    600
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                {/* ABI code */}
                <CustomTextField
                  {...baseTextFieldProps(
                    'abiCode',
                    t('onboardingFormData.billingDataSection.pspDataSection.abiCode'),
                    600
                  )}
                />
              </Grid>
            </>
          )}
          {/* indirizzo mail di supporto */}
          {!institutionAvoidGeotax && (
            <Grid item xs={12}>
              <CustomTextField
                {...baseTextFieldProps(
                  'supportEmail',
                  t('onboardingFormData.billingDataSection.assistanceContact.supportEmail'),
                  600,
                  theme.palette.text.primary
                )}
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
                {t(
                  'onboardingFormData.billingDataSection.assistanceContact.supportEmailDescriprion'
                )}
              </Typography>
            </Grid>
          )}
        </Grid>
      </Paper>
    </>
  );
}
