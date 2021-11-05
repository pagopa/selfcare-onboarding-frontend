import { Box, Grid, Link, SvgIcon, Typography } from '@mui/material';
import { ReactComponent as logo } from '../assets/logo.svg';

const Footer = () => (
  <Box
    component="footer"
    sx={{
      py: '32px',
      mt: 'auto',
      height: '188px',
      bgcolor: '#01254C',
      alignItems: 'center',
    }}
  >
    <Grid container justifyContent={'center'} alignItems={'center'}>
      <Box sx={{ width: '90%', display: 'flex' }}>
        <SvgIcon component={logo} viewBox="0 0 80 24" sx={{ width: '80px' }} />
        <Box sx={{ textAlign: 'end', flexGrow: 1 }}>
          <Typography
            component="div"
            sx={{
              fontWeight: 'normal',
              fontSize: '15px',
              lineHeight: '22,82px',
              textAlign: 'left',
              color: 'background.default',
              paddingLeft: '30px',
            }}
          >
            PagoPA S.p.A. - società per azioni con socio unico - capitale sociale di euro 1,000,000
            interamente versato - sede legale in Roma, Piazza Colonna 370, CAP 00187 - n. di
            iscrizione a Registro Imprese di Roma, CF e P.IVA 15376371009
          </Typography>
        </Box>
      </Box>
    </Grid>
    <Grid container alignItems={'center'} justifyContent={'center'}>
      <Box sx={{ width: '90%', display: 'flex' }}>
        <Typography
          style={{
            fontWeight: 'normal',
            fontSize: '15px',
            lineHeight: '15px',
            textAlign: 'left',
            padding: '27px 0px',
          }}
          component="div"
        >
          <Link
            href="https://www.pagopa.gov.it/it/privacy-policy/"
            underline="none"
            sx={{ marginRight: '10px', color: 'text.disabled' }}
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
        </Typography>
      </Box>
    </Grid>
  </Box>
);

export default Footer;
