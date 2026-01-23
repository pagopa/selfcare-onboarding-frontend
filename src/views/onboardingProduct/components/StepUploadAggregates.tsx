import { Alert, AlertTitle, Grid, Typography, useTheme } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import {
  InstitutionType,
  RequestOutcomeMessage,
  StepperStepComponentProps,
} from '../../../../types';
import { FileUploader } from '../../../components/fileUpload/FileUploader';
import { OnboardingStepActions } from '../../../components/registrationSteps/OnboardingStepActions';
import { UserContext } from '../../../lib/context';
import { RowError } from '../../../model/RowError';
import { getExampleAggregatesCsv, verifyAggregates } from '../../../services/aggregatesServices';

type Props = {
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setOutcome: React.Dispatch<React.SetStateAction<RequestOutcomeMessage | null | undefined>>;
  productName?: string;
  productId?: string;
  partyName?: string;
  institutionType?: InstitutionType;
} & StepperStepComponentProps;

export function StepUploadAggregates({
  loading,
  setLoading,
  setOutcome,
  productName,
  productId,
  partyName,
  institutionType,
  forward,
  back,
}: Props) {
  const { setRequiredLogin } = useContext(UserContext);

  const { t } = useTranslation();
  const theme = useTheme();

  const [uploadedFile, setUploadedFiles] = useState<Array<File>>([]);
  const [disabled, setDisabled] = useState<boolean>(true);
  const [invalidFile, setInvalidFile] = useState<boolean>(false);
  const [foundErrors, setFoundErrors] = useState<Array<RowError>>();
  const [errorCsv, setErrorCsv] = useState<string>();

  useEffect(() => {
    if (uploadedFile[0]?.name) {
      setDisabled(false);
      setInvalidFile(false);
      setFoundErrors(undefined);
    } else {
      setDisabled(true);
    }
  }, [uploadedFile[0]?.name]);

  const onDropAccepted = (acceptedFiles: Array<File>) => {
    setUploadedFiles(acceptedFiles);
    setDisabled(false);
  };

  const onDropRejected = () => {
    setDisabled(true);
    setInvalidFile(true);
  };

  const deleteUploadedFiles = (): void => {
    setUploadedFiles([]);
    setFoundErrors(undefined);
  };

  const parseJson2Csv = (errorJson: Array<RowError>) => {
    if (errorJson.length === 0) {
      return;
    }

    // eslint-disable-next-line functional/immutable-data
    const orderedErrorJson = errorJson.sort((a, b) => a.row - b.row);

    const replacer = (_key: any, value: any) => (value === null ? '' : value);
    const header = Object.keys(orderedErrorJson[0]);

    const csv = [
      header.join(','),
      ...orderedErrorJson.map((row: any) =>
        header.map((fieldName) => JSON.stringify(row[fieldName], replacer)).join(',')
      ),
    ].join('\r\n');

    const csvWithBom = '\uFEFF' + csv;

    const blob = new Blob([csvWithBom], { type: 'text/csv;charset=utf-8;' });
    const downloadUrl = URL.createObjectURL(blob);

    setErrorCsv(downloadUrl);
    setUploadedFiles([]);
  };

  return (
    <Grid container direction="column">
      <Grid container item xs={8} justifyContent="center" textAlign="center" mb={3}>
        <Grid item xs={8}>
          <Typography variant="h3">
            <Trans i18nKey="stepUploadAggregates.title" values={{ productName }}>
              {`Indica gli enti da aggregare per ${productName}`}
            </Trans>
          </Typography>
          <Typography variant="body1" mt={1}>
            {t('stepUploadAggregates.subTitle')}
          </Typography>
        </Grid>
      </Grid>
      {(invalidFile || foundErrors) && (
        <Grid
          item
          pt={2}
          pb={4}
          sx={{
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Alert
            severity="error"
            sx={{
              width: '684px',
              maxWidth: { xs: 335, md: 484, lg: 684 },
              height: '77px',
              fontSize: 'fontSize',
              alignItems: 'center',
              color: 'colorTextPrimary',
              borderLeft: 'solid',
              borderLeftColor: 'error.main',
              borderLeftWidth: '4px',
            }}
          >
            <AlertTitle>
              {t(`stepUploadAggregates.errors.${foundErrors ? 'onCsv' : 'invalidFormat'}.title`)}
            </AlertTitle>
            <Trans
              i18nKey={t(
                `stepUploadAggregates.errors.${foundErrors ? 'onCsv' : 'invalidFormat'}.description`
              )}
              components={{
                1: (
                  <a
                    download={`${partyName}_${productName}_aggregati_errore.csv`.replace(/ /g, '_')}
                    href={errorCsv}
                    style={{ color: theme.palette.text.primary }}
                  />
                ),
              }}
            >
              {foundErrors
                ? '<1>Scarica il report</1> per verificare le informazioni e carica di nuovo il file.'
                : 'È possibile caricare solo file in formato .csv'}
            </Trans>
          </Alert>
        </Grid>
      )}
      <Grid
        container
        item
        xs={12}
        display="flex"
        justifyContent="center"
        alignContent="center"
        alignItems="self-start"
        flexDirection="column"
      >
        <Grid item mb={3}>
          <FileUploader
            title={t('stepUploadAggregates.dropArea.title')}
            descriptionLink={t('stepUploadAggregates.dropArea.button')}
            uploadedFiles={uploadedFile}
            deleteUploadedFiles={deleteUploadedFiles}
            onDropAccepted={onDropAccepted}
            onDropRejected={onDropRejected}
            accept={{ 'text/csv': ['.csv'] }}
            loading={loading}
            isAggregatesUpload={true}
            theme={theme}
          />
          {!uploadedFile[0]?.name && (
            <Typography
              sx={{
                fontSize: '12px',
                fontWeight: 'fontWeightMedium',
                color: theme.palette.text.secondary,
                marginLeft: 3,
              }}
            >
              <Trans
                i18nKey={'stepUploadAggregates.downloadExampleCsv'}
                components={{
                  1: (
                    <a
                      onClick={() => getExampleAggregatesCsv(productId, productName, partyName)}
                      style={{
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        color: theme.palette.primary.main,
                        fontWeight: 'fontWeightMedium',
                      }}
                    />
                  ),
                }}
              >
                {'Non sai come preparare il file? <1>Scarica l’esempio</1>'}
              </Trans>
            </Typography>
          )}
        </Grid>
      </Grid>
      <OnboardingStepActions
        back={{ label: t('stepUploadAggregates.back'), action: back, disabled: false }}
        forward={{
          label: t('stepUploadAggregates.forward'),
          action: () =>
            verifyAggregates(
              uploadedFile[0],
              setLoading,
              institutionType,
              productId,
              setRequiredLogin,
              parseJson2Csv,
              setDisabled,
              forward,
              setFoundErrors,
              setOutcome
            ),
          disabled,
        }}
      />
    </Grid>
  );
}
