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

type Props = {
  forward: () => void;
  back: () => void;
};

export function StepAdditionalInfos({ forward, back }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();

  const [radioValues, setRadioValues] = useState({
    isEstabilishedRegulatoryProvision: '',
    fromBelongsRegulatedMarket: '',
    isFromIPA: '',
    isConcessionaireOfPublicService: '',
    optionalPartyInformations: '',
  });

  const [blockData, setBlockData] = useState<{
    [field: string]: { openTextField: boolean; textFieldValue: string; errorText: string };
  }>({});

  const [errors, setErrors] = useState<{
    [field: string]: string;
  }>({});

  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [disabled, setDisabled] = useState<boolean>(false);

  useEffect(() => {
    const isContinueButtonEnabled = Object.entries(radioValues).every(([key, value]) =>
      key === 'optionalPartyInformations' ? true : value !== ''
    );

    setDisabled(!isContinueButtonEnabled || Object.values(errors).some((error) => error !== ''));
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
    setBlockData((prevBlockData) => ({
      ...prevBlockData,
      [field]: {
        openTextField: open,
        textFieldValue: value,
        errorText: '',
      },
    }));
  };

  const validateTextField = () => {
    const newErrors = Object.entries(radioValues).reduce((acc, [field]) => {
      if (blockData[field]?.openTextField && blockData[field]?.textFieldValue === '') {
        return {
          ...acc,
          [field]: t(`additionalDataPage.formQuestions.textFields.errors.${field}`),
        };
      }
      return acc;
    }, {});

    if (
      isChecked &&
      (!blockData.optionalPartyInformations ||
        blockData.optionalPartyInformations?.textFieldValue === '')
    ) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        optionalPartyInformations: t(
          'additionalDataPage.formQuestions.textFields.errors.optionalPartyInformations'
        ),
      }));
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        ...newErrors,
      }));
      setDisabled(true);
    } else {
      setErrors({});
      forward();
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
          onRadioChange={(value: any) =>
            handleRadioChange('isEstabilishedRegulatoryProvision', value)
          }
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
          onRadioChange={(value: any) => handleRadioChange('fromBelongsRegulatedMarket', value)}
          onTextFieldChange={handleTextFieldChange}
          errorText={errors.fromBelongsRegulatedMarket || ''}
        />
        <Divider />
        <RadioWithTextField
          title={t('additionalDataPage.formQuestions.registratedOnIPA')}
          label={t('additionalDataPage.formQuestions.textFields.labels.ipa')}
          field={'isFromIPA'}
          onRadioChange={(value: any) => handleRadioChange('isFromIPA', value)}
          onTextFieldChange={handleTextFieldChange}
          errorText={errors.isFromIPA || ''}
        />
        <Divider />
        <RadioWithTextField
          title={t('additionalDataPage.formQuestions.concessionaireOfPublicService')}
          label={t('additionalDataPage.formQuestions.textFields.labels.note')}
          field={'isConcessionaireOfPublicService'}
          onRadioChange={(value: any) =>
            handleRadioChange('isConcessionaireOfPublicService', value)
          }
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
            error={!!errors.optionalPartyInformations}
            helperText={errors.optionalPartyInformations || ''}
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
