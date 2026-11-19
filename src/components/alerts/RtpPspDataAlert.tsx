import { Alert, Grid, Typography } from '@mui/material';
import { ButtonNaked } from '@pagopa/mui-italia';
import { useTranslation } from 'react-i18next';
import { ENV } from '../../utils/env';

const RtpPspDataAlert = () => {
  const { t } = useTranslation();

  return (
    <Grid item xs={11} mb={5}>
      <Alert
        severity="info"
        sx={{ width: '100%', alignItems: 'center' }}
        action={
          <ButtonNaked
            component="a"
            href={ENV.URL_FE.ASSISTANCE}
            color="blueItaly"
            sx={{ fontWeight: 'fontWeightBold', whiteSpace: 'nowrap', mx: 1 }}
          >
            {t('onboardingFormData.rtpPspDataAlert.action')}
          </ButtonNaked>
        }
      >
        <Typography variant="body2">
          {t('onboardingFormData.rtpPspDataAlert.description')}
        </Typography>
      </Alert>
    </Grid>
  );
};

export default RtpPspDataAlert;
