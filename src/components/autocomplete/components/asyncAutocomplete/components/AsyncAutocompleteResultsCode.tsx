import { Box, styled } from '@mui/system';
import { PartyAccountItemButton } from '@pagopa/mui-italia/components/PartyAccountItemButton';
import { useTranslation } from 'react-i18next';
import { PartyData } from '../../../../../../types';
import { AooData } from '../../../../../model/AooData';
import { SelectionsState } from '../../../../../model/Selection';
import { UoData } from '../../../../../model/UoModel';

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

type CodeSearchResult = PartyData | AooData | UoData;

type Props = {
  setSelected: React.Dispatch<React.SetStateAction<PartyData | null>>;
  apiLoading?: boolean;
  getOptionLabel: (option: unknown) => string;
  getOptionKey: (option: unknown) => string;
  cfResult?: PartyData;
  setCfResult: React.Dispatch<React.SetStateAction<PartyData | undefined>>;
  uoResult?: UoData;
  aooResult?: AooData;
  selections?: SelectionsState;
};

const isResultList = (
  result: CodeSearchResult | ReadonlyArray<CodeSearchResult>
): result is ReadonlyArray<CodeSearchResult> => Array.isArray(result);

// In the add-user flow the tax code searches store the raw list returned by
// ONBOARDING_GET_INSTITUTIONS: the party to show is its first element.
const firstResult = (
  result: CodeSearchResult | ReadonlyArray<CodeSearchResult> | undefined
): CodeSearchResult | undefined => (result && isResultList(result) ? result[0] : result);

const pickResult = (
  selections: SelectionsState | undefined,
  cfResult: PartyData | undefined,
  aooResult: AooData | undefined,
  uoResult: UoData | undefined
): CodeSearchResult | undefined => {
  if (
    selections?.taxCode ||
    selections?.ivassCode ||
    selections?.reaCode ||
    selections?.personalTaxCode
  ) {
    return firstResult(cfResult);
  }
  if (selections?.aooCode) {
    return aooResult;
  }
  return selections?.uoCode ? uoResult : undefined;
};

const getPartyName = (party: Partial<PartyData>): string =>
  party.description ?? party.businessName ?? party.denominazioneAoo ?? party.descrizioneUo ?? '';

// In the add-user flow AOO/UO results are onboarded institutions, described by parentDescription
const getPartyRole = (
  selections: SelectionsState | undefined,
  aooResult: Partial<PartyData> | undefined,
  uoResult: Partial<PartyData> | undefined
): string => {
  const subunit = !selections?.taxCode && aooResult ? aooResult : uoResult;
  return subunit?.denominazioneEnte || subunit?.parentDescription || '';
};

export default function AsyncAutocompleteResultsCode({
  setSelected,
  apiLoading,
  cfResult,
  setCfResult,
  uoResult,
  aooResult,
  selections,
}: Props) {
  const { t } = useTranslation();
  const party = pickResult(selections, cfResult, aooResult, uoResult);

  // The result for the current search type may not be there yet (or was cleared)
  if (!party) {
    return null;
  }

  const selectParty = () => {
    // AOO and UO results are selected as parties: PartyData includes their fields
    setSelected(party as PartyData);
    setCfResult(undefined);
  };

  return (
    <CustomBox
      my={2}
      width="90%"
      maxHeight="200px"
      overflow="auto"
      role="list"
      aria-live="polite"
      aria-label={t('asyncAutocomplete.searchResultsLabel')}
    >
      {!apiLoading && (
        <Box
          sx={{ textTransform: 'capitalize' }}
          py={1}
          key={`${cfResult?.id}`}
          display="flex"
          role="listitem"
          onKeyDownCapture={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              selectParty();
            }
          }}
        >
          <PartyAccountItemButton
            partyName={getPartyName(party).toLocaleLowerCase()}
            partyRole={getPartyRole(selections, aooResult, uoResult)}
            image={''}
            action={selectParty}
            maxCharactersNumberMultiLine={20}
          />
        </Box>
      )}
    </CustomBox>
  );
}
