import {
  FormControl,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup,
  Typography,
  Paper,
  useTheme,
} from '@mui/material';
import React from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { InstitutionType, Product, StepperStepComponentProps } from '../../../types';
import { OnboardingStepActions } from '../OnboardingStepActions';

type Props = StepperStepComponentProps & {
  institutionType: InstitutionType;
  fromDashboard: boolean;
  selectedProduct?: Product | null;
};

const institutionTypeValues: Array<{ labelKey: string; value: InstitutionType }> = [
  { labelKey: 'pa', value: 'PA' },
  { labelKey: 'gsp', value: 'GSP' },
  { labelKey: 'scp', value: 'SCP' },
  { labelKey: 'pt', value: 'PT' },
];

export default function StepInstitutionType({
  back,
  forward,
  institutionType,
  fromDashboard,
  selectedProduct,
}: Props) {
  const [selectedValue, setSelectedValue] = React.useState<InstitutionType>(institutionType);

  const { t } = useTranslation();

  const theme = useTheme();

  const handleChange = (value: InstitutionType) => setSelectedValue(value);

  const onForwardAction = () => {
    forward(selectedValue);
  };

  const institutionTypeValueFiltered = (id: string | undefined) => {
    switch (id) {
      case 'prod-interop':
      case 'prod-pagopa':
        return institutionTypeValues.filter(
          (it) => it.labelKey === 'pa' || it.labelKey === 'gsp' || it.labelKey === 'scp'
        );
      case 'prod-pn':
        return institutionTypeValues.filter((it) => it.labelKey === 'pa');
      case 'prod-idpay':
        return institutionTypeValues.filter((it) => it.labelKey === 'pa');
      default:
        return institutionTypeValues.filter(
          (it) =>
            it.labelKey === 'pa' ||
            it.labelKey === 'gsp' ||
            it.labelKey === 'scp' ||
            it.labelKey === 'pt'
        );
    }
  };

  const institutionTypeLabelFiltered = (selectedProductId: string | undefined, itValue: string) => {
    if (selectedProductId === 'prod-io' && itValue === 'PT') {
      return t('stepInstitutionType.cadArticle6AppIo');
    } else if (
      (selectedProductId === 'prod-pn' || selectedProductId === 'prod-idpay') &&
      itValue === 'PA'
    ) {
      return t('stepInstitutionType.cadArticle165');
    } else {
      return t('stepInstitutionType.cadArticle2');
    }
  };

  return (
    <Grid container display="flex" justifyContent="center" alignItems="center">
      <Grid item xs={12} display="flex" justifyContent="center">
        <Typography variant="h3" align="center" pb={4}>
          <Trans i18nKey="stepInstitutionType.title">
            Seleziona il tipo di ente che <br /> rappresenti
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
                {institutionTypeValueFiltered(selectedProduct?.id).map((ot) => (
                  <FormControlLabel
                    sx={{ p: '8px' }}
                    key={ot.labelKey}
                    onChange={() => handleChange(ot.value)}
                    value={ot.value}
                    control={<Radio id={ot.labelKey} />}
                    label={
                      <>
                        <Typography sx={{ fontWeight: 600, fontSize: '18px', color: '#17324D' }}>
                          {t(`stepInstitutionType.institutionTypeValues.${ot.labelKey}`) as string}
                        </Typography>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 400,
                            fontSize: '14px',
                            color: '#5C6F82',
                          }}
                        >
                          {institutionTypeLabelFiltered(selectedProduct?.id, ot.value)}
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
      <Grid item xs={12} mt={4}>
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
