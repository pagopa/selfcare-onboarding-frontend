import React, { useContext, useState } from 'react';
import debounce from 'lodash/debounce';
import { AxiosError, AxiosResponse } from 'axios';
import { IconButton, InputAdornment, TextField, Theme, Grid, Typography } from '@mui/material';
import { Box, styled } from '@mui/system';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';
import { useTranslation } from 'react-i18next';
import { Endpoint } from '../../types';
import { fetchWithLogs } from '../lib/api-utils';
import { getFetchOutcome } from '../lib/error-utils';
import { ENV } from '../utils/env';
import { UserContext } from '../lib/context';
import { ReactComponent as PartyIcon } from '../assets/onboarding_party_icon.svg';

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
});

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

type AutocompleteProps = {
  selected: any;
  setSelected: React.Dispatch<React.SetStateAction<any>>;
  endpoint: Endpoint;
  transformFn: any;
  optionKey?: string;
  optionLabel?: string;
  theme: Theme;
};

// eslint-disable-next-line sonarjs/cognitive-complexity
export function AsyncAutocompleteV2({
  selected,
  setSelected,
  endpoint,
  transformFn,
  optionKey,
  optionLabel,
  theme,
}: AutocompleteProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState<string>('');
  const [options, setOptions] = useState<Array<any>>([]);
  const { setRequiredLogin } = useContext(UserContext);
  const { t } = useTranslation();

  const handleSearch = async (query: string) => {
    setIsLoading(true);

    const searchResponse = await fetchWithLogs(
      endpoint,
      {
        method: 'GET',
        params: { limit: ENV.MAX_INSTITUTIONS_FETCH, page: 1, search: query },
      },
      () => setRequiredLogin(true)
    );

    const outcome = getFetchOutcome(searchResponse);

    if (outcome === 'success') {
      setOptions(transformFn((searchResponse as AxiosResponse).data));
    } else if ((searchResponse as AxiosError).response?.status === 404) {
      setOptions([]);
    }

    setIsLoading(false);
  };

  const getOptionKey: (option: any) => string =
    optionKey !== undefined ? (o) => o[optionKey] : (o) => o.label ?? o;

  const getOptionLabel: (option: any) => string =
    optionLabel !== undefined ? (o) => o[optionLabel] : (o) => o.label ?? o;

  const showElement = input !== undefined && input.length >= 3;

  const handleChange = (event: any) => {
    const value = event.target.value as string;
    setInput(value);
    if (value !== '') {
      setSelected(null);
      if (value.length >= 3) {
        void debounce(handleSearch, 100)(value);
      }
    }
    if (value === '') {
      setSelected(null);
    }
    if (selected) {
      setInput(getOptionLabel(selected));
    }
  };
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '104px',
        maxHeight: '100%',
        minWidth: '480px',
        borderRadius: '16px',
        boxShadow:
          '0px 8px 10px -5px rgba(0, 43, 85, 0.1), 0px 16px 24px 2px rgba(0, 43, 85, 0.05), 0px 6px 30px 5px rgba(0, 43, 85, 0.1);',
      }}
    >
      <Grid container>
        <Grid
          item
          xs={12}
          display="flex"
          justifyContent="center"
          width="100%"
          pt={4}
          pb={showElement && !selected ? 0 : 4}
        >
          {selected && (
            <Box display="flex" alignItems="center">
              <PartyIcon width={50} />
            </Box>
          )}
          <CustomTextField
            sx={{ width: '80%' }}
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
                color: '#17324D',
                textAlign: 'start',
                paddingLeft: '8px',
                textTransform: 'capitalize',
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
                  }}
                >
                  <ClearOutlinedIcon sx={{ color: theme.palette.text.primary }} />
                </IconButton>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} display="flex" justifyContent="center">
          {showElement && options.length > 0 ? (
            <CustomBox my={2} {...options} width="80%" maxHeight="200px" overflow="auto">
              {!isLoading &&
                options.map((option) => (
                  <Box
                    py={1}
                    key={getOptionKey(option)}
                    sx={{
                      fontStyle: 'normal',
                      fontWeight: 'normal',
                      fontSize: '16px',
                      lineHeight: '24px',
                      color: '#5A768A',
                      textTransform: 'capitalize',
                    }}
                  >
                    <Box display="flex">
                      <Box pr={1}>
                        <PartyIcon width={50} />
                      </Box>
                      <Box display="flex" alignItems="center">
                        <Typography
                          onClick={() => {
                            setSelected(option);
                            setOptions([]);
                          }}
                          variant="sidenav"
                          sx={{ fontWeight: '700', cursor: 'pointer' }}
                        >
                          {getOptionLabel(option)?.toLowerCase()}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                ))}
            </CustomBox>
          ) : input.length >= 1 && input.length < 3 ? (
            <Typography pb={3}> {t('asyncAutocomplete.lessThen3CharacterLabel')}</Typography>
          ) : (
            input.length >= 3 &&
            options.length === 0 &&
            !selected && <Typography pb={3}> {t('asyncAutocomplete.noResultsLabel')} </Typography>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
