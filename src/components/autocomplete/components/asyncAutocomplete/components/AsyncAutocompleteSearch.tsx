import { IconButton, TextField, Theme, Tooltip, Typography, Box } from '@mui/material';
import { styled } from '@mui/system';
import { useTranslation } from 'react-i18next';
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';
import { Dispatch, SetStateAction, useEffect, useMemo } from 'react';
import { IPACatalogParty, PartyData } from '../../../../../../types';
import { useHistoryState } from '../../../../useHistoryState';
import { UoData } from '../../../../../model/UoModel';
import { StepBillingDataHistoryState } from '../../../../steps/StepOnboardingFormData';
import { AooData } from '../../../../../model/AooData';
import { SelectionsState } from '../../../../../model/Selection';

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
  isSearchFieldSelected: boolean;
  selections: SelectionsState;
  handleChange: (event: any) => void;
  setCfResult: React.Dispatch<React.SetStateAction<PartyData | undefined>>;
  setAooResult: React.Dispatch<React.SetStateAction<AooData | undefined>>;
  setUoResult: React.Dispatch<React.SetStateAction<UoData | undefined>>;
  setMerchantSearchResult?: Dispatch<SetStateAction<PartyData | undefined>>;
  externalInstitutionId: string;
  addUser: boolean;
};

// eslint-disable-next-line sonarjs/cognitive-complexity, complexity
export default function AsyncAutocompleteSearch({
  theme,
  selected,
  setSelected,
  setInput,
  input,
  isSearchFieldSelected,
  selections,
  handleChange,
  setCfResult,
  setAooResult,
  setUoResult,
  setMerchantSearchResult,
  externalInstitutionId,
  addUser,
}: Props) {
  const setSelectedHistory = useHistoryState<IPACatalogParty | null>('selected_step1', null)[2];
  const { t } = useTranslation();
  const [stepHistoryState, setStepHistoryState, setStepHistoryStateHistory] =
    useHistoryState<StepBillingDataHistoryState>('onboardingFormData', {
      externalInstitutionId,
      isTaxCodeEquals2PIVA: false,
    });

  const truncatedText = {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical' as const,
    width: '100%',
    whiteSpace: 'normal' as const,
  };

  const valueSelected =
    (selections.businessName ||
      selections.taxCode ||
      selections.ivassCode ||
      selections.personalTaxCode) &&
    selected?.description
      ? selected.description
      : selected && selections.aooCode && selected?.denominazioneAoo
        ? selected?.denominazioneAoo
        : selected && selections.uoCode && selected.descrizioneUo
          ? selected?.descrizioneUo
          : addUser &&
              selected &&
              (selections.aooCode || selections.uoCode) &&
              selected?.description
            ? selected.description
            : selected?.businessName;

  useEffect(() => {
    if (selected && selected?.denominazioneAoo) {
      setInput(selected?.denominazioneAoo);
    } else if (selected && selected?.descrizioneUo) {
      setInput(selected?.descrizioneUo);
    } else {
      setInput(input);
    }
  }, []);

  useEffect(
    () => console.log('input', input, 'selected', selected, 'valueSelected', valueSelected),
    [input, selected, valueSelected]
  );

  const label = useMemo(() => {
    if (selected) {
      return '';
    }

    if (selections.reaCode) {
      return t('asyncAutocomplete.reaLabel');
    }
    if (selections.aooCode) {
      return t('asyncAutocomplete.aooLabel');
    }
    if (selections.uoCode) {
      return t('asyncAutocomplete.uoLabel');
    }

    return t('asyncAutocomplete.searchLabel');
  }, [selected, selections.reaCode, selections.aooCode, selections.uoCode, t]);

  return (
    <Tooltip arrow title={selected?.description?.length > 20 ? selected?.description : ''}>
      <CustomTextField
        disabled={!isSearchFieldSelected}
        id="Parties"
        sx={{
          width: '100%',
          mx: selected ? '6px' : 4,
          ml: selected ? '12px' : 4,
          '& input#Parties': { display: selected && 'none !important' },
        }}
        onChange={handleChange}
        value={!selected ? input : valueSelected}
        label={label}
        variant={!selected ? 'outlined' : 'standard'}
        inputProps={{
          // maxLength: isTaxCodeSelected ? '11' : undefined,
          style: {
            fontStyle: 'normal',
            fontWeight: '600',
            fontSize: '16px',
            lineHeight: '24px',
            color: theme.palette.text.primary,
            textAlign: 'start',
            paddingLeft: '16px',
            ...(selected && {
              ...truncatedText,
              WebkitLineClamp: 1,
            }),
          },
        }}
        InputProps={{
          startAdornment: selected && (
            <Box width="100%">
              <Typography variant="body1" sx={{ fontWeight: 'fontWeightBold' }}>
                {valueSelected}
              </Typography>
              {(selections.aooCode ||
                selections.uoCode ||
                selected.denominazioneAoo ||
                selected.descrizioneUo) && (
                <Typography
                  variant="body1"
                  sx={{
                    ...(selected && {
                      ...truncatedText,
                      WebkitLineClamp: 2,
                    }),
                  }}
                >
                  {selected.denominazioneEnte ?? selected.parentDescription}
                </Typography>
              )}
            </Box>
          ),
          endAdornment: selected && (
            <IconButton
              disabled={!isSearchFieldSelected}
              onClick={() => {
                setInput('');
                setSelected('');
                setSelectedHistory(null);
                setCfResult(undefined);
                setAooResult(undefined);
                setUoResult(undefined);
                setMerchantSearchResult?.(undefined);
                setStepHistoryState({
                  ...stepHistoryState,
                  isTaxCodeEquals2PIVA: false,
                });
                setStepHistoryStateHistory({
                  ...stepHistoryState,
                  isTaxCodeEquals2PIVA: false,
                });
              }}
              aria-label="clearIcon"
            >
              <ClearOutlinedIcon
                sx={{
                  color: !isSearchFieldSelected
                    ? theme.palette.text.disabled
                    : theme.palette.text.primary,
                }}
              />
            </IconButton>
          ),
        }}
      />
    </Tooltip>
  );
}
