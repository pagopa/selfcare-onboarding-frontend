const regexReplace = require('regex-replace');

const FILE = 'openApi/generated-party-registry-proxy/party-registry-proxy-swagger20.json';
const opts = { fileContentsOnly: true };

async function fixPreGen() {
  await regexReplace(
    /("format": *"uri",[\s]*"type": "string")/gi,
    '"$ref": "#/definitions/STRINGWrapper"',
    FILE,
    opts
  );

  // Patch: PDNDBusinessResource (infocamere/visura) is under-declared in the
  // spec. The backend returns these fields and the UI relies on them (e.g.
  // atecoCodes for the idpay-merchant ATECO whitelist check, nRea/cciaa for the
  // REA, vatNumber/legalForm for the onboarding payload), but io-ts strips
  // anything not declared. "nrea" is unique to PDNDBusinessResource, so we
  // piggy-back on it: rename it to nRea (matching the FE model) and inject the
  // remaining fields. See src/model/PDNDBusinessResource.ts.
  await regexReplace(
    /"nrea"\s*:\s*\{\s*"type"\s*:\s*"string"\s*\}/,
    '"nRea":{"type":"string"},' +
      '"atecoCodes":{"type":"array","items":{"type":"string"}},' +
      '"legalForm":{"type":"string"},' +
      '"vatNumber":{"type":"string"},' +
      '"disabledStateInstitution":{"type":"string"},' +
      '"descriptionStateInstitution":{"type":"string"},' +
      '"statusCompanyRI":{"type":"string"},' +
      '"statusCompanyRD":{"type":"string"}',
    FILE,
    opts
  );
}

fixPreGen();
