import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';

export default function PartyAdvancedRadioButton() {
    return (
    <FormControl>
      <RadioGroup
        row
        aria-labelledby="Seleziona la tipologia di ricerca dell'ente"
        defaultValue="businessName"
        name="partyAdvancedRadioButton"
      >
        <FormControlLabel value="businessName" control={<Radio />} label="Ragione Sociale" />
        <FormControlLabel value="taxCode" control={<Radio />} label="Codice Fiscale ente" />
      </RadioGroup>
    </FormControl>
  );
}