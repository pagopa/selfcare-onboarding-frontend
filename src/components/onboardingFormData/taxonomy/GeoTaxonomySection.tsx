import { useContext, useEffect, useRef, useState } from 'react';
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
import { useHistoryState } from '../../useHistoryState';

type Props = {
  retrievedTaxonomies: Array<GeographicTaxonomy>;
  setGeographicTaxonomies: React.Dispatch<React.SetStateAction<Array<GeographicTaxonomy>>>;
  formik: any;
};

export default function GeoTaxonomySection({
  retrievedTaxonomies,
  setGeographicTaxonomies,
  formik,
}: Props) {
  const { t } = useTranslation();
  const nationalArea = [{ code: '100', desc: 'ITALIA' }];

  const [isNationalAreaVisible, setIsNationalAreaVisible] = useState<boolean>(false);
  const [isLocalAreaVisible, setIsLocalAreaVisible] = useState<boolean>(false);
  const [optionsSelected, setOptionsSelected] = useState<Array<GeographicTaxonomy>>([]);
  const [options, setOptions] = useState<Array<OnboardingInstitutionInfo>>([]);
  const [isAddNewAutocompleteEnabled, setIsAddNewAutocompleteEnabled] = useState<boolean>(false);
  const [input, setInput] = useState<string>('');
  const [error, setError] = useState<any>({});

  const localState = useRef<Array<GeographicTaxonomy>>();
  const [geotaxonomiesHistory, setGeotaxonomiesHistory, setGeotaxonomiesHistoryState] =
    useHistoryState<Array<GeographicTaxonomy>>('geotaxonomies', []);

  const { setRequiredLogin } = useContext(UserContext);

  const emptyField = !optionsSelected.find((o) => o?.desc === '');
  const deleteError = (index: number) => {
    const newError = { ...error };
    // eslint-disable-next-line functional/immutable-data
    delete newError[index];
    setError(newError);
  };

  const findError = (index: number) => {
    setError((currError: any) => ({ ...currError, [index]: true }));
  };

  useEffect(() => {
    if (retrievedTaxonomies && retrievedTaxonomies[0]?.code === '100') {
      setIsNationalAreaVisible(true);
      setOptionsSelected(nationalArea);
      setGeographicTaxonomies(optionsSelected);
    } else if (retrievedTaxonomies && retrievedTaxonomies.length > 0) {
      setIsLocalAreaVisible(true);
      setOptionsSelected(retrievedTaxonomies);
      setIsAddNewAutocompleteEnabled(true);
      setGeographicTaxonomies(optionsSelected);
    } else if (geotaxonomiesHistory[0]?.code === '100') {
      setIsLocalAreaVisible(false);
    }
  }, [retrievedTaxonomies]);

  useEffect(() => {
    if (geotaxonomiesHistory && geotaxonomiesHistory.length > 0) {
      setOptionsSelected(geotaxonomiesHistory);
      setIsLocalAreaVisible(true);
      if (geotaxonomiesHistory[0]?.code === '100') {
        setIsLocalAreaVisible(false);
      }
    }
  }, [retrievedTaxonomies]);

  useEffect(() => {
    setGeographicTaxonomies(optionsSelected);
    setGeotaxonomiesHistory(optionsSelected);
    setGeotaxonomiesHistoryState(optionsSelected);
    if (optionsSelected[0]?.desc !== '' && optionsSelected.length > 0 && emptyField) {
      setIsAddNewAutocompleteEnabled(true);
    } else {
      setIsAddNewAutocompleteEnabled(false);
    }
  }, [optionsSelected]);

  useEffect(() => {
    if (geotaxonomiesHistory[0]?.code === '100') {
      setIsLocalAreaVisible(false);
      setIsNationalAreaVisible(true);
    }
  }, []);

  const handleRemoveClick = (index: number) => {
    const list = [...optionsSelected];
    // eslint-disable-next-line functional/immutable-data
    list.splice(index, 1);
    setOptionsSelected(list);
    setIsAddNewAutocompleteEnabled(true);
    deleteError(index);
    setGeotaxonomiesHistory(list);
    // eslint-disable-next-line functional/immutable-data
    localState.current = list;
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

  const checkLocalArea = () => {
    if (
      retrievedTaxonomies &&
      retrievedTaxonomies[0]?.code !== '100' &&
      retrievedTaxonomies.length !== 0
    ) {
      if (
        geotaxonomiesHistory &&
        geotaxonomiesHistory.length > 0 &&
        localState.current &&
        localState.current?.length > 0
      ) {
        setOptionsSelected(localState.current);
      } else {
        setOptionsSelected(retrievedTaxonomies);
      }
    } else if (geotaxonomiesHistory && geotaxonomiesHistory.length > 0) {
      if (
        geotaxonomiesHistory[0]?.code === '100' &&
        localState.current &&
        localState.current?.length > 0
      ) {
        setOptionsSelected(localState.current);
      } else if (geotaxonomiesHistory[0]?.code === '100' && !localState.current) {
        setOptionsSelected([{ code: '', desc: '' }]);
      } else {
        setOptionsSelected(geotaxonomiesHistory);
      }
    } else {
      setOptionsSelected([{ code: '', desc: '' }]);
    }
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

    if (!value) {
      deleteError(index);
    }
    if (formik.values.geographicTaxonomies.length > 0) {
      setGeotaxonomiesHistory(formik.values.geographicTaxonomies);
      setGeotaxonomiesHistoryState(formik.values.geographicTaxonomies);
      // eslint-disable-next-line functional/immutable-data
      localState.current = formik.values.geographicTaxonomies;
    }
  };

  const handleSearchInput = (event: any, index: number) => {
    const value = event.target.value;
    setInput(value);
    if (value.length >= 3) {
      void debounce(handleSearch, 100)(value, index);
    } else {
      setOptions([]);
    }
  };

  const handleSearch = async (query: string, index: number) => {
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

      const dataFiltered = data.filter(
        (data: any) => !optionsSelected.find((os) => os?.code === data?.code)
      );

      const matchesWithTyped = dataFiltered.filter((o: GeographicTaxonomy) =>
        o.desc.toLocaleLowerCase().includes(query.toLocaleLowerCase())
      );
      setOptions(matchesWithTyped);

      if (matchesWithTyped.length > 0) {
        deleteError(index);
      } else {
        findError(index);
        setIsAddNewAutocompleteEnabled(false);
      }
    } else if ((searchGeotaxonomy as AxiosError).response?.status === 404) {
      setOptions([]);
    }
  };

  return (
    <Paper elevation={8} sx={{ p: 4, borderRadius: 2, my: 4 }}>
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
            value={'national'}
            control={<Radio disableRipple={true} id={'national_geographicTaxonomies'} />}
            label={t('onboardingFormData.taxonomySection.nationalLabel')}
            onChange={() => {
              setIsNationalAreaVisible(true);
              setIsLocalAreaVisible(false);
              setGeographicTaxonomies(nationalArea);
              setOptionsSelected(nationalArea);
            }}
            sx={{ mr: 3, ml: 1 }}
          />
          <FormControlLabel
            id={'geographicTaxonomies'}
            checked={isLocalAreaVisible}
            value={'local'}
            control={<Radio disableRipple={true} />}
            label={t('onboardingFormData.taxonomySection.localLabel')}
            onChange={() => {
              setIsNationalAreaVisible(false);
              setIsLocalAreaVisible(true);
              setGeographicTaxonomies(optionsSelected);
              checkLocalArea();
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
                    value={geotaxonomiesHistory[i]?.desc ?? val?.desc}
                    renderOption={(props, option) => (
                      <span {...props}>{option.desc ? option.desc : ''}</span>
                    )}
                    renderInput={(params) => (
                      <TextField
                        onChange={(e) => handleSearchInput(e, i)}
                        {...params}
                        variant="outlined"
                        label={
                          !val?.desc
                            ? t('onboardingFormData.taxonomySection.localSection.inputLabel')
                            : ''
                        }
                        error={error?.[i]}
                        helperText={
                          error?.[i] && t('onboardingFormData.taxonomySection.error.notMatchedArea')
                        }
                      />
                    )}
                  />
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
