/**
 * Blockchain Test Configuration
 *
 * Controls whether blockchain integration tests should run.
 * These tests require:
 * - Active internet connection
 * - Access to Celo Alfajores testnet RPC
 * - Deployed contracts on Alfajores
 *
 * To enable blockchain tests:
 *   RUN_BLOCKCHAIN_TESTS=true npm test -- tests/blockchain
 */

export const SHOULD_RUN_BLOCKCHAIN_TESTS =
  process.env.RUN_BLOCKCHAIN_TESTS === 'true';

/**
 * Use this instead of `describe` for blockchain integration tests
 * that should be skipped by default.
 *
 * @example
 * describeBlockchain('My Contract Tests', () => {
 *   test('should do something', async () => {
 *     // Test code that requires real blockchain connection
 *   });
 * });
 */
export const describeBlockchain = SHOULD_RUN_BLOCKCHAIN_TESTS
  ? describe
  : describe.skip;
