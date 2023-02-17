import { IconButton, TextField, Theme } from '@mui/material';
import { styled } from '@mui/system';
import { useTranslation } from 'react-i18next';
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';
import { Dispatch, SetStateAction } from 'react';
import { IPACatalogParty } from '../../../../../../types';
import { useHistoryState } from '../../../../useHistoryState';

const CustomTextField = styled(TextField)({
  justifyContent: 'center',
  /* default */
  '.css-1tu8ncx-MuiInputBase-root-MuiInput-root:before': {
    borderBottom: 'none',
  },
  /* hover (double-ampersand needed for specificity reasons. */
  '&& .MuiInput-underline:hover:before': {
    borderBottom: 'none',
  },
  /* focused */
  '.MuiInput-underline:after': {
    borderBottom: 'none',
  },
  '.MuiInput-underline:before': {
    borderBottom: 'none',
  },
});

type Props = {
  theme: Theme;
  selected: any;
  setSelected: React.Dispatch<React.SetStateAction<any>>;
  setInput: Dispatch<SetStateAction<string>>;
  input: string;
  handleChange: (event: any) => void;
  isSearchFieldSelected: boolean;
};

export default function AsyncAutocompleteSearch({
  theme,
  selected,
  setSelected,
  setInput,
  input,
  handleChange,
  isSearchFieldSelected,
}: Props) {
  const setSelectedHistory = useHistoryState<IPACatalogParty | null>('selected_step1', null)[2];
  const { t } = useTranslation();
  return (
    <CustomTextField
      disabled={!isSearchFieldSelected}
      id="Parties"
      sx={{ width: '100%', mx: selected ? 1 : 4 }}
      value={selected ? selected.description : input}
      onChange={handleChange}
      label={!selected ? t('asyncAutocomplete.serachLabel') : ''}
      variant={!selected ? 'outlined' : 'standard'}
      inputProps={{
        // maxLength: isTaxCodeSelected ? '11' : undefined,
        style: {
          fontStyle: 'normal',
          fontWeight: '700',
          fontSize: '16px',
          lineHeight: '24px',
          color: theme.palette.text.primary,
          textAlign: 'start',
          paddingLeft: '8px',
        },
      }}
      InputProps={{
        endAdornment: (
          <IconButton
            disabled={!isSearchFieldSelected}
            onClick={() => {
              setInput('');
              setSelected('');
              setSelectedHistory(null);
            }}
            aria-label="clearIcon"
          >
            <ClearOutlinedIcon
              sx={{
                color: !isSearchFieldSelected
                  ? theme.palette.text.disabled
                  : theme.palette.text.primary,
              }}
            />
          </IconButton>
        ),
      }}
    />
  );
}
