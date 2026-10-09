import { Autocomplete, Grid, MenuItem, TextField, Typography } from '@mui/material';

import { Box } from '@mui/system';
import { theme } from '@pagopa/mui-italia';
import { t } from 'i18next';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { InstitutionType } from '../../../../types';
import { OnboardingControllers } from '../../../hooks/useOnboardingControllers';
import { CountryResource } from '../../../model/CountryResource';
import { InstitutionLocationData } from '../../../model/InstitutionLocationData';
import {
  getCountriesFromGeotaxonomies,
  getNationalCountries,
} from '../../../services/geoTaxonomyServices';
import { baseNumericFieldProps } from '../../../utils/formatting-utils';
import { isInsuranceCompany } from '../../../utils/institutionTypeUtils';
import {
  autocompletePaperStyle,
  CustomNumberField,
  CustomTextFieldNotched,
  fieldColor,
} from '../../../utils/style-utils';
import {
  isAddressDisabled,
  isBusinessNameDisabled,
  isDigitalAddressDisabled,
  isFieldLockedForPrivate,
  isTaxCodeFieldDisabled,
  showTaxCodeField,
} from '../../../utils/validateFields';
import { CustomTextField } from '../../steps/StepOnboardingFormData';

type Props = {
  controllers: OnboardingControllers;
  origin?: string;
  onboardingFormData: any;
  baseTextFieldProps: any;
  institutionType: InstitutionType;
  isInfoCompany: boolean;
  formik: any;
  productId?: string;
  setInstitutionLocationData: Dispatch<SetStateAction<InstitutionLocationData | undefined>>;
  setRequiredLogin: Dispatch<SetStateAction<boolean>>;
};

