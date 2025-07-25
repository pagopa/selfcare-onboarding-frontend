import { Box, styled } from '@mui/system';
import { PartyAccountItemButton } from '@pagopa/mui-italia/dist/components/PartyAccountItemButton';
import { PartyData } from '../../../../../../types';
import { SelectionsState } from '../../../../../model/Selection';

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
  apiLoading?: boolean;
  getOptionLabel: (option: any) => string;
  getOptionKey: (option: any) => string;
  cfResult?: PartyData;
  setCfResult: React.Dispatch<React.SetStateAction<PartyData | undefined>>;
  uoResult?: any;
  aooResult?: any;
  selections?: SelectionsState;
};

// eslint-disable-next-line sonarjs/cognitive-complexity
export default function AsyncAutocompleteResultsCode({
  setSelected,
  apiLoading,
  cfResult,
  setCfResult,
  uoResult,
  aooResult,
  selections,
}: Props) {
  const party =
    selections?.taxCode ||
    selections?.ivassCode ||
    selections?.reaCode ||
    selections?.personalTaxCode
      ? cfResult
      : selections?.aooCode
        ? aooResult
        : selections?.uoCode
          ? uoResult
          : '';

  const partyName =
    party?.description ??
    party?.businessName ??
    party?.denominazioneAoo ??
    party?.descrizioneUo ??
    party[0]?.description;

  return (
    <CustomBox my={2} {...cfResult} width="90%" maxHeight="200px" overflow="auto">
      {!apiLoading && (
        <Box
          sx={{ textTransform: 'capitalize' }}
          py={1}
          key={`${cfResult?.id}`}
          display="flex"
          onKeyDownCapture={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              setSelected(party);
              setCfResult(undefined);
            }
          }}
        >
          <PartyAccountItemButton
            partyName={partyName?.toLocaleLowerCase()}
            partyRole={
              !selections?.taxCode && aooResult
                ? aooResult.denominazioneEnte || aooResult.parentDescription
                : uoResult
                  ? uoResult?.denominazioneEnte || uoResult.parentDescription
                  : ''
            }
            image={' '}
            action={() => {
              const partySelected = party[0] ?? party;
              setSelected(partySelected);
              setCfResult(undefined);
            }}
            maxCharactersNumberMultiLine={20}
          />
        </Box>
      )}
    </CustomBox>
  );
}
