import { Box, styled } from '@mui/system';
import { PartyAccountItemButton } from '@pagopa/mui-italia/dist/components/PartyAccountItemButton';
import { InstitutionResource } from '../../../../../model/InstitutionResource';

const CustomBox = styled(Box)({
  /* width */
  '::-webkit-scrollbar': {
    width: '6px',
  },
  /* Track */
  '::-webkit-scrollbar-track': {
    boxShadow: 'inset 0 0 5px #F2F6FA',
    borderRadius: '20px',
  },
  /* Handle */
  '::-webkit-scrollbar-thumb': {
    background: '#0073E6',
    backgroundClip: 'padding-box',
    borderRadius: '20px',
  },
  /* Handle on hover */
  '::-webkit-scrollbar-thumb:hover': {
    background: '#0073E6',
  },
});

type Props = {
  setSelected: React.Dispatch<React.SetStateAction<any>>;
  isLoading: boolean;
  getOptionLabel: (option: any) => string;
  getOptionKey: (option: any) => string;
  cfResult?: InstitutionResource;
  setCfResult: React.Dispatch<React.SetStateAction<InstitutionResource | undefined>>;
};

export default function AsyncAutocompleteResultsTaxCode({
  setSelected,
  isLoading,
  cfResult,
  setCfResult,
}: Props) {
  return (
    <CustomBox my={2} {...cfResult} width="80%" maxHeight="200px" overflow="auto">
      {!isLoading && (
        <Box
          py={1}
          key={cfResult?.id}
          display="flex"
          onKeyDownCapture={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              setSelected(cfResult);
              setCfResult(undefined);
            }
          }}
        >
          <PartyAccountItemButton
            partyName={cfResult?.description ?? ''}
            image={' '}
            action={() => {
              setSelected(cfResult);
              setCfResult(undefined);
            }}
            maxCharactersNumberMultiLine={20}
          />
        </Box>
      )}
    </CustomBox>
  );
}
