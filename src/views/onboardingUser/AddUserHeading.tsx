import { Grid, Typography } from '@mui/material';
import { Trans } from 'react-i18next';
import { useTranslation } from 'react-i18next';
import { RolesInformations } from '../../components/shared/RolesInformations';
import { InstitutionType } from '../../../types';
import { isTechPartner } from '../../utils/institutionTypeUtils';

type Props = {
  institutionType?: InstitutionType;
};

function AddUserHeading({ institutionType }: Props) {
  const { t } = useTranslation();

  return (
    <Grid container sx={{ display: 'flex', flexDirection: 'column', textAlign: 'center' }}>
      <Grid item mb={1}>
        <Typography variant="h3" fontWeight="fontWeightBold">
          <Trans i18nKey="addUser.title" components={{ 1: <br /> }}>
            {`Aggiungi un nuovo <1 /> Amministratore`}
          </Trans>
        </Typography>
      </Grid>
      <Grid item mb={1}>
        <Typography variant="body1" fontWeight="fontWeightRegular">
          <Trans i18nKey="addUser.subTitle" components={{ 1: <br /> }}>
            {`Indica per quale prodotto vuoi aggiungere un nuovo<1 />Amministratore`}
          </Trans>
        </Typography>
      </Grid>
      <Grid item mb={3}>
        <RolesInformations
          isTechPartner={isTechPartner(institutionType)}
          linkLabel={t('moreInformationOnRoles')}
        />
      </Grid>
    </Grid>
  );
}

export default AddUserHeading;
