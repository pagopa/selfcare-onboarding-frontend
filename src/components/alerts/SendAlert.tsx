import { Grid, Alert, Typography } from '@mui/material';
import { theme } from '@pagopa/mui-italia';
import { Trans } from 'react-i18next';
import { isSendProduct } from '../../utils/institutionTypeUtils';
import { Product } from '../../../types';

const SendAlert = ({ product }: { product: Product | null | undefined }) =>
  isSendProduct(product?.id) && (
    <Grid container item justifyContent="center">
      <Grid item display="flex" justifyContent="center" mb={5}>
        <Alert
          severity="info"
          sx={{
            width: '100%',
            paddingRight: '56px !important',
          }}
        >
          <Typography sx={{ fontSize: '16px', a: { color: theme.palette.text.primary } }}>
            <Trans
              i18nKey={'onboardingStep1.onboarding.disclaimer.description'}
              components={{
                1: <strong />,
                3: <br />,
                5: (
                  <a
                    href="https://docs.pagopa.it/area-riservata/area-riservata/come-aderire"
                    target="_blank"
                    rel="noreferrer"
                  />
                ),
              }}
            >
              {`Al momento possono aderire a SEND tramite Area Riservata solo le <1>Pubbliche <3>Amministrazioni Locali </1> presenti su IPA che trovi a <5>questo link</5>.`}
            </Trans>
          </Typography>
        </Alert>
      </Grid>
    </Grid>
  );

export default SendAlert;
