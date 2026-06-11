import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';
import { Grid, IconButton, TextField, Typography } from '@mui/material';
import { emailRegexp } from '@pagopa/selfcare-common-frontend/lib/utils/constants';
import { verifyChecksumMatchWithTaxCode } from '@pagopa/selfcare-common-frontend/lib/utils/verifyChecksumMatchWithTaxCode';
import { verifyNameMatchWithTaxCode } from '@pagopa/selfcare-common-frontend/lib/utils/verifyNameMatchWithTaxCode';
import { verifySurnameMatchWithTaxCode } from '@pagopa/selfcare-common-frontend/lib/utils/verifySurnameMatchWithTaxCode';
import { TFunction } from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { PartyRole, UserOnCreate } from '../../../types';
import { PRODUCT_IDS } from '../../utils/constants';
import { isPecEmail } from '../../utils/validateFields';
import { UsersError, UsersObject } from '../steps/StepAddManager';

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
  isExtraDelegate?: boolean;
  buildRemoveDelegateForm?: (idToRemove: string) => (_: React.SyntheticEvent) => void;
  delegateId?: string;
  productId?: string;
  addUserFlow?: boolean;
};

type Field = {
  id: keyof UserOnCreate;
  type?: 'text' | 'email';
  width?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  regexp?: RegExp;
  regexpMessageKey?: string;
  invalidPecMessageKey?: string;
  conflictMessageKey?: string;
  hasDescription?: boolean;
  unique: boolean;
  caseSensitive?: boolean;
  uniqueMessageKey?: string;
  textTransform?: TextTransform;
};

type TextTransform = 'uppercase' | 'lowercase';

type ValidationErrorCode =
  | `${keyof UserOnCreate}-regexp`
  | `${keyof UserOnCreate}-unique`
  | `${keyof UserOnCreate}-conflict`
  | `${keyof UserOnCreate}-invalidPec`;

const TAX_CODE_REGEXP = new RegExp(
  '^[A-Za-z]{6}[0-9lmnpqrstuvLMNPQRSTUV]{2}[abcdehlmprstABCDEHLMPRST]{1}[0-9lmnpqrstuvLMNPQRSTUV]{2}[A-Za-z]{1}[0-9lmnpqrstuvLMNPQRSTUV]{3}[A-Za-z]{1}$'
);

const allowsDuplicates = (productId?: string, addUserFlow?: boolean): boolean =>
  productId === PRODUCT_IDS.IDPAY_MERCHANT || productId === PRODUCT_IDS.CED || !!addUserFlow;

const stringEquals = (str1?: string, str2?: string, caseSensitive?: boolean): boolean =>
  ((!str1 && !str2) ||
    (!caseSensitive ? str1?.toUpperCase() === str2?.toUpperCase() : str1 === str2)) as boolean;

const isSamePerson = (u1: UserOnCreate, u2: UserOnCreate): boolean =>
  stringEquals(u1.name, u2.name, false) &&
  stringEquals(u1.surname, u2.surname, false) &&
  stringEquals(u1.taxCode, u2.taxCode, false);

const fields = (productId?: string, addUserFlow?: boolean): Array<Field> => {
  const duplicatesAllowed = allowsDuplicates(productId, addUserFlow);
  return [
    { id: 'name', unique: false, conflictMessageKey: 'conflict' },
    { id: 'surname', unique: false, conflictMessageKey: 'conflict' },
    {
      id: 'taxCode',
      width: 12,
      regexp: TAX_CODE_REGEXP,
      regexpMessageKey: 'invalid',
      unique: !duplicatesAllowed,
      caseSensitive: false,
      uniqueMessageKey: duplicatesAllowed ? undefined : 'duplicate',
      textTransform: 'uppercase',
    },
    {
      id: 'email',
      width: 12,
      regexp: emailRegexp,
      regexpMessageKey: 'invalid',
      invalidPecMessageKey: 'invalidPec',
      hasDescription: true,
      unique: !duplicatesAllowed,
      caseSensitive: false,
      uniqueMessageKey: duplicatesAllowed ? undefined : 'duplicate',
      conflictMessageKey: 'conflict',
      textTransform: 'lowercase',
    },
  ];
};

