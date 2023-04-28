import { Grid, Paper, TextField } from '@mui/material';
import React from 'react';
import { useTranslation, TFunction } from 'react-i18next';
import { verifyNameMatchWithTaxCode } from '@pagopa/selfcare-common-frontend/utils/verifyNameMatchWithTaxCode';
import { verifySurnameMatchWithTaxCode } from '@pagopa/selfcare-common-frontend/utils/verifySurnameMatchWithTaxCode';
import { verifyChecksumMatchWithTaxCode } from '@pagopa/selfcare-common-frontend/utils/verifyChecksumMatchWithTaxCode';
import { UserOnCreate, PartyRole } from '../../types';
import { UsersError, UsersObject } from './steps/StepAddManager';

type PlatformUserFormProps = {
  prefix: keyof UsersObject;
  role: PartyRole;
  people: UsersObject;
  peopleErrors?: UsersError;
  allPeople: UsersObject;
  setPeople: React.Dispatch<React.SetStateAction<UsersObject>>;
  readOnly?: boolean;
  readOnlyFields?: Array<keyof UserOnCreate>;
  isAuthUser?: boolean;
};

type Field = {
  id: keyof UserOnCreate;
  type?: 'text' | 'email';
  width?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  regexp?: RegExp;
  regexpMessageKey?: string;
  conflictMessageKey?: string;
  hasDescription?: boolean;
  unique: boolean;
  caseSensitive?: boolean;
  uniqueMessageKey?: string;
  textTransform?: TextTransform;
};

type TextTransform = 'uppercase' | 'lowercase';

const fields: Array<Field> = [
  { id: 'name', unique: false, conflictMessageKey: 'conflict' },
  { id: 'surname', unique: false, conflictMessageKey: 'conflict' },
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
    textTransform: 'uppercase',
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
    textTransform: 'lowercase',
  },
];

type ValidationErrorCode =
  | `${keyof UserOnCreate}-regexp`
  | `${keyof UserOnCreate}-unique`
  | `${keyof UserOnCreate}-conflict`;

function stringEquals(str1?: string, str2?: string, caseSensitive?: boolean) {
  return (
    (!str1 && !str2) ||
    (!caseSensitive ? str1?.toUpperCase() === str2?.toUpperCase() : str1 === str2)
  );
}

export function validateUser(
  userTempId: keyof UsersObject,
  user: UserOnCreate,
  users: UsersObject,
  isAuthUser?: boolean
): boolean {
  return (
    fields.filter(({ id }) => !user[id]).map(({ id }) => id).length === 0 && // mandatory fields
    validateNoMandatory(userTempId, user, users, isAuthUser).length === 0
  );
}

// eslint-disable-next-line sonarjs/cognitive-complexity
function validateNoMandatory(
  userTempId: keyof UsersObject,
  user: UserOnCreate,
  users: UsersObject,
  isAuthUser?: boolean
): Array<ValidationErrorCode> {
  const usersArray = users
    ? Object.entries(users)
        .filter((u) => u[0] !== userTempId)
        .map((u) => u[1])
    : [];
  return (
    fields
      // eslint-disable-next-line complexity
      .map(({ id, regexp, unique, caseSensitive }) =>
        regexp &&
        user[id] &&
        user.taxCode &&
        user &&
        (!regexp.test(user[id] as string) || verifyChecksumMatchWithTaxCode(user.taxCode)) &&
        id === 'taxCode'
          ? `${id}-regexp`
          : regexp && user[id] && !regexp.test(user[id] as string) && id === 'email'
          ? `${id}-regexp`
          : unique && usersArray.findIndex((u) => stringEquals(u[id], user[id], caseSensitive)) > -1
          ? `${id}-unique`
          : id === 'name' &&
            user.name &&
            verifyNameMatchWithTaxCode(user.name, user.taxCode) &&
            !isAuthUser
          ? `${id}-conflict`
          : id === 'surname' &&
            user.surname &&
            verifySurnameMatchWithTaxCode(user.surname, user.taxCode) &&
            !isAuthUser
          ? `${id}-conflict`
          : undefined
      )
      .filter((x) => x)
      .map((x) => x as ValidationErrorCode)
  );
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
  peopleErrors,
  allPeople,
  setPeople,
  readOnly,
  readOnlyFields = [],
  isAuthUser,
}: PlatformUserFormProps) {
  const { t } = useTranslation();

  const buildSetPerson = (key: string) => (e: any) => {
    setPeople({
      ...people,
      [prefix]: {
        ...people[prefix],
        [key]: e.target.value,
        role,
      },
    });
  };

  const errors: Array<ValidationErrorCode> = people[prefix]
    ? validateNoMandatory(prefix, people[prefix], allPeople, isAuthUser)
    : [];

  const externalErrors: { [errorsUserData: string]: Array<string> } | undefined =
    peopleErrors && peopleErrors[prefix];

  const checkErrors = (id: string, prefixErrorCode: string): Array<string> =>
    (externalErrors && externalErrors[id]) ??
    errors.filter((e) => e.startsWith(prefixErrorCode)).map((e) => e.replace(prefixErrorCode, ''));

  const transcodeHelperText = (
    isError: boolean,
    error: Array<string>,
    field: string,
    regexpMessageKey?: string,
    uniqueMessageKey?: string,
    conflictMessageKey?: string,
    hasDescription?: boolean
  ): string =>
    isError
      ? error.indexOf('regexp') > -1
        ? transcodeFormErrorKey(field, regexpMessageKey, t)
        : error.indexOf('unique') > -1
        ? transcodeFormErrorKey(field, uniqueMessageKey, t)
        : error.indexOf('conflict') > -1
        ? transcodeFormErrorKey(field, conflictMessageKey, t)
        : t('platformUserForm.helperText')
      : hasDescription
      ? t(`platformUserForm.fields.${field}.description`)
      : '';

  return (
    <Paper sx={{ borderRadius: '16px', p: 4, width: '704px' }}>
      <Grid container spacing={2} mb="-16px">
        {fields.map(
          ({
            id,
            type = 'text',
            width = 6,
            regexpMessageKey,
            uniqueMessageKey,
            conflictMessageKey,
            hasDescription,
            textTransform,
          }) => {
            const prefixErrorCode = `${id}-`;
            const error = checkErrors(id, prefixErrorCode);
            const isError = error && error.length > 0;
            return (
              <Grid item key={id} xs={width} mb={2}>
                <TextField
                  id={`${prefix}-${id}`}
                  variant="outlined"
                  label={t(`platformUserForm.fields.${id}.label`)}
                  type={type}
                  value={people[prefix] && people[prefix][id] ? people[prefix][id] : ''}
                  onChange={buildSetPerson(id)}
                  sx={{
                    width: '100%',
                  }}
                  inputProps={{
                    style: {
                      textTransform,
                    },
                  }}
                  error={isError}
                  helperText={transcodeHelperText(
                    isError,
                    error,
                    id,
                    regexpMessageKey,
                    uniqueMessageKey,
                    conflictMessageKey,
                    hasDescription
                  )}
                  disabled={readOnly || readOnlyFields.indexOf(id) > -1}
                />
              </Grid>
            );
          }
        )}
      </Grid>
    </Paper>
  );
}
