import { Box, styled } from '@mui/system';
import { PartyAccountItemButton } from '@pagopa/mui-italia/components/PartyAccountItemButton';
import { useTranslation } from 'react-i18next';
import { PartyData } from '../../../../../../types';
import { AutocompleteOption } from '../../../../../model/AutocompleteOption';

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
  setSelected: React.Dispatch<React.SetStateAction<PartyData | null>>;
  options: ReadonlyArray<AutocompleteOption>;
  setOptions: React.Dispatch<React.SetStateAction<ReadonlyArray<AutocompleteOption>>>;
  apiLoading?: boolean;
  getOptionLabel: (option: AutocompleteOption) => string;
  getOptionKey: (option: AutocompleteOption) => string;
};

export default function AsyncAutocompleteResultsBusinessName({
  setSelected,
  options,
  setOptions,
  apiLoading,
  getOptionLabel,
  getOptionKey,
}: Props) {
  const { t } = useTranslation();
  // The selected search result is carried as the selected party for the following steps
  const selectOption = (option: AutocompleteOption) => {
    setSelected(option as PartyData);
    setOptions([]);
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
      {!apiLoading &&
        options.map((option) => (
          <Box
            py={1}
            key={getOptionKey(option)}
            display="flex"
            role="listitem"
            onKeyDownCapture={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                selectOption(option);
              }
            }}
          >
            <PartyAccountItemButton
              partyName={getOptionLabel(option)}
              image={''}
              action={() => selectOption(option)}
              maxCharactersNumberMultiLine={20}
            />
          </Box>
        ))}
    </CustomBox>
  );
}
