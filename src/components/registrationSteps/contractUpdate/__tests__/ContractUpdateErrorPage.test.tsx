import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { ENV } from '../../../../utils/env';
import { ContractUpdateErrorPage } from '../ContractUpdateErrorPage';

const assign = vi.fn();
const writeText = vi.fn();

beforeEach(() => {
  Object.defineProperty(window, 'location', { value: { assign }, writable: true });
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
});

afterEach(() => vi.clearAllMocks());

const queryAll = () => ({
  copy: screen.queryByRole('button', { name: 'Copia il codice errore' }),
  exit: screen.queryByRole('button', { name: 'Esci' }),
  assistance: screen.queryByRole('button', { name: 'Contatta l’assistenza' }),
  login: screen.queryByRole('button', { name: 'Accedi' }),
  documents: screen.queryByRole('button', { name: 'Vai ai documenti' }),
});

it('generic: shows error description, exit and assistance', () => {
  render(<ContractUpdateErrorPage variant="generic" errorDescription="ERR-500" />);
  const b = queryAll();

  expect(screen.getByText('La pagina che cercavi non è disponibile')).toBeInTheDocument();
  expect(b.copy).toBeInTheDocument();
  expect(b.exit).toBeInTheDocument();
  expect(b.assistance).toBeInTheDocument();
  expect(b.login).toBeNull();
  expect(b.documents).toBeNull();

  fireEvent.click(b.copy as HTMLElement);
  expect(writeText).toHaveBeenCalledWith('ERR-500');
  fireEvent.click(b.exit as HTMLElement);
  expect(assign).toHaveBeenCalledWith(ENV.URL_FE.LOGOUT);
  fireEvent.click(b.assistance as HTMLElement);
  expect(assign).toHaveBeenCalledWith(ENV.URL_FE.ASSISTANCE);
});

it('notAllowed: shows exit and assistance only', () => {
  render(<ContractUpdateErrorPage variant="notAllowed" />);
  const b = queryAll();

  expect(b.exit).toBeInTheDocument();
  expect(b.assistance).toBeInTheDocument();
  expect(b.copy).toBeNull();
  expect(b.documents).toBeNull();
});

it('alreadyCompleted: shows login leading to the institution detail', () => {
  render(<ContractUpdateErrorPage variant="alreadyCompleted" institutionId="inst-1" />);
  const b = queryAll();

  expect(b.exit).toBeNull();
  expect(b.copy).toBeNull();
  fireEvent.click(b.login as HTMLElement);
  expect(assign).toHaveBeenCalledWith(`${ENV.URL_FE.DASHBOARD}/inst-1`);
});

it('expired: shows description and documents link, no exit', () => {
  render(
    <ContractUpdateErrorPage variant="expired" errorDescription="EXPIRED" institutionId="inst-1" />
  );
  const b = queryAll();

  expect(b.copy).toBeInTheDocument();
  expect(b.exit).toBeNull();
  fireEvent.click(b.documents as HTMLElement);
  expect(assign).toHaveBeenCalledWith(`${ENV.URL_FE.DASHBOARD}/inst-1/documents`);
});

it('renders the title and description of each variant', () => {
  const { unmount } = render(<ContractUpdateErrorPage variant="cancelled" productTitle="App IO" />);
  expect(screen.getByText('La richiesta è stata annullata')).toBeInTheDocument();
  expect(screen.getByText(/per il prodotto App IO/)).toBeInTheDocument();
  unmount();

  const second = render(<ContractUpdateErrorPage variant="notAllowed" />);
  expect(screen.getByText('Non hai permessi per completare questa richiesta')).toBeInTheDocument();
  second.unmount();

  const third = render(<ContractUpdateErrorPage variant="alreadyCompleted" />);
  expect(screen.getByText('Hai già inviato questo documento')).toBeInTheDocument();
  third.unmount();

  render(<ContractUpdateErrorPage variant="expired" errorDescription="X" />);
  expect(screen.getByText('La richiesta non è più valida')).toBeInTheDocument();
});

it('cancelled: shows documents link only', () => {
  render(<ContractUpdateErrorPage variant="cancelled" institutionId="inst-1" />);
  const b = queryAll();

  expect(b.documents).toBeInTheDocument();
  expect(b.copy).toBeNull();
  expect(b.exit).toBeNull();
  expect(b.login).toBeNull();
});
