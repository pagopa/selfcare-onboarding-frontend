import { Modal, Typography, useTheme } from '@mui/material';
import { Box } from '@mui/system';
import MDSpinner from 'react-md-spinner';

type LoadingOverlayProps = {
  loadingText: string;
};

export function LoadingOverlay({ loadingText }: LoadingOverlayProps) {
  const theme = useTheme();

  return (
    <Modal
    open={true}
    aria-labelledby="modal-modal-title"
    aria-describedby="modal-modal-description">
  <Box>
      <MDSpinner singleColor={theme.palette.primary.main} />
      {loadingText && <Typography>{loadingText}</Typography>}
      </Box>
    </Modal>
  );
}
