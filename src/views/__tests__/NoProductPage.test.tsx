import { render, screen } from '@testing-library/react';
import NoProductPage from '../NoProductPage';
import './../../locale';

test('test', () => {
  render(<NoProductPage />);

  screen.getByText('Spiacenti, qualcosa è andato storto.');
  screen.getByText('Impossibile individuare il prodotto desiderato');
});
