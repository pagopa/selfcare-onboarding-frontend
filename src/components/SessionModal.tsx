import * as React from 'react';
import { Typography, Box, Button, Grid, IconButton } from '@mui/material';
import Dialog from '@mui/material/Dialog';
// import DialogActions from '@mui/material/DialogActions';
// import DialogContent from '@mui/material/DialogContent';
// import DialogContentText from '@mui/material/DialogContentText';
// import DialogTitle from '@mui/material/DialogTitle';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';

type Props = {
  open: boolean;
  handleClose: React.MouseEventHandler<HTMLButtonElement> | undefined;
};
export default function SessionModal({ open, handleClose }: Props) {
  const title = 'Vuoi uscire dalla sessione?';
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('xs'));

  return (
    <Dialog
      // sx={{ backgroundColor:'white'}}
      fullScreen={fullScreen}
      open={open}
      onClose={handleClose}
      aria-labelledby="responsive-dialog-title"
    >
      <Grid container direction="column" sx={{ height: '276px', width: '406px' }}>
        <Box mx={3}>
          <Grid container item mt={4}>
            <Grid item xs={10}>
              <IconButton
                // color="primary"
                onClick={handleClose}
                style={{ position: 'absolute', top: '20px', right: '16px', zIndex: 100 }}
              >
                <ClearOutlinedIcon />
              </IconButton>
              <Typography variant="h5" sx={{ fontSize: '18px', fontWeight: '600' }}>
                {title}
              </Typography>
            </Grid>
          </Grid>

          <Grid container item>
            <Grid item xs={10} my={3}>
              <Typography variant="body2">
                Se confermi dovrai ripetere l&rsquo;autenticazione per entrare e ripetere i passaggi
                effettuati.
              </Typography>
            </Grid>
          </Grid>

          <Grid item xs={12} mb={2}>
            <Button
              sx={{ width: '100%' }}
              color="primary"
              variant="contained"
              onClick={handleClose}
            >
              Conferma
            </Button>
          </Grid>

          <Grid item xs={12} mb={2}>
            <Button onClick={handleClose} sx={{ width: '100%' }} color="primary" variant="outlined">
              Annulla
            </Button>
          </Grid>
        </Box>
      </Grid>
    </Dialog>
  );
}
