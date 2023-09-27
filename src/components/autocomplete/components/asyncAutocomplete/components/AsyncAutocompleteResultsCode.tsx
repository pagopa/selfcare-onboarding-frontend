import { Box, styled } from '@mui/system';
import { PartyAccountItemButton } from '@pagopa/mui-italia/dist/components/PartyAccountItemButton';

import { AooData } from '../../../../../model/AooData';
import { InstitutionResource } from '../../../../../model/InstitutionResource';
import { UoData } from '../../../../../model/UoModel';
import { ANACParty } from '../../../../../../types';

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
  cfResult?: InstitutionResource | ANACParty;
  setCfResult: React.Dispatch<React.SetStateAction<InstitutionResource | ANACParty | undefined>>;
  uoResult?: UoData;
  aooResult?: AooData;
  isTaxCodeSelected?: boolean;
  isAooCodeSelected?: boolean;
  isUoCodeSelected?: boolean;
};

// eslint-disable-next-line sonarjs/cognitive-complexity
export default function AsyncAutocompleteResultsCode({
  setSelected,
  isLoading,
  cfResult,
  setCfResult,
  uoResult,
  aooResult,
  isTaxCodeSelected,
  isAooCodeSelected,
  isUoCodeSelected,
}: Props) {
  const visibleCode = isTaxCodeSelected
    ? cfResult
    : isAooCodeSelected
    ? aooResult
    : isUoCodeSelected
    ? uoResult
    : '';
  return (
    <CustomBox my={2} {...cfResult} width="90%" maxHeight="200px" overflow="auto">
      {!isLoading && (
        <Box
          sx={{ textTransform: 'capitalize' }}
          py={1}
          key={cfResult?.id}
          display="flex"
          onKeyDownCapture={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              setSelected(visibleCode);
              setCfResult(undefined);
            }
          }}
        >
          <PartyAccountItemButton
            partyName={
              isTaxCodeSelected && cfResult?.description
                ? cfResult?.description.toLocaleLowerCase()
                : isAooCodeSelected && aooResult?.denominazioneAoo
                ? aooResult?.denominazioneAoo.toLocaleLowerCase()
                : isUoCodeSelected && uoResult?.descrizioneUo
                ? uoResult?.descrizioneUo.toLocaleLowerCase()
                : ''
            }
            partyRole={
              !isTaxCodeSelected && aooResult
                ? aooResult.denominazioneEnte
                : uoResult
                ? uoResult?.denominazioneEnte
                : ''
            }
            image={' '}
            action={() => {
              setSelected(visibleCode);
              setCfResult(undefined);
            }}
            maxCharactersNumberMultiLine={20}
          />
        </Box>
      )}
    </CustomBox>
  );
}
