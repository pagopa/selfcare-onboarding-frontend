import React, { useContext, useState } from 'react';
import debounce from 'lodash/debounce';
import { AxiosError, AxiosResponse } from 'axios';
import { IconButton, InputAdornment, TextField, Theme, Grid, Typography } from '@mui/material';
import { Box } from '@mui/system';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';
// import { useTranslation } from 'react-i18next';
import { Endpoint } from '../../types';
import { fetchWithLogs } from '../lib/api-utils';
import { getFetchOutcome } from '../lib/error-utils';
import { ENV } from '../utils/env';
import { UserContext } from '../lib/context';

type AutocompleteProps = {
  selected: any;
  setSelected: React.Dispatch<React.SetStateAction<any>>;
  endpoint: Endpoint;
  transformFn: any;
  optionKey?: string;
  optionLabel?: string;
  theme: Theme;
};

export function AsyncAutocompleteV2({
  selected,
  setSelected,
  endpoint,
  transformFn,
  // optionKey,
  optionLabel,
  theme,
}: AutocompleteProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState<string>('');
  const [options, setOptions] = useState<Array<any>>([]);
  const { setRequiredLogin } = useContext(UserContext);
  // const { t } = useTranslation();

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

  // const noOptionsText =
  //   input !== undefined && input.length >= 3
  //     ? t('asyncAutocomplete.noResultsLabel')
  //     : t('asyncAutocomplete.lessThen3CharacterLabel');
  // const getOptionKey: (option: any) => string =
  //   optionKey !== undefined ? (o) => o[optionKey] : (o) => o.label ?? o;

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
    // if (reason === 'clear') {
    //   setSelected(null);
    // }
    if (
      // reason === 'reset' &&
      selected
    ) {
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
      {/* <Autocomplete
        id="Parties"
        freeSolo
        value={selected}
        noOptionsText={noOptionsText}
        onChange={(_event, value) => {
          setSelected(value);
          setInput(getOptionLabel(value));
        }}
        options={options}
        loading={isLoading}
        inputValue={input}
        disableClearable={true}
        onInputChange={(_event, value, reason) => {
          setInput(value);
          if (reason === 'input') {
            setSelected(null);
            if (value.length >= 3) {
              void debounce(handleSearch, 100)(value);
            }
          }
          if (reason === 'clear') {
            setSelected(null);
          }
          if (reason === 'reset' && selected) {
            setInput(getOptionLabel(selected));
          }
        }}
        filterOptions={(x) => x}
        sx={{
          '.MuiOutlinedInput-root': { borderRadius: '5px', padding: '0' },
          width: '90%',
        }}
        renderInput={(params) => (
          <TextField
            label="Cerca ente"
            {...params}
            inputProps={{
              ...params.inputProps,
              style: {
                fontStyle: 'normal',
                fontWeight: 'normal',
                fontSize: '16px',
                lineHeight: '24px',
                color: '#5C6F82',
                textAlign: 'start',
                paddingLeft: '16px',
                textTransform: 'capitalize',
              },
            }}
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="end">
                  <SearchOutlinedIcon sx={{ color: theme.palette.text.primary }} />
                </InputAdornment>
              ),
              endAdornment: (
                <IconButton onClick={() => setInput('')}>
                  <ClearOutlinedIcon sx={{ color: theme.palette.text.primary }} />
                </IconButton>
              ),
            }}
            variant="outlined"
          />
        )}
        getOptionLabel={getOptionKey}
        renderOption={(props, option) => (
          <li {...props}>
            <Box
              sx={{
                fontStyle: 'normal',
                fontWeight: 'normal',
                fontSize: '16px',
                lineHeight: '24px',
                color: '#5A768A',
                textTransform: 'capitalize',
              }}
            >
              {getOptionLabel(option)?.toLowerCase()}
            </Box>
          </li>
        )}
      /> */}

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
          <TextField
            sx={{ width: '80%' }}
            value={input}
            onChange={handleChange}
            label="Cerca ente"
            inputProps={{
              style: {
                fontStyle: 'normal',
                fontWeight: 'normal',
                fontSize: '16px',
                lineHeight: '24px',
                color: '#5C6F82',
                textAlign: 'start',
                paddingLeft: '16px',
                textTransform: 'capitalize',
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="end">
                  <SearchOutlinedIcon sx={{ color: theme.palette.text.primary }} />
                </InputAdornment>
              ),
              endAdornment: (
                <IconButton onClick={() => setInput('')}>
                  <ClearOutlinedIcon sx={{ color: theme.palette.text.primary }} />
                </IconButton>
              ),
            }}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12} display="flex" justifyContent="center">
          {showElement && (
            <Box {...options} width="80%">
              {!isLoading ? (
                options.map((option, index) => (
                  <Box
                    py={1}
                    key={index}
                    sx={{
                      fontStyle: 'normal',
                      fontWeight: 'normal',
                      fontSize: '16px',
                      lineHeight: '24px',
                      color: '#5A768A',
                      textTransform: 'capitalize',
                    }}
                  >
                    <Typography
                      onClick={() => {
                        setSelected(option);
                        setOptions([]);
                      }}
                    >
                      {getOptionLabel(option)?.toLowerCase()}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Box>Loader</Box>
              )}
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
