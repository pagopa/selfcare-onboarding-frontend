import { Grid, Alert, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { theme } from '@pagopa/mui-italia';
import { isInteropProduct, isGlobalServiceProvider } from '../../utils/institutionTypeUtils';
import { InstitutionType, Product } from '../../../types';

const InteropGspAlert = ({
  product,
  institutionType,
}: {
  product: Product | null | undefined;
  institutionType?: InstitutionType;
}) =>
  isInteropProduct(product?.id) &&
  isGlobalServiceProvider(institutionType) && (
    <Grid container item justifyContent="center">
      <Grid item xs={9}>
        <Box display="flex" justifyContent="center" mb={5}>
          <Alert severity="info" sx={{ width: '100%' }}>
            <Typography sx={{ fontSize: '16px', a: { color: theme.palette.text.primary } }}>
              Al momento i Gestori di Pubblico Servizio possono aderire solo se presenti in IPA,
              come indicato nelle{' '}
              <a href="https://trasparenza.agid.gov.it/moduli/downloadFile.php?file=oggetto_allegati/213481832030O__O20211210_LG+Infrastruttura+Interoperabilit%26%23224%3B+PDND_v1_allegato+1.pdf">
                {' '}
                linee guida AGID
              </a>{' '}
            </Typography>
          </Alert>
        </Box>
      </Grid>
    </Grid>
  );

export default InteropGspAlert;
