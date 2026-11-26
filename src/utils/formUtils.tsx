import { Trans } from 'react-i18next';
import { InstitutionType, Product } from '../../types';
import { isRtpProduct, isTechPartner } from './institutionTypeUtils';

export const subtitleUtils = (
  institutionType?: InstitutionType,
  selectedProduct?: Product | null
) => {
  if (isRtpProduct(selectedProduct?.id)) {
    return <Trans i18nKey="onboardingSubProduct.billingData.rtpSubtitle" />;
  }
  if (isTechPartner(institutionType)) {
    return (
      <Trans
        i18nKey="onboardingSubProduct.billingDataPt.subTitle"
        values={{ nameProduct: selectedProduct?.title }}
        components={{ 1: <br />, 3: <br />, 5: <strong /> }}
      >
        {`Inserisci le informazioni richieste e assicurati che siano corrette.<1 /> Serviranno a registrarti come Partner tecnologico per il<3/> prodotto <5>{{nameProduct}}</5>.`}
      </Trans>
    );
  }
  return (
    <Trans i18nKey="onboardingSubProduct.billingData.subTitle" components={{ 1: <br /> }}>
      {`Conferma, modifica o inserisci i dati richiesti, assicurandoti che siano corretti. <1 />Verranno usati anche per richiedere l’adesione ad altri prodotti e in caso di fatturazione.`}
    </Trans>
  );
};
