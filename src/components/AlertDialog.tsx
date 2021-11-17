import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { DialogActions, Grid, Typography } from '@mui/material';
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';

type DialogOption = {
  title: string | null;
  description: string | null;
  open: boolean;
  showConfirm?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
  handleConfirm?: (t: any) => void;
  handleClose: (t: any) => void;
};

export function AlertDialog({
  title,
  description,
  open,
  showConfirm,
  confirmLabel,
  cancelLabel,
  handleConfirm,
  handleClose,
}: DialogOption) {
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      maxWidth={'lg'}
    >
      <Grid
        container
        direction={'row'}
        alignItems={'center'}
        justifyContent={'space-between'}
        sx={{ pt: 4, pl: 3, pr: 3 }}
      >
        <Typography
          sx={{
            fontSize: '18px',
            lineHeight: '28px',
          }}
          variant={'h6'}
          align="left"
        >
          {title ? title : 'Titolo'}
        </Typography>

        <ClearOutlinedIcon onClick={handleClose} sx={{ color: 'info.main' }} />
      </Grid>

      <DialogContent>
        <Typography variant={'body1'} align="left">
          {description ? description : 'Descrizione'}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Grid container direction={'column'} m={2}>
          {showConfirm && (
            <Button
              color="primary"
              variant="contained"
              onClick={handleConfirm ? handleConfirm : handleClose}
            >
              {confirmLabel ? confirmLabel : 'Torna alla pagina di caricamento'}
            </Button>
          )}
          <Button sx={{ mt: 1 }} color="primary" variant="outlined" onClick={handleClose}>
            {cancelLabel ? cancelLabel : 'Esci'}
          </Button>
        </Grid>
      </DialogActions>
    </Dialog>
  );
}
