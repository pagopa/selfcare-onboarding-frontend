import { Grid, Paper, Typography } from '@mui/material';
import useTheme from '@mui/material/styles/useTheme';

type DocumentCardProps = {
  title: string;
  description: string;
  children: React.ReactNode;
  helper?: string;
};

export const DocumentCard = ({ title, description, children, helper }: DocumentCardProps) => {
  const theme = useTheme();
  return (
    <Paper
      elevation={8}
      sx={{
        borderRadius: theme.spacing(2),
        p: 4,
        my: 2,
        width: '704px',
      }}
    >
      <Grid
        container
        display="flex"
        direction="column"
        alignItems="flex-start"
        justifyContent="center"
        sx={{ width: '100%' }}
      >
        <Grid item xs={12} textAlign="left">
          <Typography
            component="div"
            variant="caption"
            sx={{ fontWeight: 'fontWeightBold' }}
            mb={1}
          >
            {title.toUpperCase()}
          </Typography>
          <Typography sx={{ fontWeight: 400 }} variant="body2" mb={3}>
            {description}
          </Typography>
        </Grid>
        <Grid item xs={12} width="100%">
          {children}
        </Grid>
        <Grid item xs={12}>
          {helper && (
            <Typography variant="caption" color={theme.palette.text.secondary} align="center">
              {helper}
            </Typography>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
};
