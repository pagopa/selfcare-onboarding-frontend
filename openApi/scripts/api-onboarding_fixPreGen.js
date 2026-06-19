const regexReplace = require('regex-replace');

regexReplace(
  /("format": *"uri",[\s]*"type": "string")/gi,
  '"$ref": "#/definitions/STRINGWrapper"',
  'openApi/generated-onboarding/onboarding-swagger20.json',
  { fileContentsOnly: true }
);

// Patch: gen-api-models doesn't handle inline string enum response schemas
// (decodes them as t.undefined). Replace the inline schema in
// checkRecipientCodeUsingGET with a $ref to a named definition.
regexReplace(
  /"schema":\s*\{\s*"enum":\s*\[\s*"ACCEPTED",\s*"DENIED_NO_BILLING",\s*"DENIED_NO_ASSOCIATION"\s*\],\s*"type":\s*"string"\s*\}/g,
  '"schema": {"$ref": "#/definitions/RecipientCodeStatus"}',
  'openApi/generated-onboarding/onboarding-swagger20.json',
  { fileContentsOnly: true }
);

// Inject the RecipientCodeStatus definition into the definitions block
// (piggy-backing on the existing STRINGWrapper injection point).
regexReplace(
  /"STRINGWrapper":\{"type": "string"\}/,
  '"STRINGWrapper":{"type": "string"},"RecipientCodeStatus":{"type": "string","enum":["ACCEPTED","DENIED_NO_BILLING","DENIED_NO_ASSOCIATION"]}',
  'openApi/generated-onboarding/onboarding-swagger20.json',
  { fileContentsOnly: true }
);
