import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';
import { Box, IconButton, TextField, Theme, Tooltip, Typography } from '@mui/material';
import { styled } from '@mui/system';
import { ChangeEvent, Dispatch, SetStateAction, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IPACatalogParty, PartyData } from '../../../../../../types';
import { useHistoryState } from '../../../../../hooks/useHistoryState';
import { AooData } from '../../../../../model/AooData';
import { PDNDBusinessResource } from '../../../../../model/PDNDBusinessResource';
import { SelectionsState } from '../../../../../model/Selection';
import { UoData } from '../../../../../model/UoModel';
import { StepBillingDataHistoryState } from '../../../../steps/StepOnboardingFormData';

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
  /* outlined border color: minimum 3:1 contrast ratio against white (WCAG 1.4.11) */
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: 'rgba(0, 0, 0, 0.5)',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: 'rgba(0, 0, 0, 0.87)',
  },
});

type Props = {
  theme: Theme;
  selected: PartyData | null;
  setSelected: React.Dispatch<React.SetStateAction<PartyData | null>>;
  setInput: Dispatch<SetStateAction<string>>;
  input: string;
  isSearchFieldSelected: boolean;
  selections: SelectionsState;
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
  setCfResult: React.Dispatch<React.SetStateAction<PartyData | undefined>>;
  setAooResult: React.Dispatch<React.SetStateAction<AooData | undefined>>;
  setUoResult: React.Dispatch<React.SetStateAction<UoData | undefined>>;
  setMerchantSearchResult?: (value?: PDNDBusinessResource) => void;
  setDisabled: Dispatch<SetStateAction<boolean>>;
  externalInstitutionId: string;
  addUser: boolean;
};

const truncatedText = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical' as const,
  width: '100%',
  whiteSpace: 'normal' as const,
};

const getSelectedValue = (
  selected: PartyData | null,
  selections: SelectionsState,
  addUser: boolean
): string | undefined => {
  if (!selected) {
    return undefined;
  }
  const isPartySearch =
    selections.businessName ||
    selections.taxCode ||
    selections.ivassCode ||
    selections.personalTaxCode;
  if (isPartySearch && selected.description) {
    return selected.description;
  }
  if (selections.aooCode && selected.denominazioneAoo) {
    return selected.denominazioneAoo;
  }
  if (selections.uoCode && selected.descrizioneUo) {
    return selected.descrizioneUo;
  }
  if (addUser && (selections.aooCode || selections.uoCode) && selected.description) {
    return selected.description;
  }
  return selected.businessName;
};

const getTooltipTitle = (selected: PartyData | null): string =>
  selected?.description && selected.description.length > 20 ? selected.description : '';

const isSubunit = (selected: PartyData, selections: SelectionsState): boolean =>
  selections.aooCode ||
  selections.uoCode ||
  !!selected.denominazioneAoo ||
  !!selected.descrizioneUo;

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
  setDisabled,
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

  const valueSelected = getSelectedValue(selected, selections, addUser);

  useEffect(() => {
    setInput(selected?.denominazioneAoo || selected?.descrizioneUo || input);
  }, []);

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

  const handleClear = () => {
    setInput('');
    setSelected(null);
    setSelectedHistory(null);
    setCfResult(undefined);
    setAooResult(undefined);
    setUoResult(undefined);
    setMerchantSearchResult?.(undefined);
    setDisabled?.(true);
    setStepHistoryState({
      ...stepHistoryState,
      isTaxCodeEquals2PIVA: false,
    });
    setStepHistoryStateHistory({
      ...stepHistoryState,
      isTaxCodeEquals2PIVA: false,
    });
  };

  return (
    <Tooltip arrow title={getTooltipTitle(selected)}>
      <CustomTextField
        disabled={!isSearchFieldSelected}
        id="Parties"
        sx={{
          width: '100%',
          mx: selected ? '6px' : 4,
          ml: selected ? '12px' : 4,
          '& input#Parties': { display: selected && 'none !important' },
        }}
        onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(e)}
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
              {isSubunit(selected, selections) && (
                <Typography
                  variant="body1"
                  sx={{
                    ...truncatedText,
                    WebkitLineClamp: 2,
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
              onClick={handleClear}
              aria-label={t('asyncAutocomplete.clearIconAriaLabel')}
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
