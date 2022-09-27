import { IconButton, InputAdornment, TextField, Theme } from '@mui/material';
import { styled } from '@mui/system';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { IPACatalogParty } from '../../../../types';

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
  searchByTaxCode: boolean;
  selected: IPACatalogParty | null;
  setSelected: React.Dispatch<React.SetStateAction<IPACatalogParty | null>>;
  setInput: Dispatch<SetStateAction<string>>;
  input: string;
  error: boolean;
  handleChange: (event: any) => void;
};

// eslint-disable-next-line sonarjs/cognitive-complexity
export default function AsyncAutocompleteSearch({
  theme,
  searchByTaxCode,
  selected,
  setSelected,
  setInput,
  input,
  error,
  handleChange,
}: Props) {
  const { t } = useTranslation();
  return (
    <CustomTextField
      id="Parties"
      sx={{ width: '80%' }}
      value={selected ? selected.description : input}
      onChange={handleChange}
      label={
        !selected && !searchByTaxCode
          ? t('onboardingStep1.onboarding.searchParty')
          : !selected && searchByTaxCode
          ? t('stepSearchPartyFromTaxCode.placeholder')
          : ''
      }
      helperText={
        searchByTaxCode && error ? t('stepSearchPartyFromTaxCode.notMatchHelperText') : ''
      }
      error={error}
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
          textTransform: 'capitalize',
        },
      }}
      InputProps={{
        startAdornment: !selected && !searchByTaxCode && (
          <InputAdornment position="end">
            <SearchOutlinedIcon sx={{ color: theme.palette.text.primary }} />
          </InputAdornment>
        ),
        endAdornment: (
          <IconButton
            onClick={() => {
              setInput('');
              setSelected(null);
            }}
            aria-label="clearIcon"
          >
            {!searchByTaxCode && <ClearOutlinedIcon sx={{ color: theme.palette.text.primary }} />}
          </IconButton>
        ),
      }}
    />
  );
}
