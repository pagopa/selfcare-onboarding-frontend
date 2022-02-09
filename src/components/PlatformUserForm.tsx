import { Grid, Paper, TextField } from '@mui/material';
import React from 'react';
import { styled } from '@mui/material/styles';
import { UserOnCreate, PartyRole } from '../../types';
import { UsersObject } from './OnboardingStep2';

const CustomTextField = styled(TextField)({
  '& .MuiFormHelperText-root': {
    color: '#5C6F82',
  },
  "& .MuiInputBase-root.Mui-disabled:before": {
    borderBottomStyle: "solid",
  },
  input: {
    '&.Mui-disabled':{
      WebkitTextFillColor:' #A2ADB8'
    },
  },
});

type PlatformUserFormProps = {
  prefix: keyof UsersObject;
  role: PartyRole;
  people: UsersObject;
  allPeople: UsersObject;
  setPeople: React.Dispatch<React.SetStateAction<UsersObject>>;
  readOnly?: Array<keyof UserOnCreate>;
};

type Field = {
  id: keyof UserOnCreate;
  label: string;
  type?: 'text' | 'email';
  width?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  regexp?: RegExp;
  regexpMessage?: string;
  helperMessage?: string;
  unique: boolean;
  caseSensitive?: boolean;
  uniqueMessage?: string;
};

const fields: Array<Field> = [
  { id: 'name', label: 'Nome', unique: false },
  { id: 'surname', label: 'Cognome', unique: false },
  {
    id: 'taxCode',
    label: 'Codice Fiscale',
    width: 12,
    regexp: new RegExp(
      '^[A-Za-z]{6}[0-9lmnpqrstuvLMNPQRSTUV]{2}[abcdehlmprstABCDEHLMPRST]{1}[0-9lmnpqrstuvLMNPQRSTUV]{2}[A-Za-z]{1}[0-9lmnpqrstuvLMNPQRSTUV]{3}[A-Za-z]{1}$'
    ),
    regexpMessage: 'Il Codice Fiscale inserito non è valido',
    unique: true,
    caseSensitive: false,
    uniqueMessage: 'Il codice fiscale inserito è già presente',
  },
  {
    id: 'email',
    label: 'Email istituzionale',
    type: 'email',
    width: 12,
    regexp: new RegExp('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$'),
    regexpMessage: "L'indirizzo email non è valido",
    helperMessage: "Inserisci l'indirizzo email istituzionale utilizzato per l'Ente",
    unique: true,
    caseSensitive: false,
    uniqueMessage: "L'indirizzo email inserito è già presente",
  },
];

type ValidationErrorCode = `${keyof UserOnCreate}-regexp` | `${keyof UserOnCreate}-unique`;

function stringEquals(str1?: string, str2?: string, caseSensitive?: boolean) {
  return (
    (!str1 && !str2) ||
    (!caseSensitive ? str1?.toUpperCase() === str2?.toUpperCase() : str1 === str2)
  );
}

export function validateUser(
  userTempId: keyof UsersObject,
  user: UserOnCreate,
  users: UsersObject
): boolean {
  return (
    fields.filter(({ id }) => !user[id]).map(({ id }) => id).length === 0 && // mandatory fields
    validateNoMandatory(userTempId, user, users).length === 0
  );
}

function validateNoMandatory(
  userTempId: keyof UsersObject,
  user: UserOnCreate,
  users: UsersObject
): Array<ValidationErrorCode> {
  const usersArray = users
    ? Object.entries(users)
        .filter((u) => u[0] !== userTempId)
        .map((u) => u[1])
    : [];

  return fields
    .map(({ id, regexp, unique, caseSensitive }) =>
      regexp && user[id] && !regexp.test(user[id] as string)
        ? `${id}-regexp`
        : unique && usersArray.findIndex((u) => stringEquals(u[id], user[id], caseSensitive)) > -1
        ? `${id}-unique`
        : undefined
    )
    .filter((x) => x)
    .map((x) => x as ValidationErrorCode);
}

export function PlatformUserForm({
  prefix,
  role,
  people,
  allPeople,
  setPeople,
  readOnly = [],
}: PlatformUserFormProps) {
  const buildSetPerson = (key: string) => (e: any) => {
    setPeople({
      ...people,
      [prefix]: { ...people[prefix], [key]: e.target.value, role },
    });
  };

  const errors: Array<ValidationErrorCode> = people[prefix]
    ? validateNoMandatory(prefix, people[prefix], allPeople)
    : [];

  return (
    <Paper elevation={0} sx={{ py: 4, px: 6 }}>
      <Grid container spacing={2}>
        {fields.map(
          ({
            id,
            label,
            type = 'text',
            width = 6,
            regexpMessage,
            uniqueMessage,
            helperMessage,
          }) => {
            const prefixErrorCode = `${id}-`;
            const error = errors
              .filter((e) => e.startsWith(prefixErrorCode))
              .map((e) => e.replace(prefixErrorCode, ''));
            const isError = error && error.length > 0;
            return (
              <Grid item key={id} xs={width} mb={5}>
                <CustomTextField
                  id={`${prefix}-${id}`}
                  variant="standard"
                  label={<React.Fragment>{label}</React.Fragment>}
                  type={type}
                  value={people[prefix] && people[prefix][id] ? people[prefix][id] : ''}
                  onChange={buildSetPerson(id)}
                  sx={{ width: '100%' }}
                  error={isError}
                  helperText={
                    isError
                      ? error.indexOf('regexp') > -1
                        ? regexpMessage
                        : error.indexOf('unique') > -1
                        ? uniqueMessage
                        : 'Campo non valido'
                      : helperMessage
                  }
                  disabled={readOnly.indexOf(id) > -1}
                />
              </Grid>
            );
          }
        )}
      </Grid>
    </Paper>
  );
}
