import { Grid, Typography, Button } from '@mui/material';
import { IllusError } from '@pagopa/mui-italia';
import { ENV } from '../../utils/env';

type Props = {
  titleContent: any;
  descriptionContent: any;
  backButtonContent: any;
};

export default function ErrorPage({ titleContent, descriptionContent, backButtonContent }: Props) {
  return (
    <Grid container justifyContent="center" alignItems="center">
      <IllusError size={60} />
      <Grid container direction="column" key="0" mt={3}>
        <Grid item xs={6}>
          <Typography variant="h4" textAlign="center">
            {titleContent}
          </Typography>
        </Grid>
        <Grid item xs={6} mt={1} mb={4} textAlign="center">
          {descriptionContent}
        </Grid>
        <Grid item xs={4} alignSelf="center">
          <Button variant="contained" onClick={() => window.location.assign(ENV.URL_FE.LANDING)}>
            {backButtonContent}
          </Button>
        </Grid>
      </Grid>
    </Grid>
  );
}
