import { useState } from 'react';
import { Grid, useTheme, TextField, IconButton } from '@mui/material';
import { styled } from '@mui/system';
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';
import { useHistoryState } from '../../useHistoryState';
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
  handleChange: (event: any) => void;
};

export default function SearchTaxonomyLocalValues({ handleChange }: Props) {
  const [selected, setSelected, setSelectedHistory] = useHistoryState<
    IPACatalogParty | null | string
  >('selected_step1', null);

  const [input, setInput] = useState<string>();

  const theme = useTheme();

  return (
    <>
      {/* DATI DELLA TASSONOMIA */}
      <Grid item spacing={3}>
        <CustomTextField
          sx={{ width: '100%' }}
          id="Parties"
          value={selected ? 'selected.description' : input}
          onChange={handleChange}
          label={!selected ? 'Comune, Provincia o Regione' : ''}
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
            endAdornment: selected && (
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
      </Grid>
    </>
  );
}
