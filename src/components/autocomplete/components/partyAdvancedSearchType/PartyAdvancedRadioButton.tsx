import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import { useTranslation } from 'react-i18next';

type Props = {
  setIsTaxCodeSelected: React.Dispatch<React.SetStateAction<boolean | undefined>>;
  setIsBusinessNameSelected: React.Dispatch<React.SetStateAction<boolean>>;
  setIsIvassCodeSelected: React.Dispatch<React.SetStateAction<boolean>>;
  setOptions: React.Dispatch<React.SetStateAction<Array<any>>>;
  setInput: React.Dispatch<React.SetStateAction<string>>;
};

export default function PartyAdvancedRadioButton({
  setIsTaxCodeSelected,
  setIsBusinessNameSelected,
  setIsIvassCodeSelected,
  setOptions,
  setInput,
}: Props) {
  const onSelectValue = (
    isBusinessNameSelected: boolean,
    isTaxCodeSelected: boolean,
    isIvassCodeSelected: boolean
  ) => {
    setIsBusinessNameSelected(isBusinessNameSelected);
    setIsTaxCodeSelected(isTaxCodeSelected);
    setIsIvassCodeSelected(isIvassCodeSelected);
    setOptions([]);
    setInput('');
  };
  const { t } = useTranslation();
  return (
    <FormControl>
      <RadioGroup
        row
        aria-labelledby={t('asyncAutocomplete.ariaLabel')}
        defaultValue="businessName"
        name="partyAdvancedRadioButton"
      >
        <FormControlLabel
          value="businessName"
          id="businessName"
          control={<Radio />}
          label={t('asyncAutocomplete.businessName')}
          onClick={() => onSelectValue(true, false, false)}
        />
        <FormControlLabel
          id="taxcode"
          value="taxCode"
          control={<Radio />}
          label={t('asyncAutocomplete.taxcode')}
          onClick={() => onSelectValue(false, true, false)}
        />
        <FormControlLabel
          id="ivassCode"
          value="ivassCode"
          control={<Radio />}
          label={t('asyncAutocomplete.originId')}
          onClick={() => onSelectValue(false, false, true)}
        />
      </RadioGroup>
    </FormControl>
  );
}
