const regexReplace = require('regex-replace');

regexReplace(
  'readonly sort\\?: array;',
  'readonly sort?: Array<string>;',
  'src/api/generated/onboarding/requestTypes.ts',
  { fileContentsOnly: true }
);

// Restore the real HTTP method to HEAD for verifyOnboardingUsingHEAD. In
// fixPreGen we declare it as "get" so codegen generates the typed client
// (the tool skips HEAD), then here we put the method back so the actual
// request hitting the backend stays a HEAD. See api-onboarding_fixPreGen.js.
regexReplace(
  /(const verifyOnboardingUsingHEADT[\s\S]*?method:\s*)"get"/,
  '$1"head" as any',
  'src/api/generated/onboarding/client.ts',
  { fileContentsOnly: true }
);

// The spec declares getInstitutionOnboardingInfoUsingGET at the path
// "/v1/institutions/onboarding/" (trailing slash). Spring Boot 3 disabled
// trailing-slash matching by default, so that request no longer hits the
// controller and returns 400 "No static resource ...". Strip the trailing
// slash from the generated URL so it matches "/v1/institutions/onboarding".
regexReplace(
  /\/v1\/institutions\/onboarding\/`/,
  '/v1/institutions/onboarding`',
  'src/api/generated/onboarding/client.ts',
  { fileContentsOnly: true }
);
