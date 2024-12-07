import Decimal from "decimal.js";
import { formatUnits, parseUnits } from "viem";

export const calculateZapInToTokenDistribution = ({
  token0,
  token1,
  zapInToken,
  token1ToToken0,
  zapInAmount,
}: {
  token0: {
    decimals: number;
    price: string | number;
  };
  zapInToken: {
    decimals: number;
    price: string | number;
  };
  token1: {
    decimals: number;
    price: string | number;
  };
  token1ToToken0: number | string;
  zapInAmount: string | number;
}) => {
  const token1ToToken0USD = Number(token1ToToken0) * Number(token1.price);

  const totalUSD = new Decimal(token0.price).plus(token1ToToken0USD);

  const token0Multiplier = new Decimal(token0.price).dividedBy(totalUSD);
  const token1Multiplier = new Decimal(token1ToToken0USD).dividedBy(totalUSD);

  const formattedzapInAmount = formatUnits(
    BigInt(zapInAmount),
    zapInToken.decimals
  );
  const zapInAmountUSD = new Decimal(formattedzapInAmount)
    .mul(zapInToken.price)
    .toString();

  const swapAmountForToken0USD = new Decimal(zapInAmountUSD)
    .mul(token0Multiplier)
    .toString();
  const swapAmountForToken1USD = new Decimal(zapInAmountUSD)
    .mul(token1Multiplier)
    .toString();

  const swapAmountForToken0 = new Decimal(swapAmountForToken0USD)
    .dividedBy(zapInToken.price)
    .toString();
  const swapAmountForToken1 = new Decimal(swapAmountForToken1USD)
    .dividedBy(zapInToken.price)
    .toString();

  const swapAmountForToken0InWei = parseUnits(
    swapAmountForToken0,
    zapInToken.decimals
  );
  const swapAmountForToken1InWei = parseUnits(
    swapAmountForToken1,
    zapInToken.decimals
  );

  return {
    amount0InWei: swapAmountForToken0InWei.toString(),
    amount1InWei: swapAmountForToken1InWei.toString(),
  };
};
