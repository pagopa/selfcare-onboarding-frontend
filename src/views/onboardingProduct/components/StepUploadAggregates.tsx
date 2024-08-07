import { Alert, AlertTitle, Grid, Typography, useTheme } from '@mui/material';
import { useTranslation, Trans } from 'react-i18next';
import { useContext, useEffect, useState } from 'react';
import { AxiosResponse } from 'axios';
import {
  InstitutionType,
  RequestOutcomeMessage,
  StepperStepComponentProps,
} from '../../../../types';
import { OnboardingStepActions } from '../../../components/OnboardingStepActions';
import { FileUploader } from '../../../components/FileUploader';
import { RowError } from '../../../model/RowError';
import { fetchWithLogs } from '../../../lib/api-utils';
import { getFetchOutcome } from '../../../lib/error-utils';
import { UserContext } from '../../../lib/context';
import { AggregateInstitution } from '../../../model/AggregateInstitution';
import { genericError } from './StepVerifyOnboarding';

type Props = {
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setOutcome: React.Dispatch<React.SetStateAction<RequestOutcomeMessage | null | undefined>>;
  productName?: string;
  institutionType?: InstitutionType;
} & StepperStepComponentProps;

export function StepUploadAggregates({
  loading,
  setLoading,
  setOutcome,
  productName,
  institutionType,
  forward,
  back,
}: Props) {
  const { setRequiredLogin } = useContext(UserContext);

  const { t } = useTranslation();
  const theme = useTheme();

  const [uploadedFile, setUploadedFiles] = useState<Array<File>>([]);
  const [disabled, setDisabled] = useState<boolean>(true);
  const [foundErrors, setFoundErrors] = useState<Array<RowError>>();
  const [errorCsv, setErrorCsv] = useState<string>();

  useEffect(() => {
    if (uploadedFile[0]?.name) {
      setDisabled(false);
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

    const blob = new Blob([csv], { type: 'text/csv' });
    const downloadUrl = URL.createObjectURL(blob);

    setErrorCsv(downloadUrl);
    setUploadedFiles([]);
  };

  const verifyAggregates = async (file: File) => {
    setLoading(true);

    const formData = new FormData();
    formData.append('aggregates', file);

    const verifyAggregates = await fetchWithLogs(
      {
        endpoint: 'ONBOARDING_VERIFY_AGGREGATES',
      },
      {
        method: 'POST',
        params: {
          institutionType,
        },
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      },
      () => setRequiredLogin(true)
    );

    const result = getFetchOutcome(verifyAggregates);

    if (result === 'success') {
      const errors = (verifyAggregates as AxiosResponse).data.errors as Array<RowError>;
      const aggregatesList = (verifyAggregates as AxiosResponse).data
        .aggregates as Array<AggregateInstitution>;
      parseJson2Csv(errors);

      if (errors.length === 0) {
        setDisabled(false);
        forward(undefined, aggregatesList);
      } else {
        setDisabled(true);
        setFoundErrors(errors);
      }
    } else {
      setOutcome(genericError);
    }
    setLoading(false);
  };

  return (
    <Grid container direction="column">
      <Grid container item justifyContent="center" mb={foundErrors ? 3 : 6}>
        <Grid item xs={12}>
          <Typography variant="h3" component="h2" align="center">
            <Trans i18nKey="stepUploadAggregates.title" values={{ productName }}>
              {`Indica gli enti da aggregare per ${productName}`}
            </Trans>
          </Typography>
        </Grid>
      </Grid>
      {foundErrors && (
        <Grid item pt={2} pb={4} sx={{ display: 'flex', justifyContent: 'center' }}>
          <Alert
            severity="error"
            sx={{
              width: '480px',
              height: '97px',
              fontSize: 'fontSize',
              alignItems: 'center',
              color: 'colorTextPrimary',
              borderLeft: 'solid',
              borderLeftColor: 'error.main',
              borderLeftWidth: '4px',
            }}
          >
            <AlertTitle>{t('stepUploadAggregates.errorAlert.title')}</AlertTitle>
            <Trans
              i18nKey={'stepUploadAggregates.errorAlert.description'}
              components={{
                1: (
                  <a
                    download={'aggregates_errors.csv'}
                    href={errorCsv}
                    style={{ color: theme.palette.text.primary }}
                  />
                ),
              }}
            >
              {'<1>Scarica il report</1> per verificare le informazioni e carica di nuovo il file.'}
            </Trans>
          </Alert>
        </Grid>
      )}
      <Grid item xs={12} display="flex" justifyContent="center" pb={4}>
        <FileUploader
          title={t('stepUploadAggregates.dropArea.title')}
          descriptionLink={t('stepUploadAggregates.dropArea.button')}
          uploadedFiles={uploadedFile}
          deleteUploadedFiles={deleteUploadedFiles}
          onDropAccepted={onDropAccepted}
          onDropRejected={onDropRejected}
          accept={['.csv']}
          loading={loading}
          isAggregatesUpload={true}
          theme={theme}
        />
      </Grid>
      <OnboardingStepActions
        back={{ label: t('stepUploadAggregates.back'), action: back, disabled: false }}
        forward={{
          label: t('stepUploadAggregates.forward'),
          action: () => verifyAggregates(uploadedFile[0]),
          disabled,
        }}
      />
    </Grid>
  );
}
