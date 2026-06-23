const regexReplace = require('regex-replace');

const FILE = 'openApi/generated-onboarding/onboarding-swagger20.json';
const opts = { fileContentsOnly: true };

async function fixPreGen() {
  await regexReplace(
    /("format": *"uri",[\s]*"type": "string")/gi,
    '"$ref": "#/definitions/STRINGWrapper"',
    FILE,
    opts
  );

  // Patch: gen-api-models doesn't handle inline string enum response schemas
  // (decodes them as t.undefined). Replace the inline schema in
  // checkRecipientCodeUsingGET with a $ref to a named definition.
  await regexReplace(
    /"schema":\s*\{\s*"enum":\s*\[\s*"ACCEPTED",\s*"DENIED_NO_BILLING",\s*"DENIED_NO_ASSOCIATION"\s*\],\s*"type":\s*"string"\s*\}/g,
    '"schema": {"$ref": "#/definitions/RecipientCodeStatus"}',
    FILE,
    opts
  );

  // Inject the RecipientCodeStatus definition at the top of the definitions
  // block. NB: STRINGWrapper is NOT available here yet (it is added later by
  // fixSwagger20ArraySchemaDef.js), so we piggy-back on the "definitions": {
  // opening, which always exists after the OpenAPI 3 -> Swagger 2 conversion.
  await regexReplace(
    /"definitions"\s*:\s*\{/,
    '"definitions":{"RecipientCodeStatus":{"type": "string","enum":["ACCEPTED","DENIED_NO_BILLING","DENIED_NO_ASSOCIATION"]},',
    FILE,
    opts
  );

  // Patch: the spec declares Problem as an empty object ("Generic problem
  // response"), so the codegen generates an empty type and io-ts strips the
  // fields the frontend relies on (Problem.detail, Problem.errors[].code used
  // by transcodeErrorCode for the contract-upload error flow). Flesh out the
  // schema to match the real backend payload (see Problem in types.ts).
  await regexReplace(
    /"Problem":\s*\{\s*"description":\s*"Generic problem response",\s*"type":\s*"object"\s*\}/,
    '"Problem":{"description":"Generic problem response","type":"object","properties":{"detail":{"type":"string"},"status":{"type":"integer","format":"int32"},"errors":{"type":"array","items":{"type":"object","properties":{"code":{"type":"string"},"detail":{"type":"string"}}}}}}',
    FILE,
    opts
  );
}

fixPreGen();
