import { Grid } from '@mui/material';
import { IllusError } from '@pagopa/mui-italia';
import { EndingPage } from '@pagopa/selfcare-common-frontend/lib';
import { Trans, useTranslation } from 'react-i18next';
import { InstitutionType, Product } from '../../../types';
import { ENV } from '../../utils/env';
import { RolesInformations } from '../shared/RolesInformations';
import { addUserFlowProducts } from '../../utils/constants';

type Props = {
  selectedProduct?: Product | null;
  institutionType?: InstitutionType;
};

export default function AlreadyOnboarded({
  selectedProduct,
  institutionType,
}: Props) {
  const { t } = useTranslation();
  /* const history = useHistory(); */

  const isEnabledProduct2AddUser = !!(
    selectedProduct?.id && addUserFlowProducts(selectedProduct.id)
  );

  return (
    <EndingPage
      minHeight="52vh"
      variantTitle={'h4'}
      variantDescription={'body1'}
      icon={<IllusError size={60} />}
      title={<Trans i18nKey="stepVerifyOnboarding.alreadyOnboarded.title" />}
      description={
        <Grid container sx={{ display: 'flex', flexDirection: 'column' }}>
          <Grid item>
            <Trans
              i18nKey="stepVerifyOnboarding.alreadyOnboarded.description"
              components={{ 1: <br /> }}
            >
              {
                'Per operare sul prodotto, chiedi a un Amministratore di <1/>aggiungerti nella sezione Utenti.'
              }
            </Trans>
          </Grid>
          <Grid item>
            <RolesInformations
              isTechPartner={institutionType === 'PT'}
              linkLabel={t('moreInformationOnRoles')}
            />
          </Grid>
        </Grid>
      }
       isParagraphPresent={isEnabledProduct2AddUser}
      /* paragraph={
        isEnabledProduct2AddUser && (
          <Trans
            i18nKey="stepVerifyOnboarding.alreadyOnboarded.addNewAdmin"
            components={{
              1: <br />,
              3: (
                <Link
                  underline="none"
                  sx={{ cursor: 'pointer' }}
                  onClick={() => {
                    history.push(ROUTES.ONBOARDING_USER.PATH, {
                      data: {
                        institutionType,
                        party: onboardingFormData,
                        product: selectedProduct,
                      },
                    });
                  }}
                />
              ),
            }}
          >
            {
              'Gli attuali Amministratori non sono più disponibili e hai l’esigenza <1 />di gestire i prodotti? <3>Aggiungi un nuovo Amministratore</3>'
            }
          </Trans>
        )
      } */
      buttonLabel={<Trans i18nKey="stepVerifyOnboarding.alreadyOnboarded.backHome" />}
      onButtonClick={() => window.location.assign(ENV.URL_FE.LANDING)}
    />
  );
}
