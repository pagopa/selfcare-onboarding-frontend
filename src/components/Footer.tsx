import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import { Box, Container } from '@mui/material';
import LogoPagoPa from '../assets/pagopa-logo.svg';

const Footer = () => (
  <Box
    component="footer"
    sx={{
      py: '50px',
      px: 2,
      mt: 'auto',
      maxHeight: '189px',
      bgcolor: '#01254C',
    }}
  >
    <Container maxWidth="lg">
      <Grid container direction="row" spacing={4}>
        <Grid item xs={3} md={3} lg={3}>
          <img src={LogoPagoPa} alt="fireSpot" />
        </Grid>
        <Grid item xs={9} md={9} lg={9}>
          <Typography
            component="div"
            sx={{
              fontWeight: 'normal',
              fontSize: '15px',
              lineHeight: '22,82px',
              textAlign: 'center',
              color: 'text.disabled',
            }}
          >
            PagoPA S.p.A. - società per azioni con socio unico - capitale sociale di euro 1,000,000
            interamente versato - sede legale in Roma, Piazza Colonna 370, CAP 00187 - n. di
            iscrizione a Registro Imprese di Roma, CF e P.IVA 15376371009
          </Typography>
        </Grid>
        <Typography
          style={{
            fontWeight: 'normal',
            fontSize: '15px',
            lineHeight: '15px',
            textAlign: 'center',
            color: 'text.secondary',

            padding: '40px 0px',
          }}
          component="div"
        >
          <Link
            href="https://www.pagopa.gov.it/it/privacy-policy/"
            underline="none"
            sx={{ margin: '10px', color: 'text.disabled' }}
          >
            {'Privacy Policy '}{' '}
          </Link>
          <Link
            href="https://pagopa.portaleamministrazionetrasparente.it/"
            underline="none"
            sx={{ margin: '10px', color: 'text.disabled' }}
          >
            {'Società Trasparente '}{' '}
          </Link>
          <Link
            href="https://www.pagopa.it/it/lavora-con-noi/"
            underline="none"
            sx={{ margin: '10px', color: 'text.disabled' }}
          >
            {'Lavora Con Noi '}{' '}
          </Link>
          <Link
            href="https://www.pagopa.gov.it/it/privacy-policy/"
            underline="none"
            sx={{ margin: '10px', color: 'text.disabled' }}
          >
            {'Sicurezza '}{' '}
          </Link>
        </Typography>
      </Grid>
    </Container>
  </Box>
);

export default Footer;
