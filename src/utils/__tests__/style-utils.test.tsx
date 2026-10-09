import { render, screen } from '@testing-library/react';
import { theme } from '@pagopa/mui-italia';
import {
  CustomNumberField,
  CustomTextField,
  CustomTextFieldNotched,
  autocompletePaperStyle,
  fieldColor,
} from '../style-utils';

describe('style-utils', () => {
  describe('fieldColor', () => {
    test('returns disabled color when disabled', () => {
      expect(fieldColor(true)).toBe(theme.palette.text.disabled);
    });

    test('returns primary color when enabled', () => {
      expect(fieldColor(false)).toBe(theme.palette.text.primary);
    });
  });

  describe('autocompletePaperStyle', () => {
    test('limits height and enables vertical scroll', () => {
      expect(autocompletePaperStyle.paper.sx).toMatchObject({
        overflowY: 'auto',
        maxHeight: '200px',
      });
    });
  });

  describe('styled text fields', () => {
    test.each([
      ['CustomTextField', CustomTextField],
      ['CustomNumberField', CustomNumberField],
      ['CustomTextFieldNotched', CustomTextFieldNotched],
    ])('%s renders a labelled input', (_name, Field) => {
      render(<Field id="f" label="Campo" defaultValue="abc" />);

      expect(screen.getByLabelText('Campo')).toHaveValue('abc');
    });

    test('CustomTextFieldNotched accepts paddingValue', () => {
      render(<CustomTextFieldNotched id="f" label="Campo" paddingValue="10px" />);

      expect(screen.getByLabelText('Campo')).toBeInTheDocument();
    });
  });
});
