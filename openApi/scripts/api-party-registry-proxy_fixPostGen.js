const regexReplace = require('regex-replace');

regexReplace('array', 'Array<string>', 'src/api/generated/party-registry-proxy/requestTypes.ts', {
  fileContentsOnly: true,
});
