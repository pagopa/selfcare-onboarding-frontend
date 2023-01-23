import { IconButton, InputAdornment, TextField, Theme } from '@mui/material';
import { styled } from '@mui/system';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';
import { Dispatch, SetStateAction } from 'react';
import { IPACatalogParty } from '../../../../types';
import { useHistoryState } from '../../useHistoryState';

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
};

export default function AsyncAutocompleteSearch({
  theme,
  selected,
  setSelected,
  setInput,
  input,
  handleChange,
}: Props) {
  const setSelectedHistory = useHistoryState<IPACatalogParty | null>('selected_step1', null)[2];

  return (
    <CustomTextField
      id="Parties"
      sx={{ width: '100%', mx: 4 }}
      value={selected ? selected.description : input}
      onChange={handleChange}
      label={!selected ? 'Cerca ente' : ''}
      variant={!selected ? 'outlined' : 'standard'}
      inputProps={{
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
        startAdornment: !selected && (
          <InputAdornment position="end">
            <SearchOutlinedIcon sx={{ color: theme.palette.text.primary }} />
          </InputAdornment>
        ),
        endAdornment: (
          <IconButton
            onClick={() => {
              setInput('');
              setSelected('');
              setSelectedHistory(null);
            }}
            aria-label="clearIcon"
          >
            <ClearOutlinedIcon sx={{ color: theme.palette.text.primary }} />
          </IconButton>
        ),
      }}
    />
  );
}
