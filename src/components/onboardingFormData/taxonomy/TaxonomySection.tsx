import { useState, useContext } from 'react';
import { AxiosError, AxiosResponse } from 'axios';
import debounce from 'lodash/debounce';
import { useTranslation } from 'react-i18next';
import {
  RadioGroup,
  Radio,
  FormControlLabel,
  Paper,
  Grid,
  Typography,
  Box,
  Tooltip,
} from '@mui/material';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import { ButtonNaked } from '@pagopa/mui-italia';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { fetchWithLogs } from '../../../lib/api-utils';
import { ENV } from '../../../utils/env';
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
  const [selected, setSelected] = useState();
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
      setSelected(undefined);
      if (value.length >= 3) {
        void debounce(handleSearch, 100)(value);
      }
    }
    if (value === '') {
      setSelected(undefined);
    }
    if (selected) {
      setInput(getOptionLabel(selected));
    }
  };

  const handleOpenClick = () => {
    console.log('test');
  };
  return (
    <Paper elevation={0} sx={{ p: 5, borderRadius: '16px', my: 4 }}>
      <Grid container item pb={2}>
        <Grid item xs={12} display="flex">
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 'fontWeightBold' }}>
              {t('onboardingFormData.taxonomySection.title')}
            </Typography>
          </Box>
          <Box ml={2} display="flex" alignItems="center" sx={{ cursor: 'pointer' }}>
            <Tooltip
              title={t('onboardingFormData.taxonomySection.infoLabel') as string}
              placement="top"
            >
              <InfoOutlinedIcon color="primary" fontSize={'small'} />
            </Tooltip>
          </Box>
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
      {/* Local Area Visible */}
      {isLocalAreaVisible && (
        <>
          <Box sx={{ pt: 2 }}>
            <SearchTaxonomyLocalValues handleChange={handleChange} />
            <ResultsTaxonomyLocalValues isLoading={isLoading} input={input} options={options} />
          </Box>
          <Box mt={2}>
            <ButtonNaked
              component="button"
              onClick={handleOpenClick}
              startIcon={<AddOutlinedIcon />}
              sx={{ color: 'primary.main' }}
              weight="default"
              // disabled={!selected}
            >
              {t('onboardingFormData.taxonomySection.localSection.addButtonLabel')}
            </ButtonNaked>
          </Box>
        </>
      )}
    </Paper>
  );
}
