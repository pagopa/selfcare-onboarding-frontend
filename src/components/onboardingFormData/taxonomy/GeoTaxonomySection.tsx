import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import debounce from 'lodash/debounce';
import { Autocomplete } from '@mui/material';
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
} from '@mui/material';
import { AddOutlined, RemoveCircleOutlineOutlined } from '@mui/icons-material';
import { ButtonNaked } from '@pagopa/mui-italia';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { AxiosError, AxiosResponse } from 'axios';
import { fetchWithLogs } from '../../../lib/api-utils';
import { getFetchOutcome } from '../../../lib/error-utils';
import { UserContext } from '../../../lib/context';
import { ENV } from '../../../utils/env';
import { OnboardingInstitutionInfo } from '../../../model/OnboardingInstitutionInfo';
import { GeographicTaxonomy } from '../../../model/GeographicTaxonomies';

type Props = {
  retrievedTaxonomies: Array<GeographicTaxonomy>;
  setGeographicTaxonomies: React.Dispatch<React.SetStateAction<Array<GeographicTaxonomy>>>;
};

export default function GeoTaxonomySection({
  retrievedTaxonomies,
  setGeographicTaxonomies,
}: Props) {
  const { t } = useTranslation();
  const [isNationalAreaVisible, setIsNationalAreaVisible] = useState<boolean>(false);
  const [isLocalAreaVisible, setIsLocalAreaVisible] = useState<boolean>(false);
  const [_isLoading, setIsLoading] = useState(false);
  const { setRequiredLogin } = useContext(UserContext);
  const [optionsSelected, setOptionsSelected] = useState<Array<GeographicTaxonomy>>([]);
  const [options, setOptions] = useState<Array<OnboardingInstitutionInfo>>([]);
  const [isAddNewAutocompleteEnabled, setIsAddNewAutocompleteEnabled] = useState<boolean>(false);
  const [input, setInput] = useState<string>('');

  const emptyField = !optionsSelected.find((o) => o?.desc === '');

  useEffect(() => {
    if (retrievedTaxonomies && retrievedTaxonomies[0]?.code === '100') {
      setIsNationalAreaVisible(true);
      setGeographicTaxonomies([{ code: '100', desc: 'ITALIA' }]);
    } else if (retrievedTaxonomies && retrievedTaxonomies.length > 0) {
      setIsLocalAreaVisible(true);
      setOptionsSelected(retrievedTaxonomies);
      setIsAddNewAutocompleteEnabled(true);
      setGeographicTaxonomies(optionsSelected);
    }
  }, []);

  useEffect(() => {
    setGeographicTaxonomies(optionsSelected);
  }, [optionsSelected]);

  const handleRemoveClick = (index: number) => {
    const list = [...optionsSelected];
    // eslint-disable-next-line functional/immutable-data
    list.splice(index, 1);
    setOptionsSelected(list);
    setIsAddNewAutocompleteEnabled(true);
  };

  const handleAddClick = () => {
    if (emptyField) {
      setIsAddNewAutocompleteEnabled(false);
    }
    setOptionsSelected([
      ...optionsSelected,
      {
        code: '',
        desc: '',
      },
    ]);
  };

  const handleChange = (_event: any, value: any, index: number) => {
    const newValues = optionsSelected;

    // eslint-disable-next-line functional/immutable-data
    newValues[index] = value;
    setOptionsSelected(newValues.slice());
    if (newValues[index]?.desc) {
      setIsAddNewAutocompleteEnabled(true);
    } else if (emptyField) {
      setIsAddNewAutocompleteEnabled(false);
    }
  };

  const handleSearchInput = (event: any) => {
    const value = event.target.value;
    setInput(value);
    if (value.length >= 3) {
      void debounce(handleSearch, 100)(value);
    } else {
      setOptions([]);
    }
  };
  const handleSearch = async (query: string) => {
    setIsLoading(true);
    const searchGeotaxonomy = await fetchWithLogs(
      {
        endpoint: 'ONBOARDING_GET_GEOTAXONOMY',
      },
      {
        method: 'GET',
        params: { limit: ENV.MAX_INSTITUTIONS_FETCH, page: 1, startsWith: query },
      },
      () => setRequiredLogin(true)
    );
    const outcome = getFetchOutcome(searchGeotaxonomy);

    if (outcome === 'success') {
      // eslint-disable-next-line functional/no-let
      let data = (searchGeotaxonomy as AxiosResponse).data;

      data = data.map((value: OnboardingInstitutionInfo) => ({ ...value, label: value.desc }));

      setOptions(data.filter((o: any) => !optionsSelected.includes(o)));
    } else if ((searchGeotaxonomy as AxiosError).response?.status === 404) {
      setOptions([]);
    }
    setIsLoading(false);
  };

  // const notValidEntry = input.length >= 3 && options.length === 0 && !optionsSelected;

  return (
    <Paper elevation={0} sx={{ p: 4, borderRadius: 2, my: 4 }}>
      <Grid container item pb={3}>
        <Grid item xs={12} display="flex">
          <Box>
            <Typography component="div" variant="caption" sx={{ fontWeight: 'fontWeightBold' }}>
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
      <RadioGroup name="geographicTaxonomy">
        <Box display="flex">
          <FormControlLabel
            checked={isNationalAreaVisible}
            value={'nationl'}
            control={<Radio disableRipple={true} />}
            label={t('onboardingFormData.taxonomySection.nationalLabel')}
            onChange={() => {
              setIsNationalAreaVisible(true);
              setIsLocalAreaVisible(false);
              setGeographicTaxonomies([{ code: '100', desc: 'ITALIA' }]);
            }}
            sx={{ mr: 3, ml: 1 }}
          />
          <FormControlLabel
            checked={isLocalAreaVisible}
            value={'local'}
            control={<Radio disableRipple={true} />}
            label={t('onboardingFormData.taxonomySection.localLabel')}
            onChange={() => {
              setIsNationalAreaVisible(false);
              setIsLocalAreaVisible(true);
              setGeographicTaxonomies(optionsSelected);
              setOptionsSelected([{ code: '', desc: '' }]);
            }}
          />
        </Box>
      </RadioGroup>
      {isLocalAreaVisible && (
        <>
          {optionsSelected.map((val, i) => (
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
                  <Autocomplete
                    freeSolo
                    onOpen={() => setOptions([])}
                    disablePortal
                    options={input.length >= 3 ? options : []}
                    sx={{ width: '100%' }}
                    onChange={(event: any, value: any) => handleChange(event, value, i)}
                    value={val?.desc}
                    renderOption={(props, option) => (
                      // TODO: customize layout
                      <span {...props}>{option.desc ? option.desc : ''}</span>
                    )}
                    renderInput={(params) => (
                      <TextField
                        onChange={handleSearchInput}
                        {...params}
                        variant="outlined"
                        label={
                          !val?.desc
                            ? t('onboardingFormData.taxonomySection.localSection.inputLabel')
                            : ''
                        }
                        // error={notValidEntry}
                      />
                    )}
                  />
                  {/* {notValidEntry && (
                    <Typography sx={{ fontSize: 'fontSize', color: 'error.dark' }} pt={1} ml={2}>
                      {t('onboardingFormData.taxonomySection.error.notMatchedArea')}
                    </Typography>
                  )} */}
                </Box>
              </Box>
              {optionsSelected.length - 1 === i && (
                <Box mt={2}>
                  <ButtonNaked
                    disabled={!isAddNewAutocompleteEnabled}
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
        </>
      )}
    </Paper>
  );
}
