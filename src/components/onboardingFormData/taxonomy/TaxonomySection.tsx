import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import debounce from 'lodash/debounce';
import {
  RadioGroup,
  Radio,
  FormControlLabel,
  Paper,
  Grid,
  Typography,
  Box,
  Tooltip,
  TextField,
  IconButton,
  useTheme,
} from '@mui/material';
import { AddOutlined, RemoveCircleOutlineOutlined, ClearOutlined } from '@mui/icons-material';
import { ButtonNaked } from '@pagopa/mui-italia';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { AxiosError, AxiosResponse } from 'axios';
import { useHistoryState } from '../../useHistoryState';
import { Geotaxonomy } from '../../../model/Geotaxonomy';
import { fetchWithLogs } from '../../../lib/api-utils';
import { getFetchOutcome } from '../../../lib/error-utils';
import { UserContext } from '../../../lib/context';
import { ENV } from '../../../utils/env';

// import ResultsTaxonomyLocalValues from './ResultsTaxonomyLocalValues';
// import SearchTaxonomyLocalValues from './SearchTaxonomyLocalValues';

export default function TaxonomySection() {
  const { t } = useTranslation();
  const theme = useTheme();
  const [isNationalAreaVisible, setIsNationalAreaVisible] = useState<boolean>();
  const [isLocalAreaVisible, setIsLocalAreaVisible] = useState<boolean>();
  const [inputList, setInputList] = useState([{ taxonomyRegion: '' }]);
  const [selectedRegion, setSelectedRegion, setSelectedRegionHistory] =
    useHistoryState<Geotaxonomy | null>('selected_step1', null);
  const [inputValue, setInputValue] = useState<string>('');
  const [_isLoading, setIsLoading] = useState(false);
  const { setRequiredLogin } = useContext(UserContext);
  const [options, setOptions] = useState<Array<any>>([]);

  console.log('options', options);
  const optionLabel = 'description';

  const getOptionLabel: (option: any) => string =
    optionLabel !== undefined ? (o) => o[optionLabel] : (o) => o.label ?? o;

  const handleRemoveClick = (index: number) => {
    const list = [...inputList];
    // eslint-disable-next-line functional/immutable-data
    list.splice(index, 1);
    setInputList(list);
  };

  const handleAddClick = () => {
    setInputList([...inputList, { taxonomyRegion: '' }]);
  };

  const handleChange = (event: any) => {
    const value = event.target.value as string;
    console.log('value', value);
    setInputValue(value);
    if (value !== '') {
      setSelectedRegion(null);
      if (value.length >= 3) {
        console.log('>=3');
        void debounce(handleSearch, 100)(value);
      }
    }
    if (value === '') {
      setSelectedRegion(null);
    }
    if (selectedRegion) {
      setInputValue(getOptionLabel(selectedRegion));
    }
  };

  const transformFn = (data: { items: Array<Geotaxonomy> }) => data.items;

  const handleSearch = async (query: string) => {
    setIsLoading(true);

    const searchGeotaxonomy = await fetchWithLogs(
      {
        endpoint: 'ONBOARDING_GET_GEOTAXONOMY',
      },
      {
        method: 'GET',
        params: { limit: ENV.MAX_INSTITUTIONS_FETCH, page: 1, search: query },
      },
      () => setRequiredLogin(true)
    );
    const outcome = getFetchOutcome(searchGeotaxonomy);

    console.log('data', (searchGeotaxonomy as AxiosResponse).data);
    if (outcome === 'success') {
      setOptions(transformFn((searchGeotaxonomy as AxiosResponse).data));
    } else if ((searchGeotaxonomy as AxiosError).response?.status === 404) {
      setOptions([]);
    }

    setIsLoading(false);
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
              arrow={true}
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
          {/* <Box sx={{ pt: 2 }} key={i}>
              <SearchTaxonomyLocalValues />
              <ResultsTaxonomyLocalValues />
            </Box> */}
          {/* <Box mt={2}>
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
          </Box> */}

          {inputList.map((_val, i) => (
            <div key={i}>
              <Box display={'flex'} width="100%" mt={2}>
                {i !== 0 && (
                  <Box display="flex" alignItems={'center'}>
                    <ButtonNaked
                      component="button"
                      onClick={() => handleRemoveClick(i)}
                      startIcon={<RemoveCircleOutlineOutlined />}
                      sx={{ color: 'error.dark', size: 'medium' }}
                      weight="default"
                      size="large"
                    />
                  </Box>
                )}
                <Box width="100%">
                  <TextField
                    sx={{
                      width: '100%',
                    }}
                    id="Parties"
                    value={selectedRegion ? selectedRegion.desc : inputValue}
                    onChange={handleChange}
                    label={
                      !selectedRegion
                        ? t('onboardingFormData.taxonomySection.localSection.inputLabel')
                        : ''
                    }
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
                      endAdornment: (
                        <IconButton
                          onClick={() => {
                            setInputValue('');
                            setSelectedRegion(null);
                            setSelectedRegionHistory(null);
                          }}
                          aria-label="clearIcon"
                        >
                          <ClearOutlined color="primary" />
                        </IconButton>
                      ),
                    }}
                    name="taxonomyRegion"
                  />
                </Box>
              </Box>
              {inputList.length - 1 === i && (
                <Box mt={2}>
                  <ButtonNaked
                    component="button"
                    onClick={handleAddClick}
                    startIcon={<AddOutlined />}
                    sx={{ color: 'primary.main' }}
                    weight="default"
                  >
                    {t('onboardingFormData.taxonomySection.localSection.addButtonLabel')}
                  </ButtonNaked>
                </Box>
              )}
            </div>
          ))}

          <Typography>{options}</Typography>
        </>
      )}
    </Paper>
  );
}
