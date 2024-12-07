import Decimal from "decimal.js";
import { formatUnits, parseUnits } from "viem";

export class V3PoolUtils {
  private static Q96 = Math.pow(2, 96);
  private static tickMultiplier = 1.0001;

  public static nearestUsableTick = ({
    tick,
    tickSpacing,
  }: {
    tick: number;
    tickSpacing: number;
  }) => {
    return Math.round(tick / tickSpacing) * tickSpacing;
  };

  public static getPriceFromTick = ({
    tick,
    decimal0,
    decimal1,
  }: {
    tick: number;
    decimal0: number;
    decimal1: number;
  }) => {
    return new Decimal(V3PoolUtils.tickMultiplier)
      .pow(tick)
      .mul(new Decimal(10).pow(decimal0))
      .div(new Decimal(10).pow(decimal1))
      .toNumber();
  };

  public static getPriceFromSqrtRatio = ({
    sqrtPriceX96,
    decimal0,
    decimal1,
  }: {
    sqrtPriceX96: bigint;
    decimal0: number;
    decimal1: number;
  }) => {
    return new Decimal(sqrtPriceX96.toString())
      .div(new Decimal(V3PoolUtils.Q96))
      .pow(2)
      .mul(new Decimal(10).pow(decimal0))
      .div(new Decimal(10).pow(decimal1))
      .toNumber();
  };

  public static getSqrtPriceX96FromTick = ({ tick }: { tick: number }) => {
    return new Decimal(V3PoolUtils.tickMultiplier)
      .pow(tick / 2)
      .mul(V3PoolUtils.Q96)
      .toFixed(0);
  };

  public static getLiquidityOfToken0 = ({
    formattedToken0Amount,
    currentPrice,
    upperTick,
    decimal0,
    decimal1,
  }: {
    formattedToken0Amount: number;
    currentPrice: number;
    upperTick: number;
    decimal0: number;
    decimal1: number;
  }) => {
    const maxPrice = V3PoolUtils.getPriceFromTick({
      tick: upperTick,
      decimal0,
      decimal1,
    });
    const sqrtCurrentPrice = Math.sqrt(currentPrice);
    const sqrtMaxPrice = Math.sqrt(maxPrice);
    return (
      (formattedToken0Amount * sqrtCurrentPrice * sqrtMaxPrice) /
      (sqrtMaxPrice - sqrtCurrentPrice)
    );
  };

  public static getLiquidityOfToken1 = ({
    formattedToken1Amount,
    currentPrice,
    lowerTick,
    decimal0,
    decimal1,
  }: {
    formattedToken1Amount: number;
    currentPrice: number;
    lowerTick: number;
    decimal0: number;
    decimal1: number;
  }) => {
    const minPrice = V3PoolUtils.getPriceFromTick({
      tick: lowerTick,
      decimal0,
      decimal1,
    });
    const sqrtCurrentPrice = Math.sqrt(currentPrice);
    const sqrtMinPrice = Math.sqrt(minPrice);
    return formattedToken1Amount / (sqrtCurrentPrice - sqrtMinPrice);
  };

  public static getToken1Amount = ({
    formattedToken0Amount,
    lowerTick,
    upperTick,
    decimal0,
    decimal1,
    sqrtPriceX96,
  }: {
    formattedToken0Amount: number;
    lowerTick: number;
    upperTick: number;
    decimal0: number;
    decimal1: number;
    sqrtPriceX96: bigint;
  }) => {
    const calculatedCurrentPrice = V3PoolUtils.getPriceFromSqrtRatio({
      sqrtPriceX96,
      decimal0,
      decimal1,
    });
    const liquidityOfToken0 = V3PoolUtils.getLiquidityOfToken0({
      formattedToken0Amount,
      currentPrice: calculatedCurrentPrice,
      upperTick,
      decimal0,
      decimal1,
    });
    const minPrice = V3PoolUtils.getPriceFromTick({
      tick: lowerTick,
      decimal0,
      decimal1,
    });
    const sqrtCurrentPrice = Math.sqrt(calculatedCurrentPrice);
    const sqrtMinPrice = Math.sqrt(minPrice);
    return Number(
      new Decimal(
        liquidityOfToken0 * (sqrtCurrentPrice - sqrtMinPrice)
      ).toFixed(7)
    );
  };

