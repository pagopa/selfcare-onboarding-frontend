import { Grid, Paper, TextField, Typography } from '@mui/material';
import React from 'react';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { UserOnCreate, UserPlatformRole, UserRole } from '../../types';
import { UsersObject } from './OnboardingStep2';

type PlatformUserFormProps = {
  prefix: keyof UsersObject;
  role: UserRole;
  platformRole: UserPlatformRole;
  people: UsersObject;
  setPeople: React.Dispatch<React.SetStateAction<UsersObject>>;
};

type Field = {
  id: keyof UserOnCreate;
  label: string;
  type?: 'text' | 'email';
  width?: 1|2|3|4|5|6|7|8|9|10|11|12;
  regexp?: RegExp;
};

const fields: Array<Field> = [
  { id: 'name', label: 'Nome' },
  { id: 'surname', label: 'Cognome' },
  { id: 'taxCode', label: 'Codice Fiscale', width: 12 },
  { id: 'email', label: 'Email istituzionale', type: 'email', width: 12, regexp: new RegExp('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$') },
];

export function validateUser(user: UserOnCreate): boolean {
  return  fields.filter(({id})=>!user[id]).map(({id})=>id).length === 0 // mandatory fields
    && validateNoMandatory(user).length === 0;
}

function validateNoMandatory(user: UserOnCreate): Array<keyof UserOnCreate> {
  return fields.filter(({id, regexp})=>
                  regexp &&
                  user[id] &&
                  !regexp.test(user[id] as string)
                ).map(({id})=>id);
}

export function PlatformUserForm({
  prefix,
  role,
  platformRole,
  people,
  setPeople,
}: PlatformUserFormProps) {
  const buildSetPerson = (key: string) => (e: any) => {
    setPeople({
      ...people,
      [prefix]: { ...people[prefix], [key]: e.target.value, role, platformRole },
    });
  };

  const errors: Array<string> = people[prefix] ? validateNoMandatory(people[prefix]) : [];

  return (
    <Paper elevation={0} sx={{p: 10}} variant="outlined">
      <Grid container spacing={2}>
        {fields.map(({ id, label, type = 'text', width = 6}) => (
          <Grid item key={id} xs={width}>
            <TextField
              id={`${prefix}-${id}`}
              variant="standard"
              label={label}
              type={type}
              value={people[prefix] && people[prefix][id] ? people[prefix][id] : ''}
              onChange={buildSetPerson(id)}
              sx={{width: '100%'}}
              error={errors.indexOf(id) > -1}
            />
          </Grid>
        ))}
        <Grid item xs={12} sx={{display: "flex"}}>
          <InfoOutlinedIcon /><Typography>Inserisci l&apos;indirizzo email istituzionale utilizzato per l&apos;Ente</Typography>
        </Grid>
      </Grid>
    </Paper>
  );
}
