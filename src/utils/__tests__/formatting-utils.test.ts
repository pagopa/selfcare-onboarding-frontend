import { OnboardingControllers } from '../../hooks/useOnboardingControllers';
import { requiredError } from '../constants';
import { baseNumericFieldProps, fileFromReader, formatCity } from '../formatting-utils';
import { fieldColor } from '../style-utils';

const controllers = (isDisabled = false) => ({ isDisabled }) as OnboardingControllers;

const makeFormik = (errors: Record<string, string> = {}, values: Record<string, any> = {}) => ({
  errors,
  values,
  handleChange: vi.fn(),
});

describe('formatting-utils', () => {
  describe('formatCity', () => {
    test('capitalizes first letter and lowercases the rest', () => {
      expect(formatCity('mILANO')).toBe('Milano');
    });

    test('removes the "- comune" suffix', () => {
      expect(formatCity('ROMA - COMUNE')).toBe('Roma');
    });
  });

  describe('fileFromReader', () => {
    test('builds an object URL from the reader chunks', async () => {
      const chunks = [new Uint8Array([1, 2]), new Uint8Array([3])];
      const reader = {
        read: vi
          .fn()
          .mockResolvedValueOnce({ done: false, value: chunks[0] })
          .mockResolvedValueOnce({ done: false, value: chunks[1] })
          .mockResolvedValueOnce({ done: true, value: undefined }),
      } as any;
      const createObjectURL = vi.fn().mockReturnValue('blob:fake');
      const original = URL.createObjectURL;
      URL.createObjectURL = createObjectURL;

      try {
        await expect(fileFromReader(reader)).resolves.toBe('blob:fake');
        expect(reader.read).toHaveBeenCalledTimes(3);
        expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
      } finally {
        URL.createObjectURL = original;
      }
    });
  });

  describe('baseNumericFieldProps', () => {
    test('returns base props from formik values', () => {
      const formik = makeFormik({}, { vatNumber: '123' });
      const props = baseNumericFieldProps(
        'vatNumber',
        'Partita IVA',
        undefined,
        undefined,
        controllers(),
        formik
      );

      expect(props).toMatchObject({
        id: 'vatNumber',
        type: 'tel',
        value: '123',
        label: 'Partita IVA',
        error: false,
        helperText: undefined,
        required: true,
        variant: 'outlined',
        onChange: formik.handleChange,
      });
      expect(props.InputProps.style).toMatchObject({
        fontSize: 18,
        fontWeight: 'fontWeightMedium',
        color: fieldColor(false),
      });
      expect(props.InputLabelProps.sx).toEqual({ whiteSpace: 'normal', overflow: 'visible' });
    });

    test('sets error and helperText for a validation error', () => {
      const formik = makeFormik({ vatNumber: 'Invalid' });
      const props = baseNumericFieldProps('vatNumber', 'l', 400, 14, controllers(), formik);

      expect(props.error).toBe(true);
      expect(props.helperText).toBe('Invalid');
      expect(props.InputProps.style).toMatchObject({ fontSize: 14, fontWeight: 400 });
    });

    test('does not flag the required error', () => {
      const formik = makeFormik({ vatNumber: requiredError });
      const props = baseNumericFieldProps('vatNumber', 'l', undefined, 18, controllers(), formik);

      expect(props.error).toBe(false);
      expect(props.helperText).toBeUndefined();
    });

    test('uses disabled color when controllers.isDisabled', () => {
      const props = baseNumericFieldProps(
        'vatNumber',
        'l',
        undefined,
        18,
        controllers(true),
        makeFormik()
      );

      expect(props.InputProps.style.color).toBe(fieldColor(true));
    });
  });
});
