import Decimal from "decimal.js";

export const SLIPPAGE_MULTIPLIER = 100;

export const getSlippageToleranceAndMinAmount = (
  amount: string,
  slippage: number
) => {
  const destAmount = new Decimal(amount);
  const slippageTolerance = slippage * SLIPPAGE_MULTIPLIER;
  const minAmount = destAmount
    .minus(
      destAmount
        .mul(slippageTolerance)
        .dividedBy(100)
        .dividedBy(SLIPPAGE_MULTIPLIER)
    )
    .toFixed(0);

  return { slippageTolerance, minAmount };
};
