import * as React from 'react';
import { Typography, Button, Grid, IconButton } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';

type Props = {
  open: boolean;
  handleClose?: React.MouseEventHandler<HTMLButtonElement> | undefined;
  handleExit: React.MouseEventHandler<HTMLButtonElement> | undefined;
  message: string;
  title: string;
  onConfirm?: React.MouseEventHandler<HTMLButtonElement> | undefined;
  confirmLabel: string;
  rejectLabel: string;
  height?: string;
  width?: string;
};
export default function SessionModal({
  open,
  handleClose,
  handleExit,
  message,
  onConfirm,
  title,
  confirmLabel,
  rejectLabel,
  height = '16em',
  width = '21.9em',
}: Props) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('xs'));

  return (
    <Dialog
      fullScreen={fullScreen}
      open={open}
      onClose={handleClose}
      aria-labelledby="responsive-dialog-title"
    >
      <IconButton
        onClick={handleClose}
        style={{ position: 'absolute', top: '20px', right: '16px', zIndex: 100 }}
      >
        <ClearOutlinedIcon />
      </IconButton>
      <Grid container direction="row" sx={{ height, width }} mx={3}>
        <Grid item mt={4}>
          <Grid container direction="row">
            <Grid item xs={10}>
              <Typography variant="h5" sx={{ fontSize: '18px', fontWeight: '600' }}>
                {title}
              </Typography>
            </Grid>

            <Grid container item>
              <Grid item xs={12} my={3}>
                <Typography variant="body2">{message}</Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <Grid container justifyContent="end" direction="row">
            <Grid item xs={12} mb={2}>
              <Button
                sx={{ width: '100%' }}
                color="primary"
                variant="contained"
                onClick={onConfirm}
              >
                {confirmLabel}
              </Button>
            </Grid>

            <Grid item xs={12} mb={2}>
              <Button
                onClick={handleExit}
                sx={{ width: '100%' }}
                color="primary"
                variant="outlined"
              >
                {rejectLabel}
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Dialog>
  );
}
