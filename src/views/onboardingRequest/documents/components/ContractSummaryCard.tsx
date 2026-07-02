import { Grid, Paper, Typography } from '@mui/material';
import { theme } from '@pagopa/mui-italia';
import { isArray } from 'lodash';
import { useTranslation } from 'react-i18next';
import { UploadedDocument } from '../../../../model/Documents';
import UploadedDocumentComponent from './UploadedDocument';

type Props = {
  document: UploadedDocument | Array<UploadedDocument> | undefined;
  tkey: string;
};

const ContractSummaryCard = ({ document, tkey }: Props) => {
  const { t } = useTranslation();
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
            {t(`upladDocuments.contractSummary.${tkey}.title`).toUpperCase()}
          </Typography>
          <Typography sx={{ fontWeight: 400 }} variant="body2" mb={3}>
            {t(`upladDocuments.contractSummary.${tkey}.subtitle`)}
          </Typography>
        </Grid>
        {!isArray(document) ? (
          <Grid item xs={12} width="100%">
            <UploadedDocumentComponent file={document?.file} />
          </Grid>
        ) : (
          document.map((doc: UploadedDocument) => (
            <Grid item xs={12} width="100%" key={doc.id} mb={1}>
              <UploadedDocumentComponent file={doc.file} />
            </Grid>
          ))
        )}
      </Grid>
    </Paper>
  );
};

export default ContractSummaryCard;
