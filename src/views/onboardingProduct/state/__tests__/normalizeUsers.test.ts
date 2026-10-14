import { describe, expect, test } from 'vitest';
import { InstitutionType, UserOnCreate } from '../../../../../types';
import { normalizeUsers } from '../normalizeUsers';

const legal = {
  name: 'Mario',
  surname: 'Rossi',
  taxCode: 'rssmra80a01h501u',
  email: 'Mario.Rossi@Example.IT',
  role: 'MANAGER',
} as UserOnCreate;

const admin = {
  name: 'Luca',
  surname: 'Bianchi',
  taxCode: 'bnclcu80a01f205n',
  email: 'LUCA@EXAMPLE.IT',
  role: 'DELEGATE',
} as UserOnCreate;

describe('normalizeUsers', () => {
  test('upper-cases tax codes and lower-cases emails keeping the other fields', () => {
    expect(normalizeUsers([legal, admin], 'PA')).toEqual([
      { ...legal, taxCode: 'RSSMRA80A01H501U', email: 'mario.rossi@example.it' },
      { ...admin, taxCode: 'BNCLCU80A01F205N', email: 'luca@example.it' },
    ]);
  });

  test('drops the first user (legal representative) for tech partners', () => {
    expect(normalizeUsers([legal, admin], 'PT')).toEqual([
      { ...admin, taxCode: 'BNCLCU80A01F205N', email: 'luca@example.it' },
    ]);
  });

  test.each<InstitutionType | undefined>(['PA', 'GSP', 'PSP', 'PRV', undefined])(
    'keeps every user for institution type %s',
    (institutionType) => {
      expect(normalizeUsers([legal, admin], institutionType)).toHaveLength(2);
    }
  );

  test('does not mutate the input users', () => {
    const users = [{ ...legal }];
    normalizeUsers(users, 'PA');
    expect(users[0]).toEqual(legal);
  });

  test('keeps missing tax code and email as undefined', () => {
    expect(normalizeUsers([{ name: 'X' } as UserOnCreate], 'PA')).toEqual([
      { name: 'X', taxCode: undefined, email: undefined },
    ]);
  });

  test.each<InstitutionType>(['PA', 'PT'])('returns undefined when users are missing (%s)', (t) => {
    expect(normalizeUsers(undefined, t)).toBeUndefined();
  });

  test('returns an empty list for a tech partner with only the legal representative', () => {
    expect(normalizeUsers([legal], 'PT')).toEqual([]);
  });
});