  public static getToken0Amount = ({
    formattedToken1Amount,
    sqrtPriceX96,
    lowerTick,
    upperTick,
    decimal0,
    decimal1,
  }: {
    formattedToken1Amount: number;
    sqrtPriceX96: bigint;
    lowerTick: number;
    upperTick: number;
    decimal0: number;
    decimal1: number;
  }) => {
    const currentPrice = V3PoolUtils.getPriceFromSqrtRatio({
      sqrtPriceX96,
      decimal0,
      decimal1,
    });
    const liquidityOfToken1 = V3PoolUtils.getLiquidityOfToken1({
      formattedToken1Amount,
      currentPrice,
      lowerTick,
      decimal0,
      decimal1,
    });
    const maxPrice = V3PoolUtils.getPriceFromTick({
      tick: upperTick,
      decimal0,
      decimal1,
    });
    const sqrtCurrentPrice = Math.sqrt(currentPrice);
    const sqrtMaxPrice = Math.sqrt(maxPrice);
    return liquidityOfToken1 * (1 / sqrtCurrentPrice - 1 / sqrtMaxPrice);
  };

  public static getTickAtSqrtPrice = ({
    sqrtPriceX96,
  }: {
    sqrtPriceX96: bigint;
  }) => {
    const sqrtPrice = new Decimal(sqrtPriceX96.toString()).div(V3PoolUtils.Q96);
    const price = sqrtPrice.pow(2);
    const tick = new Decimal(Math.log(price.toNumber())).div(
      Math.log(V3PoolUtils.tickMultiplier)
    );
    return Math.floor(tick.toNumber());
  };

  public static getTokenAmountsForLiquidity = ({
    liquidity,
    sqrtPriceX96,
    lowerTick,
    upperTick,
    currentTick,
  }: {
    liquidity: string;
    sqrtPriceX96: bigint;
    lowerTick: number;
    upperTick: number;
    currentTick: number;
  }) => {
    const sqrtRatioA = new Decimal(
      Math.sqrt(Math.pow(V3PoolUtils.tickMultiplier, lowerTick))
    );
    const sqrtRatioB = new Decimal(
      Math.sqrt(Math.pow(V3PoolUtils.tickMultiplier, upperTick))
    );

    const sqrtPrice = new Decimal(sqrtPriceX96.toString()).div(V3PoolUtils.Q96);
    let amount0InWei = new Decimal(0);
    let amount1InWei = new Decimal(0);
    if (currentTick < lowerTick) {
      amount0InWei = new Decimal(liquidity).mul(
        sqrtRatioB.minus(sqrtRatioA).div(sqrtRatioA.mul(sqrtRatioB))
      );
    } else if (currentTick >= upperTick) {
      amount1InWei = new Decimal(liquidity).mul(sqrtRatioB.minus(sqrtRatioA));
    } else if (currentTick >= lowerTick && currentTick < upperTick) {
      amount0InWei = new Decimal(liquidity).mul(
        sqrtRatioB.minus(sqrtPrice).div(new Decimal(sqrtPrice).mul(sqrtRatioB))
      );
      amount1InWei = new Decimal(liquidity).mul(
        new Decimal(sqrtPrice).minus(sqrtRatioA)
      );
    }

    return {
      amount0InWei: amount0InWei.toFixed(0),
      amount1InWei: amount1InWei.toFixed(0),
    };
  };

