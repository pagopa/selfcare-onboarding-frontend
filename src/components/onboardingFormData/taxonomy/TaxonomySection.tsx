import { useState, useContext } from 'react';
import { AxiosError, AxiosResponse } from 'axios';
import debounce from 'lodash/debounce';
import { useTranslation } from 'react-i18next';
import { RadioGroup, Radio, FormControlLabel, Paper, Grid, Typography, Box } from '@mui/material';
import { fetchWithLogs } from '../../../lib/api-utils';
import { ENV } from '../../../utils/env';
import { useHistoryState } from '../../useHistoryState';
import { IPACatalogParty } from '../../../../types';
import { UserContext } from '../../../lib/context';
import { getFetchOutcome } from '../../../lib/error-utils';
import ResultsTaxonomyLocalValues from './ResultsTaxonomyLocalValues';
import SearchTaxonomyLocalValues from './SearchTaxonomyLocalValues';

export default function TaxonomySection() {
  const optionLabel = 'description';
  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const getOptionLabel: (option: any) => string =
    optionLabel !== undefined ? (o) => o[optionLabel] : (o) => o.label ?? o;
  const { setRequiredLogin } = useContext(UserContext);
  const [input, setInput] = useState<string>('');
  const [options, setOptions] = useState<Array<any>>([]);
  const [selected, setSelected, _setSelectedHistory] = useHistoryState<IPACatalogParty | null>(
    'selected_step1',
    null
  );
  const [isNationalAreaVisible, setIsNationalAreaVisible] = useState<boolean>();
  const [isLocalAreaVisible, setIsLocalAreaVisible] = useState<boolean>();

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    const searchResponse = await fetchWithLogs(
      { endpoint: 'ONBOARDING_GET_SEARCH_PARTIES' },
      {
        method: 'GET',
        params: { limit: ENV.MAX_INSTITUTIONS_FETCH, page: 1, search: query },
      },
      () => setRequiredLogin(true)
    );

    const outcome = getFetchOutcome(searchResponse);
    if (outcome === 'success') {
      setOptions((searchResponse as AxiosResponse).data);
    } else if ((searchResponse as AxiosError).response?.status === 404) {
      setOptions([]);
    }

    setIsLoading(false);
  };
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
    <Paper elevation={0} sx={{ p: 5, borderRadius: '16px', my: 4 }}>
      <Grid container item pb={2}>
        <Grid item xs={12}>
          <Typography variant="caption" sx={{ fontWeight: 'fontWeightBold' }}>
            {t('onboardingFormData.taxonomySection.title')}
          </Typography>
        </Grid>
      </Grid>
      <RadioGroup
        aria-labelledby="demo-radio-buttons-group-label"
        defaultValue="female"
        name="radio-buttons-group"
      >
        <Box display="flex">
          <FormControlLabel
            checked={isNationalAreaVisible}
            value="national"
            control={<Radio />}
            label={t('onboardingFormData.taxonomySection.nationalLabel')}
            onChange={() => {
              setIsNationalAreaVisible(true);
              setIsLocalAreaVisible(false);
            }}
            sx={{ mr: 4, ml: 1 }}
          />
          <FormControlLabel
            checked={isLocalAreaVisible}
            value="local"
            control={<Radio />}
            label={t('onboardingFormData.taxonomySection.localLabel')}
            onChange={() => {
              setIsNationalAreaVisible(false);
              setIsLocalAreaVisible(true);
            }}
          />
        </Box>
      </RadioGroup>
      {/* National Area Visible */}
      {isNationalAreaVisible && <> National area</>}
      {isLocalAreaVisible && (
        <Box sx={{ pt: 1 }}>
          <SearchTaxonomyLocalValues handleChange={handleChange} />
          <ResultsTaxonomyLocalValues isLoading={isLoading} input={input} options={options} />
        </Box>
      )}
    </Paper>
  );
}
