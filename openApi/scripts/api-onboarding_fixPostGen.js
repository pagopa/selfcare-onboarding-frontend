const regexReplace = require('regex-replace');

regexReplace(
  'readonly sort\\?: array;',
  'readonly sort?: Array<string>;',
  'src/api/generated/onboarding/requestTypes.ts',
  { fileContentsOnly: true }
);
