/// <reference types="node" />
/**
 * Clears the dev backend of onboardings left behind by the e2e suite, without running the tests.
 *
 * The Playwright global setup already does this before every run, so this is only useful to clean
 * up on demand - or to check what is stuck without waiting for a full suite.
 *
 *   yarn reset
 */
import globalSetup from '../utils/global.setup';

globalSetup().catch((error) => {
  console.error('Reset failed:', error);
  process.exit(1);
});
