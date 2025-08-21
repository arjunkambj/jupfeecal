export interface FeeCalculationParams {
  tradeSizeUsd: number;
  leverage: number;
  isOpening: boolean;
  positionDurationHours: number;
  asset: string;
  tradeImpactFeeScalar?: number;
  utilizationRate?: number;
  hourlyBorrowRate?: number;
  customIncreasePositionBps?: number;
  customDecreasePositionBps?: number;
}

export interface FeeBreakdown {
  baseFee: number;
  baseFeePercentage: number;
  priceImpactFee: number;
  priceImpactFeePercentage: number;
  borrowFee: number;
  borrowFeeHourly: number;
  borrowFeePercentage: number;
  estimatedGasFee: number;
  totalFees: number;
  totalFeesPercentage: number;
}

export interface CustodyAccountParams {
  increasePositionBps: number;
  decreasePositionBps: number;
  tradeImpactFeeScalar: number;
  hourlyFundingDbps: number;
  tokensLocked: number;
  tokensOwned: number;
}

export interface AssetConfig {
  symbol: string;
  defaultHourlyBorrowRate: number;
  defaultUtilization: number;
  tradeImpactFeeScalar: number;
}

export type PositionType = "long" | "short";
export type SwapType = "exactIn" | "exactOut";
