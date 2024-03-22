import { JsonFragment, Interface } from "@ethersproject/abi";
import { BigNumber } from "ethers";

export type CallInput = {
  target: string;
  interface?: Interface | JsonFragment[];
  function: string;
  args?: Array<any>;
}

export interface UniswapPairReserves {
  reserve0: BigNumber;
  reserve1: BigNumber;
  blockTimestampLast: number;
}

export interface UniswapReservesData {
  [key: string]: UniswapPairReserves;
}

export interface TokenBalances {
  [key: string]: BigNumber;
}

export interface TokenBalanceAndAllowance {
  balance: BigNumber;
  allowance: BigNumber;
}

export interface TokenBalancesAndAllowances {
  [key: string]: TokenBalanceAndAllowance;
}