/**
 * Contract Address Management — Celo Games Portal (Celo only)
 *
 * Centralizes all contract addresses on the Celo blockchain.
 */

import { celo } from 'wagmi/chains';

export type SupportedChainId = typeof celo.id;
export type SupportedChain = 'celo';

export type GameId =
  | 'blackjack'
  | 'rps'
  | 'tictactoe'
  | 'jackpot'
  | '2048'
  | 'mastermind'
  | 'minesweeper'
  | 'sudoku'
  | 'yahtzee'
  | 'connectfive'
  | 'solitaire'
  | 'snake'
  | 'memory'
  | 'maze'
  | 'tetris'
  | 'poker'
  | 'wordle'
  | 'brickbreaker'
  | 'flappybird'
  | 'plinko';

type AddressOrNull = `0x${string}` | null;

interface ChainAddresses {
  celo: AddressOrNull;
}

export const CONTRACT_ADDRESSES: Record<GameId, ChainAddresses> = {
  blackjack:   { celo: '0x6cb9971850767026feBCb4801c0b8a946F28C9Ec' },
  rps:         { celo: '0xc4f5f0201bf609535ec7a6d88a05b05013ae0c49' },
  tictactoe:   { celo: '0xa9596b4a5A7F0E10A5666a3a5106c4F2C3838881' },
  jackpot:     { celo: '0x07Bc49E8A2BaF7c68519F9a61FCD733490061644' },
  '2048':      { celo: '0xeD8D3C3aA578049743492a813EC327A3209Ef151' },
  mastermind:  { celo: '0xA734Ae8A46C5432427Ec2240153020d5ac72f0CE' },
  minesweeper: { celo: '0x62798e5246169e655901C546c0496bb2C6158041' },
  sudoku:      { celo: '0xB404882d0eb3A7c1022071559ab149e38d60cbE1' },
  yahtzee:     { celo: '0xfff18d55e8365a9d60971543d9f7f3541c0a9ce0' },
  connectfive: { celo: '0xd00a6170d83b446314b2e79f9603bc0a72c463e6' },
  solitaire:   { celo: '0x552c22fe8e0dbff856d45bcf32ddf6fe1ccb1525' },
  snake:       { celo: '0x5646fda34aaf8a95b9b0607db5ca02bdee267598' },
  memory:      { celo: '0xf387107bb43591c49dca7f46cd3cffc705f0cb0c' },
  maze:        { celo: '0x15110ed1bff11b2522234a44665bc689c500a285' },
  tetris:      { celo: '0x1d24cca8b0c15fef23b37978a3f696a52c0e9116' },
  poker:       { celo: '0xe446ee939ba9f508e4f4fcbf10c10172ac4df267' },
  wordle:      { celo: '0x3Be204FcE03b7ec24e85C1d4320A81Df59cF34f0' },
  brickbreaker: { celo: '0xde31f2cfcf6b351cb5eefb951889d12206616008' },
  flappybird:   { celo: '0x6b0f0a8dfcd4faa3166261e026a4bcaae8f28057' },
  plinko:       { celo: '0x2d65202f305e18672a56de2c499e7cb0be74ea94' },
};

const CHAIN_ID_TO_NAME: Record<number, SupportedChain> = {
  [celo.id]: 'celo',
};

export interface ChainConfig {
  name: string;
  shortName: string;
  chainId: number;
  icon: string;
  explorerUrl: string;
  explorerName: string;
  rpcUrl: string;
  nativeCurrency: string;
}

export const CHAIN_CONFIG: Record<SupportedChain, ChainConfig> = {
  celo: {
    name: 'Celo',
    shortName: 'Celo',
    chainId: celo.id,
    icon: '🟡',
    explorerUrl: 'https://celoscan.io',
    explorerName: 'Celoscan',
    rpcUrl: 'https://forno.celo.org',
    nativeCurrency: 'CELO',
  },
};

export const SUPPORTED_CHAIN_IDS: number[] = [celo.id];

export function getChainName(chainId: number): SupportedChain | null {
  return CHAIN_ID_TO_NAME[chainId] ?? null;
}

export function isSupportedChain(chainId: number): boolean {
  return chainId in CHAIN_ID_TO_NAME;
}

export function getContractAddress(gameId: GameId, chainId: number | undefined): `0x${string}` | null {
  if (!chainId) return null;
  const chainName = getChainName(chainId);
  if (!chainName) return null;
  return CONTRACT_ADDRESSES[gameId][chainName];
}

export function isGameAvailableOnChain(gameId: GameId, chainId: number | undefined): boolean {
  return getContractAddress(gameId, chainId) !== null;
}

export function getExplorerUrl(chainId: number | undefined): string {
  return CHAIN_CONFIG.celo.explorerUrl;
}

export function getExplorerTxUrl(chainId: number | undefined, txHash: string): string {
  return `${getExplorerUrl(chainId)}/tx/${txHash}`;
}

export function getExplorerAddressUrl(chainId: number | undefined, address: string | null): string {
  return `${getExplorerUrl(chainId)}/address/${address ?? ''}`;
}

export function getExplorerName(chainId: number | undefined): string {
  return CHAIN_CONFIG.celo.explorerName;
}
