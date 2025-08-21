import { AssetConfig } from "@/types/fee-types";

export const BPS_POWER = 10000;
export const USDC_DECIMALS = 1000000;

export const BASE_FEE_BPS = {
  OPEN_POSITION: 6,
  CLOSE_POSITION: 6,
};

export const DEFAULT_TRADE_IMPACT_FEE_SCALAR = 100000000;

export const DEFAULT_GAS_FEE_SOL = 0.005;
export const SOL_PRICE_USD = 100;

export const ASSET_CONFIGS: Record<string, AssetConfig> = {
  SOL: {
    symbol: "SOL",
    defaultHourlyBorrowRate: 0.606,
    defaultUtilization: 0.198,
    tradeImpactFeeScalar: 100000000,
  },
  ETH: {
    symbol: "ETH",
    defaultHourlyBorrowRate: 0.5,
    defaultUtilization: 0.15,
    tradeImpactFeeScalar: 120000000,
  },
  BTC: {
    symbol: "BTC",
    defaultHourlyBorrowRate: 0.4,
    defaultUtilization: 0.12,
    tradeImpactFeeScalar: 150000000,
  },
  USDT: {
    symbol: "USDT",
    defaultHourlyBorrowRate: 0.3,
    defaultUtilization: 0.25,
    tradeImpactFeeScalar: 200000000,
  },
};

export const DEFAULT_CUSTODY_PARAMS = {
  increasePositionBps: BASE_FEE_BPS.OPEN_POSITION,
  decreasePositionBps: BASE_FEE_BPS.CLOSE_POSITION,
  tradeImpactFeeScalar: DEFAULT_TRADE_IMPACT_FEE_SCALAR,
  hourlyFundingDbps: 0.606,
  tokensLocked: 200,
  tokensOwned: 1010,
};
