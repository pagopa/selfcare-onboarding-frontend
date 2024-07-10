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

type Props = StepperStepComponentProps & {
  originId?: string;
  origin?: string;
};
export function StepAdditionalInformations({ forward, back, originId, origin }: Props) {
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

  const [disabled, setDisabled] = useState<boolean>(false);
  const [shrink, setShrink] = useState<boolean>(false);

  useEffect(() => {
    const isContinueButtonEnabled = Object.entries(radioValues).every(([key, value]) =>
      key === 'optionalPartyInformations' ? true : value !== undefined
    );

    const allFalseAndUnchecked =
      Object.values(radioValues).every((value) => !value) &&
      !additionalData.optionalPartyInformations?.choice;

    setDisabled(
      !isContinueButtonEnabled ||
      allFalseAndUnchecked ||
      Object.values(errors).some((error) => error !== '')
    );
  }, [radioValues, errors, additionalData.optionalPartyInformations?.choice]);

  const handleRadioChange = (field: any, value: any) => {
    setRadioValues((prevValues) => ({
      ...prevValues,
      [field]: value,
    }));
    setAdditionalData((prevValues) => ({
      ...prevValues,
      [field]: { ...prevValues[field], choice: value },
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [field]: '',
    }));
  };



  console.log('additionalData', additionalData);

  useEffect(() => {
    if (origin === 'IPA' && originId) {
      handleRadioChange('isFromIPA', true);
      handleTextFieldChange(true, 'isFromIPA', originId, true);
      handleTextFieldChange(true, 'optionalPartyInformations', '', false);
    } else {
      handleRadioChange('isFromIPA', false);
      handleTextFieldChange(false, 'isFromIPA', '', false);
      handleTextFieldChange(true, 'optionalPartyInformations', '', false);
    }
  }, [origin, originId]);

  const handleTextFieldChange = (open: boolean, field: string, value: string, choice: boolean) => {
    setErrors((prevErrors) => ({
      ...prevErrors,
      [field]: '',
    }));
    setAdditionalData((prevAdditionalData) => ({
      ...prevAdditionalData,
      [field]: {
        openTextField: open,
        textFieldValue: value,
        choice,
      },
    }));
  };

  // eslint-disable-next-line sonarjs/cognitive-complexity
  const validateTextField = () => {
    const newErrors = Object.keys(radioValues).reduce((acc, field) => {
      switch (field) {
        case 'optionalPartyInformations':
          if (
            additionalData.optionalPartyInformations?.choice &&
            !additionalData.optionalPartyInformations?.textFieldValue
          ) {
            return {
              ...acc,
              [field]: t(
                `additionalDataPage.formQuestions.textFields.errors.optionalPartyInformations`
              ),
            };
          }
          break;
        case 'isFromIPA':
          if (
            additionalData[field]?.openTextField &&
            additionalData[field]?.textFieldValue === '' &&
            !(radioValues[field] && origin === 'IPA')
          ) {
            return {
              ...acc,
              [field]: t(`additionalDataPage.formQuestions.textFields.errors.${field}`),
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
          additionalData={additionalData}
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
          additionalData={additionalData}
        />
        <Divider />
        <RadioWithTextField
          title={t('additionalDataPage.formQuestions.registratedOnIPA')}
          label={t('additionalDataPage.formQuestions.textFields.labels.ipa')}
          field={'isFromIPA'}
          onRadioChange={handleRadioChange}
          onTextFieldChange={handleTextFieldChange}
          errorText={errors.isFromIPA || ''}
          isIPA={origin === 'IPA'}
          additionalData={additionalData}
        />
        <Divider />
        <RadioWithTextField
          title={t('additionalDataPage.formQuestions.concessionaireOfPublicService')}
          label={t('additionalDataPage.formQuestions.textFields.labels.note')}
          field={'isConcessionaireOfPublicService'}
          onRadioChange={handleRadioChange}
          onTextFieldChange={handleTextFieldChange}
          errorText={errors.isConcessionaireOfPublicService || ''}
          additionalData={additionalData}
        />
        <Divider />
        <Grid item pb={4}>
          <FormControlLabel
            value={additionalData.optionalPartyInformations?.choice}
            control={<Checkbox size="small" />}
            onClick={() => {
              handleRadioChange('optionalPartyInformations', !additionalData.optionalPartyInformations?.choice);
              if (
                additionalData.optionalPartyInformations?.textFieldValue &&
                additionalData.optionalPartyInformations?.choice &&
                additionalData.optionalPartyInformations?.textFieldValue !== ''
              ) {
                setShrink(false);
                setAdditionalData((prevValues) => ({
                  ...prevValues,
                  ['optionalPartyInformations']: {
                    openTextField: true,
                    textFieldValue: '',
                    choice: !additionalData.optionalPartyInformations?.choice,
                  },
                }));
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
              handleTextFieldChange(true, 'optionalPartyInformations', e.target.value, additionalData.optionalPartyInformations?.choice);
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
            label: t('stepAddManager.back'),
            disabled: false,
          }}
          forward={{
            action: validateTextField,
            label: t('stepAddManager.continue'),
            disabled,
          }}
        />
      </Grid>
    </Grid>
  );
}
