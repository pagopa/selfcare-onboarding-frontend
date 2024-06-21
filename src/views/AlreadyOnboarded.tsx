import { Grid, Link } from '@mui/material';
import { IllusError } from '@pagopa/mui-italia';
import { EndingPage } from '@pagopa/selfcare-common-frontend';
import { resolvePathVariables } from '@pagopa/selfcare-common-frontend/utils/routes-utils';
import { Trans } from 'react-i18next';
import { useHistory } from 'react-router';
import { RolesInformations } from '../components/RolesInformations';
import { ROUTES } from '../utils/constants';
import { ENV } from '../utils/env';
import { InstitutionType, Party, Product } from '../../types';

type Props = {
  selectedParty?: Party;
  selectedProduct?: Product | null;
  institutionType?: InstitutionType;
};

export default function AlreadyOnboarded({
  selectedParty,
  selectedProduct,
  institutionType,
}: Props) {
  const history = useHistory();
  return (
    <EndingPage
      minHeight="52vh"
      variantTitle={'h4'}
      variantDescription={'body1'}
      icon={<IllusError size={60} />}
      title={<Trans i18nKey="stepVerifyOnboarding.alreadyOnboarded.title" />}
      description={
        <Grid container sx={{ display: 'flex', flexDirection: 'column' }}>
          <Trans
            i18nKey="stepVerifyOnboarding.alreadyOnboarded.description"
            components={{ 1: <br /> }}
          >
            {
              'Per operare sul prodotto, chiedi a un Amministratore di <1/>aggiungerti nella sezione Utenti.'
            }
          </Trans>
          <Grid item>
            <RolesInformations />
          </Grid>
        </Grid>
      }
      isParagraphPresent={true}
      paragraph={
        <Trans
          i18nKey="stepVerifyOnboarding.alreadyOnboarded.addNewAdmin"
          components={{
            1: <br />,
            3: (
              <Link
                underline="none"
                sx={{ cursor: 'pointer' }}
                onClick={() => {
                  if (selectedParty) {
                    history.push(
                      resolvePathVariables(
                        ROUTES.ONBOARDING_USER.PATH.concat(`?institutionType=${institutionType}`),
                        { productId: selectedProduct?.id ?? '' }
                      ),
                      { data: { party: selectedParty, product: selectedProduct } }
                    );
                  }
                }}
              />
            ),
          }}
        >
          {
            'Gli attuali Amministratori non sono più disponibili e hai l’esigenza <1 />di gestire i prodotti? <3>Aggiungi un nuovo Amministratore</3>'
          }
        </Trans>
      }
      buttonLabel={<Trans i18nKey="stepVerifyOnboarding.alreadyOnboarded.backHome" />}
      onButtonClick={() => window.location.assign(ENV.URL_FE.LANDING)}
    />
  );
}
