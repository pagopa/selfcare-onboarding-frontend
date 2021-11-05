import { AppBar, Grid, Toolbar, Typography } from '@mui/material';

const SubHeader = () => (
  <AppBar
    position="relative"
    sx={{ alignItems: 'center', height: '107px', backgroundColor: '#0066CC' }}
  >
    <Toolbar sx={{ width: { xs: '100%', lg: '90%' }, minHeight: '107px !important' }}>
      <Grid container direction="column">
        <Grid item>
          <Typography
            component="div"
            sx={{
              fontWeight: 'bold',
              fontSize: '24px',
              lineHeight: '36px',
              textAlign: 'left',
              color: 'background.default',
            }}
          >
            Self Care
          </Typography>
        </Grid>
        <Grid item>
          <Typography
            component="div"
            sx={{
              fontWeight: 'normal',
              fontSize: '14px',
              lineHeight: '24px',
              textAlign: 'left',
              color: 'background.default',
            }}
          >
            Gestisci i tuoi prodotti e servizi PagoPA
          </Typography>
        </Grid>
      </Grid>
    </Toolbar>
  </AppBar>
);

export default SubHeader;
