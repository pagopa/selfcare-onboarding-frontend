import { Link } from '@mui/material';

type Props = {
  linkLabel: string;
  documentationLink?: string;
  isTechPartner?: boolean;
};

export function RolesInformations({ isTechPartner, linkLabel, documentationLink }: Props) {
  return (
    <Link
      component="button"
      color="primary"
      // startIcon={<MenuBookIcon />}
      sx={{ fontWeight: 'fontWeightBold', fontSize: 'fontSize'}}

      onClick={() => {
        const docLink =
          documentationLink ?? isTechPartner
            ? 'https://docs.pagopa.it/manuale-di-area-riservata-per-partner-tecnologici/area-riservata/ruoli'
            : 'https://docs.pagopa.it/area-riservata/area-riservata/ruoli';
        window.open(docLink);
      }}
    >
      {linkLabel}
    </Link>
  );
}
