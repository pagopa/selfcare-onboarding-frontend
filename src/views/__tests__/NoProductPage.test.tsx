import { render, screen } from '@testing-library/react';
import NoProductPage from '../../components/layout/NoProductPage';
import './../../locale';
import i18n from '@pagopa/selfcare-common-frontend/lib/locale/locale-utils';

beforeAll(() => {
  i18n.changeLanguage('it');
});

test('test', () => {
  render(<NoProductPage />);

  screen.getByText('Spiacenti, qualcosa è andato storto.');
  screen.getByText('Impossibile individuare il prodotto desiderato');
});
