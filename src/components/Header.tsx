import { AppBar, Container, Grid, Toolbar } from '@mui/material';
import LogoPagoPa from '../assets/logo_pago_pa_mini.svg';
// import { URL_FE_LOGOUT } from '../lib/constants';

const Header = () => (
  <AppBar>
    <Toolbar sx={{ bgcolor: 'main.primary' }}>
      <Container maxWidth="lg">
        <Grid container direction="row" spacing={4}>
          <Grid item xs={3} md={3} lg={3}>
            <img src={LogoPagoPa} alt="fireSpot" />
          </Grid>
          <Grid item xs={3} md={3} lg={3}>
            <img src={LogoPagoPa} alt="fireSpot" />
          </Grid>
        </Grid>
      </Container>
    </Toolbar>
  </AppBar>
);

export default Header;