  public static calculateOptimalAmount = ({
    token0,
    token1,
    sqrtPriceX96,
    lowerTick,
    upperTick,
  }: {
    token0: {
      decimals: number;
      amount: bigint;
    };
    token1: {
      decimals: number;
      amount: bigint;
    };
    sqrtPriceX96: bigint;
    lowerTick: number;
    upperTick: number;
  }) => {
    const token1AmountForFullToken0 = V3PoolUtils.getToken1Amount({
      formattedToken0Amount: Number(
        formatUnits(token0.amount, token0.decimals)
      ),
      sqrtPriceX96,
      decimal0: token0.decimals,
      decimal1: token1.decimals,
      lowerTick,
      upperTick,
    });
    const formattedToken1ForFullToken0 = parseUnits(
      token1AmountForFullToken0.toString(),
      token1.decimals
    );
    if (token1.amount >= BigInt(formattedToken1ForFullToken0)) {
      return {
        token0Amount: token0.amount,
        token1Amount: BigInt(formattedToken1ForFullToken0),
      };
    } else {
      const token0AmountForFullToken1 = V3PoolUtils.getToken0Amount({
        formattedToken1Amount: Number(
          formatUnits(token1.amount, token1.decimals)
        ),
        sqrtPriceX96,
        lowerTick,
        upperTick,
        decimal0: token0.decimals,
        decimal1: token1.decimals,
      });

      const formattedToken0ForFullToken1 = parseUnits(
        token0AmountForFullToken1.toString(),
        token0.decimals
      );

      return {
        token0Amount: BigInt(formattedToken0ForFullToken1),
        token1Amount: token1.amount,
      };
    }
  };

  public static calculateFeesInTokens = ({
    lowerTick,
    upperTick,
    currentTick,
    liquidity,
    token0,
    token1,
    feeGrowthGlobal0X128,
    feeGrowthGlobal1X128,
    feeGrowthOutsideLower0,
    feeGrowthOutsideLower1,
    feeGrowthOutsideUpper0,
    feeGrowthOutsideUpper1,
    feeGrowthInside0,
    feeGrowthInside1,
  }: {
    lowerTick: number;
    upperTick: number;
    currentTick: number;
    liquidity: bigint;
    token0: {
      decimals: number;
    };
    token1: {
      decimals: number;
    };
    feeGrowthGlobal0X128: bigint;
    feeGrowthGlobal1X128: bigint;
    feeGrowthOutsideLower0: bigint;
    feeGrowthOutsideLower1: bigint;
    feeGrowthOutsideUpper0: bigint;
    feeGrowthOutsideUpper1: bigint;
    feeGrowthInside0: bigint;
    feeGrowthInside1: bigint;
  }) => {
    const calculateFees = (
      liquidity: Decimal,
      feeGrowthInsideLast: Decimal,
      feeGrowthInsideCurrent: Decimal
    ) => {
      const feeGrowthDelta = feeGrowthInsideCurrent.minus(feeGrowthInsideLast);
      const feesEarned = liquidity
        .mul(feeGrowthDelta)
        .div(new Decimal(2).pow(128));
      return feesEarned;
    };

    const liquidityDecimal = new Decimal(liquidity.toString());
    let feeGrowthInside0X128 = new Decimal(feeGrowthInside0.toString());
    let feeGrowthInside1X128 = new Decimal(feeGrowthInside1.toString());

    if (currentTick < lowerTick) {
      feeGrowthInside0X128 = new Decimal(feeGrowthOutsideLower0.toString());
      feeGrowthInside1X128 = new Decimal(feeGrowthOutsideLower1.toString());
    } else if (currentTick > upperTick) {
      feeGrowthInside0X128 = new Decimal(feeGrowthOutsideUpper0.toString());
      feeGrowthInside1X128 = new Decimal(feeGrowthOutsideUpper1.toString());
    } else {
      feeGrowthInside0X128 = new Decimal(
        (
          feeGrowthGlobal0X128 -
          feeGrowthOutsideLower0 -
          feeGrowthOutsideUpper0
        ).toString()
      );
      feeGrowthInside1X128 = new Decimal(
        (
          feeGrowthGlobal1X128 -
          feeGrowthOutsideLower1 -
          feeGrowthOutsideUpper1
        ).toString()
      );
    }

    const feesEarnedToken0 = calculateFees(
      liquidityDecimal,
      new Decimal(0),
      feeGrowthInside0X128
    );
    const feesEarnedToken1 = calculateFees(
      liquidityDecimal,
      new Decimal(0),
      feeGrowthInside1X128
    );

    const feesEarnedToken0Adjusted = feesEarnedToken0.div(
      new Decimal(10).pow(token0.decimals)
    );
    const feesEarnedToken1Adjusted = feesEarnedToken1.div(
      new Decimal(10).pow(token1.decimals)
    );

    return {
      feesEarnedToken0: feesEarnedToken0Adjusted.toFixed(0),
      feesEarnedToken1: feesEarnedToken1Adjusted.toFixed(0),
    };
  };

