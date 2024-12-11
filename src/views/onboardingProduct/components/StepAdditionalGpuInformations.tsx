import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  Paper,
  Radio,
  RadioGroup,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { useTranslation, Trans } from 'react-i18next';
import { useState } from 'react';
import { OnboardingStepActions } from '../../../components/OnboardingStepActions';
import { StepperStepComponentProps } from '../../../../types';
import {
  AdditionalGpuInformations,
  AdditionalGpuInformationsRadio,
} from '../../../model/AdditionalGpuInformations';

type Props = StepperStepComponentProps & {
  originId?: string;
  origin?: string;
};
export function StepAdditionalGpuInformations({ back, forward /* origin, originId  */ }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [additionalGpuInformations, setAdditionalGpuInformations] =
    useState<AdditionalGpuInformations>({
      businessRegisterNumber: undefined,
      legalRegisterNumber: undefined,
      legalRegisterName: undefined,
      longTermPayments: undefined,
      manager: false,
      managerAuthorized: false,
      managerEligible: false,
      managerProsecution: false,
      institutionCourtMeasures: false,
    });

  const [radioValues, setRadioValues] = useState<AdditionalGpuInformationsRadio>({
    isPartyRegistered: null,
    isPartyProvidingAService: null,
    longTermPayments: null,
  });

  const [errors, setErrors] = useState<{
    [field: string]: string;
  }>({});

  const [fieldDisabled, setFieldDisabled] = useState({
    isPartyRegistered: true,
    isPartyProvidingAService: true,
  });

  // eslint-disable-next-line sonarjs/cognitive-complexity
  const handleAbleDisableAndCleanField = (fieldName: string, value: any) => {
    switch (fieldName) {
      case 'isPartyRegistered':
      case 'isPartyProvidingAService':
        // Una sola chiamata per aggiornare lo stato
        setAdditionalGpuInformations((prev) => {
          // eslint-disable-next-line functional/no-let
          let updatedState = { ...prev };

          if (fieldName === 'isPartyRegistered' && value === 'false') {
            // Ripulisci i campi collegati quando il valore di isPartyRegistered è 'false'
            updatedState = {
              ...updatedState,
              businessRegisterNumber: undefined,
              legalRegisterNumber: undefined,
            };
          }

          if (fieldName === 'isPartyProvidingAService' && value === 'false') {
            // Ripulisci il campo collegato quando il valore di isPartyProvidingAService è 'false'
            updatedState = {
              ...updatedState,
              legalRegisterName: undefined,
            };
          }
          console.log('updatedState', updatedState);
          return updatedState;
        });

        // Gestione del disabilitamento dei campi
        setFieldDisabled((prev) => {
          const updatedDisabledState = { ...prev };

          if (fieldName === 'isPartyRegistered') {
            // eslint-disable-next-line functional/immutable-data
            updatedDisabledState.isPartyRegistered = value === 'false';
          }

          if (fieldName === 'isPartyProvidingAService') {
            // eslint-disable-next-line functional/immutable-data
            updatedDisabledState.isPartyProvidingAService = value === 'false';
          }

          return updatedDisabledState;
        });

        setErrors((prev) => {
          const updatedErrors = { ...prev };

          if (fieldName === 'isPartyRegistered' && value === 'false') {
            // eslint-disable-next-line functional/immutable-data
            delete updatedErrors.businessRegisterNumber;
            // eslint-disable-next-line functional/immutable-data
            delete updatedErrors.legalRegisterNumber;
          }

          if (fieldName === 'isPartyProvidingAService' && value === 'false') {
            // eslint-disable-next-line functional/immutable-data
            delete updatedErrors.legalRegisterName;
          }

          return updatedErrors;
        });
        break;
      default:
        break;
    }
  };

  const handleFieldChange = (
    fieldName: string,
    value: string | boolean | undefined,
    fieldType: 'text' | 'radio' | 'checkbox'
  ) => {
    switch (fieldType) {
      case 'text':
        const onlyAlfaNumericValue =
          typeof value === 'string' ? value.replace(/[^a-zA-Z0-9]/g, '') : value;
        const onlyNumberValue = typeof value === 'string' ? value.replace(/[^0-9]/g, '') : value;
        const onlyAlfaNumericWithSpaceValue =
          typeof value === 'string' ? value.replace(/[^a-zA-Z0-9 ]/g, '') : value;

        setAdditionalGpuInformations((prev) => ({
          ...prev,
          [fieldName]:
            fieldName === 'businessRegisterNumber'
              ? onlyAlfaNumericValue
              : fieldName === 'legalRegisterNumber'
                ? onlyNumberValue
                : onlyAlfaNumericWithSpaceValue,
        }));
        return;
      case 'checkbox':
        setAdditionalGpuInformations((prev) => ({
          ...prev,
          [fieldName]: value,
        }));
        break;
      case 'radio':
        setAdditionalGpuInformations((prev) => ({
          ...prev,
          [fieldName]: fieldName === 'longTermPayments' ? value === 'true' : value,
        }));
        setRadioValues((prev) => ({
          ...prev,
          [fieldName]: value === 'true',
        }));
        handleAbleDisableAndCleanField(fieldName, value);
        break;
      default:
        console.error(`Tipo di campo non gestito: ${fieldName}`);
    }

    setErrors((prev) => ({
      ...prev,
      [fieldName]: '',
    }));
  };

  const validateAndProceed = () => {
    const newErrors: { [field: string]: string } = {};

    // Validazione dei campi di testo condizionati
    if (radioValues.isPartyRegistered) {
      if (!additionalGpuInformations.businessRegisterNumber) {
        // eslint-disable-next-line functional/immutable-data
        newErrors.businessRegisterNumber = t(
          'additionalGpuDataPage.firstBlock.errors.requiredField'
        );
      }
      if (!additionalGpuInformations.legalRegisterNumber) {
        // eslint-disable-next-line functional/immutable-data
        newErrors.legalRegisterNumber = t('additionalGpuDataPage.firstBlock.errors.requiredField');
      }
    }

    if (radioValues.isPartyProvidingAService && !additionalGpuInformations.legalRegisterName) {
      // eslint-disable-next-line functional/immutable-data
      newErrors.legalRegisterName = t('additionalGpuDataPage.firstBlock.errors.requiredField');
    }

    // Mostra errori se ci sono
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      // Procedi se non ci sono errori
      forward(additionalGpuInformations);
      console.log('forward with this data: ', additionalGpuInformations);
    }
  };

  return (
    <Grid container item sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Grid container sx={{ textAlign: 'center' }}>
        <Grid item xs={12} mb={2}>
          <Typography variant="h3"> {t('additionalGpuDataPage.title')}</Typography>
        </Grid>
        <Grid item xs={12} mb={4}>
          <Typography variant="body2" fontSize={'18px'}>
            <Trans i18nKey="additionalGpuDataPage.subTitle" components={{ 1: <br /> }} />
          </Typography>
        </Grid>
      </Grid>

      <Paper
        elevation={8}
        sx={{ borderRadius: theme.spacing(2), p: 4, justifyContent: 'center', width: '70%' }}
      >
        <Grid container sx={{ textAlign: 'start' }}>
          <Grid item xs={12} my={1}>
            <Typography sx={{ fontSize: '18px', fontWeight: 600 }}>
              {' '}
              {t('additionalGpuDataPage.firstBlock.question.isPartyRegistered')}
            </Typography>
          </Grid>
          <Grid item xs={12} my={1}>
            <FormControl>
              <RadioGroup
                id="isPartyRegistered"
                aria-labelledby="demo-controlled-radio-buttons-group"
                name="isPartyRegistered"
                value={radioValues.isPartyRegistered}
                onChange={(event) =>
                  handleFieldChange('isPartyRegistered', event.target.value, 'radio')
                }
              >
                <FormControlLabel
                  id="isPartyRegisteredTrue"
                  value="true"
                  control={<Radio />}
                  label={t('additionalGpuDataPage.firstBlock.yes')}
                />
                <FormControlLabel
                  id="isPartyRegisteredFalse"
                  value="false"
                  control={<Radio />}
                  label={t('additionalGpuDataPage.firstBlock.no')}
                />
              </RadioGroup>
            </FormControl>
          </Grid>
          <Grid item xs={12} my={1}>
            <Typography sx={{ fontSize: '18px', fontWeight: 600 }}>
              {' '}
              {t('additionalGpuDataPage.firstBlock.question.subscribedTo')}
            </Typography>
          </Grid>
          <Grid container item xs={12} my={1} sx={{ display: 'flex', flexDirection: 'row' }}>
            <Grid item xs={8} paddingRight={2}>
              <FormControl fullWidth>
                <TextField
                  id="businessRegisterNumber"
                  name="businessRegisterNumber"
                  variant="outlined"
                  label={t('additionalGpuDataPage.firstBlock.placeholder.registerBoardList')}
                  onChange={(event) =>
                    handleFieldChange('businessRegisterNumber', event.target.value, 'text')
                  }
                  value={additionalGpuInformations.businessRegisterNumber || ''}
                  placeholder={t('additionalGpuDataPage.firstBlock.placeholder.registerBoardList')}
                  error={!!errors.businessRegisterNumber}
                  helperText={errors.businessRegisterNumber}
                  disabled={fieldDisabled.isPartyRegistered}
                />
              </FormControl>
            </Grid>
            <Grid item xs={4}>
              <FormControl fullWidth>
                <TextField
                  id="legalRegisterNumber"
                  name="legalRegisterNumber"
                  variant="outlined"
                  label={t('additionalGpuDataPage.firstBlock.placeholder.numberOfSubscription')}
                  onChange={(event) =>
                    handleFieldChange('legalRegisterNumber', event.target.value, 'text')
                  }
                  value={additionalGpuInformations.legalRegisterNumber || ''}
                  placeholder={t(
                    'additionalGpuDataPage.firstBlock.placeholder.numberOfSubscription'
                  )}
                  error={!!errors.legalRegisterNumber}
                  helperText={errors.legalRegisterNumber}
                  disabled={fieldDisabled.isPartyRegistered}
                />
              </FormControl>
            </Grid>
          </Grid>
          <Grid item xs={12} my={1}>
            <Typography sx={{ fontSize: '18px', fontWeight: 600 }}>
              {' '}
              {t('additionalGpuDataPage.firstBlock.question.isPartyProvidingAService')}
            </Typography>
          </Grid>
          <Grid item xs={12} my={1}>
            <FormControl>
              <RadioGroup
                id="isPartyProvidingAService"
                aria-labelledby="isPartyProvidingAService"
                name="isPartyProvidingAService"
                value={radioValues.isPartyProvidingAService}
                onChange={(event) =>
                  handleFieldChange('isPartyProvidingAService', event.target.value, 'radio')
                }
              >
                <FormControlLabel
                  id="isPartyProvidingAServiceTrue"
                  value="true"
                  control={<Radio />}
                  label={t('additionalGpuDataPage.firstBlock.yes')}
                />
                <FormControlLabel
                  id="isPartyProvidingAServiceFalse"
                  value="false"
                  control={<Radio />}
                  label={t('additionalGpuDataPage.firstBlock.no')}
                />
              </RadioGroup>
            </FormControl>
          </Grid>
          <Grid item xs={12} my={1}>
            <Typography sx={{ fontSize: '18px', fontWeight: 600 }}>
              {' '}
              {t('additionalGpuDataPage.firstBlock.question.gpuRequestAccessFor')}
            </Typography>
          </Grid>
          <Grid item xs={12} my={1}>
            <FormControl fullWidth>
              <TextField
                id="legalRegisterName"
                name="legalRegisterName"
                variant="outlined"
                label={t('additionalGpuDataPage.firstBlock.placeholder.answer')}
                onChange={(event) =>
                  handleFieldChange('legalRegisterName', event.target.value, 'text')
                }
                error={!!errors.legalRegisterName}
                helperText={errors.legalRegisterName}
                value={additionalGpuInformations.legalRegisterName || ''}
                placeholder={t('additionalGpuDataPage.firstBlock.placeholder.answer')}
                disabled={fieldDisabled.isPartyProvidingAService}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} my={1}>
            <Typography sx={{ fontSize: '18px', fontWeight: 600 }}>
              {' '}
              {t('additionalGpuDataPage.firstBlock.question.longTermPayments')}
            </Typography>
          </Grid>
          <Grid item xs={12} my={1}>
            <FormControl>
              <RadioGroup
                id="longTermPayments"
                aria-labelledby="longTermPayments"
                name="longTermPayments"
                value={radioValues.longTermPayments}
                onChange={(event) =>
                  handleFieldChange('longTermPayments', event.target.value, 'radio')
                }
              >
                <FormControlLabel
                  id="longTermPaymentsTrue"
                  value="true"
                  control={<Radio />}
                  label={t('additionalGpuDataPage.firstBlock.yes')}
                />
                <FormControlLabel
                  value="false"
                  id="longTermPaymentsFalse"
                  control={<Radio />}
                  label={t('additionalGpuDataPage.firstBlock.no')}
                />
              </RadioGroup>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <Paper
        elevation={8}
        sx={{ borderRadius: theme.spacing(2), p: 4, justifyContent: 'center', width: '70%', mt: 4 }}
      >
        <Grid container sx={{ textAlign: 'start' }}>
          <Grid item xs={12} my={1}>
            <Typography sx={{ fontSize: '18px', fontWeight: 600 }}>
              {' '}
              {t('additionalGpuDataPage.secondBlock.title')}
            </Typography>
          </Grid>
          <Grid item xs={12} my={1} p={2}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    id="manager"
                    name="manager"
                    onChange={() =>
                      handleFieldChange('manager', !additionalGpuInformations.manager, 'checkbox')
                    }
                    checked={additionalGpuInformations.manager}
                  />
                }
                label={t('additionalGpuDataPage.secondBlock.boxes.first')}
                sx={{ mb: 1 }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    id="managerAuthorized"
                    name="managerAuthorized"
                    onChange={() =>
                      handleFieldChange(
                        'managerAuthorized',
                        !additionalGpuInformations.managerAuthorized,
                        'checkbox'
                      )
                    }
                    checked={additionalGpuInformations.managerAuthorized}
                  />
                }
                label={t('additionalGpuDataPage.secondBlock.boxes.second')}
                sx={{ mb: 1 }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    id="managerEligible"
                    name="managerEligible"
                    onChange={() =>
                      handleFieldChange(
                        'managerEligible',
                        !additionalGpuInformations.managerEligible,
                        'checkbox'
                      )
                    }
                    checked={additionalGpuInformations.managerEligible}
                  />
                }
                label={t('additionalGpuDataPage.secondBlock.boxes.third')}
                sx={{ mb: 1 }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    id="managerProsecution"
                    name="managerProsecution"
                    onChange={() =>
                      handleFieldChange(
                        'managerProsecution',
                        !additionalGpuInformations.managerProsecution,
                        'checkbox'
                      )
                    }
                    checked={additionalGpuInformations.managerProsecution}
                  />
                }
                label={t('additionalGpuDataPage.secondBlock.boxes.fourth')}
                sx={{ mb: 1 }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    id="institutionCourtMeasures"
                    name="institutionCourtMeasures"
                    onChange={() =>
                      handleFieldChange(
                        'institutionCourtMeasures',
                        !additionalGpuInformations.institutionCourtMeasures,
                        'checkbox'
                      )
                    }
                    checked={additionalGpuInformations.institutionCourtMeasures}
                  />
                }
                label={t('additionalGpuDataPage.secondBlock.boxes.fifth')}
              />
            </FormGroup>
          </Grid>
          <Grid item xs={12} my={1}>
            <Typography sx={{ fontSize: '14px', fontWeight: 400, color: 'text.secondary' }}>
              {' '}
              {t('additionalGpuDataPage.secondBlock.legalBlockFooterInfo')}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Grid item mb={10} mt={4}>
        <OnboardingStepActions
          back={{
            action: back,
            label: t('stepAddManager.back'),
            disabled: false,
          }}
          forward={{
            action: validateAndProceed,
            label: t('stepAddManager.continue'),
            disabled:
              radioValues.isPartyRegistered === null ||
              radioValues.isPartyProvidingAService === null ||
              radioValues.longTermPayments === null,
          }}
        />
      </Grid>
    </Grid>
  );
}
