import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';

type Props = {setIsTaxCodeSelected:React.Dispatch<React.SetStateAction<boolean | undefined>>;
              setIsBusinessNameSelected: React.Dispatch<React.SetStateAction<boolean>>;
              setOptions: React.Dispatch<React.SetStateAction<Array<any>>>;
              setInput: React.Dispatch<React.SetStateAction<string>>;};

export default function PartyAdvancedRadioButton({setIsTaxCodeSelected, setIsBusinessNameSelected, setOptions, setInput}:Props) {

  const onSelectValue = (isBusinessNameSelected: boolean, isTaxCodeSelected: boolean) => {
    setIsBusinessNameSelected(isBusinessNameSelected);
    setIsTaxCodeSelected(isTaxCodeSelected);
    setOptions([]);
    setInput('');};

    return (
    <FormControl>
      <RadioGroup
        row
        aria-labelledby="Seleziona la tipologia di ricerca dell'ente"
        defaultValue="businessName"
        name="partyAdvancedRadioButton"
      >
        <FormControlLabel value="businessName" control={<Radio />} label="Ragione Sociale" onClick={() => onSelectValue(true, false)}/>
        <FormControlLabel value="taxCode" control={<Radio />} label="Codice Fiscale ente" onClick={() => onSelectValue(false, true)} />
      </RadioGroup>
    </FormControl>
  );
}