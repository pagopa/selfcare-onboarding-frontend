import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterAll, beforeAll, beforeEach, expect, test, vi } from 'vitest';
import '../../../../locale';
import { ENV } from '../../../../utils/env';
import { triggerQualtricsIntercept } from '../../../../utils/qualtricsUtils';
import {
  buildInstitutionInfo,
  buildOnboardingRequestResource,
} from '../../../../utils/test/builders';
import CompleteRequestComponent from '../CompleteRequest';
// Imported after the component to avoid the constants.ts <-> views import cycle
import { OnboardingApi } from '../../../../api/OnboardingApiClient';

vi.setConfig({ testTimeout: 80000 });

vi.mock('../../../../utils/qualtricsUtils', () => ({ triggerQualtricsIntercept: vi.fn() }));

vi.mock('../../../../services/requestStatusServices', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../../services/requestStatusServices')>()),
  onboardingContractUpload: vi.fn(
    async (_file: File, ctx: { setOutcomeContentState: (outcome: 'success') => void }) =>
      ctx.setOutcomeContentState('success')
  ),
}));

vi.mock('react-router-dom', () => ({
  useHistory: () => ({
    location: mockedLocation,
    replace: vi.fn(),
  }),
}));

vi.mock('react-router', () => ({
  useParams: () => ({}),
}));

let mockedContract: File;

const oldWindowLocation = global.window.location;
const mockedLocation = {
  assign: vi.fn(),
  pathname: '',
  origin: 'MOCKED_ORIGIN',
  search: '',
  hash: '',
};

beforeAll(() => {
  Object.defineProperty(window, 'location', { value: mockedLocation });
});

beforeEach(() => {
  mockedContract = new File(['pdf'], 'contract.pdf', { type: 'multipart/form-data' });
  mockedLocation.assign.mockClear();
});

afterAll(() => {
  Object.defineProperty(window, 'location', { value: oldWindowLocation });
});

test('Test: The jwt is not present and the onboarding request is not retrieved, so the error page is showed', async () => {
  mockedLocation.search = 'jwt=';
  render(<CompleteRequestComponent />);

  await waitFor(() => screen.getByText('La pagina che cercavi non è disponibile'));
  const assistanceButton = screen.getByRole('button', {
    name: 'Contatta l\u2019assistenza',
  });

  fireEvent.click(assistanceButton);
  await waitFor(() => expect(mockedLocation.assign).toHaveBeenCalledWith(ENV.URL_FE.ASSISTANCE));
});

test('Test: The jwt is non-existent and the onboarding request is not retrieved, so the error page is showed', async () => {
  mockedLocation.search = 'jwt=wrongJwt';
  render(<CompleteRequestComponent />);

  await waitFor(() => screen.getByText('La pagina che cercavi non è disponibile'));
  const assistanceButton = screen.getByText('Contatta l\u2019assistenza');

  fireEvent.click(assistanceButton);
  await waitFor(() => expect(mockedLocation.assign).toHaveBeenCalledWith(ENV.URL_FE.ASSISTANCE));
});

test('Test: The jwt exist and the request is correct retrieved, but it is already approved', async () => {
  mockedLocation.search = 'jwt=alreadyApproved';
  render(<CompleteRequestComponent />);

  await waitFor(() => screen.getByText('La richiesta di adesione è stata accettata'));
  const login = screen.getByText('Accedi');

  fireEvent.click(login);
  const expectedOnSuccess = encodeURIComponent(
    mockedLocation.pathname + mockedLocation.search
  );
  await waitFor(() =>
    expect(mockedLocation.assign).toHaveBeenCalledWith(
      `${ENV.URL_FE.LOGIN}/login?onSuccess=${expectedOnSuccess}`
    )
  );
});

test('Test: The jwt exist but is expired', async () => {
  mockedLocation.search = 'jwt=expired';
  render(<CompleteRequestComponent />);

  await waitFor(() => screen.getByText('La richiesta di adesione è scaduta'));
  const login = screen.getByText('Torna alla home');

  fireEvent.click(login);
  await waitFor(() =>
    expect(mockedLocation.assign).toHaveBeenCalledWith(ENV.URL_FE.LANDING)
  );
});

test('Test: The jwt exist and the request is correctly retrieved and waiting for upload/download contract, starting the upload flow', async () => {
  mockedLocation.search = 'jwt=pendingRequest';
  render(<CompleteRequestComponent />);

  await waitFor(() => screen.getByText('Carica l\u2019accordo firmato'));
  await waitFor(() => screen.getByText('Scarica l\u2019accordo di adesione'));

  const uploadContract = await waitFor(() =>
    screen.getByRole('button', {
      name: 'Vai al caricamento',
    })
  );
  fireEvent.click(uploadContract);
  screen.getByText('carica il file');

  const submit = screen.getByRole('button', {
    name: 'Continua',
  }) as HTMLButtonElement;
  expect(submit.disabled).toBe(true);

  const upload = document.getElementById('file-uploader') as HTMLElement;

  userEvent.upload(upload, mockedContract);
});

test('Test: after the contract upload the Qualtrics survey receives the institution type', async () => {
  const qualtricsEnabled = ENV.QUALTRICS_APPROVAL.ENABLE;
  ENV.QUALTRICS_APPROVAL.ENABLE = true;
  vi.mocked(OnboardingApi.retrieveOnboardingRequest).mockResolvedValueOnce(
    buildOnboardingRequestResource({
      institutionInfo: buildInstitutionInfo({ institutionType: 'GSP' }),
    })
  );
  mockedLocation.search = 'jwt=pendingRequest';
  try {
    render(<CompleteRequestComponent />);

    fireEvent.click(await screen.findByRole('button', { name: 'Vai al caricamento' }));
    await userEvent.upload(document.getElementById('file-uploader') as HTMLElement, mockedContract);
    fireEvent.click(screen.getByRole('button', { name: 'Continua' }));

    await waitFor(() =>
      expect(triggerQualtricsIntercept).toHaveBeenCalledWith(
        expect.objectContaining({ institutionType: 'GSP' }),
        expect.anything()
      )
    );
  } finally {
    ENV.QUALTRICS_APPROVAL.ENABLE = qualtricsEnabled;
  }
});

test('Test: contract update flow uses the new drag and drop and upload page', async () => {
  mockedLocation.search = 'jwt=pendingRequest&contract-update=true';
  render(<CompleteRequestComponent />);

  await waitFor(() => screen.getByText('Scarica il documento da firmare'));
  fireEvent.click(screen.getByRole('button', { name: /Vai al caricamento/ }));

  await waitFor(() => screen.getByRole('button', { name: 'Carica il file' }));
  screen.getByText('Trascina qui il documento firmato oppure');

  fireEvent.click(screen.getByRole('button', { name: 'Continua' }));
  await waitFor(() => screen.getByTestId('ErrorOutlineIcon'));
  screen.getByText('*Campo obbligatorio');

  const upload = document.querySelector('input[type="file"]') as HTMLInputElement;
  await userEvent.upload(upload, mockedContract);

  await waitFor(() => screen.getByText(mockedContract.name));
  expect(screen.queryByText('*Campo obbligatorio')).toBeNull();
  screen.getByRole('button', { name: 'Rimuovi il file' });
  screen.getByRole('button', { name: /Indietro/ });
});