const validateTaxCodeField = (value: string): ValidationErrorCode | undefined => {
  if (!TAX_CODE_REGEXP.test(value) || verifyChecksumMatchWithTaxCode(value)) {
    return 'taxCode-regexp';
  }
  return undefined;
};

const validateEmailField = (
  value: string,
  user: UserOnCreate,
  usersArray: Array<UserOnCreate>,
  duplicatesAllowed: boolean
): ValidationErrorCode | undefined => {
  if (!emailRegexp.test(value)) {
    return 'email-regexp';
  }
  if (isPecEmail(value)) {
    return 'email-invalidPec';
  }
  if (
    duplicatesAllowed &&
    usersArray.some(
      (u) =>
        isSamePerson(u, user) &&
        u.email &&
        emailRegexp.test(u.email) &&
        !stringEquals(u.email, value, false)
    )
  ) {
    return 'email-conflict';
  }
  return undefined;
};

const getFieldSpecificError = (
  id: keyof UserOnCreate,
  value: string,
  user: UserOnCreate,
  usersArray: Array<UserOnCreate>,
  duplicatesAllowed: boolean
): ValidationErrorCode | undefined => {
  if (id === 'taxCode') {
    return validateTaxCodeField(value);
  }
  if (id === 'email') {
    return validateEmailField(value, user, usersArray, duplicatesAllowed);
  }
  return undefined;
};

const validateField = (
  field: Field,
  user: UserOnCreate,
  usersArray: Array<UserOnCreate>,
  isAuthUser: boolean | undefined,
  duplicatesAllowed: boolean
): ValidationErrorCode | undefined => {
  const { id, unique, caseSensitive } = field;
  const value = user[id] as string | undefined;

  const fieldSpecificError = value
    ? getFieldSpecificError(id, value, user, usersArray, duplicatesAllowed)
    : undefined;
  if (fieldSpecificError) {
    return fieldSpecificError;
  }

  if (unique && usersArray.some((u) => stringEquals(u[id], value, caseSensitive))) {
    return `${id}-unique`;
  }

  if (
    id === 'name' &&
    user.name &&
    verifyNameMatchWithTaxCode(user.name, user.taxCode) &&
    !isAuthUser
  ) {
    return 'name-conflict';
  }

  if (
    id === 'surname' &&
    user.surname &&
    verifySurnameMatchWithTaxCode(user.surname, user.taxCode) &&
    !isAuthUser
  ) {
    return 'surname-conflict';
  }

  return undefined;
};

const validateNoMandatory = (
  userTempId: keyof UsersObject,
  user: UserOnCreate,
  productId: string | undefined,
  users?: UsersObject,
  isAuthUser?: boolean,
  addUserFlow?: boolean
): Array<ValidationErrorCode> => {
  const fieldsToValidate = fields(productId, addUserFlow);
  const duplicatesAllowed = allowsDuplicates(productId, addUserFlow);
  const usersArray = users
    ? Object.entries(users)
        .filter(([id]) => id !== userTempId)
        .map(([, u]) => u)
    : [];

  return fieldsToValidate
    .map((field) => validateField(field, user, usersArray, isAuthUser, duplicatesAllowed))
    .filter((x): x is ValidationErrorCode => x !== undefined);
};

export const validateUser = (
  userTempId: keyof UsersObject,
  user: UserOnCreate,
  users: UsersObject,
  productId?: string,
  isAuthUser?: boolean,
  addUserFlow?: boolean
): boolean => {
  const fieldsToValidate = fields(productId, addUserFlow);
  const missingFields = fieldsToValidate.filter(({ id }) => !user[id]);
  const validationErrors = validateNoMandatory(
    userTempId,
    user,
    productId,
    users,
    isAuthUser,
    addUserFlow
  );
  return missingFields.length === 0 && validationErrors.length === 0;
};

const transcodeFormErrorKey = (
  idField: string,
  errorKey: string | undefined,
  t: TFunction<'translation', undefined>
) => (errorKey ? t(`platformUserForm.fields.${idField}.errors.${errorKey}`) : '');

