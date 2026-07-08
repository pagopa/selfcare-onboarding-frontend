import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Box, Typography, useTheme } from '@mui/material';

type Props = {
  title: string;
  description: string;
};

const DocumentAlert = ({ title, description }: Props) => {
  const theme = useTheme();

  return (
    <Box
      display="flex"
      alignItems="center"
      gap={2}
      sx={{
        width: '100%',
        p: 2,
        mb: 2,
        borderLeft: `4px solid ${theme.palette.error.main}`,
        backgroundColor: `${theme.palette.error.main}14`,
        borderRadius: '4px',
      }}
    >
      <ErrorOutlineIcon sx={{ color: theme.palette.text.primary }} />
      <Box textAlign="left">
        <Typography variant="body2" sx={{ fontWeight: 'fontWeightBold' }}>
          {title}
        </Typography>
        <Typography variant="body2">{description}</Typography>
      </Box>
    </Box>
  );
};

export default DocumentAlert;
