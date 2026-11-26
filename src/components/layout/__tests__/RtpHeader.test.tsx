import { fireEvent, render, screen } from '@testing-library/react';
import { CONFIG } from '@pagopa/selfcare-common-frontend/lib/config/env';
import { storageUserOps } from '@pagopa/selfcare-common-frontend/lib/utils/storage';
import RtpHeader from '../RtpHeader';

afterEach(() => {
  vi.restoreAllMocks();
});

test('the assistance opens in a new tab without asking to exit the onboarding', () => {
  vi.spyOn(storageUserOps, 'read').mockReturnValue({ uid: 'uid', name: 'Mario' });
  const open = vi.spyOn(window, 'open').mockReturnValue(null);
  const onExit = vi.fn();

  render(
    <RtpHeader
      loggedUser={{ id: 'uid', name: 'Mario' }}
      onExit={onExit}
      enableLogin
      enableAssistanceButton
    />
  );
  fireEvent.click(screen.getAllByRole('button', { name: /assistenza/i })[0]);

  expect(open).toHaveBeenCalledWith(CONFIG.URL_FE.ASSISTANCE, '_blank', 'noopener,noreferrer');
  expect(onExit).not.toHaveBeenCalled();
});
