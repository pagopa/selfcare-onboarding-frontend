import {
  FormControl,
  FormControlLabel,
  Grid,
  Paper,
  Radio,
  RadioGroup,
  Typography,
  useTheme,
} from '@mui/material';
import React, { useRef } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import {
  IPACatalogParty,
  InstitutionType,
  Product,
  StepperStepComponentProps,
} from '../../../types';
import { OnboardingStepActions } from '../registrationSteps/OnboardingStepActions';
import { useHistoryState } from '../../hooks/useHistoryState';
import {
  description4InstitutionType,
  institutionType4Product,
} from '../../utils/constants';

type Props = StepperStepComponentProps & {
  institutionType: InstitutionType;
  fromDashboard: boolean;
  selectedProduct?: Product | null;
};

export default function StepInstitutionType({
  back,
  forward,
  institutionType,
  fromDashboard,
  selectedProduct,
}: Props) {
  const [selectedValue, setSelectedValue] = React.useState<InstitutionType>(institutionType);
  const setSelectedHistory = useHistoryState<IPACatalogParty | null>('selected_step1', null)[2];

  const selectedValueRef = useRef<InstitutionType>(selectedValue);

  const { t } = useTranslation();

  const theme = useTheme();

  const handleChange = (value: InstitutionType) => {
    if (value !== selectedValueRef.current) {
      setSelectedHistory(null);
    }
    setSelectedValue(value);
  };

  const onForwardAction = () => {
    forward(selectedValue);
  };

  return (
    <Grid container display="flex" justifyContent="center" alignItems="center">
      <Grid item xs={12} display="flex" justifyContent="center">
        <Typography variant="h3" align="center" pb={1}>
          <Trans i18nKey="stepInstitutionType.title">
            Seleziona il tipo di ente che <br /> rappresenti
          </Trans>
        </Typography>
      </Grid>
      <Grid item xs={12} display="flex" justifyContent="center">
        <Typography variant="body1" align="center" pb={4}>
          <Trans
            i18nKey="stepInstitutionType.subtitle"
            values={{ productName: selectedProduct?.title }}
            components={{ 1: <strong /> }}
          >
            {`Indica il tipo di ente che aderirà a <1>{{productName}}</1>`}
          </Trans>
        </Typography>
      </Grid>
      <Paper
        elevation={8}
        sx={{ borderRadius: theme.spacing(2), p: 1, width: '580px', height: '100%' }}
      >
        <Grid container item>
          <Grid item xs={12} p={3}>
            <FormControl>
              <RadioGroup name="radio-buttons-group" defaultValue={institutionType}>
                {institutionType4Product(selectedProduct?.id).map((ot) => (
                  <FormControlLabel
                    sx={{ p: '8px' }}
                    key={ot.labelKey}
                    onChange={() => handleChange(ot.value)}
                    value={ot.value}
                    control={
                      <Radio
                        id={ot.labelKey}
                        inputProps={{
                          'aria-label': t(
                            `stepInstitutionType.institutionTypes.${ot.labelKey}.title`
                          ),
                        }}
                      />
                    }
                    label={
                      <>
                        <Typography sx={{ fontWeight: 600, fontSize: '18px', color: '#17324D' }}>
                          {t(`stepInstitutionType.institutionTypes.${ot.labelKey}.title`)}
                        </Typography>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 400,
                            fontSize: '14px',
                            color: '#5C6F82',
                          }}
                        >
                          {t(description4InstitutionType(ot))}
                        </Typography>
                      </>
                    }
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>
      <Grid item xs={12} mt={2}>
        <OnboardingStepActions
          back={
            fromDashboard
              ? {
                  action: back,
                  label: t('onboardingStep1.onboarding.onboardingStepActions.backAction'),
                  disabled: false,
                }
              : undefined
          }
          forward={{
            action: onForwardAction,
            label: t('stepInstitutionType.confirmLabel'),
            disabled: !selectedValue,
          }}
        />
      </Grid>
    </Grid>
  );
}
