/* eslint-disable sonarjs/cognitive-complexity */
import { Grid, Link, Typography } from '@mui/material';
import type { ReactElement } from 'react';
import { theme } from '@pagopa/mui-italia';
import { Trans } from 'react-i18next';
import {
  isContractingAuthority,
  isInsuranceCompany,
  isPublicServiceCompany,
  isPrivateInstitution,
  isInteropProduct,
  isIdpayMerchantProduct,
} from '../utils/institutionTypeUtils';
import { InstitutionType, PartyData, Product } from '../../types';

const SearchPartySubtitle = ({
  selected,
  product,
  institutionType,
  subTitle,
}: {
  selected: PartyData | null;
  product: Product | null | undefined;
  institutionType: InstitutionType | undefined;
  subTitle: string | ReactElement;
}) => {
  const defaultSubTitleContent = () => (
    <Trans
      i18nKey="onboardingStep1.onboarding.selectedInstitution"
      values={{ productName: product?.title }}
      components={{ 1: <strong /> }}
    >
      {`Prosegui con l’adesione a <strong>{{productName}}</strong> per l’ente selezionato`}
    </Trans>
  );

  const contractingAutorityContent = () => (
    <Trans
      i18nKey="onboardingStep1.onboarding.saSubTitle"
      values={{
        productName: product?.title,
      }}
      components={{
        1: <br />,
        3: (
          <Link
            sx={{
              color: theme.palette.text.primary,
              textDecorationColor: theme.palette.text.primary,
            }}
            href="https://www.agid.gov.it/it/piattaforme/procurement/certificazione-componenti-piattaforme"
            target="_blank"
            rel="noreferrer"
          />
        ),
        5: <strong />,
      }}
    >
      {`Se sei tra i gestori privati di piattaforma e-procurement e hai <1 /> già ottenuto la <3>certificazione da AgID</3>, inserisci uno dei dati <1 /> richiesti e cerca l’ente per cui vuoi richiedere l’adesione a <1 /> <5>{{ productName }}</5>`}
    </Trans>
  );

  const insuranceCompanyContent = () => (
    <Trans
      i18nKey="onboardingStep1.onboarding.asSubTitle"
      values={{ productName: product?.title }}
      components={{ 1: <br />, 3: <strong /> }}
    >
      {`Se sei una società di assicurazione presente nell’Albo delle <1 /> imprese IVASS,
                  inserisci uno dei dati richiesti e cerca l’ente per
                  <1 /> cui vuoi richiedere l’adesione a <3>{{ productName }}.</3>`}
    </Trans>
  );

  const infocamereContent = () => (
    <Trans
      i18nKey="onboardingStep1.onboarding.scpSubtitle"
      components={{ 3: <br />, 5: <strong /> }}
      values={{ productName: product?.title }}
    >
      {`Inserisci uno dei dati richiesti e cerca da Infocamere l’ente <br />
                  per cui vuoi richiedere l’adesione a <strong>{{ productName }}.</strong>`}
    </Trans>
  );

  const idPayMerchantContent = () => (
    <Trans
      i18nKey="onboardingStep1.onboarding.merchantSubtitle"
      components={{ 3: <br />, 5: <strong /> }}
      values={{ productName: product?.title }}
    >
      {`Inserisci uno dei dati richiesti per cercare su InfoCamere l’ente <br />
                  per cui vuoi richiedere l’adesione a <strong>{{ productName }}.</strong>`}
    </Trans>
  );

  return (
    <Grid container item justifyContent="center" mt={1}>
      <Grid item xs={12}>
        <Typography variant="body1" align="center" color={theme.palette.text.primary}>
          {selected
            ? defaultSubTitleContent()
            : isContractingAuthority(institutionType)
              ? contractingAutorityContent()
              : isInsuranceCompany(institutionType)
                ? insuranceCompanyContent()
                : isPublicServiceCompany(institutionType) ||
                    (isPrivateInstitution(institutionType) && isInteropProduct(product?.id))
                  ? infocamereContent()
                  : isIdpayMerchantProduct(product?.id)
                    ? idPayMerchantContent()
                    : subTitle}
        </Typography>
      </Grid>
    </Grid>
  );
};

export default SearchPartySubtitle;
