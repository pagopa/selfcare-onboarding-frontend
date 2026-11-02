import { Box, Typography } from '@mui/material';

type Props = {
  label: string;
};

export default function AsyncAutocompleteStatusMessage({ label }: Props) {
  return (
    <Box
      role="status"
      aria-live="polite"
      display="flex"
      sx={{ justifyContent: 'start' }}
      width="100%"
      mx={4}
    >
      <Typography py={3} sx={{ fontSize: '18px', fontWeight: 'fontWeightBold' }}>
        {label}
      </Typography>
    </Box>
  );
}
