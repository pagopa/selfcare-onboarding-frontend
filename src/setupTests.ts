// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import it from './locale/it';
import en from './locale/en';
import de from './locale/de';
import fr from './locale/fr';
import sl from './locale/sl';

void i18n.use(initReactI18next).init({
    resources: {
        it: { translation: it },
        en: { translation: en },
        de: { translation: de },
        fr: { translation: fr },
        sl: { translation: sl },
    },
    lng: 'it',
    fallbackLng: 'it',
    initImmediate: false,
    interpolation: { escapeValue: false },
});

beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => { });
    vi.spyOn(console, 'warn').mockImplementation(() => { });
});