  //   from decimal import Decimal

  // liquidity = Decimal("319288742824")
  // tick_lower = -198500
  // tick_upper = -197900
  // current_tick = -193353 # factory -> getPool -> slot0
  // token0_decimals = 18
  // token1_decimals = 6

  // # Fee calculation function
  // def calculate_fees(liquidity, fee_growth_inside_last?, fee_growth_inside_current?):
  //     # Difference in fee growth
  //     fee_growth_delta = Decimal(fee_growth_inside_current) - Decimal(fee_growth_inside_last)

  //     # Fees earned (dividing by 2^128 to scale down)
  //     fees_earned = Decimal(liquidity) * fee_growth_delta / Decimal(2**128)
  //     return fees_earned

  // # Input data
  // liquidity = Decimal("319288742824")  # Position's liquidity

  // # nft.positions(id)
  // fee_growth_inside0_last_x128 = Decimal("17787814214885374369605274375452121749440")  # Last recorded fee growth for Token0
  // fee_growth_inside1_last_x128 = Decimal("44017703758289246838585543500802")  # Last recorded fee growth for Token1

  // fee_growth_global_0 = Decimal("122362593033939971490636492290400383466995")  # pool.feeGrowthGlobal0X128
  // fee_growth_global_1 = Decimal("351898573665666716271827821967404 ") # pool.feeGrowthGlobal1X128

  // # Extract fee growth outside values
  // # from ticks(uper), tick(lower)
  // fee_growth_outside_lower_0 = Decimal("22165618704680606505567691241939906129388")
  // fee_growth_outside_lower_1 = Decimal("50993724740162885018901842009196")
  // fee_growth_outside_upper_0 = Decimal("43196826019464299850052001829765982460142")
  // fee_growth_outside_upper_1 = Decimal("103134444107702657081457574041766")

  // if current_tick < tick_lower:
  //     fee_growth_inside_0_x128 = Decimal(fee_growth_outside_lower_0)
  //     fee_growth_inside_1_x128 = Decimal(fee_growth_outside_lower_1)
  // elif current_tick > tick_upper:
  //     fee_growth_inside_0_x128 = Decimal(fee_growth_outside_upper_0)
  //     fee_growth_inside_1_x128 = Decimal(fee_growth_outside_upper_1)
  // else:
  //     fee_growth_inside_0_x128 = (
  //         Decimal(fee_growth_global_0)
  //         - Decimal(fee_growth_outside_lower_0)
  //         - Decimal(fee_growth_outside_upper_0)
  //     )
  //     fee_growth_inside_1_x128 = (
  //         Decimal(fee_growth_global_1)
  //         - Decimal(fee_growth_outside_lower_1)
  //         - Decimal(fee_growth_outside_upper_1)
  //     )

  // # Calculate fees earned
  // fees_earned_token0 = calculate_fees(liquidity, fee_growth_inside0_last_x128, fee_growth_inside_0_x128)
  // fees_earned_token1 = calculate_fees(liquidity, fee_growth_inside1_last_x128, fee_growth_inside_1_x128)

  // # Adjust for decimals
  // token0_decimals = 18
  // token1_decimals = 6

  // fees_earned_token0 = fees_earned_token0 / Decimal(10 ** token0_decimals)
  // fees_earned_token1 = fees_earned_token1 / Decimal(10 ** token1_decimals)

  // print(f"Fees Earned in Token0 (adjusted for decimals): {fees_earned_token0}")
  // print(f"Fees Earned in Token1 (adjusted for decimals): {fees_earned_token1}")
}