const transcodeHelperText = (
  isError: boolean,
  error: Array<string>,
  field: string,
  messageKeys: {
    regexp?: string;
    unique?: string;
    conflict?: string;
    invalidPec?: string;
    description?: boolean;
  },
  t: TFunction<'translation', undefined>
): string => {
  if (!isError) {
    return messageKeys.description ? t(`platformUserForm.fields.${field}.description`) : '';
  }
  if (error.includes('regexp')) {
    return transcodeFormErrorKey(field, messageKeys.regexp, t);
  }
  if (error.includes('invalidPec')) {
    return transcodeFormErrorKey(field, messageKeys.invalidPec, t);
  }
  if (error.includes('unique')) {
    return transcodeFormErrorKey(field, messageKeys.unique, t);
  }
  if (error.includes('conflict')) {
    return transcodeFormErrorKey(field, messageKeys.conflict, t);
  }
  return t('platformUserForm.helperText');
};

export const PlatformUserForm = ({
  prefix,
  role,
  people,
  peopleErrors,
  allPeople,
  setPeople,
  readOnly,
  readOnlyFields = [],
  isAuthUser,
  isExtraDelegate,
  buildRemoveDelegateForm,
  delegateId,
  productId,
  addUserFlow,
}: PlatformUserFormProps) => {
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
    ? validateNoMandatory(prefix, people[prefix], productId, allPeople, isAuthUser, addUserFlow)
    : [];

  const externalErrors: { [errorsUserData: string]: Array<string> } | undefined =
    peopleErrors && peopleErrors[prefix];

  const checkErrors = (id: string, prefixErrorCode: string): Array<string> =>
    (externalErrors && externalErrors[id]) ??
    errors.filter((e) => e.startsWith(prefixErrorCode)).map((e) => e.replace(prefixErrorCode, ''));

  return (
    <Grid container xs={12}>
      {isExtraDelegate && delegateId && buildRemoveDelegateForm && (
        <Grid container xs={12} pb={3} alignItems="center" width="100%">
          <Grid item xs={6}>
            <Typography
              component="div"
              variant="caption"
              sx={{ fontWeight: 'fontWeightBold' }}
              data-testid="extra-delegate"
            >
              {t('stepAddDelegates.addUserLabel')}
            </Typography>
          </Grid>
          <Grid item xs={6} display="flex" justifyContent="flex-end" flexGrow={1}>
            <IconButton
              data-testid="removeButton"
              color="primary"
              onClick={buildRemoveDelegateForm(delegateId)}
              sx={{ p: '8px', display: 'flex', marginTop: 'auto' }}
              aria-label={t('stepAddDelegates.removeUser')}
            >
              <ClearOutlinedIcon />
            </IconButton>
          </Grid>
        </Grid>
      )}
      <Grid container xs={12} spacing={2} mb="-16px">
        {fields(productId, addUserFlow).map(
          ({
            id,
            type = 'text',
            width = 6,
            regexpMessageKey,
            uniqueMessageKey,
            conflictMessageKey,
            invalidPecMessageKey,
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
                    '& .MuiOutlinedInput-root.MuiInputBase-root': {
                      fontWeight: 'fontWeightMedium',
                    },
                    '& .MuiInputLabel-root.Mui-disabled': {
                      color: 'text.secondary',
                    },
                    /* error label and helper text: minimum 4.5:1 contrast ratio on white (WCAG 1.4.3) */
                    '& .MuiFormLabel-root.Mui-error': { color: '#C5281C' },
                    '& .MuiFormHelperText-root.Mui-error': { color: '#C5281C' },
                  }}
                  inputProps={{
                    style: { textTransform },
                    'data-testid': `${prefix}-${id}`,
                  }}
                  error={isError}
                  helperText={transcodeHelperText(
                    isError,
                    error,
                    id,
                    {
                      regexp: regexpMessageKey,
                      unique: uniqueMessageKey,
                      conflict: conflictMessageKey,
                      invalidPec: invalidPecMessageKey,
                      description: hasDescription,
                    },
                    t
                  )}
                  disabled={readOnly || readOnlyFields.indexOf(id) > -1}
                  InputLabelProps={{
                    sx: {
                      /* allow long labels to wrap instead of being clipped at zoom 400% (WCAG 1.4.10) */
                      whiteSpace: 'normal',
                      overflow: 'visible',
                    },
                  }}
                />
              </Grid>
            );
          }
        )}
      </Grid>
    </Grid>
  );
};