const PartyGeneralData = ({
  controllers,
  origin,
  onboardingFormData,
  baseTextFieldProps,
  institutionType,
  isInfoCompany,
  formik,
  productId,
  setInstitutionLocationData,
  setRequiredLogin,
  // eslint-disable-next-line complexity
}: Props) => {
  const [shrinkCity, setShrinkCity] = useState<boolean>(false);
  const [isCitySelected, setIsCitySelected] = useState<boolean>(false);
  const [nationalCountries, setNationalCountries] = useState<Array<CountryResource>>();
  const [input, setInput] = useState<string>();
  const [countries, setCountries] = useState<Array<InstitutionLocationData>>();

  useEffect(() => {
    if (countries && countries.length > 0 && origin !== 'IPA') {
      if (!formik.values.istatCode) {
        void formik.setFieldValue('istatCode', countries[0].istat_code);
      }
      if (!formik.values.country) {
        void formik.setFieldValue('country', countries[0].country);
      }
    }
  }, [countries]);

  useEffect(() => {
    if (formik.values.city && !formik.values.country && origin !== 'IPA') {
      const loadCountryForCity = async () => {
        try {
          await getCountriesFromGeotaxonomies(
            formik.values.city ?? '',
            setCountries,
            setRequiredLogin
          );
        } catch (error) {
          console.error('Failed to load country for city:', error);
        }
      };
      void loadCountryForCity();
    }
  }, [formik.values.city]);

  return (
    <>
      {controllers.isAooUo && (
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
                fieldColor(controllers.isDisabled)
              )}
              disabled={controllers.isDisabled}
            />
          </Grid>
          <Grid item xs={4}>
            <CustomTextField
              {...baseTextFieldProps(
                'uoUniqueCode',
                t('onboardingFormData.billingDataSection.uoUniqueCode'),
                600,
                fieldColor(controllers.isDisabled)
              )}
              disabled={controllers.isDisabled}
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
                fieldColor(controllers.isDisabled)
              )}
              disabled={controllers.isDisabled}
            />
          </Grid>
          <Grid item xs={4}>
            <CustomTextField
              {...baseTextFieldProps(
                'aooUniqueCode',
                t('onboardingFormData.billingDataSection.aooUniqueCode'),
                600,
                fieldColor(controllers.isDisabled)
              )}
              disabled={controllers.isDisabled}
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
              fieldColor(
                isBusinessNameDisabled(
                  controllers,
                  institutionType,
                  isInfoCompany,
                  onboardingFormData,
                  isFieldLockedForPrivate(institutionType, productId)
                ) ?? false
              )
            )}
            disabled={isBusinessNameDisabled(
              controllers,
              institutionType,
              isInfoCompany,
              onboardingFormData,
              isFieldLockedForPrivate(institutionType, productId)
            )}
          />
        </Grid>
      )}
      <Grid container spacing={2} pl={3} pt={3}>
        <Grid item xs={controllers.isForeignInsurance ? 12 : 7}>
          <CustomTextFieldNotched
            paddingValue="20px"
            {...baseTextFieldProps(
              'registeredOffice',
              t('onboardingFormData.billingDataSection.fullLegalAddress'),
              600,
              fieldColor(isAddressDisabled(controllers, institutionType))
            )}
            disabled={isAddressDisabled(controllers, institutionType)}
          />
        </Grid>
        {!controllers.isForeignInsurance && (
          <Grid item xs={5}>
            <CustomNumberField
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
              {...baseNumericFieldProps(
                'zipCode',
                t('onboardingFormData.billingDataSection.zipCode'),
                600,
                16,
                controllers,
                formik
              )}
              disabled={isAddressDisabled(controllers, institutionType)}
            />
          </Grid>
        )}
      </Grid>
      <Grid container spacing={2} pl={3} pt={3}>
        <Grid item xs={7}>
          {isInsuranceCompany(institutionType) && controllers.isForeignInsurance ? (
            <CustomTextField
              {...baseTextFieldProps(
                'city',
                t('onboardingFormData.billingDataSection.city'),
                600,
                fieldColor(controllers.isDisabled)
              )}
              disabled={controllers.isDisabled}
            />
          ) : (
            <Autocomplete
              data-testid="city-autocomplete"
              id="city-select"
              onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value;
                formik.setFieldValue('city', value);
                if (value.length >= 3) {
                  void getCountriesFromGeotaxonomies(value, setCountries, setRequiredLogin);
                } else {
                  setCountries(undefined);
                }
              }}
              inputValue={formik.values.city || ''}
              onChange={(_e: any, selected: any) => {
                formik.setFieldValue('city', selected?.city || '');
                formik.setFieldValue('county', selected?.city || '');
                formik.setFieldValue(
                  'istatCode',
                  !controllers.isFromIPA ? selected?.istat_code : undefined
                );
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
              forcePopupIcon={!(controllers.isFromIPA || !controllers.isCityEditable)}
              disabled={controllers.isPremium || controllers.isFromIPA || controllers.isAooUo}
              ListboxProps={{
                style: {
                  overflow: 'visible',
                },
                'aria-live': 'polite',
              }}
              componentsProps={autocompletePaperStyle}
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
                      !controllers.isCityEditable || controllers.isFromIPA || controllers.isAooUo
                        ? formik.values.city
                        : params.inputProps.value,
                  }}
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
                      color: controllers.isDisabled
                        ? theme.palette.text.disabled
                        : theme.palette.text.primary,
                    },
                    '& .MuiInputBase-root': {
                      height: '56px',
                    },
                  }}
                  onClick={() => setShrinkCity(true)}
                  onBlur={() => setShrinkCity(false)}
                  disabled={controllers.isDisabled}
                />
              )}
            />
          )}
        </Grid>
        <Grid item xs={5}>
          {isInsuranceCompany(institutionType) && controllers.isForeignInsurance ? (
            <Autocomplete
              id="country-select"
              onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value;
                setInput(value);
                if (value.length >= 3) {
                  void getNationalCountries(setNationalCountries);
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
              componentsProps={autocompletePaperStyle}
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
            fieldColor(
              isDigitalAddressDisabled(
                controllers,
                institutionType,
                isInfoCompany,
                onboardingFormData,
                isFieldLockedForPrivate(institutionType, productId)
              ) ?? false
            )
          )}
          disabled={
            isDigitalAddressDisabled(
              controllers,
              institutionType,
              isInfoCompany,
              onboardingFormData,
              isFieldLockedForPrivate(institutionType, productId)
            ) ?? false
          }
        />
      </Grid>
      {showTaxCodeField(institutionType, onboardingFormData) && (
        <Grid item xs={12}>
          <CustomTextField
            {...baseTextFieldProps(
              'taxCode',
              controllers.isAooUo
                ? t('onboardingFormData.billingDataSection.taxCodeCentralParty')
                : t('onboardingFormData.billingDataSection.taxCode'),
              600,
              fieldColor(
                isTaxCodeFieldDisabled(
                  controllers,
                  institutionType,
                  isInfoCompany,
                  onboardingFormData,
                  isFieldLockedForPrivate(institutionType, productId)
                ) ?? false
              )
            )}
            disabled={
              isTaxCodeFieldDisabled(
                controllers,
                institutionType,
                isInfoCompany,
                onboardingFormData,
                isFieldLockedForPrivate(institutionType, productId)
              ) ?? false
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
    </>
  );
};

export default PartyGeneralData;
