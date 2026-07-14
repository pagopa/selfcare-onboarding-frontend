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

// Fix the multipart body generator for uploadAttachmentUsingPOST. gen-api-models
// mishandles a multipart body that mixes a binary field (attachment) with plain
// string fields (attachmentId, attachmentDescription): it emits the undefined
// identifier `attachmentId_.uri` instead of assembling a FormData. Replace it
// with a proper FormData, matching how the tool handles single-file endpoints.
regexReplace(
  /body:\s*\(\{\s*\["attachmentId"\]:\s*attachmentId,\s*\["attachmentDescription"\]:\s*attachmentDescription\s*\}\)\s*=>\s*attachmentId_\.uri,/,
  `body: ({
      ["attachment"]: attachment,
      ["attachmentId"]: attachmentId,
      ["attachmentDescription"]: attachmentDescription
    }) => {
      if (typeof window === "undefined")
        throw new Error(
          "File upload is only support inside a browser runtime envoronment"
        );
      const formData = new FormData();
      formData.append("attachment", attachment);
      if (attachmentId !== undefined)
        formData.append("attachmentId", attachmentId);
      if (attachmentDescription !== undefined)
        formData.append("attachmentDescription", attachmentDescription);
      return formData;
    },`,
  'src/api/generated/onboarding/client.ts',
  { fileContentsOnly: true }
);
