// {
//     "status": "MISSING",
//     "description": "Please provide the following additional details to add liquidity: zap in token and zap in amount.",
//     "API": "/addLiquidity",
//     "missing_data": [
//         "zapInToken",
//         "zapInAmount"
//     ]
// }

import { AddLiquidityRequest } from "./addLiquidity";
import { MigrateLiquidityRequest } from "./migrateLiquidity";
import { RemoveLiquidityRequest } from "./removeLiquidity";

export const aiResponseStatus = {
  success: "success",
  missing: "missing",
  dos: "dos",
} as const;

export type AiResponse = {
  status: keyof typeof aiResponseStatus;
  API: string;
  missing_data?: string[];
  description?: string;
  payload?:
    | AddLiquidityRequest
    | RemoveLiquidityRequest
    | MigrateLiquidityRequest;
};
