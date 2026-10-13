import { Grid, Link, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { theme } from '@pagopa/mui-italia';
import { Trans } from 'react-i18next';
import { noMandatoryIpaProducts } from '../../utils/constants';
import {
  isContractingAuthority,
  isInsuranceCompany,
  isPublicServiceCompany,
  isPrivateInstitution,
  isPrivatePersonInstitution,
  isGlobalServiceProvider,
} from '../../utils/institutionTypeUtils';
import { InstitutionType, Product } from '../../../types';

const SearchPartyLinks = ({
  institutionType,
  product,
  onForwardAction,
}: {
  institutionType: InstitutionType | undefined;
  product: Product | null | undefined;
  onForwardAction: () => void;
}) =>
  !isContractingAuthority(institutionType) &&
  !isInsuranceCompany(institutionType) &&
  !isPublicServiceCompany(institutionType) &&
  !isPrivateInstitution(institutionType) &&
  !isPrivatePersonInstitution(institutionType) && (
    <Grid container item justifyContent="center">
      <Grid item xs={6}>
        <Box
          sx={{
            fontSize: '14px',
            lineHeight: '24px',
            textAlign: 'center',
          }}
        >
          <Typography
            sx={{
              textAlign: 'center',
            }}
            variant="body1"
            color={theme.palette.text.secondary}
          >
            {isGlobalServiceProvider(institutionType) && noMandatoryIpaProducts(product?.id) ? (
              <Trans
                i18nKey="onboardingStep1.onboarding.gpsDescription"
                components={{
                  1: <br />,
                  2: (
                    <Link
                      id="no_ipa"
                      sx={{
                        textDecoration: 'underline',
                        color: theme.palette.primary.main,
                        cursor: 'pointer',
                      }}
                      onClick={onForwardAction}
                    />
                  ),
                }}
              >
                {`Non trovi il tuo ente nell'IPA?<1 /><2>Inserisci manualmente i dati del tuo ente.</2>`}
              </Trans>
            ) : (
              <Trans
                i18nKey="onboardingStep1.onboarding.ipaDescription"
                components={{
                  1: (
                    <Link
                      sx={{
                        textDecoration: 'underline',
                        color: theme.palette.primary.dark,
                        cursor: 'pointer',
                      }}
                      href="https://indicepa.gov.it/ipa-portale/servizi-enti/accreditamento-ente"
                    />
                  ),
                  3: <br />,
                }}
              >
                {`Non trovi il tuo ente nell'IPA? <1>In questa pagina</1> trovi maggiori <3/> informazioni sull'indice e su come accreditarsi `}
              </Trans>
            )}
          </Typography>
        </Box>
      </Grid>
    </Grid>
  );

export default SearchPartyLinks;
