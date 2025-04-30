import { Grid, Link, Typography, useTheme, Paper } from '@mui/material';
import { Box } from '@mui/system';
import { styled } from '@mui/material/styles';
import { useTranslation, Trans } from 'react-i18next';
import { SetStateAction } from 'react';
import { Product } from '../../../../types';
import { OnboardingStepActions } from '../../../components/OnboardingStepActions';

type Props = {
  subProduct: Product | undefined;
  activeStep: number;
  setActiveStep: (value: SetStateAction<number>) => void;
  back: () => void;
};

const CustomBox = styled(Box)({
  '&::-webkit-scrollbar': {
    width: 4,
  },
  '&::-webkit-scrollbar-track': {
    boxShadow: `inset 10px 10px  #E6E9F2`,
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: '#0073E6',
    borderRadius: '16px',
  },
  overflowY: 'auto',
  overflowX: 'hidden',
});
export function SubProductStepNoParties({ subProduct, activeStep, setActiveStep, back }: Props) {
  const { t } = useTranslation();

  const theme = useTheme();

  return (
    <Grid container direction="column" sx={{ minWidth: '480px' }}>
      <Grid container item justifyContent="center">
        <Grid item xs={12}>
          <Typography variant="h3" component="h2" align="center" color={theme.palette.text.primary}>
            <Trans i18nKey="onboardingSubProduct.noPartyStep.title" components={{ 1: <br /> }}>
              {`Nessuno dei tuoi enti può <1/> aderire`}
            </Trans>
          </Typography>
        </Grid>
      </Grid>

      <Grid container item justifyContent="center" mt={1}>
        <Grid item xs={12}>
          <Typography variant="body1" align="center" color={theme.palette.text.primary}>
            <Trans
              i18nKey="onboardingSubProduct.noPartyStep.subTitle"
              values={{ productName: subProduct?.title }}
              components={{ 1: <br />, 3: <strong /> }}
            >
              {`Se non vedi enti disponibili nella lista, l'ente cercato potrebbe <br/> aver già aderito <3>{{productName}}</3>`}
            </Trans>
          </Typography>
        </Grid>
      </Grid>

      <Grid container item textAlign="center" justifyContent="center" mt={4} mb={2}>
        <Paper
          elevation={8}
          sx={{ borderRadius: theme.spacing(2), py: 2, px: 4, minWidth: '480px' }}
        >
          <CustomBox
            maxHeight={'250px'}
            sx={{
              pointerEvents: 'none',
            }}
          >
            <Typography
              py={2}
              sx={{
                fontSize: '18px',
                fontWeight: 'fontWeightBold',
                display: 'flex',
                justifyContent: 'flex-start',
              }}
            >
              {t('onboardingSubProduct.noPartyStep.notPartyAvailable')}
            </Typography>
          </CustomBox>
        </Paper>
      </Grid>

      <Grid container item justifyContent="center">
        <Grid item xs={6}>
          <Box
            sx={{
              fontSize: '14px',
              lineHeight: '24px',
              textAlign: 'center',
            }}
          >
            <Typography
              aria-label="Non trovi il tuo ente? Scopri perché"
              sx={{
                textAlign: 'center',
              }}
              variant="caption"
              color={theme.palette.text.primary}
            >
              <Trans i18nKey="onboardingSubProduct.noPartyStep.helperLink">
              Non trovi il tuo ente?
                <Link sx={{ cursor: 'pointer' }} onClick={() => setActiveStep(activeStep + 1)}>
                  Scopri perché
                </Link>
              </Trans>
            </Typography>
          </Box>
        </Grid>
      </Grid>

      <Grid item mt={3}>
        <OnboardingStepActions
          back={{
            action: back,
            label: t('onboardingSubProduct.noPartyStep.backButton'),
          }}
        />
      </Grid>
    </Grid>
  );
}
