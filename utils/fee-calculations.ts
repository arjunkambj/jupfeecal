import {
  FeeCalculationParams,
  FeeBreakdown,
  CustodyAccountParams,
} from "@/types/fee-types";
import {
  BPS_POWER,
  DEFAULT_GAS_FEE_SOL,
  SOL_PRICE_USD,
} from "@/config/jupiter-fees-config";

export function calculateBaseFee(
  tradeSizeUsd: number,
  isOpening: boolean,
  custodyParams: Partial<CustodyAccountParams>,
): { fee: number; percentage: number } {
  const baseFeeBps = isOpening
    ? custodyParams.increasePositionBps || 6
    : custodyParams.decreasePositionBps || 6;

  const baseFeeBpsDecimals = baseFeeBps / BPS_POWER;
  const fee = tradeSizeUsd * baseFeeBpsDecimals;

  return {
    fee,
    percentage: baseFeeBpsDecimals * 100,
  };
}

export function calculatePriceImpactFee(
  tradeSizeUsd: number,
  tradeImpactFeeScalar: number = 100000000,
): { fee: number; percentage: number } {
  const tradeSizeUsdBps = tradeSizeUsd * BPS_POWER;
  const priceImpactFeeBps = tradeSizeUsdBps / tradeImpactFeeScalar;
  const priceImpactFeeUsd = (tradeSizeUsd * priceImpactFeeBps) / BPS_POWER;

  return {
    fee: priceImpactFeeUsd,
    percentage: (priceImpactFeeUsd / tradeSizeUsd) * 100,
  };
}

export function calculateUtilization(
  tokensLocked: number,
  tokensOwned: number,
): number {
  if (tokensOwned > 0 && tokensLocked > 0) {
    return tokensLocked / tokensOwned;
  }

  return 0;
}

export function calculateBorrowFee(
  positionSizeUsd: number,
  utilizationRate: number,
  hourlyFundingDbps: number,
  durationHours: number,
): { hourlyFee: number; totalFee: number; percentage: number } {
  const hourlyBorrowRate = (hourlyFundingDbps / 1000) * utilizationRate;
  const hourlyFee = positionSizeUsd * hourlyBorrowRate;

  const compoundedFee =
    positionSizeUsd * Math.pow(1 + hourlyBorrowRate, durationHours) -
    positionSizeUsd;

  return {
    hourlyFee,
    totalFee: compoundedFee,
    percentage: (compoundedFee / positionSizeUsd) * 100,
  };
}

export function calculateTotalFees(params: FeeCalculationParams): FeeBreakdown {
  const positionSize = params.tradeSizeUsd * params.leverage;

  const baseFeeResult = calculateBaseFee(positionSize, params.isOpening, {
    increasePositionBps: params.customIncreasePositionBps || 6,
    decreasePositionBps: params.customDecreasePositionBps || 6,
  });

  const priceImpactResult = calculatePriceImpactFee(
    positionSize,
    params.tradeImpactFeeScalar || 100000000,
  );

  const borrowFeeResult = calculateBorrowFee(
    positionSize,
    params.utilizationRate || 0.198,
    params.hourlyBorrowRate || 1.2,
    params.positionDurationHours,
  );

  const estimatedGasFee = DEFAULT_GAS_FEE_SOL * SOL_PRICE_USD;

  const totalFees =
    baseFeeResult.fee +
    priceImpactResult.fee +
    borrowFeeResult.totalFee +
    estimatedGasFee;

  return {
    baseFee: baseFeeResult.fee,
    baseFeePercentage: baseFeeResult.percentage,
    priceImpactFee: priceImpactResult.fee,
    priceImpactFeePercentage: priceImpactResult.percentage,
    borrowFee: borrowFeeResult.totalFee,
    borrowFeeHourly: borrowFeeResult.hourlyFee,
    borrowFeePercentage: borrowFeeResult.percentage,
    estimatedGasFee,
    totalFees,
    totalFeesPercentage: (totalFees / positionSize) * 100,
  };
}

export function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(value);
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(4)}%`;
}

export function getPriceImpactData(
  maxTradeSize: number = 1000000,
  scalar: number = 100000000,
): Array<{ size: number; fee: number }> {
  const data = [];
  const step = maxTradeSize / 100;

  for (let size = 0; size <= maxTradeSize; size += step) {
    const { fee } = calculatePriceImpactFee(size, scalar);

    data.push({ size, fee });
  }

  return data;
}
