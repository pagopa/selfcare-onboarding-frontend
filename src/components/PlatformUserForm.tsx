import { Grid, Paper, TextField } from '@mui/material';
import React from 'react';
import { styled } from '@mui/material/styles';
// import theme from '@pagopa/mui-italia/theme';
import { UserOnCreate, UserPlatformRole, UserRole } from '../../types';
import { UsersObject } from './OnboardingStep2';

const CustomTextField = styled(TextField)({
  '& .MuiFormHelperText-root':{
    color: '#5C6F82',
  },
});

type PlatformUserFormProps = {
  prefix: keyof UsersObject;
  role: UserRole;
  platformRole: UserPlatformRole;
  people: UsersObject;
  setPeople: React.Dispatch<React.SetStateAction<UsersObject>>;
  readOnly?: Array<keyof UserOnCreate>;
};

type Field = {
  id: keyof UserOnCreate;
  label: string;
  type?: 'text' | 'email';
  width?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  regexp?: RegExp;
  message?: string;
  helperMessage?: string;
};

const fields: Array<Field> = [
  { id: 'name', label: 'Nome', message: 'Questo campo è obbligatorio' },
  { id: 'surname', label: 'Cognome', message: 'Questo campo è obbligatorio' },
  {
    id: 'taxCode',
    label: 'Codice Fiscale',
    width: 12,
    regexp: new RegExp(
      '^[A-Za-z]{6}[0-9lmnpqrstuvLMNPQRSTUV]{2}[abcdehlmprstABCDEHLMPRST]{1}[0-9lmnpqrstuvLMNPQRSTUV]{2}[A-Za-z]{1}[0-9lmnpqrstuvLMNPQRSTUV]{3}[A-Za-z]{1}$'
    ),
    message: 'Il Codice Fiscale inserito non è valido'
  },
  {
    id: 'email',
    label: 'Email istituzionale',
    type: 'email',
    width: 12,
    regexp: new RegExp('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$'),
    message: 'L’indirizzo email non è valido',
    helperMessage:"Inserisci l'indirizzo email istituzionale utilizzato per l'Ente"
  },
];

export function validateUser(user: UserOnCreate): boolean {
  return (
    fields.filter(({ id }) => !user[id]).map(({ id }) => id).length === 0 && // mandatory fields
    validateNoMandatory(user).length === 0
  );
}

function validateNoMandatory(user: UserOnCreate): Array<keyof UserOnCreate> {
  return fields
    .filter(({ id, regexp }) => regexp && user[id] && !regexp.test(user[id] as string))
    .map(({ id }) => id);
}

export function PlatformUserForm({
  prefix,
  role,
  platformRole,
  people,
  setPeople,
  readOnly = [],
}: PlatformUserFormProps) {
  const buildSetPerson = (key: string) => (e: any) => {
    setPeople({
      ...people,
      [prefix]: { ...people[prefix], [key]: e.target.value, role, platformRole },
    });
  };

  const errors: Array<string> = people[prefix] ? validateNoMandatory(people[prefix]) : [];

  return (

    <Paper elevation={0} sx={{ py:4, px:6 }} >
      <Grid container spacing={2}>
        {fields.map(({ id, label, type = 'text', width = 6, message, helperMessage}) => {
          const isError= errors.indexOf(id) > -1;
          return (
          <Grid item key={id} xs={width} mb={5}>
            <CustomTextField
              id={`${prefix}-${id}`}
              variant="standard"
              label={
                <React.Fragment>
                  {label}
                </React.Fragment>
              }
              type={type}
              value={people[prefix] && people[prefix][id] ? people[prefix][id] : ''}
              onChange={buildSetPerson(id)}
              sx={{ width: '100%' }}
              error={isError}
              helperText={isError ? message : helperMessage}
              disabled={readOnly.indexOf(id) > -1}
            />
          </Grid>
        );})}
      </Grid>
    </Paper>
  );
}
