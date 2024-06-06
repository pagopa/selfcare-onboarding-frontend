import { ButtonNaked } from '@pagopa/mui-italia';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { useTranslation } from 'react-i18next';

type Props = {
  isTechPartner?: boolean;
};

export function RolesInformations({ isTechPartner }: Props) {
  const { t } = useTranslation();

  return (
    <ButtonNaked
      component="button"
      color="primary"
      startIcon={<MenuBookIcon />}
      sx={{ fontWeight: 700 }}
      onClick={() => {
        const docLink = isTechPartner
          ? 'https://docs.pagopa.it/manuale-di-area-riservata-per-partner-tecnologici/area-riservata/ruoli'
          : 'https://docs.pagopa.it/area-riservata/area-riservata/ruoli';
        window.open(docLink);
      }}
    >
      {t('moreInformationOnRoles')}
    </ButtonNaked>
  );
}
