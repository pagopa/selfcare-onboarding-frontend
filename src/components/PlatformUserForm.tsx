import { Grid, Paper, TextField, useTheme } from '@mui/material';
import React from 'react';
import { useTranslation, TFunction } from 'react-i18next';
import { UserOnCreate, PartyRole } from '../../types';
import { UsersObject } from './OnboardingStep2';

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
  type?: 'text' | 'email';
  width?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  regexp?: RegExp;
  regexpMessageKey?: string;
  hasDescription?: boolean;
  unique: boolean;
  caseSensitive?: boolean;
  uniqueMessageKey?: string;
};

const fields: Array<Field> = [
  { id: 'name', unique: false },
  { id: 'surname', unique: false },
  {
    id: 'taxCode',
    width: 12,
    regexp: new RegExp(
      '^[A-Za-z]{6}[0-9lmnpqrstuvLMNPQRSTUV]{2}[abcdehlmprstABCDEHLMPRST]{1}[0-9lmnpqrstuvLMNPQRSTUV]{2}[A-Za-z]{1}[0-9lmnpqrstuvLMNPQRSTUV]{3}[A-Za-z]{1}$'
    ),
    regexpMessageKey: 'invalid',
    unique: true,
    caseSensitive: false,
    uniqueMessageKey: 'duplicate',
  },
  {
    id: 'email',
    width: 12,
    regexp: new RegExp('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$'),
    regexpMessageKey: 'invalid',
    hasDescription: true,
    unique: true,
    caseSensitive: false,
    uniqueMessageKey: 'duplicate',
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

const transcodeFormErrorKey = (
  idField: string,
  errorKey: string | undefined,
  t: TFunction<'translation', undefined>
) => (errorKey ? t(`platformUserForm.fields.${idField}.errors.${errorKey}`) : '');

export function PlatformUserForm({
  prefix,
  role,
  people,
  allPeople,
  setPeople,
  readOnly = [],
}: PlatformUserFormProps) {
  const { t } = useTranslation();
  const theme = useTheme();

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
    <Paper elevation={0} sx={{ py: 4, px: 6, borderRadius: '16px' }}>
      <Grid container spacing={2}>
        {fields.map(
          ({
            id,
            type = 'text',
            width = 6,
            regexpMessageKey,
            uniqueMessageKey,
            hasDescription,
          }) => {
            const prefixErrorCode = `${id}-`;
            const error = errors
              .filter((e) => e.startsWith(prefixErrorCode))
              .map((e) => e.replace(prefixErrorCode, ''));
            const isError = error && error.length > 0;
            return (
              <Grid item key={id} xs={width} mb={3}>
                <TextField
                  id={`${prefix}-${id}`}
                  variant="outlined"
                  label={t(`platformUserForm.fields.${id}.label`)}
                  type={type}
                  value={people[prefix] && people[prefix][id] ? people[prefix][id] : ''}
                  onChange={buildSetPerson(id)}
                  sx={{
                    width: '100%',
                    '& .MuiFormHelperText-root': {
                      color: theme.palette.text.secondary,
                    },
                    '& .MuiInputBase-root.Mui-disabled:before': {
                      borderBottomStyle: 'solid',
                    },
                    input: {
                      '&.Mui-disabled': {
                        WebkitTextFillColor: theme.palette.text.disabled,
                      },
                    },
                  }}
                  error={isError}
                  helperText={
                    isError
                      ? error.indexOf('regexp') > -1
                        ? transcodeFormErrorKey(id, regexpMessageKey, t)
                        : error.indexOf('unique') > -1
                        ? transcodeFormErrorKey(id, uniqueMessageKey, t)
                        : t('platformUserForm.helperText')
                      : hasDescription
                      ? t(`platformUserForm.fields.${id}.description`)
                      : ''
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
