import { Typography, useTheme, Grid } from '@mui/material';
import { Box } from '@mui/system';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useTranslation, Trans } from 'react-i18next';

export default function SubProductStepSelectPricingPlan() {
  const discount = true;
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Box width={'100%'} height={'720px'} sx={{ backgroundColor: 'primary.main' }} mt={'-88px'}>
      <Grid
        container
        direction={'column'}
        alignContent={'centr'}
        sx={{ alignContent: 'center' }}
        alignItems="center"
      >
        {/* discount banner */}
        <Grid item xs={12} mt={8}>
          {discount && (
            <Box
              width={'326px'}
              height={'41px'}
              sx={{ backgroundColor: 'warning.main', borderRadius: theme.spacing(0.5) }}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Typography variant="subtitle2">
                {t('onBoardingSubProduct.subProductStepSelectPricingPlan.discountLabelData')}{' '}
              </Typography>
            </Box>
          )}
        </Grid>

        {/* title section */}
        <Grid item xs={4} mt={3} display="flex" justifyContent="center" maxWidth={'100%'}>
          <Typography
            variant="h2"
            display={'flex'}
            justifyContent="center"
            alignContent={'center'}
            color="white"
            textAlign="center"
          >
            <Trans i18nKey="onBoardingSubProduct.subProductStepSelectPricingPlan.title">
              Passa a IO Premium e migliora le <br /> performance dei messaggi
            </Trans>
          </Typography>
        </Grid>
        {/* check section */}
        <Grid item xs={4} mt={3} maxWidth={'100%'} direction="column">
          <Box display={'flex'} justifyContent="center">
            <CheckCircleIcon style={{ color: 'white' }} fontSize="small" />
            <Typography pl={1} fontSize="fontSize" color={'white'}>
              {t('onBoardingSubProduct.subProductStepSelectPricingPlan.firstCheckLabel')}
            </Typography>
          </Box>
          <Box display={'flex'} justifyContent="center" pt={1}>
            <CheckCircleIcon style={{ color: 'white' }} fontSize="small" />
            <Typography pl={1} fontSize="fontSize" color={'white'}>
              {t('onBoardingSubProduct.subProductStepSelectPricingPlan.secondCheckLabel')}
            </Typography>
          </Box>
          <Box display={'flex'} justifyContent="center" pt={1}>
            <CheckCircleIcon style={{ color: 'white' }} fontSize="small" />
            <Typography pl={1} fontSize="fontSize" color={'white'}>
              {t('onBoardingSubProduct.subProductStepSelectPricingPlan.thirdCheckLabel')}
            </Typography>
          </Box>
        </Grid>
        {/* info section */}
        <Grid container item justifyContent={'center'} mt={4} mb={5}>
          <Grid item xs={7}>
            <Typography fontSize={'fontSize'} color="white" textAlign={'center'}>
              <Trans i18nKey="onBoardingSubProduct.subProductStepSelectPricingPlan.infoSectionLabel">
                Se il tuo ente ha già aderito ad app IO, scegli qual è il piano che più soddisfa le
                sue esigenze. <br /> Il piano a carnet è attivabile una sola volta. Una volta
                terminato il numero di messaggi del piano a <br /> carnet, si attiverà
                automaticamente il piano a consumo.
              </Trans>
            </Typography>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}
