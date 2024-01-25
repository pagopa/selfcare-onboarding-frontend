import {
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  Paper,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { useTranslation, Trans } from 'react-i18next';
import { useEffect, useState } from 'react';
import { OnboardingStepActions } from '../../../components/OnboardingStepActions';
import { RadioWithTextField } from '../../../components/RadioWithTextField';
import { StepperStepComponentProps } from '../../../../types';

export function StepAdditionalInformations({ forward, back }: StepperStepComponentProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  const [radioValues, setRadioValues] = useState({
    isEstabilishedRegulatoryProvision: undefined,
    fromBelongsRegulatedMarket: undefined,
    isFromIPA: undefined,
    isConcessionaireOfPublicService: undefined,
    optionalPartyInformations: false,
  });

  const [additionalData, setAdditionalData] = useState<{
    [field: string]: { openTextField: boolean; textFieldValue: string; choice: boolean };
  }>({});

  const [errors, setErrors] = useState<{
    [field: string]: string;
  }>({});

  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [disabled, setDisabled] = useState<boolean>(false);
  const [shrink, setShrink] = useState<boolean>(false);

  useEffect(() => {
    const isContinueButtonEnabled = Object.entries(radioValues).every(([key, value]) =>
      key === 'optionalPartyInformations' ? true : value !== undefined
    );

    const allFalseAndUnchecked = Object.values(radioValues).every((value) => !value) && !isChecked;

    setDisabled(
      !isContinueButtonEnabled ||
        allFalseAndUnchecked ||
        Object.values(errors).some((error) => error !== '')
    );
  }, [radioValues, errors, isChecked]);

  const handleRadioChange = (field: any, value: any) => {
    setRadioValues((prevValues) => ({
      ...prevValues,
      [field]: value,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [field]: '',
    }));
  };

  const handleTextFieldChange = (open: boolean, field: string, value: string) => {
    setErrors((prevErrors) => ({
      ...prevErrors,
      [field]: '',
    }));
    setAdditionalData((prevAdditionalData) => ({
      ...prevAdditionalData,
      [field]: {
        openTextField: open,
        textFieldValue: value,
        choice: false,
      },
    }));
  };

  const validateTextField = () => {
    const newErrors = Object.keys(radioValues).reduce((acc, field) => {
      switch (field) {
        case 'optionalPartyInformations':
          if (isChecked && !additionalData.optionalPartyInformations?.textFieldValue) {
            return {
              ...acc,
              [field]: t(
                `additionalDataPage.formQuestions.textFields.errors.optionalPartyInformations`
              ),
            };
          }
          break;
        default:
          if (
            additionalData[field]?.openTextField &&
            additionalData[field]?.textFieldValue === ''
          ) {
            return {
              ...acc,
              [field]: t(`additionalDataPage.formQuestions.textFields.errors.${field}`),
            };
          }
      }
      return acc;
    }, {});

    if (Object.keys(newErrors).length) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        ...newErrors,
      }));
      setDisabled(true);
    } else {
      setErrors({});

      const choices = Object.values(radioValues);

      const additionalDataWithChoice = Object.keys(radioValues).reduce(
        (result, key, index) => ({
          ...result,
          [key]: { ...additionalData[key], choice: choices[index] },
        }),
        {}
      );
      forward(additionalDataWithChoice);
    }
  };

  return (
    <Grid container item sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Grid container sx={{ textAlign: 'center' }}>
        <Grid item xs={12} mb={2}>
          <Typography variant="h3"> {t('additionalDataPage.title')}</Typography>
        </Grid>
        <Grid item xs={12} mb={4}>
          <Typography variant="body2" fontSize={'18px'}>
            <Trans i18nKey="additionalDataPage.subTitle" components={{ 1: <br /> }} />
          </Typography>
        </Grid>
      </Grid>

      <Paper elevation={8} sx={{ borderRadius: theme.spacing(2), px: 4, pt: 1 }}>
        <RadioWithTextField
          title={t('additionalDataPage.formQuestions.estabilishedRegulatoryProvision')}
          label={t('additionalDataPage.formQuestions.textFields.labels.note')}
          field={'isEstabilishedRegulatoryProvision'}
          onRadioChange={handleRadioChange}
          onTextFieldChange={handleTextFieldChange}
          errorText={errors.isEstabilishedRegulatoryProvision || ''}
        />
        <Divider />
        <RadioWithTextField
          title={
            <Trans
              i18nKey={'additionalDataPage.formQuestions.belongsRegulatedMarket'}
              components={{ 1: <br /> }}
            />
          }
          label={t('additionalDataPage.formQuestions.textFields.labels.note')}
          field={'fromBelongsRegulatedMarket'}
          onRadioChange={handleRadioChange}
          onTextFieldChange={handleTextFieldChange}
          errorText={errors.fromBelongsRegulatedMarket || ''}
        />
        <Divider />
        <RadioWithTextField
          title={t('additionalDataPage.formQuestions.registratedOnIPA')}
          label={t('additionalDataPage.formQuestions.textFields.labels.ipa')}
          field={'isFromIPA'}
          onRadioChange={handleRadioChange}
          onTextFieldChange={handleTextFieldChange}
          errorText={errors.isFromIPA || ''}
        />
        <Divider />
        <RadioWithTextField
          title={t('additionalDataPage.formQuestions.concessionaireOfPublicService')}
          label={t('additionalDataPage.formQuestions.textFields.labels.note')}
          field={'isConcessionaireOfPublicService'}
          onRadioChange={handleRadioChange}
          onTextFieldChange={handleTextFieldChange}
          errorText={errors.isConcessionaireOfPublicService || ''}
        />
        <Divider />
        <Grid item pb={4}>
          <FormControlLabel
            value={isChecked}
            control={<Checkbox size="small" />}
            onClick={() => {
              handleRadioChange('optionalPartyInformations', !isChecked);
              setIsChecked(!isChecked);
              if (
                additionalData.optionalPartyInformations?.textFieldValue &&
                isChecked &&
                additionalData.optionalPartyInformations?.textFieldValue !== ''
              ) {
                setShrink(false);
                setAdditionalData({
                  ['optionalPartyInformations']: {
                    openTextField: true,
                    textFieldValue: '',
                    choice: !isChecked,
                  },
                });
              }
            }}
            label={t('additionalDataPage.formQuestions.other')}
            sx={{
              marginY: 2,
              paddingLeft: 1,
              '.MuiFormControlLabel-label': {
                fontSize: '18px',
                fontWeight: 'fontWeightMedium',
              },
            }}
          />
          <TextField
            variant="outlined"
            label={t('additionalDataPage.formQuestions.optionalPartyInformations')}
            fullWidth
            sx={{ color: theme.palette.text.secondary }}
            onChange={(e: any) => {
              handleTextFieldChange(true, 'optionalPartyInformations', e.target.value);
            }}
            onClick={() => setShrink(true)}
            onBlur={() => {
              if (
                additionalData.optionalPartyInformations?.textFieldValue &&
                additionalData.optionalPartyInformations?.textFieldValue !== ''
              ) {
                setShrink(true);
              } else {
                setShrink(false);
              }
            }}
            error={!!errors.optionalPartyInformations}
            InputLabelProps={{
              shrink,
            }}
            helperText={errors.optionalPartyInformations || ''}
            value={additionalData.optionalPartyInformations?.textFieldValue}
          />
        </Grid>
      </Paper>

      <Grid item mb={10} mt={4}>
        <OnboardingStepActions
          back={{
            action: back,
            label: t('onboardingStep2.backLabel'),
            disabled: false,
          }}
          forward={{
            action: validateTextField,
            label: t('onboardingStep2.confirmLabel'),
            disabled,
          }}
        />
      </Grid>
    </Grid>
  );
}
