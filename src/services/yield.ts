// File: src/services/yield.ts
// SIMULATION ONLY – NO REAL MONEY OR APIS
import { EarnPosition, EarnProduct } from '../types';

export const accrueYield = (
  positions: EarnPosition[],
  products: EarnProduct[],
  now: number = Date.now(),
  speedMultiplier: number = 1,
): EarnPosition[] => {
  return positions.map((position) => {
    const product = products.find((item) => item.id === position.productId);
    if (!product) {
      return position;
    }
    const elapsedDays = (now - position.startDate) / (1000 * 60 * 60 * 24) * speedMultiplier;
    const reward = position.amount * product.apy * (elapsedDays / 365);
    return {
      ...position,
      accruedReward: reward,
    };
  });
};
