import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { DialogActions, Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

type DialogOption = {
  title: string | null;
  description: React.ReactElement | null;
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
  confirmLabel,
  cancelLabel,
  handleConfirm,
  handleClose,
}: DialogOption) {
  const { t } = useTranslation();
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
        <Typography variant={'sidenav'} align="left">
          {title ? title : t('alertDialog.title')}
        </Typography>
      </Grid>

      <DialogContent>
        <Typography variant={'body1'} align="left">
          {description ? description : t('alertDialog.description')}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Grid container direction={'row-reverse'} mt={1} mb={3} ml={2}>
          <Grid xs={4} ml={1}>
            <Button
              color="primary"
              variant="contained"
              onClick={handleConfirm ? handleConfirm : handleClose}
            >
              {confirmLabel ? confirmLabel : t('alertDialog.confirmLabel')}
            </Button>
          </Grid>
          <Grid xs={2}>
            <Button color="primary" variant="outlined" onClick={handleClose}>
              {cancelLabel ? cancelLabel : t('alertDialog.cancelLabel')}
            </Button>
          </Grid>
        </Grid>
      </DialogActions>
    </Dialog>
  );
}
